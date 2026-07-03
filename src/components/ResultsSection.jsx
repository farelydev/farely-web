import { useMemo, useState } from "react";
import { carrierLabel, cx, findAirport, firstSegment, isoDurationToMinutes, lastSegment, minutesToPretty, parseMoneyToNumber, stopsLabel } from "../utils/flightHelpers";

const AIRLINE_BRANDS = {
  A1: { name: "A.P.G.", colors: ["#13294b", "#f5b700"] },
  AF: { name: "Air France", colors: ["#002157", "#ed2939"] },
  AT: { name: "Royal Air Maroc", colors: ["#006233", "#c1272d"] },
  BA: { name: "British Airways", colors: ["#075aaa", "#eb2226"] },
  EK: { name: "Emirates", colors: ["#d71920", "#ffffff"] },
  EY: { name: "Etihad Airways", colors: ["#6f5a2a", "#f6e7b2"] },
  HR: { name: "Hahn Air", colors: ["#243b55", "#e9eef7"] },
  IB: { name: "Iberia", colors: ["#d71920", "#f7b500"] },
  KL: { name: "KLM", colors: ["#00a1de", "#ffffff"] },
  LH: { name: "Lufthansa", colors: ["#05164d", "#ffcc00"] },
  LS: { name: "Jet2", colors: ["#d71920", "#ffffff"] },
  PC: { name: "Pegasus Airlines", colors: ["#f7b500", "#ffffff"] },
  TP: { name: "TAP Air Portugal", colors: ["#006b54", "#d71920"] },
  QR: { name: "Qatar Airways", colors: ["#5c0632", "#ffffff"] },
  UX: { name: "Air Europa", colors: ["#1d4ed8", "#ffffff"] },
  TK: { name: "Turkish Airlines", colors: ["#c70a0c", "#ffffff"] },
  U2: { name: "easyJet", colors: ["#ff6600", "#ffffff"] },
  VY: { name: "Vueling", colors: ["#ffcc00", "#1f2937"] },
  VS: { name: "Virgin Atlantic", colors: ["#da0530", "#ffffff"] },
  W9: { name: "Wizz Air UK", colors: ["#c0007a", "#ffffff"] },
  X1: { name: "Hahn Air Systems", colors: ["#1f2937", "#d1d5db"] },
};

const DEFAULT_FILTERS = {
  maxPrice: "",
  airline: "any",
  stops: "any",
  departTime: "any",
  arriveTime: "any",
  departAirport: "any",
  arriveAirport: "any",
  sameReturnAirport: false,
  maxDuration: "",
  cabinBagOnly: false,
};

function airlineBrand(code) {
  const normalized = String(code || "").toUpperCase();
  return {
    code: normalized || "??",
    name: AIRLINE_BRANDS[normalized]?.name || normalized || "Airline",
    colors: AIRLINE_BRANDS[normalized]?.colors || ["#315bff", "#ffffff"],
  };
}

function airportDisplay(code) {
  const normalized = String(code || "").toUpperCase();
  if (!normalized) return "Airport TBC";

  const airport = findAirport(normalized);
  if (!airport) return normalized;

  const name = airport.name === "All airports" ? "all airports" : airport.name;
  return `${airport.city} ${name} (${airport.iata})`;
}

function AirlineLogo({ code }) {
  const brand = airlineBrand(code);
  const [bg, fg] = brand.colors;
  const logoUrl = /^[A-Z0-9]{2}$/.test(brand.code) ? `https://images.kiwi.com/airlines/64/${brand.code}.png` : "";

  return (
    <span
      className="fa-airlineLogo"
      style={{
        "--airline-bg": bg,
        "--airline-fg": fg,
      }}
      title={brand.name}
      aria-label={brand.name}
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <span>{brand.code.slice(0, 2)}</span>
    </span>
  );
}

function EmptyResultsIcon() {
  return (
    <svg className="fa-emptyIcon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M10 38l42-20c2.5-1.2 4.8 1.7 3.1 3.9L44 36l5 17-5.4 2.2-9.1-13.5-11 7.2.4 7.6-4.2 1.7-4.4-10.5-10.4-4.6 1.8-4.2 7.5.8L25 28.6 10 38z" />
    </svg>
  );
}

