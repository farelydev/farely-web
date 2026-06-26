// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Amadeus from "amadeus";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { worldAirports, worldCountries } from "./src/data/worldAirports.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const PORT = process.env.PORT || 4000;
const AMADEUS_HOSTNAME = String(process.env.AMADEUS_HOSTNAME || "test").trim().toLowerCase();
const FLIGHT_DEAL_PARTNER = String(process.env.FLIGHT_DEAL_PARTNER || "google-flights-placeholder").trim();
const FLIGHT_AFFILIATE_URL = String(process.env.FLIGHT_AFFILIATE_URL || "").trim();
const TRAVELPAYOUTS_MARKER = String(process.env.TRAVELPAYOUTS_MARKER || "").trim();
const TRAVELPAYOUTS_HOST = String(process.env.TRAVELPAYOUTS_HOST || "www.aviasales.com").trim();
const TRAVELPAYOUTS_SUB_ID = String(process.env.TRAVELPAYOUTS_SUB_ID || "").trim();
const ADMIN_ANALYTICS_TOKEN = String(process.env.ADMIN_ANALYTICS_TOKEN || "").trim();
const SUPPORT_TO_EMAIL = String(process.env.SUPPORT_TO_EMAIL || process.env.VITE_CONTACT_EMAIL || "info@tryfarely.com").trim();
const SUPPORT_FROM_EMAIL = String(process.env.SUPPORT_FROM_EMAIL || "Farely Support <support@tryfarely.com>").trim();
const PUBLIC_SUPPORT_EMAIL = String(process.env.PUBLIC_SUPPORT_EMAIL || process.env.VITE_SUPPORT_EMAIL || "support@tryfarely.com").trim();
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || "").trim();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ANALYTICS_DIR = path.join(__dirname, "data");
const DEAL_CLICKS_FILE = path.join(ANALYTICS_DIR, "deal-clicks.jsonl");
const SUPPORT_REQUESTS_FILE = path.join(ANALYTICS_DIR, "support-requests.jsonl");
const DIST_DIR = path.join(__dirname, "dist");

const hasAmadeusCredentials =
  !!process.env.AMADEUS_CLIENT_ID && !!process.env.AMADEUS_CLIENT_SECRET;

const USE_DEMO_FALLBACK = String(process.env.USE_DEMO_FALLBACK || "true").toLowerCase() !== "false";
const SAFE_FLEX_WINDOW_MAX = Number(String(process.env.SAFE_FLEX_WINDOW_MAX || "3").trim()) || 3;

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: AMADEUS_HOSTNAME === "production" ? "production" : "test",
});

const DEFAULT_LOCATIONS = [
  { city: "London", country: "United Kingdom", name: "All airports", iata: "LON", type: "city", tags: ["LHR", "LGW", "STN", "LTN", "LCY"] },
  { city: "Doha", country: "Qatar", name: "Hamad International", iata: "DOH", type: "airport", tags: ["DOH"] },
  { city: "Dubai", country: "United Arab Emirates", name: "Dubai International", iata: "DXB", type: "airport", tags: ["DXB"] },
  { city: "Istanbul", country: "Türkiye", name: "Istanbul Airport", iata: "IST", type: "airport", tags: ["IST"] },
  { city: "New York", country: "United States", name: "All airports", iata: "NYC", type: "city", tags: ["JFK", "EWR", "LGA"] },
  { city: "Jeddah", country: "Saudi Arabia", name: "King Abdulaziz International", iata: "JED", type: "airport", tags: ["JED", "Umrah"] },
  { city: "Mogadishu", country: "Somalia", name: "Aden Adde International", iata: "MGQ", type: "airport", tags: ["MGQ"] },
  { city: "Nairobi", country: "Kenya", name: "Jomo Kenyatta International", iata: "NBO", type: "airport", tags: ["NBO"] },
  { city: "Bangkok", country: "Thailand", name: "All airports", iata: "BKK", type: "city", tags: ["BKK", "DMK"] },
  { city: "Tokyo", country: "Japan", name: "All airports", iata: "TYO", type: "city", tags: ["HND", "NRT"] },
  { city: "Toronto", country: "Canada", name: "All airports", iata: "YTO", type: "city", tags: ["YYZ", "YTZ"] },
  { city: "Lagos", country: "Nigeria", name: "Murtala Muhammed International", iata: "LOS", type: "airport", tags: ["LOS"] },
  { city: "Cairo", country: "Egypt", name: "Cairo International", iata: "CAI", type: "airport", tags: ["CAI"] },
];

const COUNTRY_NAMES = new Map(
  worldCountries.map((country) => [String(country.code || "").toUpperCase(), country.name])
);

