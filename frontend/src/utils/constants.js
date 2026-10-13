export const CATEGORIES = [
  { name: 'Restaurants, Cafes & Food Outlets', icon: 'Utensils', color: 'bg-orange-50 text-orange-600 border-orange-200', tag: 'Food & Dining' },
  { name: 'Supermarkets & Grocery Stores', icon: 'ShoppingBag', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', tag: 'Groceries' },
  { name: 'Hospitals, Clinics & Diagnostic Labs', icon: 'Activity', color: 'bg-rose-50 text-rose-600 border-rose-200', tag: 'Healthcare' },
  { name: 'Pharmacies & Medical Shops', icon: 'PlusCircle', color: 'bg-teal-50 text-teal-600 border-teal-200', tag: 'Pharmacy' },
  { name: 'Schools, Colleges & Training Institutes', icon: 'GraduationCap', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', tag: 'Education' },
  { name: 'IT Companies, Tech Firms & Coworking', icon: 'Briefcase', color: 'bg-sky-50 text-sky-600 border-sky-200', tag: 'IT & Tech' },
  { name: 'Banks, ATMs & Financial Services', icon: 'Building2', color: 'bg-cyan-50 text-cyan-600 border-cyan-200', tag: 'Finance' },
  { name: 'Salons, Spas & Beauty Parlours', icon: 'Scissors', color: 'bg-purple-50 text-purple-600 border-purple-200', tag: 'Beauty' },
  { name: 'Gyms, Fitness & Yoga Studios', icon: 'Dumbbell', color: 'bg-red-50 text-red-600 border-red-200', tag: 'Fitness' },
  { name: 'Automobile Showrooms, Garages & Repair', icon: 'Wrench', color: 'bg-amber-50 text-amber-600 border-amber-200', tag: 'Auto' },
  { name: 'Electronics, Mobile Stores & Computer Repair', icon: 'Smartphone', color: 'bg-blue-50 text-blue-600 border-blue-200', tag: 'Electronics' },
  { name: 'Clothing, Fashion & Boutiques', icon: 'Shirt', color: 'bg-pink-50 text-pink-600 border-pink-200', tag: 'Fashion' },
  { name: 'Hotels and Accommodation', icon: 'Hotel', color: 'bg-teal-50 text-teal-700 border-teal-200', tag: 'Hospitality' },
  { name: 'Libraries & Bookshops', icon: 'BookOpen', color: 'bg-lime-50 text-lime-700 border-lime-200', tag: 'Books' },
  { name: 'Real Estate & Property Services', icon: 'Home', color: 'bg-amber-50 text-amber-700 border-amber-200', tag: 'Real Estate' },
  { name: 'Courier, Printing & Stationery Services', icon: 'Printer', color: 'bg-violet-50 text-violet-600 border-violet-200', tag: 'Services' },
  { name: 'Home Repair and Maintenance', icon: 'Hammer', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', tag: 'Home Care' },
  { name: 'Other Local Businesses', icon: 'Store', color: 'bg-slate-50 text-slate-700 border-slate-200', tag: 'General' },

  // Backward-compatible category aliases
  { name: 'Restaurants and Cafes', icon: 'Utensils', color: 'bg-orange-50 text-orange-600 border-orange-200', tag: 'Food' },
  { name: 'Grocery Stores and Supermarkets', icon: 'ShoppingBag', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', tag: 'Groceries' },
  { name: 'Hospitals and Clinics', icon: 'Activity', color: 'bg-rose-50 text-rose-600 border-rose-200', tag: 'Healthcare' },
  { name: 'Pharmacies', icon: 'PlusCircle', color: 'bg-teal-50 text-teal-600 border-teal-200', tag: 'Pharmacy' },
  { name: 'Salons and Beauty Services', icon: 'Scissors', color: 'bg-purple-50 text-purple-600 border-purple-200', tag: 'Beauty' },
  { name: 'Automobile Repair', icon: 'Wrench', color: 'bg-amber-50 text-amber-600 border-amber-200', tag: 'Auto' },
  { name: 'Electronics and Mobile Repair', icon: 'Smartphone', color: 'bg-blue-50 text-blue-600 border-blue-200', tag: 'Electronics' },
  { name: 'Clothing and Fashion', icon: 'Shirt', color: 'bg-pink-50 text-pink-600 border-pink-200', tag: 'Fashion' },
  { name: 'Educational Institutes and Coaching Centers', icon: 'GraduationCap', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', tag: 'Education' },
  { name: 'Fitness Centers and Gyms', icon: 'Dumbbell', color: 'bg-red-50 text-red-600 border-red-200', tag: 'Fitness' },
  { name: 'Professional Services', icon: 'Briefcase', color: 'bg-slate-50 text-slate-700 border-slate-200', tag: 'Services' },
];

export const PRIMARY_CATEGORIES = CATEGORIES.slice(0, 18);

export const HYDERABAD_ZONES = [
  {
    name: '🌟 Medchal & Kandlakoya Region',
    localities: [
      { name: 'Kandlakoya', lat: 17.5878, lng: 78.4878, zone: 'Kandlakoya', pincode: '501401' },
      { name: 'Kandlakoya IT Park', lat: 17.5885, lng: 78.4890, zone: 'Gateway IT Hub', pincode: '501401' },
      { name: 'Medchal Town', lat: 17.6297, lng: 78.4814, zone: 'Medchal District', pincode: '501401' },
      { name: 'Medchal Checkpost', lat: 17.6380, lng: 78.4790, zone: 'NH 44 Hub', pincode: '501401' },
      { name: 'Medchal Railway Station Road', lat: 17.6250, lng: 78.4860, zone: 'Medchal', pincode: '501401' },
      { name: 'Gundlapochampally', lat: 17.5750, lng: 78.4840, zone: 'Medchal Industrial', pincode: '501401' },
      { name: 'Dulapally', lat: 17.5450, lng: 78.4650, zone: 'Medchal Area', pincode: '500014' },
    ],
  },
  {
    name: '📍 North Hyderabad',
    localities: [
      { name: 'Kompally', lat: 17.5385, lng: 78.4852, zone: 'North Hyderabad', pincode: '500100' },
      { name: 'Suchitra', lat: 17.5130, lng: 78.4740, zone: 'North Hyderabad', pincode: '500067' },
      { name: 'Jeedimetla', lat: 17.5180, lng: 78.4480, zone: 'North Industrial', pincode: '500055' },
      { name: 'Quthbullapur', lat: 17.5050, lng: 78.4550, zone: 'North Hyderabad', pincode: '500055' },
      { name: 'Alwal', lat: 17.5020, lng: 78.5080, zone: 'North Hyderabad', pincode: '500010' },
      { name: 'Bowenpally', lat: 17.4720, lng: 78.4880, zone: 'North Hyderabad', pincode: '500011' },
      { name: 'Bolarum', lat: 17.5260, lng: 78.5130, zone: 'North Hyderabad', pincode: '500010' },
      { name: 'Yapral', lat: 17.5120, lng: 78.5360, zone: 'North Hyderabad', pincode: '500087' },
    ],
  },
  {
    name: '📍 West Hyderabad & Cyberabad',
    localities: [
      { name: 'HITEC City', lat: 17.4480, lng: 78.3800, zone: 'Cyberabad IT Corridor', pincode: '500081' },
      { name: 'Madhapur', lat: 17.4486, lng: 78.3908, zone: 'Cyberabad', pincode: '500081' },
      { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, zone: 'Cyberabad IT Hub', pincode: '500032' },
      { name: 'Kondapur', lat: 17.4699, lng: 78.3578, zone: 'Cyberabad', pincode: '500084' },
      { name: 'Financial District', lat: 17.4162, lng: 78.3428, zone: 'Cyberabad', pincode: '500032' },
      { name: 'Kukatpally', lat: 17.4849, lng: 78.4138, zone: 'North-West Commercial', pincode: '500072' },
      { name: 'KPHB', lat: 17.4930, lng: 78.4010, zone: 'North-West Hub', pincode: '500072' },
      { name: 'Miyapur', lat: 17.4968, lng: 78.3614, zone: 'North-West Transit Hub', pincode: '500049' },
      { name: 'Hafeezpet', lat: 17.4870, lng: 78.3490, zone: 'Cyberabad', pincode: '500049' },
      { name: 'Nallagandla', lat: 17.4650, lng: 78.3070, zone: 'West Residential', pincode: '500019' },
      { name: 'Jubilee Hills', lat: 17.4319, lng: 78.4073, zone: 'West Upscale', pincode: '500033' },
      { name: 'Banjara Hills', lat: 17.4156, lng: 78.4411, zone: 'West Commercial', pincode: '500034' },
    ],
  },
  {
    name: '📍 Central Hyderabad & Secunderabad',
    localities: [
      { name: 'Secunderabad', lat: 17.4410, lng: 78.5000, zone: 'Twin Cities Center', pincode: '500003' },
      { name: 'Paradise', lat: 17.4420, lng: 78.4870, zone: 'Central Commercial', pincode: '500003' },
      { name: 'Begumpet', lat: 17.4440, lng: 78.4680, zone: 'Central Business District', pincode: '500016' },
      { name: 'Ameerpet', lat: 17.4375, lng: 78.4482, zone: 'Central Education Hub', pincode: '500016' },
      { name: 'Himayatnagar', lat: 17.3995, lng: 78.4890, zone: 'Central Residential', pincode: '500029' },
      { name: 'Abids', lat: 17.3916, lng: 78.4734, zone: 'Heritage Market', pincode: '500001' },
      { name: 'Koti', lat: 17.3850, lng: 78.4860, zone: 'Medical & Book Bazaar', pincode: '500095' },
      { name: 'Somajiguda', lat: 17.4265, lng: 78.4578, zone: 'Central Commercial', pincode: '500082' },
      { name: 'Panjagutta', lat: 17.4265, lng: 78.4510, zone: 'Central Hub', pincode: '500082' },
    ],
  },
  {
    name: '📍 East Hyderabad',
    localities: [
      { name: 'Uppal', lat: 17.4018, lng: 78.5602, zone: 'East Metro Hub', pincode: '500039' },
      { name: 'Habsiguda', lat: 17.4160, lng: 78.5440, zone: 'East Institutional', pincode: '500007' },
      { name: 'Tarnaka', lat: 17.4285, lng: 78.5300, zone: 'East Hub', pincode: '500017' },
      { name: 'Nacharam', lat: 17.4360, lng: 78.5680, zone: 'East Industrial', pincode: '500076' },
      { name: 'Mallapur', lat: 17.4480, lng: 78.5770, zone: 'East Zone', pincode: '500076' },
      { name: 'LB Nagar', lat: 17.3457, lng: 78.5522, zone: 'South-East Commercial', pincode: '500074' },
      { name: 'Nagole', lat: 17.3750, lng: 78.5680, zone: 'East Metro', pincode: '500068' },
      { name: 'ECIL', lat: 17.4780, lng: 78.5670, zone: 'East Hyderabad', pincode: '500062' },
      { name: 'AS Rao Nagar', lat: 17.4850, lng: 78.5520, zone: 'East Commercial', pincode: '500062' },
      { name: 'Sainikpuri', lat: 17.4910, lng: 78.5480, zone: 'East Cafe Corridor', pincode: '500094' },
      { name: 'Malkajgiri', lat: 17.4510, lng: 78.5320, zone: 'North-East Zone', pincode: '500047' },
    ],
  },
  {
    name: '📍 South Hyderabad & Airport Zone',
    localities: [
      { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247, zone: 'South Commercial Hub', pincode: '500060' },
      { name: 'Malakpet', lat: 17.3730, lng: 78.4980, zone: 'South Zone', pincode: '500036' },
      { name: 'Mehdipatnam', lat: 17.3916, lng: 78.4388, zone: 'South-West Transit Hub', pincode: '500028' },
      { name: 'Tolichowki', lat: 17.4010, lng: 78.4120, zone: 'Food Corridor', pincode: '500008' },
      { name: 'Attapur', lat: 17.3670, lng: 78.4280, zone: 'South-West', pincode: '500048' },
      { name: 'Rajendranagar', lat: 17.3190, lng: 78.4050, zone: 'Agricultural & Agri-Tech', pincode: '500030' },
      { name: 'Shamshabad', lat: 17.2540, lng: 78.4310, zone: 'Airport Zone & Aerocity', pincode: '501218' },
      { name: 'Charminar (Old City)', lat: 17.3616, lng: 78.4747, zone: 'Heritage Old City', pincode: '500002' },
    ],
  },
];

export const CITIES_AND_REGIONS = [
  {
    city: 'Hyderabad (All Telangana Zones)',
    localities: HYDERABAD_ZONES.flatMap((zone) =>
      zone.localities.map((loc) => ({
        ...loc,
        regionName: zone.name,
      }))
    ),
  },
  {
    city: 'Bengaluru',
    localities: [
      { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, zone: 'Central Bengaluru' },
      { name: 'Koramangala', lat: 12.9352, lng: 77.6245, zone: 'South Bengaluru' },
      { name: 'Whitefield', lat: 12.9698, lng: 77.7500, zone: 'East Bengaluru' },
    ],
  },
  {
    city: 'Mumbai',
    localities: [
      { name: 'Bandra West', lat: 19.0596, lng: 72.8295, zone: 'Western Suburbs' },
      { name: 'Juhu', lat: 19.1075, lng: 72.8263, zone: 'Western Suburbs' },
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
  lat: 17.5878, // Centered near Kandlakoya & North-Cyberabad Axis
  lng: 78.4878,
  label: 'Kandlakoya / Hyderabad',
};