function timeFromDateTime(value) {
  if (!value || typeof value !== "string") return "—";
  return value.slice(11, 16) || "—";
}

function dateFromDateTime(value) {
  if (!value || typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function shortDateLabel(value) {
  if (!value || typeof value !== "string") return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function monthHeaderLabel(value) {
  if (!value || typeof value !== "string") return value || "";
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year || 2026, (month || 1) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function itineraryStopsLabel(itinerary) {
  const segs = itinerary?.segments || [];
  const stops = Math.max(0, segs.length - 1);
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

function itineraryRouteLabel(itinerary) {
  const segs = itinerary?.segments || [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  if (!first || !last) return "Route details unavailable";
  return `${airportDisplay(first.from)} → ${airportDisplay(last.to)}`;
}

function itineraryAirlineLabel(itinerary) {
  const segs = itinerary?.segments || [];
  const carriers = [...new Set(segs.map((seg) => seg.carrier).filter(Boolean))];
  return carriers.length ? carriers.map((code) => airlineBrand(code).name).join(" / ") : "Airline TBC";
}

function itineraryFlightNumbers(itinerary) {
  const segs = itinerary?.segments || [];
  const flights = segs
    .map((seg) => `${seg.carrier || ""}${seg.flightNumber || ""}`.trim())
    .filter(Boolean);

  if (flights.length === 0) return "Flight number TBC";
  return flights.join(" / ");
}

function formatLayoverMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return "";
  return minutesToPretty(minutes);
}

function layoverSummary(itinerary) {
  const segs = itinerary?.segments || [];
  if (segs.length <= 1) return "Direct flight";

  const layovers = [];

  for (let i = 0; i < segs.length - 1; i += 1) {
    const current = segs[i];
    const next = segs[i + 1];
    const arrive = new Date(current?.arriveAt || "");
    const depart = new Date(next?.departAt || "");
    const minutes = Math.round((depart.getTime() - arrive.getTime()) / 60000);
    const airport = current?.to || next?.from || "connection";
    const length = formatLayoverMinutes(minutes);

    layovers.push(length ? `${length} in ${airport}` : `Connection in ${airport}`);
  }

  return `Layover: ${layovers.join(", ")}`;
}

function itineraryViaLabel(itinerary) {
  const segs = itinerary?.segments || [];
  if (segs.length <= 1) return "Direct flight";

  const via = segs
    .slice(0, -1)
    .map((seg) => seg?.to)
    .filter(Boolean);

  if (via.length === 0) return `${segs.length - 1} stop`;
  if (via.length === 1) return `Via ${via[0]}`;
  return `Via ${via.join(", ")}`;
}

function formatPrice(price, currency) {
  const value = parseMoneyToNumber(price);
  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "";
  const amount = Number.isFinite(value) ? Math.round(value).toLocaleString("en-GB") : price;
  return `${symbol}${amount}`;
}

function dealUrlWithMetadata(dealUrl, metadata) {
  if (!dealUrl) return "";

  try {
    const url = new URL(dealUrl, window.location.origin);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return `${url.pathname}${url.search}`;
  } catch {
    return dealUrl;
  }
}

function timeBucket(value) {
  if (!value || typeof value !== "string") return "any";
  const hour = Number(value.slice(11, 13));
  if (!Number.isFinite(hour)) return "any";
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "overnight";
}

function outboundStops(offer) {
  const outbound = offer?.itineraries?.[0] || null;
  return Math.max(0, (outbound?.segments || []).length - 1);
}

function outboundDurationMinutes(offer) {
  return isoDurationToMinutes(offer?.itineraries?.[0]?.duration);
}

function offerValueScore(offer) {
  const price = parseMoneyToNumber(offer?.price);
  const duration = outboundDurationMinutes(offer);
  const stops = outboundStops(offer);
  return price * 0.7 + duration * 0.3 + stops * 40;
}

function baggageSummary(offer) {
  const explicit =
    offer?.baggage ||
    offer?.baggageInfo ||
    offer?.includedBags ||
    offer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity;

  if (typeof explicit === "number") {
    return explicit > 0 ? `${explicit} checked bag${explicit === 1 ? "" : "s"} listed` : "Cabin bag only listed";
  }

  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();

  return "Baggage: check partner";
}

function offerMentionsCabinBag(offer) {
  const summary = baggageSummary(offer).toLowerCase();
  if (summary === "baggage: check partner") return true;
  return /cabin|carry|hand/.test(summary);
}

function offerMatchesFilters(offer, filters) {
  const outbound = offer?.itineraries?.[0] || null;
  const inbound = offer?.itineraries?.[1] || null;
  const first = firstSegment(offer);
  const last = lastSegment(offer);
  const inboundLast = inbound?.segments?.[inbound.segments.length - 1] || null;
  const price = parseMoneyToNumber(offer?.price);
  const stops = outboundStops(offer);
  const durationMinutes = isoDurationToMinutes(outbound?.duration);

  if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
  if (filters.airline !== "any" && carrierLabel(offer) !== filters.airline) return false;
  if (filters.stops === "direct" && stops !== 0) return false;
  if (filters.stops === "one" && stops !== 1) return false;
  if (filters.departTime !== "any" && timeBucket(first?.departAt) !== filters.departTime) return false;
  if (filters.arriveTime !== "any" && timeBucket(last?.arriveAt) !== filters.arriveTime) return false;
  if (filters.departAirport !== "any" && first?.from !== filters.departAirport) return false;
  if (filters.arriveAirport !== "any" && last?.to !== filters.arriveAirport) return false;
  if (filters.sameReturnAirport && inboundLast?.to && first?.from && inboundLast.to !== first.from) return false;
  if (filters.maxDuration && durationMinutes > Number(filters.maxDuration) * 60) return false;
  if (filters.cabinBagOnly && !offerMentionsCabinBag(offer)) return false;

  return true;
}

function uniqueOptions(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function rankingStats(offers) {
  const prices = offers.map((offer) => parseMoneyToNumber(offer?.price)).filter(Number.isFinite);
  const durations = offers.map(outboundDurationMinutes).filter(Number.isFinite);
  const values = offers.map(offerValueScore).filter(Number.isFinite);

  return {
    cheapest: prices.length ? Math.min(...prices) : Infinity,
    fastest: durations.length ? Math.min(...durations) : Infinity,
    bestValue: values.length ? Math.min(...values) : Infinity,
  };
}

function recommendationBadges(offer, stats) {
  const badges = [];
  const price = parseMoneyToNumber(offer?.price);
  const duration = outboundDurationMinutes(offer);
  const stops = outboundStops(offer);
  const valueScore = offerValueScore(offer);

  if (Number.isFinite(price) && price === stats.cheapest) badges.push("Cheapest");
  if (Number.isFinite(duration) && duration === stats.fastest) badges.push("Fastest");
  if (Number.isFinite(valueScore) && valueScore === stats.bestValue && !badges.includes("Cheapest")) badges.push("Best Value");
  if (stops === 0) badges.push("Direct");

  return badges.slice(0, 3);
}

function ItineraryDetail({ label, itinerary }) {
  const segs = itinerary?.segments || [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  const mins = isoDurationToMinutes(itinerary?.duration);

  return (
    <div className="fa-legDetail">
      <div className="fa-legTop">
        <div>
          <span className="fa-legLabel">{label}</span>
          <div className="fa-legFlightNo">{itineraryFlightNumbers(itinerary)}</div>
        </div>
        <span className="fa-legMeta">{minutesToPretty(mins)} • {itineraryStopsLabel(itinerary)}</span>
      </div>

      <div className="fa-legMain">
        <div>
          <div className="fa-legTime">{timeFromDateTime(first?.departAt)}</div>
          <div className="fa-legAirport">{airportDisplay(first?.from)}</div>
          <div className="fa-legDate">{dateFromDateTime(first?.departAt)}</div>
        </div>

        <div className="fa-legLine" aria-hidden>
          <span />
        </div>

        <div>
          <div className="fa-legTime">{timeFromDateTime(last?.arriveAt)}</div>
          <div className="fa-legAirport">{airportDisplay(last?.to)}</div>
          <div className="fa-legDate">{dateFromDateTime(last?.arriveAt)}</div>
        </div>
      </div>

      <div className="fa-legFooter">
        {itineraryRouteLabel(itinerary)} • {itineraryAirlineLabel(itinerary)}
      </div>
      <div className="fa-legNote">{itineraryViaLabel(itinerary)} • {layoverSummary(itinerary)}</div>
    </div>
  );
}

export default function ResultsSection({
  didSearch, routeTitle, resultsTab, setResultsTab, apiWarning, shownOffers, apiSource,
  pricePills, flexMode, selectedFlexDate, onPickFlexDay, isSearching, exactMode,
  routeFromCode, routeToCode, departDate, tripType, returnDate, flexMonth, cabin,
}) {
  const isMultiCity = tripType === "multicity";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const airlineOptions = useMemo(
    () => uniqueOptions(shownOffers.map((offer) => carrierLabel(offer))),
    [shownOffers]
  );
  const departAirportOptions = useMemo(
    () => uniqueOptions(shownOffers.map((offer) => firstSegment(offer)?.from)),
    [shownOffers]
  );
  const arriveAirportOptions = useMemo(
    () => uniqueOptions(shownOffers.map((offer) => lastSegment(offer)?.to)),
    [shownOffers]
  );
  const filteredOffers = useMemo(
    () => shownOffers.filter((offer) => offerMatchesFilters(offer, filters)),
    [filters, shownOffers]
  );
  const filteredStats = useMemo(() => rankingStats(filteredOffers), [filteredOffers]);
  const hasChosenFlexDate = !flexMode || Boolean(selectedFlexDate);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "sameReturnAirport") return Boolean(value);
    if (key === "cabinBagOnly") return Boolean(value);
    return value !== "" && value !== "any";
  }).length;

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function setQuickFilter(key) {
    if (key === "direct") {
      updateFilter("stops", filters.stops === "direct" ? "any" : "direct");
    }
    if (key === "morning") {
      updateFilter("departTime", filters.departTime === "morning" ? "any" : "morning");
    }
    if (key === "under200") {
      updateFilter("maxPrice", filters.maxPrice === "200" ? "" : "200");
    }
    if (key === "best") {
      setResultsTab(resultsTab === "best" ? "cheapest" : "best");
    }
    if (key === "cabinBag") {
      updateFilter("cabinBagOnly", !filters.cabinBagOnly);
    }
  }

  return (
    <section className="fa-results">
      <div className="fa-resultsInner">
        <h2 className="fa-resultsTitle">
          {isMultiCity ? "Multi-city plan" : didSearch ? "Trip ideas and partner fares" : "Ready to search"}{" "}
          <span className="fa-resultsSubtitle">— {routeTitle}</span>
        </h2>

        {flexMode && !isMultiCity && (
          <div className="fa-flexWorkflow" aria-label="Cheapest Month progress">
            <span className="isDone">Choose month ✓</span>
            <span className={cx(!selectedFlexDate && "isCurrent", selectedFlexDate && "isDone")}>Choose travel day{selectedFlexDate ? " ✓" : " ←"}</span>
            <span className={cx(selectedFlexDate && "isCurrent")}>Compare flights</span>
            <span>Book with partner</span>
          </div>
        )}

        {flexMode && !isMultiCity && (
          <div className="fa-flexDateIntro">
            <div>
              <div className="fa-flexStepEyebrow">Step 1</div>
              <h3>Choose your departure date</h3>
              <p>We’ve found the cheapest travel dates. Tap a date below to compare live flights.</p>
            </div>
            {selectedFlexDate ? <span className="fa-flexSelectedDate">Selected {shortDateLabel(selectedFlexDate)}</span> : null}
          </div>
        )}

        {!isMultiCity && hasChosenFlexDate && (
          <div className="fa-resultsControls">
            <div className="fa-resultsTabs">
              <button
                type="button"
                className={cx("fa-rTab", resultsTab === "cheapest" && "isActive")}
                aria-pressed={resultsTab === "cheapest"}
                onClick={() => setResultsTab("cheapest")}
              >
                Cheapest
              </button>
              <button
                type="button"
                className={cx("fa-rTab", resultsTab === "fastest" && "isActive")}
                aria-pressed={resultsTab === "fastest"}
                onClick={() => setResultsTab("fastest")}
              >
                Fastest
              </button>
              <button
                type="button"
                className={cx("fa-rTab", resultsTab === "best" && "isActive")}
                aria-pressed={resultsTab === "best"}
                onClick={() => setResultsTab("best")}
              >
                Best
              </button>
            </div>

            <button type="button" className="fa-filterBtn" onClick={() => setFiltersOpen(true)}>
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
        )}

        {filtersOpen && (
          <div className="fa-filterOverlay" onMouseDown={() => setFiltersOpen(false)}>
            <div className="fa-filterDrawer" role="dialog" aria-modal="true" aria-label="Flight filters" onMouseDown={(event) => event.stopPropagation()}>
              <div className="fa-filterTop">
                <div>
                  <div className="fa-filterTitle">Filters</div>
                  <div className="fa-filterSub">{filteredOffers.length} of {shownOffers.length} offers shown</div>
                </div>
                <button type="button" className="fa-filterClose" onClick={() => setFiltersOpen(false)} aria-label="Close filters">x</button>
              </div>

              <div className="fa-quickFilters" aria-label="Quick flight filters">
                <button type="button" className={cx("fa-quickFilter", filters.stops === "direct" && "isActive")} onClick={() => setQuickFilter("direct")}>
                  Direct only
                </button>
                <button type="button" className={cx("fa-quickFilter", filters.departTime === "morning" && "isActive")} onClick={() => setQuickFilter("morning")}>
                  Morning departures
                </button>
                <button type="button" className={cx("fa-quickFilter", filters.maxPrice === "200" && "isActive")} onClick={() => setQuickFilter("under200")}>
                  Under £200
                </button>
                <button type="button" className={cx("fa-quickFilter", resultsTab === "best" && "isActive")} onClick={() => setQuickFilter("best")}>
                  Best value
                </button>
                <button type="button" className={cx("fa-quickFilter", filters.cabinBagOnly && "isActive")} onClick={() => setQuickFilter("cabinBag")}>
                  Cabin bag only
                </button>
              </div>

              <div className="fa-filterGrid">
                <label className="fa-filterField">
                  Budget slider
                  <div className="fa-budgetControl">
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="25"
                      value={filters.maxPrice || "1000"}
                      onChange={(event) => updateFilter("maxPrice", event.target.value === "1000" ? "" : event.target.value)}
                      aria-label="Maximum budget"
                    />
                    <input type="number" min="0" value={filters.maxPrice} onChange={(event) => updateFilter("maxPrice", event.target.value)} placeholder="No max" />
                  </div>
                </label>

                <label className="fa-filterField">
                  Airline
                  <select value={filters.airline} onChange={(event) => updateFilter("airline", event.target.value)}>
                    <option value="any">Any airline</option>
                    {airlineOptions.map((code) => (
                      <option key={code} value={code}>{airlineBrand(code).name} ({code})</option>
                    ))}
                  </select>
                </label>

                <label className="fa-filterField">
                  Stops
                  <select value={filters.stops} onChange={(event) => updateFilter("stops", event.target.value)}>
                    <option value="any">Any</option>
                    <option value="direct">Direct only</option>
                    <option value="one">1 stop</option>
                  </select>
                </label>

                <label className="fa-filterField">
                  Departure time
                  <select value={filters.departTime} onChange={(event) => updateFilter("departTime", event.target.value)}>
                    <option value="any">Any time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </label>

                <label className="fa-filterField">
                  Arrival time
                  <select value={filters.arriveTime} onChange={(event) => updateFilter("arriveTime", event.target.value)}>
                    <option value="any">Any time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </label>

                <label className="fa-filterField">
                  Departure airport
                  <select value={filters.departAirport} onChange={(event) => updateFilter("departAirport", event.target.value)}>
                    <option value="any">Any departure airport</option>
                    {departAirportOptions.map((code) => (
                      <option key={code} value={code}>{airportDisplay(code)}</option>
                    ))}
                  </select>
                </label>

                <label className="fa-filterField">
                  Arrival airport
                  <select value={filters.arriveAirport} onChange={(event) => updateFilter("arriveAirport", event.target.value)}>
                    <option value="any">Any arrival airport</option>
                    {arriveAirportOptions.map((code) => (
                      <option key={code} value={code}>{airportDisplay(code)}</option>
                    ))}
                  </select>
                </label>

                <label className="fa-filterField">
                  Max flight duration
                  <input type="number" min="1" value={filters.maxDuration} onChange={(event) => updateFilter("maxDuration", event.target.value)} placeholder="Hours" />
                </label>

                <label className="fa-filterCheck">
                  <input type="checkbox" checked={filters.sameReturnAirport} onChange={(event) => updateFilter("sameReturnAirport", event.target.checked)} />
                  Return to same airport
                </label>

                <label className="fa-filterCheck">
                  <input type="checkbox" checked={filters.cabinBagOnly} onChange={(event) => updateFilter("cabinBagOnly", event.target.checked)} />
                  Cabin bag only
                </label>
              </div>

              <div className="fa-filterActions">
                <button type="button" className="fa-filterSecondary" onClick={resetFilters}>Reset</button>
                <button type="button" className="fa-filterApply" onClick={() => setFiltersOpen(false)}>Show results</button>
              </div>
            </div>
          </div>
        )}

        {!!apiWarning && filteredOffers.length > 0 && !flexMode && (
          <div className="fa-resultsWarning">
            <div>
              <strong>Partner price check.</strong> Farely checks current partner fares so you can compare options before opening the deal.
            </div>
            <div className="fa-resultsWarningSub">{apiSource ? `Source: ${apiSource}` : "Partner fares"}</div>
          </div>
        )}

        {!isMultiCity && (
          <div className="fa-pillGrid">
            {pricePills.map((p) => (
              <button
                key={p.key}
                type="button"
                className={cx(
                  "fa-dayPill",
                  flexMode && p.date && "isClickable",
                  flexMode && p.date && p.date === selectedFlexDate && "isSelected",
                  p.source === "demo-fallback" && "isDemo"
                )}
                onClick={() => {
                  if (flexMode && p.date) onPickFlexDay(p.date);
                }}
                disabled={isSearching || !(flexMode && p.date)}
                title={flexMode && p.date ? p.date : ""}
              >
                <div className="fa-day">
                  {p.label}
                  {p.source === "demo-fallback" ? <span className="fa-demoDot"> Demo</span> : null}
                </div>
                {p.subLabel ? <div className="fa-daySub">{p.subLabel}</div> : null}
                <div className="fa-price">£{p.price}</div>
                <div className="fa-dayAction">{p.actionLabel || (flexMode && p.date ? "Choose date" : "Month guide")}</div>
              </button>
            ))}
          </div>
        )}

        {flexMode && didSearch && !selectedFlexDate && (
          <div className="fa-resultsHelper">
            Step 2 will appear after you choose a travel day. Farely will then compare the cheapest, fastest, and best live flight options for that date.
          </div>
        )}

        {hasChosenFlexDate && (
        <div className={cx("fa-resultCard", flexMode && selectedFlexDate && "isRevealed")}>
          <div className="fa-resultHeader">
            <div className="fa-resultHeaderLeft">
              {exactMode ? (
                isMultiCity ? (
                  <>
                    Multi-city plan • {routeTitle}
                  </>
                ) : (
                  <>
                  {routeFromCode} → {routeToCode} • {departDate}
                  {tripType === "return" ? ` → ${returnDate}` : ""}
                  </>
                )
              ) : (
                <>
                  Cheapest Month in {monthHeaderLabel(flexMonth)} • {selectedFlexDate ? `showing ${shortDateLabel(selectedFlexDate)}` : "choose a date"}
                </>
              )}
            </div>
            <div className="fa-resultHint">Compare the idea here, then confirm the latest fare on the partner site.</div>
          </div>

          <div className="fa-affiliateNotice">
            Farely compares travel options for free. If you book with one of our trusted partners, Farely may earn a commission at no extra cost to you.
            <a href="/affiliate-disclosure"> Learn more</a>.
          </div>

          <div className="fa-airlineList">
            {filteredOffers.length === 0 ? (
              <div className="fa-empty">
                <EmptyResultsIcon />
                <div>
                  <div className="fa-emptyTitle">
                    {shownOffers.length > 0 ? "No fares match these filters" : didSearch ? "No matching fares yet" : "Everything is ready"}
                  </div>
                  <div className="fa-emptyText">
                    {shownOffers.length > 0
                      ? "Try clearing filters or widening your budget, stops, airport, or time preferences."
                      : isMultiCity
                      ? "Multi-city search is planned in the UI. Live multi-city pricing will be added next."
                      : didSearch
                        ? "Try exact dates, adjust the route, or search again to compare the best available options."
                        : "Press Search flights to compare live prices from our travel partners."}
                  </div>
                </div>
              </div>
            ) : (
              filteredOffers.map((o, idx) => {
                const price = o?.price;
                const cur = o?.currency || "GBP";
                const carrierCode = carrierLabel(o);
                const carrier = airlineBrand(carrierCode);
                const displayedCabin = o?.cabin || cabin || "Economy";
                const outbound = o?.itineraries?.[0] || null;
                const inbound = o?.itineraries?.[1] || null;
                const first = firstSegment(o);
                const last = lastSegment(o);
                const routeLine = `${airportDisplay(first?.from || routeFromCode)} — ${airportDisplay(last?.to || routeToCode)}`;
                const badges = recommendationBadges(o, filteredStats);
                const dealUrl = dealUrlWithMetadata(o?.dealUrl, {
                  price,
                  currency: cur,
                  cabin,
                  resultRank: idx + 1,
                  sort: resultsTab,
                  tripType,
                });

                return (
                  <div key={o?.id || `${routeFromCode}-${routeToCode}-${idx}`} className={cx("fa-airlineRow", o?.isDemo && "isDemo")}>
                    <div className="fa-offerMain">
                      <div className="fa-offerTop">
                        <div className="fa-airlineLeft">
                          <div className="fa-airlineName">
                            <AirlineLogo code={carrierCode} />
                            <div>
                              <div className="fa-airlineTitleLine">
                                <span>{carrier.name}</span>
                                <span className="fa-airlineCode">{carrierCode}</span>
                                {badges.map((badge) => (
                                  <span key={badge} className={cx("fa-recBadge", badge === "Direct" && "isDirect")}>{badge}</span>
                                ))}
                                {o?.isDemo && <span className="fa-demoBadge">Demo fallback</span>}
                              </div>
                              <div className="fa-airlineMeta">
                                {routeLine} • {stopsLabel(o)}
                                {inbound ? " • Return included" : " • One-way fare"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="fa-pricePanel">
                          <div className="fa-priceLabel">Total price</div>
                          <div className="fa-airlinePrice">{formatPrice(price, cur)}</div>
                          <div className="fa-priceSub">{cur} • {displayedCabin}</div>
                        </div>
                      </div>

                      <div className="fa-legGrid">
                        <ItineraryDetail label="Outbound" itinerary={outbound} />
                        {inbound ? (
                          <ItineraryDetail label="Return" itinerary={inbound} />
                        ) : (
                          <div className="fa-legDetail isEmpty">
                            <div className="fa-legTop">
                              <span className="fa-legLabel">Return</span>
                            </div>
                            <div className="fa-legEmptyText">One-way fare</div>
                          </div>
                        )}
                      </div>

                      <div className="fa-offerSignals">
                        <span className="fa-signalChip">{baggageSummary(o)}</span>
                        <span className="fa-signalChip">Secure partner booking</span>
                        <span className="fa-signalChip">No extra Farely booking fees</span>
                        <span className="fa-signalChip">Transparent affiliate links</span>
                      </div>

                      <div className="fa-offerActions">
                        <div className="fa-offerTrust">
                          Check baggage, seat rules, and the final live fare before paying.
                        </div>
                        {dealUrl ? (
                          <a className="fa-viewDeal isActive" href={dealUrl} target="_blank" rel="noreferrer">
                            Check partner deal
                          </a>
                        ) : (
                          <button type="button" className="fa-viewDeal" disabled>
                            Deal coming soon
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="fa-tip">
            Search, compare, then confirm final price, baggage, and fare rules on the partner site before booking.
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