const WORLD_AIRPORT_LOCATIONS = worldAirports
  .filter((airport) => {
    const iata = String(airport.iata_code || "").trim().toUpperCase();
    return (
      validateIata(iata) &&
      String(airport.scheduled_service || "").toLowerCase() === "yes" &&
      ["large_airport", "medium_airport", "small_airport"].includes(String(airport.type || ""))
    );
  })
  .map((airport) => {
    const countryCode = String(airport.iso_country || "").trim().toUpperCase();
    const iata = String(airport.iata_code || "").trim().toUpperCase();
    const city = String(airport.municipality || airport.name || iata).trim();
    const typeRank = airport.type === "large_airport" ? 3 : airport.type === "medium_airport" ? 2 : 1;

    return {
      city,
      country: COUNTRY_NAMES.get(countryCode) || countryCode,
      name: String(airport.name || city).trim(),
      iata,
      type: "airport",
      tags: [iata, countryCode, airport.ident].filter(Boolean),
      searchText: `${city} ${COUNTRY_NAMES.get(countryCode) || countryCode} ${airport.name || ""} ${iata} ${airport.ident || ""}`.toLowerCase(),
      typeRank,
    };
  });

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log(`[API] ${req.method} ${req.path} query=`, req.query);
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "farely-api",
    amadeusCredentialsLoaded: hasAmadeusCredentials,
    amadeusEnvironment: AMADEUS_HOSTNAME === "production" ? "production" : "test",
    demoFallbackEnabled: USE_DEMO_FALLBACK,
    flightDealPartner: FLIGHT_AFFILIATE_URL || TRAVELPAYOUTS_MARKER ? FLIGHT_DEAL_PARTNER : "google-flights-placeholder",
    flightAffiliateConfigured: !!(FLIGHT_AFFILIATE_URL || TRAVELPAYOUTS_MARKER),
    travelpayoutsConfigured: !!TRAVELPAYOUTS_MARKER,
    analyticsProtected: !!ADMIN_ANALYTICS_TOKEN,
    serverTime: new Date().toISOString(),
  });
});

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractAmadeusError(err) {
  const possibleErrors = [];

  if (Array.isArray(err?.description)) possibleErrors.push(...err.description);
  if (Array.isArray(err?.response?.data?.errors)) possibleErrors.push(...err.response.data.errors);
  if (Array.isArray(err?.result?.errors)) possibleErrors.push(...err.result.errors);

  const body = err?.response?.body || err?.response?.text || err?.body || null;

  if (typeof body === "string") {
    const parsed = safeJsonParse(body);
    if (Array.isArray(parsed?.errors)) possibleErrors.push(...parsed.errors);
  }

  const first = possibleErrors.find(Boolean);

  const statusCode =
    Number(first?.status) ||
    Number(err?.statusCode) ||
    Number(err?.response?.statusCode) ||
    Number(err?.response?.status) ||
    500;

  const title = first?.title || err?.code || "Unknown Amadeus error";

  const detail =
    first?.detail ||
    err?.response?.data?.error_description ||
    err?.message ||
    "Amadeus returned an error, but no readable message was provided.";

  const code = first?.code || err?.code || "UNKNOWN_AMADEUS_ERROR";

  return {
    statusCode,
    title,
    detail,
    code,
    raw: {
      statusCode: err?.statusCode || err?.response?.statusCode || null,
      code: err?.code || null,
      requestPath: err?.request?.path || null,
      responseBody: typeof body === "string" ? body.slice(0, 1200) : null,
    },
  };
}

function amadeusErrorType(extracted) {
  const text = `${extracted.title || ""} ${extracted.detail || ""} ${extracted.code || ""}`.toLowerCase();
  const status = Number(extracted.statusCode);

  if (status === 401 || text.includes("authentication") || text.includes("unauthorized") || text.includes("invalid client")) {
    return "AMADEUS_AUTHENTICATION_FAILURE";
  }

  if (status === 429 || text.includes("rate limit") || text.includes("quota") || text.includes("too many requests")) {
    return "AMADEUS_RATE_LIMIT_OR_QUOTA";
  }

  if (status === 400 && (text.includes("origin") || text.includes("destination") || text.includes("iata") || text.includes("location"))) {
    return "INVALID_AIRPORT_CODE";
  }

  if (status === 400 && (text.includes("date") || text.includes("departure"))) {
    return "INVALID_DATE";
  }

  if (text.includes("no result") || text.includes("no flight") || text.includes("no availability")) {
    return "NO_RESULTS_FOUND";
  }

  if (status >= 500 || text.includes("test environment") || text.includes("sandbox")) {
    return "AMADEUS_TEST_ENVIRONMENT_LIMITATION";
  }

  return "AMADEUS_PROVIDER_ERROR";
}

