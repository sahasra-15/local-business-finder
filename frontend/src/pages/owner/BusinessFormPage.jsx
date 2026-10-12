import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Image as ImageIcon,
  Check,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { CATEGORIES, CITIES_AND_REGIONS, ALL_LOCALITIES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function BusinessFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0].name,
    description: '',
    priceRange: '$$',
    address: {
      street: '',
      locality: 'ECIL',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500062',
      country: 'India',
    },
    location: {
      coordinates: [78.567, 17.478], // [lng, lat]
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    ],
    services: ['Dine-in', 'Takeaway', 'Home Delivery'],
    openingHours: {
      monday: { open: '09:00', close: '21:00', isClosed: false },
      tuesday: { open: '09:00', close: '21:00', isClosed: false },
      wednesday: { open: '09:00', close: '21:00', isClosed: false },
      thursday: { open: '09:00', close: '21:00', isClosed: false },
      friday: { open: '09:00', close: '21:00', isClosed: false },
      saturday: { open: '09:00', close: '22:00', isClosed: false },
      sunday: { open: '10:00', close: '20:00', isClosed: false },
    },
  });

  const [newService, setNewService] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchBusiness = async () => {
        try {
          const res = await businessService.getBusinessById(id);
          const biz = res.data.business;
          setFormData({
            name: biz.name || '',
            category: biz.category || CATEGORIES[0].name,
            description: biz.description || '',
            priceRange: biz.priceRange || '$$',
            address: {
              street: biz.address?.street || '',
              locality: biz.address?.locality || 'ECIL',
              city: biz.address?.city || 'Hyderabad',
              state: biz.address?.state || 'Telangana',
              postalCode: biz.address?.postalCode || '',
              country: biz.address?.country || 'India',
            },
            location: {
              coordinates: biz.location?.coordinates || [78.567, 17.478],
            },
            contact: {
              phone: biz.contact?.phone || '',
              email: biz.contact?.email || '',
              website: biz.contact?.website || '',
            },
            images: biz.images?.length > 0 ? biz.images : [''],
            services: biz.services || [],
            openingHours: biz.openingHours || formData.openingHours,
          });
        } catch (err) {
          toast.error('Failed to load business details');
          navigate('/owner');
        } finally {
          setLoading(false);
        }
      };
      fetchBusiness();
    }
  }, [id, isEdit]);

  // Handle locality helper to set coordinates automatically
  const handleLocalityChange = (locality) => {
    const found = ALL_LOCALITIES.find((l) => l.name === locality);
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        locality,
        city: found?.city || prev.address.city,
      },
      location: found
        ? { coordinates: [found.lng, found.lat] }
        : prev.location,
    }));
  };

  const handleAddService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (idx) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx),
    }));
  };

  const handleAddImage = () => {
    if (newImage.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }));
      setNewImage('');
    }
  };

  const handleRemoveImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await businessService.updateBusiness(id, formData);
        toast.success('Business listing updated successfully!');
      } else {
        await businessService.createBusiness(formData);
        toast.success('Business listing submitted successfully!');
      }
      navigate('/owner');
    } catch (err) {
      toast.error(err.message || 'Error saving business');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-500 text-sm">Loading listing editor...</div>;
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/owner"
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Business Listing' : 'Register New Business'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Provide accurate coordinates, contact info, and hours for Hyderabad customers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. General Business Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Tiffins & Biryani House"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price Range
              </label>
              <select
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="$">$ (Budget friendly)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Upscale)</option>
                <option value="$$$$">$$$$ (Fine dining / Luxury)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your specialties, products, menu highlights, or unique facilities..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & Location Coordinates */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <span>2. Address & Geographic Coordinates</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                placeholder="Plot 42, 1st Avenue, Main Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Locality / Area *
              </label>
              <select
                value={formData.address.locality}
                onChange={(e) => handleLocalityChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {CITIES_AND_REGIONS.map((region) => (
                  <optgroup key={region.city} label={`📍 ${region.city}`}>
                    {region.localities.map((loc) => (
                      <option key={`${region.city}-${loc.name}`} value={loc.name}>
                        {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={formData.address.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, postalCode: e.target.value },
                  })
                }
                placeholder="500062"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Longitude (GeoJSON coordinate 1) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.location.coordinates[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      coordinates: [parseFloat(e.target.value) || 0, formData.location.coordinates[1]],
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Latitude (GeoJSON coordinate 2) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.location.coordinates[1]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      coordinates: [formData.location.coordinates[0], parseFloat(e.target.value) || 0],
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Links */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-600" />
            <span>3. Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.contact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value },
                  })
                }
                placeholder="+91 40 2712 0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Email
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value },
                  })
                }
                placeholder="contact@business.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={formData.contact.website}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, website: e.target.value },
                  })
                }
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Operating Hours */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>4. Weekly Operating Hours</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {daysOfWeek.map((day) => {
              const dayData = formData.openingHours[day] || {
                open: '09:00',
                close: '21:00',
                isClosed: false,
              };

              return (
                <div key={day} className="py-3 flex flex-wrap items-center justify-between gap-4">
                  <span className="w-28 text-xs font-bold uppercase text-slate-700 tracking-wider">
                    {day}
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayData.isClosed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            openingHours: {
                              ...formData.openingHours,
                              [day]: { ...dayData, isClosed: e.target.checked },
                            },
                          })
                        }
                        className="rounded text-teal-600"
                      />
                      <span>Closed</span>
                    </label>

                    {!dayData.isClosed && (
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="time"
                          value={dayData.open}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: { ...dayData, open: e.target.value },
                              },
                            })
                          }
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={dayData.close}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              openingHours: {
                                ...formData.openingHours,
                                [day]: { ...dayData, close: e.target.value },
                              },
                            })
                          }
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Services & Amenities */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            5. Services & Features
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="e.g. Free Wi-Fi, Card Payment, Outdoor Seating, Valet Parking"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
              <Button type="button" variant="secondary" size="md" onClick={handleAddService}>
                Add Service
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.services.map((svc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold"
                >
                  <span>{svc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="text-teal-500 hover:text-rose-600 transition cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6: Image URLs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-teal-600" />
            <span>6. Business Photos</span>
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
              <Button type="button" variant="secondary" size="md" onClick={handleAddImage}>
                Add Photo URL
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden h-28 border border-slate-200 group">
                  <img src={img} alt="Business" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link to="/owner">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="teal" size="md" loading={submitting} icon={Check}>
            {isEdit ? 'Save Changes' : 'Submit Business Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
