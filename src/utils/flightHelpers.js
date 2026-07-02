import { AIRPORTS } from "../data/airports";

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function pad2(n) {
  const s = String(n);
  return s.length === 1 ? `0${s}` : s;
}

export function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function addDaysISO(yyyyMmDd, add) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + Number(add || 0));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function airportLabel(a) {
  if (!a) return "";
  const parts = [];
  if (a.city) parts.push(a.city);
  if (a.country) parts.push(a.country);
  return `${parts.join(", ")} — ${a.name}`.trim();
}

export function findAirport(iata) {
  return AIRPORTS.find((a) => a.iata === iata) || null;
}

export function getIataCode({ selected, text, fallback = "XXX" }) {
  const iata = selected?.iata;
  if (iata && /^[A-Z]{3}$/.test(iata)) return iata.toUpperCase();

  const t = (text || "").trim();
  if (!t) return fallback;

  const direct = t.toUpperCase().match(/\b([A-Z]{3})\b/);
  if (direct?.[1]) return direct[1];

  return t.slice(0, 3).toUpperCase();
}

export function parseMoneyToNumber(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : Infinity;
}

export function isoDurationToMinutes(iso) {
  if (!iso || typeof iso !== "string") return Infinity;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!m) return Infinity;
  return Number(m[1] || 0) * 60 + Number(m[2] || 0);
}

export function minutesToPretty(mins) {
  if (!Number.isFinite(mins) || mins === Infinity) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function firstSegment(offer) {
  return offer?.itineraries?.[0]?.segments?.[0] || null;
}

export function lastSegment(offer) {
  const segs = offer?.itineraries?.[0]?.segments || [];
  return segs[segs.length - 1] || null;
}

export function stopsLabel(offer) {
  const segs = offer?.itineraries?.[0]?.segments || [];
  const stops = Math.max(0, segs.length - 1);
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export function carrierLabel(offer) {
  const segs = offer?.itineraries?.[0]?.segments || [];
  return segs?.[0]?.carrier || offer?.validatingAirlines?.[0] || "—";
}


export function airportDisplayName(code) {
  const normalized = String(code || "").toUpperCase();
  const airport = findAirport(normalized);
  if (!airport) return normalized || "—";
  const name = /airport|international/i.test(airport.name) ? airport.name : `${airport.name} Airport`;
  return `${airport.city} ${name} (${airport.iata})`;
}

export function timeBandFromDateTime(value) {
  const hour = Number(String(value || "").slice(11, 13));
  if (!Number.isFinite(hour)) return "";
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "overnight";
}