function makeUserFriendlyError(err, context = {}) {
  const extracted = extractAmadeusError(err);
  const type = amadeusErrorType(extracted);

  const routeText =
    context.origin && context.destination
      ? `${context.origin.toUpperCase()} → ${context.destination.toUpperCase()}`
      : "this route";

  const dateText = context.departureDate ? ` on ${context.departureDate}` : "";

  let message = `${extracted.title}: ${extracted.detail}`;

  if (type === "AMADEUS_TEST_ENVIRONMENT_LIMITATION") {
    message = `Amadeus returned an internal error for ${routeText}${dateText}. This often happens in the test/sandbox API for some routes or dates.`;
  }

  if (type === "AMADEUS_AUTHENTICATION_FAILURE") {
    message =
      "Amadeus authentication failed. Check AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in your .env file, then restart node server.js.";
  }

  if (type === "AMADEUS_RATE_LIMIT_OR_QUOTA") {
    message = "Amadeus rate limit or quota was reached. Wait a moment, then try again with a narrower search.";
  }

  if (type === "NO_RESULTS_FOUND") {
    message = `No Amadeus results found for ${routeText}${dateText}. Try a different airport code, date, or route.`;
  }

  if (type === "INVALID_AIRPORT_CODE") {
    message = `Amadeus rejected the airport or city code for ${routeText}. Use a valid 3-letter IATA city/airport code.`;
  }

  if (type === "INVALID_DATE") {
    message = "Amadeus rejected the travel date. Use YYYY-MM-DD and choose a future date.";
  }

  return {
    statusCode: extracted.statusCode >= 400 && extracted.statusCode < 600 ? extracted.statusCode : 500,
    error: extracted.title,
    type,
    message,
    amadeus: extracted,
  };
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isValidISODate(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const dt = new Date(Date.UTC(y, m - 1, d));

  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function isFutureISODate(value) {
  return isValidISODate(value) && value > todayISO();
}

function validationError(res, status, type, message, got = undefined) {
  return res.status(status).json({
    error: type,
    type,
    message,
    ...(got ? { got } : {}),
  });
}

function firstItinerarySegment(itinerary) {
  return itinerary?.segments?.[0] || null;
}

function lastItinerarySegment(itinerary) {
  const segs = itinerary?.segments || [];
  return segs[segs.length - 1] || null;
}

function buildDealUrl({
  origin,
  destination,
  departureDate,
  returnDate = "",
  carrier = "",
  offerId = "",
  source = "amadeus",
}) {
  const params = new URLSearchParams();
  params.set("origin", origin || "");
  params.set("destination", destination || "");
  params.set("departureDate", departureDate || "");
  if (returnDate) params.set("returnDate", returnDate);
  if (carrier) params.set("carrier", carrier);
  if (offerId) params.set("offerId", offerId);
  params.set("source", source);

  return `/api/deals/flight?${params.toString()}`;
}

function buildGoogleFlightsUrl({ origin, destination, departureDate, returnDate = "" }) {
  const query = returnDate
    ? `Flights from ${origin} to ${destination} departing ${departureDate} returning ${returnDate}`
    : `Flights from ${origin} to ${destination} departing ${departureDate}`;

  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

function dateTokenParts(value) {
  if (!isValidISODate(value)) {
    return {
      day: "",
      month: "",
      year: "",
      shortYear: "",
      compact: "",
    };
  }

  const [year, month, day] = value.split("-");

  return {
    day,
    month,
    year,
    shortYear: year.slice(2),
    compact: `${day}${month}`,
  };
}

function appendFarelyTrackingParams(url, {
  origin,
  destination,
  departureDate,
  returnDate = "",
  carrier = "",
  offerId = "",
  source = "unknown",
}) {
  url.searchParams.set("utm_source", "farely");
  url.searchParams.set("utm_medium", "view_deal");
  url.searchParams.set("farely_origin", origin);
  url.searchParams.set("farely_destination", destination);
  url.searchParams.set("farely_departure_date", departureDate);
  if (returnDate) url.searchParams.set("farely_return_date", returnDate);
  if (carrier) url.searchParams.set("farely_carrier", carrier);
  if (offerId) url.searchParams.set("farely_offer_id", offerId);
  url.searchParams.set("farely_source", source);

  return url;
}

function buildTravelpayoutsFlightUrl({
  origin,
  destination,
  departureDate,
  returnDate = "",
  carrier = "",
  offerId = "",
  source = "unknown",
}) {
  if (!TRAVELPAYOUTS_MARKER) return null;

  const host = TRAVELPAYOUTS_HOST.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const depart = dateTokenParts(departureDate);
  const ret = dateTokenParts(returnDate);
  const searchPath = `${origin}${depart.compact}${destination}${ret.compact}1`;
  const marker = TRAVELPAYOUTS_SUB_ID ? `${TRAVELPAYOUTS_MARKER}.${TRAVELPAYOUTS_SUB_ID}` : TRAVELPAYOUTS_MARKER;

  try {
    const url = new URL(`https://${host}/search/${searchPath}`);
    url.searchParams.set("marker", marker);
    appendFarelyTrackingParams(url, {
      origin,
      destination,
      departureDate,
      returnDate,
      carrier,
      offerId,
      source,
    });

    return url.toString();
  } catch {
    return null;
  }
}

function buildFlightAffiliateUrl({
  origin,
  destination,
  departureDate,
  returnDate = "",
  carrier = "",
  offerId = "",
  source = "unknown",
}) {
  if (!FLIGHT_AFFILIATE_URL) {
    return buildTravelpayoutsFlightUrl({
      origin,
      destination,
      departureDate,
      returnDate,
      carrier,
      offerId,
      source,
    });
  }

  const depart = dateTokenParts(departureDate);
  const ret = dateTokenParts(returnDate);

  const values = {
    origin,
    destination,
    departureDate,
    departureDay: depart.day,
    departureMonth: depart.month,
    departureYear: depart.year,
    departureShortYear: depart.shortYear,
    departureCompact: depart.compact,
    returnDate,
    returnDay: ret.day,
    returnMonth: ret.month,
    returnYear: ret.year,
    returnShortYear: ret.shortYear,
    returnCompact: ret.compact,
    carrier,
    offerId,
    source,
    marker: TRAVELPAYOUTS_MARKER,
    subId: TRAVELPAYOUTS_SUB_ID,
  };

  const renderedUrl = FLIGHT_AFFILIATE_URL.replace(/\{([a-zA-Z]+)\}/g, (_, key) =>
    encodeURIComponent(values[key] || "")
  );

  try {
    const url = new URL(renderedUrl);
    return appendFarelyTrackingParams(url, {
      origin,
      destination,
      departureDate,
      returnDate,
      carrier,
      offerId,
      source,
    }).toString();
  } catch {
    return null;
  }
}

function analyticsAuthToken(req) {
  return String(
    req.get("x-farely-admin-token") ||
      req.query.adminToken ||
      req.query.token ||
      ""
  ).trim();
}

function requireAnalyticsAdmin(req, res) {
  if (!ADMIN_ANALYTICS_TOKEN) {
    return res.status(403).json({
      ok: false,
      error: "ANALYTICS_TOKEN_NOT_CONFIGURED",
      message: "Analytics is protected. Set ADMIN_ANALYTICS_TOKEN in the API environment.",
    });
  }

  if (analyticsAuthToken(req) !== ADMIN_ANALYTICS_TOKEN) {
    return res.status(401).json({
      ok: false,
      error: "ANALYTICS_UNAUTHORIZED",
      message: "Enter the Farely admin token to view analytics.",
    });
  }

  return null;
}

async function recordDealClick(click) {
  await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  await fs.appendFile(DEAL_CLICKS_FILE, `${JSON.stringify(click)}\n`, "utf8");
}

async function recordSupportRequest(request) {
  await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  await fs.appendFile(SUPPORT_REQUESTS_FILE, `${JSON.stringify(request)}\n`, "utf8");
}

async function forwardSupportRequest(request) {
  if (!RESEND_API_KEY) {
    return {
      sent: false,
      reason: "EMAIL_PROVIDER_NOT_CONFIGURED",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SUPPORT_FROM_EMAIL,
      to: [SUPPORT_TO_EMAIL],
      reply_to: request.customerEmail || undefined,
      subject: `Farely support request: ${request.topic || "General"}`,
      text: [
        "New Farely support request",
        "",
        `Ticket: ${request.id}`,
        `Topic: ${request.topic || "General"}`,
        `Customer email: ${request.customerEmail || "Not provided"}`,
        `Submitted at: ${request.createdAt}`,
        "",
        "Question:",
        request.message,
        "",
        "Assistant reply shown to user:",
        request.assistantReply || "None",
      ].join("\n"),
    }),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      sent: false,
      reason: "EMAIL_PROVIDER_FAILED",
      providerStatus: response.status,
      providerMessage: json?.message || json?.error || "Email provider rejected the request.",
    };
  }

  return {
    sent: true,
    providerId: json?.id || null,
  };
}

async function readDealClicks(limit = 1000) {
  try {
    const text = await fs.readFile(DEAL_CLICKS_FILE, "utf8");
    const lines = text.split("\n").filter(Boolean);
    return lines
      .slice(Math.max(0, lines.length - limit))
      .map((line) => safeJsonParse(line))
      .filter(Boolean);
  } catch (err) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

function countBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function simplifyOffers(offers) {
  const list = Array.isArray(offers) ? offers : [];

  return list.map((offer) => {
    const price = offer?.price?.grandTotal ?? null;
    const currencyCode = offer?.price?.currency ?? null;

    const itineraries = (offer?.itineraries || []).map((it) => {
      const segments = (it?.segments || []).map((seg) => ({
        from: seg?.departure?.iataCode ?? null,
        to: seg?.arrival?.iataCode ?? null,
        departAt: seg?.departure?.at ?? null,
        arriveAt: seg?.arrival?.at ?? null,
        carrier: seg?.carrierCode ?? null,
        flightNumber: seg?.number ?? null,
        duration: seg?.duration ?? null,
        stops: seg?.numberOfStops ?? 0,
      }));

      return {
        duration: it?.duration ?? null,
        segments,
      };
    });

    const validatingAirlines = offer?.validatingAirlineCodes || [];
    const outbound = itineraries[0] || null;
    const inbound = itineraries[1] || null;
    const outboundFirst = firstItinerarySegment(outbound);
    const outboundLast = lastItinerarySegment(outbound);
    const inboundFirst = firstItinerarySegment(inbound);
    const offerId = offer?.id ?? null;

    return {
      id: offerId,
      price,
      currency: currencyCode,
      validatingAirlines,
      itineraries,
      isDemo: false,
      dealUrl: buildDealUrl({
        origin: outboundFirst?.from,
        destination: outboundLast?.to,
        departureDate: outboundFirst?.departAt?.slice(0, 10),
        returnDate: inboundFirst?.departAt?.slice(0, 10),
        carrier: validatingAirlines[0] || outboundFirst?.carrier,
        offerId,
        source: "amadeus",
      }),
    };
  });
}

function parseMoney(v) {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : Infinity;
}

function daysInMonth(yyyy, mm1to12) {
  return new Date(yyyy, mm1to12, 0).getDate();
}

function addDaysISO(yyyyMmDd, add) {
  const [y, m, d] = yyyyMmDd.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + Number(add || 0));

  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");

  return `${yy}-${mm}-${dd}`;
}

function validateIata(code) {
  return /^[A-Z]{3}$/.test(String(code || "").trim().toUpperCase());
}

function simplifyLocation(location) {
  const iata = String(location?.iataCode || "").trim().toUpperCase();
  if (!validateIata(iata)) return null;

  const subType = String(location?.subType || "").toLowerCase();
  const city =
    location?.address?.cityName ||
    location?.name ||
    location?.detailedName ||
    iata;
  const country =
    location?.address?.countryName ||
    location?.address?.countryCode ||
    "";
  const airportName =
    location?.name ||
    location?.detailedName ||
    city;

  return {
    city,
    country,
    name: airportName,
    iata,
    type: subType === "city" ? "city" : "airport",
    tags: [iata, location?.address?.cityCode, location?.address?.countryCode].filter(Boolean),
  };
}

function fallbackLocationSearch(keyword, limit = 12) {
  const q = String(keyword || "").trim().toLowerCase();
  if (!q) return DEFAULT_LOCATIONS.slice(0, limit);

  const locationSearchText = (location) => {
    const city = String(location.city || "").toLowerCase();
    const name = String(location.name || "").toLowerCase();
    const iata = String(location.iata || "").toLowerCase();
    const tags = (location.tags || []).join(" ").toLowerCase();
    const hay = location.searchText || `${city} ${location.country} ${name} ${iata} ${tags}`.toLowerCase();

    return { city, name, iata, tags, hay };
  };

  const scoreLocation = (location, baseScore = 0) => {
    const { city, name, iata, hay } = locationSearchText(location);
    const exact = city === q || iata === q ? 80 : 0;
    const starts = city.startsWith(q) || name.startsWith(q) || iata.startsWith(q) ? 35 : 0;
    const wordStarts = hay.split(/\s+/).some((part) => part.startsWith(q)) ? 18 : 0;
    const airportRank = Number(location.typeRank || 0);
    const matchScore = exact + starts + wordStarts;

    return { location, score: matchScore > 0 ? baseScore + matchScore + airportRank : 0 };
  };

  return [
    ...DEFAULT_LOCATIONS.map((location) => scoreLocation(location, 100)),
    ...WORLD_AIRPORT_LOCATIONS.map((location) => scoreLocation(location, 0)),
  ]
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => {
      const { searchText, typeRank, ...publicLocation } = entry.location;
      return publicLocation;
    })
    .filter((location, index, locations) => locations.findIndex((item) => item.iata === location.iata) === index)
    .slice(0, limit);
}

