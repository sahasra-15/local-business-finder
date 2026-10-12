export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDistance = (km) => {
  if (km === null || km === undefined) return null;
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
};

export const isBusinessOpenNow = (openingHours) => {
  if (!openingHours) return null;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const todayHours = openingHours[currentDay];

  if (!todayHours || todayHours.isClosed) {
    return { isOpen: false, text: 'Closed today' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const openMinutes = parseTime(todayHours.open);
  const closeMinutes = parseTime(todayHours.close);

  if (openMinutes === null || closeMinutes === null) {
    return null;
  }

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, text: `Open until ${todayHours.close}` };
  }

  return { isOpen: false, text: `Closed • Opens at ${todayHours.open}` };
};
