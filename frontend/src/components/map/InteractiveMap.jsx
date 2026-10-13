import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Navigation, Star, MapPin, ExternalLink } from 'lucide-react';
import { formatDistance } from '../../utils/formatters';
import { getBusinessDisplayImage, getCategoryFallbackImage } from '../../utils/categoryImages';

// Fix leaflet default icon issue in Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="
    background: #0d9488;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.35);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to dynamically adjust map view center and zoom
function MapUpdater({ center, zoom, selectedBusiness }) {
  const map = useMap();

  useEffect(() => {
    if (selectedBusiness?.location?.coordinates) {
      const [lng, lat] = selectedBusiness.location.coordinates;
      map.flyTo([lat, lng], 15, { duration: 1.2 });
    } else if (center) {
      map.flyTo([center.lat, center.lng], zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, selectedBusiness, map]);

  return null;
}

export default function InteractiveMap({
  businesses = [],
  center = { lat: 17.478, lng: 78.567 },
  zoom = 13,
  selectedBusiness = null,
  onMarkerClick = null,
  userLocation = null,
  height = '500px',
}) {
  const mapRef = useRef(null);

  const validBusinesses = businesses.filter(
    (b) =>
      b.location &&
      Array.isArray(b.location.coordinates) &&
      b.location.coordinates.length === 2 &&
      !isNaN(b.location.coordinates[0]) &&
      !isNaN(b.location.coordinates[1])
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} zoom={zoom} selectedBusiness={selectedBusiness} />

        {/* User GPS Location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center font-semibold text-xs p-1">
                <span className="text-teal-600 font-bold block">📍 Your Location</span>
                <span>Active search origin</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Business Markers */}
        {validBusinesses.map((b) => {
          const [lng, lat] = b.location.coordinates;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

          return (
            <Marker
              key={b._id}
              position={[lat, lng]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(b);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-56 p-1 text-slate-800">
                  <img
                    src={getBusinessDisplayImage(b)}
                    alt={b.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getCategoryFallbackImage(b.category, b.name);
                    }}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
                    {b.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 mb-1">
                    {b.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{b.averageRating ? Number(b.averageRating).toFixed(1) : 'New'}</span>
                    <span className="text-slate-400 text-[11px]">({b.totalReviews || 0})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {b.address?.locality || 'Hyderabad'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                    <Link
                      to={`/business/${b._id}`}
                      className="px-2 py-1 bg-slate-900 text-white rounded-md font-bold hover:bg-teal-600 transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