function locationMatchesKeyword(location, keyword) {
  const q = String(keyword || "").trim().toLowerCase();
  if (!q) return true;

  const city = String(location.city || "").toLowerCase();
  const name = String(location.name || "").toLowerCase();
  const iata = String(location.iata || "").toLowerCase();
  const tags = (location.tags || []).join(" ").toLowerCase();
  const hay = `${city} ${location.country || ""} ${name} ${iata} ${tags}`.toLowerCase();

  return (
    city === q ||
    iata === q ||
    city.startsWith(q) ||
    name.startsWith(q) ||
    iata.startsWith(q) ||
    hay.split(/\s+/).some((part) => part.startsWith(q))
  );
}

function uniqueLocations(locations) {
  const seen = new Set();
  const unique = [];

  for (const location of locations) {
    if (!location?.iata) continue;
    const key = location.iata.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(location);
  }

  return unique;
}

function seededNumber(seedText, min, max) {
  const text = String(seedText || "");
  let seed = 0;

  for (let i = 0; i < text.length; i += 1) {
    seed = (seed + text.charCodeAt(i) * (i + 17)) % 100000;
  }

  return min + (seed % (max - min + 1));
}

function toIsoDateTime(date, hour, minute = 0) {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${date}T${hh}:${mm}:00`;
}

function addMinutesToDateTime(date, hour, minute, addMinutes) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d, hour, minute, 0);
  dt.setMinutes(dt.getMinutes() + addMinutes);

  const yy = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, "0");
  const da = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");

  return `${yy}-${mo}-${da}T${hh}:${mi}:00`;
}

function durationIso(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `PT${h}H`;
  return `PT${h}H${m}M`;
}

function debugDepartureDate() {
  return addDaysISO(todayISO(), 45);
}

app.get("/api/debug/amadeus", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const base = {
    amadeusClientIdExists: !!process.env.AMADEUS_CLIENT_ID,
    amadeusClientSecretExists: !!process.env.AMADEUS_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV || "development",
    amadeusEnvironment: AMADEUS_HOSTNAME === "production" ? "production" : "test",
    serverTime: new Date().toISOString(),
    demoFallbackEnabled: USE_DEMO_FALLBACK,
    flightDealPartner: FLIGHT_AFFILIATE_URL || TRAVELPAYOUTS_MARKER ? FLIGHT_DEAL_PARTNER : "google-flights-placeholder",
    flightAffiliateConfigured: !!(FLIGHT_AFFILIATE_URL || TRAVELPAYOUTS_MARKER),
    travelpayoutsConfigured: !!TRAVELPAYOUTS_MARKER,
    analyticsProtected: !!ADMIN_ANALYTICS_TOKEN,
  };

  if (!hasAmadeusCredentials) {
    return res.status(200).json({
      ...base,
      amadeusTestCall: {
        ok: false,
        type: "MISSING_CREDENTIALS",
        message: "AMADEUS_CLIENT_ID and/or AMADEUS_CLIENT_SECRET are missing from .env.",
      },
    });
  }

  try {
    const departureDate = debugDepartureDate();
    const { offers } = await flightSearch({
      origin: "LON",
      destination: "PAR",
      departureDate,
      returnDate: null,
      adults: 1,
      currency: "GBP",
      nonStop: false,
      max: 1,
    });

    return res.status(200).json({
      ...base,
      amadeusTestCall: {
        ok: true,
        route: "LON-PAR",
        departureDate,
        offerCount: offers.length,
        message:
          offers.length > 0
            ? "Amadeus test call succeeded and returned at least one offer."
            : "Amadeus test call succeeded, but returned no offers for the test route/date.",
      },
    });
  } catch (err) {
    const friendly = makeUserFriendlyError(err, {
      origin: "LON",
      destination: "PAR",
      departureDate: debugDepartureDate(),
    });

    return res.status(200).json({
      ...base,
      amadeusTestCall: {
        ok: false,
        type: friendly.type,
        message: friendly.message,
        amadeusStatusCode: friendly.amadeus?.statusCode || null,
        amadeusCode: friendly.amadeus?.code || null,
      },
    });
  }
});

app.get("/api/deals/flight", async (req, res) => {
  const origin = String(req.query.origin || "").trim().toUpperCase();
  const destination = String(req.query.destination || "").trim().toUpperCase();
  const departureDate = String(req.query.departureDate || "").trim();
  const returnDate = String(req.query.returnDate || "").trim();
  const carrier = String(req.query.carrier || "").trim().toUpperCase();
  const offerId = String(req.query.offerId || "").trim();
  const source = String(req.query.source || "unknown").trim();
  const cabin = String(req.query.cabin || "").trim();
  const currency = String(req.query.currency || "").trim().toUpperCase();
  const price = String(req.query.price || "").trim();
  const resultRank = Number(String(req.query.resultRank || "").trim());
  const sort = String(req.query.sort || "").trim();
  const tripType = String(req.query.tripType || "").trim();
  const validReturnDate = isValidISODate(returnDate) ? returnDate : "";

  if (!validateIata(origin) || !validateIata(destination) || !isValidISODate(departureDate)) {
    return validationError(
      res,
      400,
      "INVALID_DEAL_REDIRECT",
      "A flight deal redirect needs valid origin, destination, and departureDate."
    );
  }

  const affiliateUrl = buildFlightAffiliateUrl({
    origin,
    destination,
    departureDate,
    returnDate: validReturnDate,
    carrier,
    offerId,
    source,
  });
  const target = affiliateUrl ? FLIGHT_DEAL_PARTNER : "google-flights-placeholder";
  const targetUrl =
    affiliateUrl ||
    buildGoogleFlightsUrl({
      origin,
      destination,
      departureDate,
      returnDate: validReturnDate,
    });

  const click = {
    type: "flight",
    origin,
    destination,
    departureDate,
    returnDate: validReturnDate || null,
    carrier,
    offerId,
    source,
    cabin: cabin || null,
    currency: currency || null,
    price: price || null,
    resultRank: Number.isFinite(resultRank) ? resultRank : null,
    sort: sort || null,
    tripType: tripType || null,
    target,
    targetUrl,
    userAgent: req.get("user-agent") || null,
    referrer: req.get("referer") || null,
    at: new Date().toISOString(),
  };

  try {
    await recordDealClick(click);
  } catch (err) {
    console.error("[Deal click] failed to persist:", err);
  }

  console.log("[Deal click]", click);

  return res.redirect(302, targetUrl);
});

app.get("/api/analytics/deal-clicks", async (req, res) => {
  const authResponse = requireAnalyticsAdmin(req, res);
  if (authResponse) return authResponse;

  try {
    const clicks = await readDealClicks(5000);
    const recent = clicks.slice(-25).reverse();

    return res.status(200).json({
      ok: true,
      totalClicks: clicks.length,
      byRoute: countBy(clicks, (click) => `${click.origin || "?"}-${click.destination || "?"}`),
      bySource: countBy(clicks, (click) => click.source),
      byCarrier: countBy(clicks, (click) => click.carrier),
      recent,
    });
  } catch (err) {
    console.error("[Analytics] deal-click summary failed:", err);
    return res.status(500).json({
      ok: false,
      error: "ANALYTICS_READ_FAILED",
      message: "Could not read deal-click analytics.",
    });
  }
});

app.get("/api/locations", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const keyword = String(req.query.keyword || req.query.q || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 12) || 12, 1), 20);

  if (!keyword || keyword.length < 2) {
    return res.status(200).json({
      data: DEFAULT_LOCATIONS.slice(0, limit),
      source: "default",
      warning: null,
    });
  }

  if (!hasAmadeusCredentials) {
    return res.status(200).json({
      data: fallbackLocationSearch(keyword, limit),
      source: "default-fallback",
      warning: "Amadeus credentials are missing, so only default locations are shown.",
    });
  }

  try {
    const fallbackMatches = fallbackLocationSearch(keyword, limit);
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: "CITY,AIRPORT",
      "page[limit]": limit,
      view: "LIGHT",
    });

    const amadeusLocations = uniqueLocations(
      (Array.isArray(response?.data) ? response.data : [])
        .map(simplifyLocation)
        .filter(Boolean)
        .filter((location) => locationMatchesKeyword(location, keyword))
    ).slice(0, limit);
    const locations = uniqueLocations([...fallbackMatches, ...amadeusLocations]).slice(0, limit);

    return res.status(200).json({
      data: locations,
      source: amadeusLocations.length ? "amadeus" : "default-fallback",
      warning: amadeusLocations.length ? null : "No Amadeus location matches were found, so default matches are shown.",
    });
  } catch (err) {
    const friendly = makeUserFriendlyError(err, {});

    console.error("[API] /api/locations error details:", {
      keyword,
      extracted: extractAmadeusError(err),
    });

    return res.status(200).json({
      data: fallbackLocationSearch(keyword, limit),
      source: "default-fallback",
      warning: friendly.message || "Location search failed, so default matches are shown.",
    });
  }
});

app.post("/api/support", async (req, res) => {
  const customerEmail = String(req.body?.customerEmail || "").trim();
  const message = String(req.body?.message || "").trim();
  const topic = String(req.body?.topic || "General").trim().slice(0, 80);
  const assistantReply = String(req.body?.assistantReply || "").trim();

  if (message.length < 8) {
    return res.status(400).json({
      ok: false,
      error: "SUPPORT_MESSAGE_TOO_SHORT",
      message: "Please add a little more detail before sending this to support.",
    });
  }

  if (message.length > 4000) {
    return res.status(400).json({
      ok: false,
      error: "SUPPORT_MESSAGE_TOO_LONG",
      message: "Please shorten the support message before sending.",
    });
  }

  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({
      ok: false,
      error: "INVALID_CUSTOMER_EMAIL",
      message: "Enter a valid email address so Farely can reply.",
    });
  }

  const supportRequest = {
    id: `farely-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    customerEmail,
    message,
    assistantReply,
    supportEmail: PUBLIC_SUPPORT_EMAIL,
    createdAt: new Date().toISOString(),
    userAgent: req.get("user-agent") || null,
    referrer: req.get("referer") || null,
  };

  try {
    await recordSupportRequest(supportRequest);
  } catch (err) {
    console.error("[Support] failed to persist request:", err);
    return res.status(500).json({
      ok: false,
      error: "SUPPORT_REQUEST_SAVE_FAILED",
      message: "Support could not receive this request. Please email Farely directly.",
    });
  }

  const delivery = await forwardSupportRequest(supportRequest).catch((err) => ({
    sent: false,
    reason: "EMAIL_PROVIDER_FAILED",
    providerMessage: err?.message || "Email provider failed.",
  }));

  return res.status(200).json({
    ok: true,
    id: supportRequest.id,
    supportEmail: PUBLIC_SUPPORT_EMAIL,
    emailSent: delivery.sent,
    delivery: {
      sent: delivery.sent,
      reason: delivery.reason || null,
    },
    message: delivery.sent
      ? "Your query has been sent to Farely support. Please allow up to 7 working days for a reply."
      : "Please use the email handoff to send this query to Farely support. Replies can take up to 7 working days.",
  });
});

