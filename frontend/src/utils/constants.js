export const CATEGORIES = [
  { name: 'Restaurants and Cafes', icon: 'Utensils', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { name: 'Grocery Stores and Supermarkets', icon: 'ShoppingBag', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { name: 'Hospitals and Clinics', icon: 'Activity', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { name: 'Pharmacies', icon: 'PlusCircle', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { name: 'Salons and Beauty Services', icon: 'Scissors', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { name: 'Automobile Repair', icon: 'Wrench', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { name: 'Electronics and Mobile Repair', icon: 'Smartphone', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { name: 'Clothing and Fashion', icon: 'Shirt', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { name: 'Educational Institutes and Coaching Centers', icon: 'GraduationCap', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { name: 'Hotels and Accommodation', icon: 'Hotel', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { name: 'Home Repair and Maintenance', icon: 'Hammer', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { name: 'Fitness Centers and Gyms', icon: 'Dumbbell', color: 'bg-red-50 text-red-600 border-red-200' },
  { name: 'Professional Services', icon: 'Briefcase', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { name: 'Other Local Businesses', icon: 'Store', color: 'bg-violet-50 text-violet-600 border-violet-200' },
];

export const CITIES_AND_REGIONS = [
  {
    city: 'Hyderabad (All Zones)',
    localities: [
      { name: 'Banjara Hills', lat: 17.4156, lng: 78.4411, zone: 'West Hyderabad' },
      { name: 'Jubilee Hills', lat: 17.4319, lng: 78.4073, zone: 'West Hyderabad' },
      { name: 'Hitec City', lat: 17.4480, lng: 78.3800, zone: 'Cyberabad' },
      { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, zone: 'Cyberabad' },
      { name: 'Madhapur', lat: 17.4486, lng: 78.3908, zone: 'Cyberabad' },
      { name: 'Kondapur', lat: 17.4699, lng: 78.3578, zone: 'Cyberabad' },
      { name: 'Financial District', lat: 17.4162, lng: 78.3428, zone: 'Cyberabad' },
      { name: 'Begumpet', lat: 17.4440, lng: 78.4680, zone: 'Central Hyderabad' },
      { name: 'Somajiguda', lat: 17.4265, lng: 78.4578, zone: 'Central Hyderabad' },
      { name: 'Ameerpet', lat: 17.4375, lng: 78.4482, zone: 'Central Hyderabad' },
      { name: 'Himayatnagar', lat: 17.3995, lng: 78.4890, zone: 'Central Hyderabad' },
      { name: 'Abids', lat: 17.3916, lng: 78.4734, zone: 'Central Hyderabad' },
      { name: 'Secunderabad', lat: 17.4410, lng: 78.5000, zone: 'Secunderabad' },
      { name: 'ECIL', lat: 17.4780, lng: 78.5670, zone: 'East Hyderabad' },
      { name: 'AS Rao Nagar', lat: 17.4850, lng: 78.5520, zone: 'East Hyderabad' },
      { name: 'Sainikpuri', lat: 17.4910, lng: 78.5480, zone: 'East Hyderabad' },
      { name: 'Tarnaka', lat: 17.4285, lng: 78.5300, zone: 'East Hyderabad' },
      { name: 'Nagaram', lat: 17.4950, lng: 78.5910, zone: 'East Hyderabad' },
      { name: 'Kushaiguda', lat: 17.4830, lng: 78.5750, zone: 'East Hyderabad' },
      { name: 'Malkajgiri', lat: 17.4510, lng: 78.5320, zone: 'North Hyderabad' },
      { name: 'Uppal', lat: 17.4018, lng: 78.5602, zone: 'East Hyderabad' },
      { name: 'Kukatpally', lat: 17.4849, lng: 78.4138, zone: 'North-West Hyderabad' },
      { name: 'Miyapur', lat: 17.4968, lng: 78.3614, zone: 'North-West Hyderabad' },
      { name: 'Kompally', lat: 17.5385, lng: 78.4852, zone: 'North Hyderabad' },
      { name: 'Charminar (Old City)', lat: 17.3616, lng: 78.4747, zone: 'South Hyderabad' },
      { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247, zone: 'South-East Hyderabad' },
      { name: 'LB Nagar', lat: 17.3457, lng: 78.5522, zone: 'South-East Hyderabad' },
      { name: 'Mehdipatnam', lat: 17.3916, lng: 78.4388, zone: 'South-West Hyderabad' },
    ],
  },
  {
    city: 'Bengaluru',
    localities: [
      { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, zone: 'Central Bengaluru' },
      { name: 'Koramangala', lat: 12.9352, lng: 77.6245, zone: 'South Bengaluru' },
      { name: 'HSR Layout', lat: 12.9121, lng: 77.6446, zone: 'South Bengaluru' },
      { name: 'Whitefield', lat: 12.9698, lng: 77.7500, zone: 'East Bengaluru' },
      { name: 'MG Road', lat: 12.9756, lng: 77.6066, zone: 'Central Bengaluru' },
    ],
  },
  {
    city: 'Mumbai',
    localities: [
      { name: 'Bandra West', lat: 19.0596, lng: 72.8295, zone: 'Western Suburbs' },
      { name: 'Andheri West', lat: 19.1363, lng: 72.8277, zone: 'Western Suburbs' },
      { name: 'Juhu', lat: 19.1075, lng: 72.8263, zone: 'Western Suburbs' },
      { name: 'Colaba', lat: 18.9067, lng: 72.8147, zone: 'South Mumbai' },
    ],
  },
  {
    city: 'Delhi NCR',
    localities: [
      { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, zone: 'Central Delhi' },
      { name: 'Cyber Hub Gurgaon', lat: 28.4950, lng: 77.0890, zone: 'Gurgaon' },
      { name: 'South Extension', lat: 28.5729, lng: 77.2219, zone: 'South Delhi' },
      { name: 'Noida Sector 18', lat: 28.5708, lng: 77.3260, zone: 'Noida' },
    ],
  },
];

// Flat list for easy dropdowns
export const HYDERABAD_LOCALITIES = CITIES_AND_REGIONS[0].localities;

export const ALL_LOCALITIES = CITIES_AND_REGIONS.flatMap((region) =>
  region.localities.map((loc) => ({
    ...loc,
    fullName: `${loc.name}, ${region.city.split(' ')[0]}`,
    city: region.city.split(' ')[0],
  }))
);

export const DEFAULT_COORDINATES = {
  lat: 17.4480,
  lng: 78.3800,
  label: 'Hyderabad (All Localities)',
};
