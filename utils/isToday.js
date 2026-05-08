// utils/isToday.js
export function isToday(dateString) {
  if (!dateString) return false;

  const d = new Date(dateString);
  const now = new Date();

  return d.toDateString() === now.toDateString();
}