function makeDemoOffers({
  origin,
  destination,
  departureDate,
  returnDate = null,
  adults = 1,
  currency = "GBP",
  reason = "Live provider failed, so demo data is shown for development.",
}) {
  const routeSeed = `${origin}-${destination}-${departureDate}-${returnDate || "oneway"}-${adults}`;

  const carriers = ["BA", "QR", "AF", "KL", "LH", "TK", "VS", "U2"];
  const basePrice = seededNumber(routeSeed, 72, 420);
  const baseDuration = seededNumber(routeSeed, 75, 460);

  const offers = Array.from({ length: 8 }).map((_, index) => {
    const price = basePrice + index * seededNumber(`${routeSeed}-${index}`, 12, 48);
    const departHour = 6 + ((index * 2) % 13);
    const departMinute = index % 2 === 0 ? 10 : 45;
    const duration = baseDuration + index * 18;
    const carrier = carriers[index % carriers.length];

    const hasStop = index > 2 && index % 2 === 1;
    const middleAirport = ["AMS", "CDG", "FRA", "IST", "DOH"][index % 5];

    const outboundSegments = hasStop
      ? [
          {
            from: origin,
            to: middleAirport,
            departAt: toIsoDateTime(departureDate, departHour, departMinute),
            arriveAt: addMinutesToDateTime(departureDate, departHour, departMinute, Math.floor(duration * 0.48)),
            carrier,
            flightNumber: String(100 + index),
            duration: durationIso(Math.floor(duration * 0.48)),
            stops: 0,
          },
          {
            from: middleAirport,
            to: destination,
            departAt: addMinutesToDateTime(departureDate, departHour, departMinute, Math.floor(duration * 0.48) + 75),
            arriveAt: addMinutesToDateTime(departureDate, departHour, departMinute, duration + 75),
            carrier,
            flightNumber: String(200 + index),
            duration: durationIso(Math.floor(duration * 0.52)),
            stops: 0,
          },
        ]
      : [
          {
            from: origin,
            to: destination,
            departAt: toIsoDateTime(departureDate, departHour, departMinute),
            arriveAt: addMinutesToDateTime(departureDate, departHour, departMinute, duration),
            carrier,
            flightNumber: String(300 + index),
            duration: durationIso(duration),
            stops: 0,
          },
        ];

    const itineraries = [
      {
        duration: durationIso(hasStop ? duration + 75 : duration),
        segments: outboundSegments,
      },
    ];

    if (returnDate) {
      const returnHour = 9 + ((index * 2) % 10);
      const returnMinute = index % 2 === 0 ? 35 : 5;
      const returnDuration = duration + seededNumber(`${routeSeed}-return-${index}`, -20, 35);

      itineraries.push({
        duration: durationIso(returnDuration),
        segments: [
          {
            from: destination,
            to: origin,
            departAt: toIsoDateTime(returnDate, returnHour, returnMinute),
            arriveAt: addMinutesToDateTime(returnDate, returnHour, returnMinute, returnDuration),
            carrier,
            flightNumber: String(600 + index),
            duration: durationIso(returnDuration),
            stops: 0,
          },
        ],
      });
    }

    return {
      id: `demo-${origin}-${destination}-${departureDate}-${index + 1}`,
      price: String(price.toFixed(2)),
      currency,
      validatingAirlines: [carrier],
      itineraries,
      isDemo: true,
      demoReason: reason,
      dealUrl: buildDealUrl({
        origin,
        destination,
        departureDate,
        returnDate,
        carrier,
        offerId: `demo-${origin}-${destination}-${departureDate}-${index + 1}`,
        source: "demo-fallback",
      }),
    };
  });

  return offers;
}

