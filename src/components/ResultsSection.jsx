import { carrierLabel, cx, firstSegment, isoDurationToMinutes, lastSegment, minutesToPretty, stopsLabel } from "../utils/flightHelpers";

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
  QR: { name: "Qatar Airways", colors: ["#5c0632", "#ffffff"] },
  TK: { name: "Turkish Airlines", colors: ["#c70a0c", "#ffffff"] },
  U2: { name: "easyJet", colors: ["#ff6600", "#ffffff"] },
  VS: { name: "Virgin Atlantic", colors: ["#da0530", "#ffffff"] },
  X1: { name: "Hahn Air Systems", colors: ["#1f2937", "#d1d5db"] },
};

function airlineBrand(code) {
  const normalized = String(code || "").toUpperCase();
  return {
    code: normalized || "??",
    name: AIRLINE_BRANDS[normalized]?.name || normalized || "Airline",
    colors: AIRLINE_BRANDS[normalized]?.colors || ["#315bff", "#ffffff"],
  };
}

function AirlineLogo({ code }) {
  const brand = airlineBrand(code);
  const [bg, fg] = brand.colors;

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
      {brand.code.slice(0, 2)}
    </span>
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
  return `${first.from || "—"} → ${last.to || "—"}`;
}

function itineraryAirlineLabel(itinerary) {
  const segs = itinerary?.segments || [];
  const carriers = [...new Set(segs.map((seg) => seg.carrier).filter(Boolean))];
  return carriers.length ? carriers.map((code) => airlineBrand(code).name).join(" / ") : "Airline TBC";
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

function ItineraryDetail({ label, itinerary }) {
  const segs = itinerary?.segments || [];
  const first = segs[0];
  const last = segs[segs.length - 1];
  const mins = isoDurationToMinutes(itinerary?.duration);

  return (
    <div className="fa-legDetail">
      <div className="fa-legTop">
        <span className="fa-legLabel">{label}</span>
        <span className="fa-legMeta">
          {minutesToPretty(mins)} • {itineraryStopsLabel(itinerary)}
        </span>
      </div>

      <div className="fa-legMain">
        <div>
          <div className="fa-legTime">{timeFromDateTime(first?.departAt)}</div>
          <div className="fa-legAirport">{first?.from || "—"}</div>
          <div className="fa-legDate">{dateFromDateTime(first?.departAt)}</div>
        </div>

        <div className="fa-legLine" aria-hidden>
          <span />
        </div>

        <div>
          <div className="fa-legTime">{timeFromDateTime(last?.arriveAt)}</div>
          <div className="fa-legAirport">{last?.to || "—"}</div>
          <div className="fa-legDate">{dateFromDateTime(last?.arriveAt)}</div>
        </div>
      </div>

      <div className="fa-legFooter">
        {itineraryRouteLabel(itinerary)} • {itineraryAirlineLabel(itinerary)}
      </div>
      <div className="fa-legNote">{itineraryViaLabel(itinerary)}</div>
    </div>
  );
}

export default function ResultsSection({
  didSearch, routeTitle, resultsTab, setResultsTab, apiWarning, shownOffers, apiSource,
  pricePills, flexMode, selectedFlexDate, onPickFlexDay, isSearching, exactMode,
  routeFromCode, routeToCode, departDate, tripType, returnDate, flexMonth,
}) {
  const isMultiCity = tripType === "multicity";

  return (
    <section className="fa-results">
      <div className="fa-resultsInner">
        <h2 className="fa-resultsTitle">
          {isMultiCity ? "Multi-city plan" : didSearch ? "Search flights" : "Ready to search"}{" "}
          <span className="fa-resultsSubtitle">— {routeTitle}</span>
        </h2>

        {!isMultiCity && (
          <div className="fa-resultsTabs">
            <button type="button" className={cx("fa-rTab", resultsTab === "cheapest" && "isActive")} onClick={() => setResultsTab("cheapest")}>
              Cheapest
            </button>
            <button type="button" className={cx("fa-rTab", resultsTab === "fastest" && "isActive")} onClick={() => setResultsTab("fastest")}>
              Fastest
            </button>
            <button type="button" className={cx("fa-rTab", resultsTab === "best" && "isActive")} onClick={() => setResultsTab("best")}>
              Best
            </button>
          </div>
        )}

        {!!apiWarning && shownOffers.length > 0 && (
          <div className="fa-resultsWarning">
            <div>
              <strong>Live provider failed.</strong> Showing demo fallback results for development.
            </div>
            <div className="fa-resultsWarningSub">Source: {apiSource || "demo-fallback"}</div>
          </div>
        )}

        {!isMultiCity && (
          <div className="fa-pillGrid">
            {pricePills.map((p) => (
              <button
                key={p.key}
                type="button"
                className={cx("fa-dayPill", flexMode && p.date && p.date === selectedFlexDate && "isSelected", p.source === "demo-fallback" && "isDemo")}
                onClick={() => {
                  if (flexMode && p.date) onPickFlexDay(p.date);
                }}
                style={{ cursor: flexMode && p.date ? "pointer" : "default" }}
                disabled={isSearching || !(flexMode && p.date)}
                title={flexMode && p.date ? p.date : ""}
              >
                <div className="fa-day">
                  {p.label}
                  {p.source === "demo-fallback" ? <span className="fa-demoDot"> Demo</span> : null}
                </div>
                {p.subLabel ? <div className="fa-daySub">{p.subLabel}</div> : null}
                <div className="fa-price">£{p.price}</div>
              </button>
            ))}
          </div>
        )}

        {flexMode && didSearch && (
          <div className="fa-resultsHelper">
            Tap a date card to reload live fares for that day.
          </div>
        )}

        <div className="fa-resultCard">
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
                  Flexible in {monthHeaderLabel(flexMonth)} • {selectedFlexDate ? `showing ${shortDateLabel(selectedFlexDate)}` : "ready to search"}
                </>
              )}
            </div>
            <div className="fa-resultHint">Compare first, then open the partner site when ready.</div>
          </div>

          <div className="fa-affiliateNotice">
            Farely may earn commission from partner links. Bookings happen with third-party travel providers.
            <a href="/affiliate-disclosure"> Learn more</a>.
          </div>

          <div className="fa-airlineList">
            {shownOffers.length === 0 ? (
              <div className="fa-empty">
                {isMultiCity
                  ? "Multi-city search is planned in the UI. Live multi-city pricing will be added next."
                  : didSearch
                    ? "No live results yet. Hit Search flights above."
                    : "Choose your trip, then hit Search flights."}
              </div>
            ) : (
              shownOffers.map((o, idx) => {
                const price = o?.price;
                const cur = o?.currency || "GBP";
                const carrierCode = carrierLabel(o);
                const outbound = o?.itineraries?.[0] || null;
                const inbound = o?.itineraries?.[1] || null;
                const first = firstSegment(o);
                const last = lastSegment(o);
                const routeLine = `${first?.from || routeFromCode} — ${last?.to || routeToCode}`;

                return (
                  <div key={o?.id || `${routeFromCode}-${routeToCode}-${idx}`} className={cx("fa-airlineRow", o?.isDemo && "isDemo")}>
                    <div className="fa-offerMain">
                      <div className="fa-offerTop">
                        <div className="fa-airlineLeft">
                          <div className="fa-airlineName">
                            <AirlineLogo code={carrierCode} /> {airlineBrand(carrierCode).name}
                            <span className="fa-airlineCode">{carrierCode}</span>
                            <span className="fa-badge">{resultsTab}</span>
                            {o?.isDemo && <span className="fa-demoBadge">Demo fallback</span>}
                          </div>
                          <div className="fa-airlineMeta">
                            {routeLine} • {stopsLabel(o)}
                            {inbound ? " • Return included" : ""}
                          </div>
                        </div>

                        <div className="fa-airlinePrice">
                          {cur === "GBP" ? "£" : ""}
                          {price}
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
                        <span className="fa-signalChip">{o?.isDemo ? "Demo fare preview" : "Third-party booking"}</span>
                        <span className="fa-signalChip">{inbound ? "Return fare" : "One-way fare"}</span>
                        <span className="fa-signalChip">Check baggage on partner site</span>
                      </div>

                      <div className="fa-offerActions">
                        {o?.dealUrl ? (
                          <a className="fa-viewDeal isActive" href={o.dealUrl} target="_blank" rel="noreferrer">
                            Check partner deal →
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
            Prices and availability can change. Check baggage, fare rules, and cancellation terms on the partner site
            before booking.
          </div>
        </div>
      </div>
    </section>
  );
}
