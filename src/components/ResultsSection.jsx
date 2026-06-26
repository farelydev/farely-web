import { carrierLabel, cx, firstSegment, isoDurationToMinutes, lastSegment, minutesToPretty, parseMoneyToNumber, stopsLabel } from "../utils/flightHelpers";

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
  return `${first.from || "—"} → ${last.to || "—"}`;
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

  return (
    <section className="fa-results">
      <div className="fa-resultsInner">
        <h2 className="fa-resultsTitle">
          {isMultiCity ? "Multi-city plan" : didSearch ? "Trip ideas and partner fares" : "Ready to search"}{" "}
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
              <strong>Live fare check is limited.</strong> Some results may be preview-only or may open on a partner site for the latest price.
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
            Tap a date card to reload live fares for that day. Exact dates are usually more dependable on the live site.
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
            <div className="fa-resultHint">Compare the idea here, then confirm the latest fare on the partner site.</div>
          </div>

          <div className="fa-affiliateNotice">
            Farely compares travel options for free. If you book with one of our trusted partners, Farely may earn a commission at no extra cost to you.
            <a href="/affiliate-disclosure"> Learn more</a>.
          </div>

          <div className="fa-airlineList">
            {shownOffers.length === 0 ? (
              <div className="fa-empty">
                <EmptyResultsIcon />
                <div>
                  <div className="fa-emptyTitle">
                    {didSearch ? "No matching fares yet" : "Ready when you are"}
                  </div>
                  <div className="fa-emptyText">
                    {isMultiCity
                      ? "Multi-city search is planned in the UI. Live multi-city pricing will be added next."
                      : didSearch
                        ? "Try exact dates, adjust the route, or search again to compare the best available options."
                        : "Search flights to compare the best options, then open a trusted partner deal when you are ready."}
                  </div>
                </div>
              </div>
            ) : (
              shownOffers.map((o, idx) => {
                const price = o?.price;
                const cur = o?.currency || "GBP";
                const carrierCode = carrierLabel(o);
                const carrier = airlineBrand(carrierCode);
                const outbound = o?.itineraries?.[0] || null;
                const inbound = o?.itineraries?.[1] || null;
                const first = firstSegment(o);
                const last = lastSegment(o);
                const routeLine = `${first?.from || routeFromCode} — ${last?.to || routeToCode}`;
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
                          <div className="fa-priceSub">{cur} • {cabin || "Economy"}</div>
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
                            View deal
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
      </div>
    </section>
  );
}