async function flightSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  currency,
  nonStop,
  max,
}) {
  const payload = {
    originLocationCode: origin.toUpperCase(),
    destinationLocationCode: destination.toUpperCase(),
    departureDate,
    adults: String(adults),
    currencyCode: currency.toUpperCase(),
    nonStop: !!nonStop,
    max: Number(max) || 25,
  };

  if (returnDate) payload.returnDate = String(returnDate);

  console.log("[Amadeus] flightOffersSearch payload:", payload);

  const response = await amadeus.shopping.flightOffersSearch.get(payload);
  const offers = Array.isArray(response?.data) ? response.data : [];

  return { response, offers };
}

async function flightSearchWithFallback({
  origin,
  destination,
  departureDate,
  returnDate,
  adults,
  currency,
  nonStop,
  max,
}) {
  try {
    const { response, offers } = await flightSearch({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      currency,
      nonStop,
      max,
    });

    return {
      source: "amadeus",
      response,
      offers: simplifyOffers(offers),
      providerError: null,
    };
  } catch (err) {
    const extracted = extractAmadeusError(err);

    console.error("[Amadeus] failed, checking fallback:", {
      origin,
      destination,
      departureDate,
      returnDate,
      extracted,
      demoFallbackEnabled: USE_DEMO_FALLBACK,
    });

    if (!USE_DEMO_FALLBACK) {
      throw err;
    }

    const friendly = makeUserFriendlyError(err, {
      origin,
      destination,
      departureDate,
    });

    const demoOffers = makeDemoOffers({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      currency,
      reason: friendly.message,
    }).slice(0, Number(max) || 25);

    return {
      source: "demo-fallback",
      response: null,
      offers: demoOffers,
      providerError: friendly,
    };
  }
}

