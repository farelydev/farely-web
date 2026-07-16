export const ROUTES = [
  { from: "LON", fromQuery: "London", to: "DXB", toQuery: "Dubai", name: "London to Dubai" },
  { from: "LON", fromQuery: "London", to: "IST", toQuery: "Istanbul", name: "London to Istanbul" },
  { from: "LON", fromQuery: "London", to: "BCN", toQuery: "Barcelona", name: "London to Barcelona" },
  { from: "LHR", fromQuery: "LHR", to: "JFK", toQuery: "JFK", name: "Heathrow to New York JFK" },
  { from: "LON", fromQuery: "London", to: "NBO", toQuery: "Nairobi", name: "London to Nairobi" },
  { from: "LON", fromQuery: "London", to: "MGQ", toQuery: "Mogadishu", name: "London to Mogadishu" },
  { from: "LON", fromQuery: "London", to: "TYO", toQuery: "Tokyo", name: "London to Tokyo" },
];

export function futureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

export function futureMonth(monthsAhead = 2) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function rotatedRoute(offset = 0) {
  const envIndex = Number.parseInt(process.env.FARELY_AUDIT_ROUTE_INDEX || "", 10);
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const index = Number.isFinite(envIndex) ? envIndex : dayIndex + offset;
  return ROUTES[((index % ROUTES.length) + ROUTES.length) % ROUTES.length];
}
