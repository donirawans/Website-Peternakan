export const formatDateIndo = (dateString) => {
  if (!dateString) return '-';
  try {
    const cleanDate = typeof dateString === 'string' ? dateString.split('T')[0] : dateString;
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatVisitSchedule = (dateString, timeString) => {
  const formattedDate = formatDateIndo(dateString);
  if (!timeString) return formattedDate;
  return `${formattedDate} • Pukul ${timeString} WIB`;
};