app.get("/api/flights", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const origin = String(req.query.origin || req.query.from || "").trim().toUpperCase();
  const destination = String(req.query.destination || req.query.to || "").trim().toUpperCase();
  const date = String(req.query.date || req.query.departDate || "").trim();
  const returnDate = String(req.query.returnDate || "").trim() || null;

  try {
    const adults = Number(String(req.query.adults || req.query.passengers || "1").trim());
    const currency = String(req.query.currency || "GBP").trim().toUpperCase();
    const nonStop = String(req.query.nonStop || "false").trim() === "true";
    const max = Number(String(req.query.max || "25").trim());

    if (!hasAmadeusCredentials) {
      return validationError(
        res,
        500,
        "MISSING_CREDENTIALS",
        "Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env, then restart node server.js."
      );
    }

    if (!origin || !destination || !date) {
      return validationError(res, 400, "MISSING_REQUIRED_PARAMS", "Required: origin, destination, date (YYYY-MM-DD)", {
        origin,
        destination,
        date,
      });
    }

    if (!validateIata(origin) || !validateIata(destination)) {
      return validationError(
        res,
        400,
        "INVALID_AIRPORT_CODE",
        "origin and destination must be valid 3-letter IATA city/airport codes, like LON, PAR, NYC, LHR, CDG, JFK, or DOH.",
        { origin, destination }
      );
    }

    if (!isFutureISODate(date)) {
      return validationError(res, 400, "INVALID_DATE", "date must be YYYY-MM-DD and must be in the future.", { date });
    }

    if (returnDate && !isFutureISODate(returnDate)) {
      return validationError(res, 400, "INVALID_DATE", "returnDate must be YYYY-MM-DD and must be in the future.", {
        returnDate,
      });
    }

    if (returnDate && returnDate <= date) {
      return validationError(res, 400, "INVALID_DATE", "returnDate must be after the departure date.", {
        date,
        returnDate,
      });
    }

    if (!Number.isFinite(adults) || adults < 1 || adults > 9) {
      return validationError(res, 400, "INVALID_ADULTS", "adults must be between 1 and 9");
    }

    const result = await flightSearchWithFallback({
      origin,
      destination,
      departureDate: date,
      returnDate,
      adults,
      currency,
      nonStop,
      max,
    });

    return res.status(200).json({
      meta: result.response?.meta ?? null,
      count: result.offers.length,
      data: result.offers,
      source: result.source,
      warning:
        result.source === "demo-fallback"
          ? result.providerError?.message || "Live Amadeus search failed, so demo results are shown for development."
          : null,
      warningType: result.providerError?.type || null,
      message:
        result.source === "amadeus" && result.offers.length === 0
          ? `No Amadeus results found for ${origin} → ${destination} on ${date}. Try another date, airport, or route.`
          : null,
      providerError: result.providerError,
      debug: {
        origin,
        destination,
        date,
        returnDate,
        amadeusEnvironment: AMADEUS_HOSTNAME === "production" ? "production" : "test",
        demoFallbackEnabled: USE_DEMO_FALLBACK,
      },
    });
  } catch (err) {
    console.error("[API] /api/flights error details:", {
      origin,
      destination,
      date,
      returnDate,
      extracted: extractAmadeusError(err),
    });

    const friendly = makeUserFriendlyError(err, {
      origin,
      destination,
      departureDate: date,
    });

    return res.status(friendly.statusCode).json(friendly);
  }
});

