// helper.js
export function isActive({ startDate, endDate }) {
  const now = new Date();
  return (
    (!startDate || new Date(startDate) <= now) &&
    (!endDate || new Date(endDate) >= now)
  );
}
export function formatCountdown(ms) {
  if (ms <= 0) return "Vorbei!";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
