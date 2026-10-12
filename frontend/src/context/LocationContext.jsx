import { createContext, useContext, useState } from 'react';
import { DEFAULT_COORDINATES, ALL_LOCALITIES, CITIES_AND_REGIONS } from '../utils/constants';
import { useToast } from './ToastContext';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const toast = useToast();
  const [coordinates, setCoordinates] = useState({
    lat: DEFAULT_COORDINATES.lat,
    lng: DEFAULT_COORDINATES.lng,
  });
  const [localityName, setLocalityName] = useState(DEFAULT_COORDINATES.label);
  const [isLocating, setIsLocating] = useState(false);
  const [isGPSActive, setIsGPSActive] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Browser GPS detection
  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocalityName('My Current Location');
        setIsGPSActive(true);
        setIsLocating(false);
        toast.success('Current location detected successfully!');
      },
      (error) => {
        setIsLocating(false);
        setIsGPSActive(false);
        let errorMsg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Switched to city area view.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        setGeoError(errorMsg);
        toast.info(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Select preset locality or custom coordinate object
  const selectLocality = (locality) => {
    if (typeof locality === 'string') {
      const found = ALL_LOCALITIES.find(
        (loc) => loc.name.toLowerCase() === locality.toLowerCase() ||
                 loc.fullName?.toLowerCase() === locality.toLowerCase()
      );
      if (found) {
        setCoordinates({ lat: found.lat, lng: found.lng });
        setLocalityName(`${found.name}, ${found.city || 'Hyderabad'}`);
        setIsGPSActive(false);
        setGeoError(null);
        toast.info(`Location set to ${found.name} (${found.city || 'Hyderabad'})`);
        return;
      }
    } else if (locality && locality.lat && locality.lng) {
      setCoordinates({ lat: locality.lat, lng: locality.lng });
      setLocalityName(locality.name ? `${locality.name}` : 'Custom Location');
      setIsGPSActive(false);
      setGeoError(null);
      toast.info(`Location updated to ${locality.name || 'coordinates'}`);
    }
  };

  // Freeform Geocoding (Lookup ANY place in India or worldwide via OpenStreetMap Nominatim)
  const geocodeAddress = async (queryText) => {
    if (!queryText || !queryText.trim()) return null;
    setIsLocating(true);
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryText.trim()
      )}&limit=1`;
      const response = await fetch(endpoint, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const newCoords = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
        setCoordinates(newCoords);
        const displayName = place.display_name.split(',')[0];
        setLocalityName(displayName);
        setIsGPSActive(false);
        setGeoError(null);
        toast.success(`Location centered on ${displayName}`);
        return newCoords;
      } else {
        toast.warning(`Could not find "${queryText}". Try selecting an area from the list.`);
        return null;
      }
    } catch (err) {
      console.warn('Geocoding service unavailable, using local lookup:', err.message);
      // Fallback to local lookup
      const local = ALL_LOCALITIES.find((l) =>
        l.name.toLowerCase().includes(queryText.toLowerCase())
      );
      if (local) {
        selectLocality(local);
        return { lat: local.lat, lng: local.lng };
      }
      return null;
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        localityName,
        isLocating,
        isGPSActive,
        geoError,
        requestCurrentLocation,
        selectLocality,
        geocodeAddress,
        localities: ALL_LOCALITIES,
        regions: CITIES_AND_REGIONS,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