app.get("/api/flexible", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const origin = String(req.query.origin || "").trim().toUpperCase();
  const destination = String(req.query.destination || "").trim().toUpperCase();
  const month = String(req.query.month || "").trim();

  try {
    const tripType = String(req.query.tripType || "oneway").trim();
    const tripLength = Number(String(req.query.tripLength || "5").trim());
    const flexWindow = Number(String(req.query.flexWindow || String(SAFE_FLEX_WINDOW_MAX)).trim());

    const adults = Number(String(req.query.adults || "1").trim());
    const currency = String(req.query.currency || "GBP").trim().toUpperCase();
    const nonStop = String(req.query.nonStop || "false").trim() === "true";

    if (!hasAmadeusCredentials) {
      return validationError(
        res,
        500,
        "MISSING_CREDENTIALS",
        "Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env, then restart node server.js."
      );
    }

    if (!origin || !destination || !month) {
      return validationError(res, 400, "MISSING_REQUIRED_PARAMS", "Required: origin, destination, month (YYYY-MM)", {
        origin,
        destination,
        month,
      });
    }

    if (!validateIata(origin) || !validateIata(destination)) {
      return validationError(
        res,
        400,
        "INVALID_AIRPORT_CODE",
        "origin and destination must be valid 3-letter IATA city/airport codes, like LON, PAR, NYC, LHR, CDG, JFK, or DOH.",
        { origin, destination }
      );
    }

    const m = month.match(/^(\d{4})-(\d{2})$/);
    if (!m) {
      return validationError(res, 400, "INVALID_DATE", "month must be YYYY-MM, for example 2026-04.");
    }

    if (!Number.isFinite(adults) || adults < 1 || adults > 9) {
      return validationError(res, 400, "INVALID_ADULTS", "adults must be between 1 and 9");
    }

    if (tripType === "return" && (!Number.isFinite(tripLength) || tripLength < 1 || tripLength > 60)) {
      return validationError(res, 400, "INVALID_TRIP_LENGTH", "Number of nights must be between 1 and 60.");
    }

    if (!Number.isInteger(flexWindow) || flexWindow < 0 || flexWindow > SAFE_FLEX_WINDOW_MAX) {
      return validationError(
        res,
        400,
        "INVALID_FLEX_WINDOW",
        `flexWindow must be a whole number between 0 and ${SAFE_FLEX_WINDOW_MAX}.`
      );
    }

    const yyyy = Number(m[1]);
    const mm = Number(m[2]);
    if (mm < 1 || mm > 12) {
      return validationError(res, 400, "INVALID_DATE", "month must include a valid month between 01 and 12.");
    }

    const totalDays = daysInMonth(yyyy, mm);
    const middleDay = Math.ceil(totalDays / 2);

    const dates = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const dd = String(i + 1).padStart(2, "0");
      return {
        day,
        date: `${m[1]}-${m[2]}-${dd}`,
      };
    })
      .filter((candidate) => Math.abs(candidate.day - middleDay) <= flexWindow)
      .map((candidate) => candidate.date)
      .filter((candidate) => candidate > todayISO());

    if (dates.length === 0) {
      return validationError(res, 400, "INVALID_DATE", "Flexible search window must contain at least one future date. Increase the flex window or choose a later month.", {
        month,
        flexWindow,
      });
    }

    const CONCURRENCY = 2;
    let idx = 0;

    const days = [];
    const dayErrors = [];

    let best = {
      date: null,
      cheapestPrice: Infinity,
      currency,
      offers: [],
      source: null,
    };

    async function worker() {
      while (idx < dates.length) {
        const myIndex = idx;
        idx += 1;

        const date = dates[myIndex];
        const computedReturnDate = tripType === "return" ? addDaysISO(date, tripLength) : null;

        try {
          const result = await flightSearchWithFallback({
            origin,
            destination,
            departureDate: date,
            returnDate: computedReturnDate,
            adults,
            currency,
            nonStop,
            max: 25,
          });

          const simplified = result.offers;
          const cheapest = simplified.length
            ? Math.min(...simplified.map((o) => parseMoney(o.price)))
            : Infinity;

          days.push({
            date,
            cheapestPrice: Number.isFinite(cheapest) ? cheapest : null,
            currency,
            offerCount: simplified.length,
            source: result.source,
          });

          if (result.providerError) {
            dayErrors.push({
              date,
              source: result.source,
              title: result.providerError?.error || "Provider error",
              detail: result.providerError?.message || "Live provider failed.",
              statusCode: result.providerError?.statusCode || 500,
            });
          }

          if (Number.isFinite(cheapest) && cheapest < best.cheapestPrice) {
            best = {
              date,
              cheapestPrice: cheapest,
              currency,
              offers: simplified.slice(0, 25),
              source: result.source,
            };
          }
        } catch (err) {
          const extracted = extractAmadeusError(err);

          console.error("[API] /api/flexible day failed:", {
            date,
            origin,
            destination,
            extracted,
          });

          dayErrors.push({
            date,
            statusCode: extracted.statusCode,
            title: extracted.title,
            detail: extracted.detail,
            code: extracted.code,
          });

          days.push({
            date,
            cheapestPrice: null,
            currency,
            offerCount: 0,
            source: "failed",
          });
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

    days.sort((a, b) => (a.date < b.date ? -1 : 1));
    dayErrors.sort((a, b) => (a.date < b.date ? -1 : 1));

    const successfulDays = days.filter((d) => d.offerCount > 0);
    const usedFallback = days.some((d) => d.source === "demo-fallback");

    return res.status(200).json({
      origin,
      destination,
      month,
      tripType,
      tripLength: tripType === "return" ? tripLength : null,
      flexWindow,
      days,
      best: best.date
        ? best
        : {
            date: null,
            cheapestPrice: null,
            currency,
            offers: [],
            source: null,
          },
      source: usedFallback ? "demo-fallback" : "amadeus",
      warning: usedFallback
        ? "Some flexible-date results could not be checked live, so Farely is showing a limited fallback preview. Use exact dates for the most reliable live results."
        : "Flexible date search is limited on the live site while Farely upgrades its flight data provider. Exact dates are the most reliable option right now.",
      debug: {
        successfulDays: successfulDays.length,
        failedOrFallbackDays: dayErrors.length,
        scannedDays: dates.length,
        scanStart: dates[0],
        scanEnd: dates[dates.length - 1],
        middleDay,
        firstFewErrors: dayErrors.slice(0, 5),
        demoFallbackEnabled: USE_DEMO_FALLBACK,
      },
    });
  } catch (err) {
    console.error("[API] /api/flexible error details:", {
      origin,
      destination,
      month,
      extracted: extractAmadeusError(err),
    });

    const friendly = makeUserFriendlyError(err, {
      origin,
      destination,
    });

    return res.status(friendly.statusCode).json(friendly);
  }
});

app.use(express.static(DIST_DIR));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Farely running on http://localhost:${PORT}`);
  console.log("Amadeus credentials loaded:", hasAmadeusCredentials);
  console.log("Demo fallback enabled:", USE_DEMO_FALLBACK);
});
