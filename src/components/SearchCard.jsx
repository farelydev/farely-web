import { useState } from "react";
import AirportAutocomplete from "./AirportAutocomplete";
import { airportLabel, cx, todayPlus } from "../utils/flightHelpers";

const CABIN_OPTIONS = ["Economy", "Premium economy", "Business", "First"];
const MIN_NIGHTS = 1;
const MAX_NIGHTS = 60;

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function monthValueFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthValue) {
  const [year, month] = String(monthValue || "").split("-").map(Number);
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
  return {
    month: date.toLocaleString("en-GB", { month: "long" }),
    year: String(date.getFullYear()),
  };
}

function seededPrice(seedText, index) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = (seed * 31 + seedText.charCodeAt(i)) % 9973;
  }
  const seasonal = [18, 8, 4, 16, 28, 46, 52, 38, 14, 10, 22, 34][index % 12];
  return 48 + ((seed + index * 17) % 72) + seasonal;
}

function buildMonthOptions({ selectedMonth, routeFromCode, routeToCode }) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const months = Array.from({ length: 10 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const value = monthValueFromDate(date);
    const labels = monthLabel(value);
    const price = seededPrice(`${routeFromCode}-${routeToCode}-${value}`, index);
    return { value, price, ...labels };
  });

  if (selectedMonth && !months.some((month) => month.value === selectedMonth)) {
    const labels = monthLabel(selectedMonth);
    months[months.length - 1] = {
      value: selectedMonth,
      price: seededPrice(`${routeFromCode}-${routeToCode}-${selectedMonth}`, months.length),
      ...labels,
    };
  }

  const cheapest = months.reduce((best, month) => (month.price < best.price ? month : best), months[0]);
  return months.map((month) => ({ ...month, isCheapest: month.value === cheapest.value }));
}

function flexibleSearchButtonLabel({ isSearching, tripType, flexMode }) {
  if (isSearching) return flexMode ? "Checking travel dates..." : "Searching flights...";
  if (tripType === "multicity") return "Review multi-city plan";
  if (flexMode) return "Show travel days";
  return "Search flights";
}

export default function SearchCard({
  tripType, setTripType, exactMode, flexMode, setDateMode, clearSearchState,
  fromText, setFromText, fromAirport, setFromAirport, toText, setToText, toAirport, setToAirport,
  multiLegs, setMultiLegs, passengers, setPassengers, cabin, setCabin,
  departDate, setDepartDate, returnDate, setReturnDate, showReturn,
  flexMonth, setFlexMonth, tripLength, setTripLength,
  onSearch, isSearching, routeFromCode, routeToCode, apiWarning, searchError,
}) {
  const [nightDraft, setNightDraft] = useState(String(tripLength || ""));
  const [isNightFocused, setIsNightFocused] = useState(false);

  const updateTripLength = (nextValue, { commitFallback = false } = {}) => {
    const raw = String(nextValue || "").replace(/[^\d]/g, "");

    if (!raw) {
      setNightDraft("");
      if (commitFallback) setTripLength(MIN_NIGHTS);
      clearSearchState();
      return;
    }

    const clamped = clampNumber(raw, MIN_NIGHTS, MAX_NIGHTS);
    setNightDraft(String(clamped));
    setTripLength(clamped);
    clearSearchState();
  };

  const monthOptions = buildMonthOptions({ selectedMonth: flexMonth, routeFromCode, routeToCode });
  const selectedMonthOption = monthOptions.find((month) => month.value === flexMonth) || monthOptions[0];

  return (
    <div id="farely-search" className="fa-card">
      <div className="fa-cardTop">
        <div className="fa-tabs">
          <button type="button" className={cx("fa-tab", tripType === "return" && "isActive")} onClick={() => { setTripType("return"); clearSearchState(); }}>
            Return
          </button>
          <button type="button" className={cx("fa-tab", tripType === "oneway" && "isActive")} onClick={() => { setTripType("oneway"); clearSearchState(); }}>
            One-way
          </button>
          <button type="button" className={cx("fa-tab", tripType === "multicity" && "isActive")} onClick={() => { setTripType("multicity"); clearSearchState(); }}>
            Multi-city
          </button>
        </div>

          <div className="fa-seg">
            <button type="button" className={cx("fa-segBtn", exactMode && "isActive")} onClick={() => { setDateMode("exact"); clearSearchState(); }}>
              Exact dates
            </button>
            <button type="button" className={cx("fa-segBtn", flexMode && "isActive")} onClick={() => { setDateMode("flex"); clearSearchState(); }}>
              Flexible dates
            </button>
          </div>
      </div>

      <div className="fa-cardBody">
        <div className="fa-leftCol">
          {tripType !== "multicity" && (
            <>
              <AirportAutocomplete
                label="Departing from"
                valueText={fromText}
                selected={fromAirport}
                onChangeText={(v) => {
                  setFromText(v);
                  setFromAirport(null);
                  clearSearchState();
                }}
                onSelectAirport={(a) => {
                  setFromAirport(a);
                  setFromText(airportLabel(a));
                  clearSearchState();
                }}
                placeholder="City or airport"
                icon="📍"
              />

              <AirportAutocomplete
                label="Going to"
                valueText={toText}
                selected={toAirport}
                onChangeText={(v) => {
                  setToText(v);
                  setToAirport(null);
                  clearSearchState();
                }}
                onSelectAirport={(a) => {
                  setToAirport(a);
                  setToText(airportLabel(a));
                  clearSearchState();
                }}
                placeholder="Where to?"
                icon="📍"
              />
            </>
          )}

          {tripType === "multicity" && (
            <div className="fa-multi">
              <div className="fa-label" style={{ marginBottom: 8 }}>
                Multi-city routes
              </div>

              <div className="fa-multiList">
                {multiLegs.map((leg, idx) => (
                  <div className="fa-multiRow" key={idx}>
                    <input
                      className="fa-miniInput"
                      value={leg.from}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMultiLegs((prev) => prev.map((x, i) => (i === idx ? { ...x, from: v } : x)));
                        clearSearchState();
                      }}
                      placeholder="From"
                    />
                    <span className="fa-arrow">→</span>
                    <input
                      className="fa-miniInput"
                      value={leg.to}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMultiLegs((prev) => prev.map((x, i) => (i === idx ? { ...x, to: v } : x)));
                        clearSearchState();
                      }}
                      placeholder="To"
                    />
                    <input
                      className="fa-miniDate"
                      type="date"
                      value={leg.date}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMultiLegs((prev) => prev.map((x, i) => (i === idx ? { ...x, date: v } : x)));
                        clearSearchState();
                      }}
                    />
                    <button
                      type="button"
                      className="fa-miniRemove"
                      aria-label="Remove leg"
                      onClick={() => {
                        setMultiLegs((prev) => prev.filter((_, i) => i !== idx));
                        clearSearchState();
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="fa-addLeg"
                onClick={() => {
                  setMultiLegs((prev) => [...prev, { from: prev[prev.length - 1]?.to || "", to: "", date: todayPlus(28) }]);
                  clearSearchState();
                }}
              >
                + Add another flight
              </button>
            </div>
          )}

          <div className="fa-row2">
            <div className="fa-field">
              <div className="fa-label">Passengers</div>
              <div className="fa-inputWrap">
                <div className="fa-icon" aria-hidden>
                  👤
                </div>
                <select className="fa-select" value={passengers} onChange={(e) => { setPassengers(Number(e.target.value)); clearSearchState(); }}>
                  {Array.from({ length: 9 }).map((_, i) => {
                    const n = i + 1;
                    return (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "passenger" : "passengers"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="fa-field">
              <div className="fa-label">Class</div>
              <div className="fa-inputWrap">
                <div className="fa-icon" aria-hidden>
                  🎟️
                </div>
                <select className="fa-select" value={cabin} onChange={(e) => { setCabin(e.target.value); clearSearchState(); }}>
                  {CABIN_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="fa-rightCol">
          {tripType === "multicity" && (
            <div className="fa-multiSummary">
              <div className="fa-label">Trip plan</div>
              <div className="fa-multiSummaryList">
                {multiLegs.map((leg, idx) => (
                  <div className="fa-multiSummaryRow" key={`${leg.from}-${leg.to}-${idx}`}>
                    <span className="fa-miniStrong">
                      {leg.from || "From"} → {leg.to || "To"}
                    </span>
                    <span>{leg.date || "Pick date"}</span>
                  </div>
                ))}
              </div>
              <div className="fa-miniNote">
                Multi-city planning is ready in the form. Live multi-city search will be added after the planner flow.
              </div>
            </div>
          )}

          {tripType !== "multicity" && exactMode && (
            <div className="fa-dateGrid">
              <div className="fa-field">
                <div className="fa-label">Depart</div>
                <div className="fa-inputWrap">
                  <div className="fa-icon" aria-hidden>
                    📅
                  </div>
                  <input className="fa-dateInput" type="date" value={departDate} onChange={(e) => { setDepartDate(e.target.value); clearSearchState(); }} />
                </div>
              </div>

              {showReturn ? (
                <div className="fa-field">
                  <div className="fa-label">Return</div>
                  <div className="fa-inputWrap">
                    <div className="fa-icon" aria-hidden>
                      📅
                    </div>
                    <input className="fa-dateInput" type="date" value={returnDate} onChange={(e) => { setReturnDate(e.target.value); clearSearchState(); }} />
                  </div>
                </div>
              ) : (
                <div className="fa-field">
                  <div className="fa-label" style={{ opacity: 0.7 }}>
                    Return
                  </div>
                  <div className="fa-inputWrap isDisabled">
                    <div className="fa-icon" aria-hidden>
                      🚫
                    </div>
                    <input className="fa-dateInput" value="One-way" disabled />
                  </div>
                </div>
              )}
              <div className="fa-dateRangeSummary" aria-live="polite">
                <span className="isActive">Depart {departDate || "pick date"}</span>
                {showReturn ? <span>Return {returnDate || "pick date"}</span> : <span>One-way trip</span>}
              </div>
            </div>
          )}

          {tripType !== "multicity" && exactMode && (
            <div className="fa-providerWarning">
              <div className="fa-providerWarningTitle">Best for fixed travel plans</div>
              <div>Choose your travel dates and Farely will check current partner fares for that route.</div>
            </div>
          )}

          {tripType !== "multicity" && flexMode && (
            <div className="fa-flexBox">
              <div className="fa-flexIntro">
                <div className="fa-flexIntroTitle">Flexible dates</div>
                <div className="fa-flexIntroText">
                  Choose a month and Farely will help you compare the cheapest travel dates within that period.
                </div>
              </div>

              <div className="fa-flexSteps" aria-label="Flexible dates flow">
                <div className="fa-flexStep isActive">
                  <span>1</span>
                  <strong>Choose month</strong>
                </div>
                <div className="fa-flexStep">
                  <span>2</span>
                  <strong>Choose travel day</strong>
                </div>
                <div className="fa-flexStep">
                  <span>3</span>
                  <strong>Compare flights</strong>
                </div>
                <div className="fa-flexStep">
                  <span>4</span>
                  <strong>Check partner deal</strong>
                </div>
              </div>

              <div className="fa-flexRow">
                <div className="fa-field">
                  <div className="fa-label">Choose month</div>
                  <div className="fa-monthSummary">
                    <div>
                      <div className="fa-monthSummaryMain">{selectedMonthOption.month} {selectedMonthOption.year}</div>
                      <div className="fa-monthSummarySub">Guide price from £{selectedMonthOption.price}</div>
                    </div>
                    <div className="fa-monthSummaryCode">Travel days next</div>
                  </div>
                </div>

                <div className="fa-field">
                  <div className="fa-label">Number of nights</div>
                  <div className="fa-nightInputWrap">
                    <input
                      className="fa-nightInput"
                      type="number"
                      inputMode="numeric"
                      min={MIN_NIGHTS}
                      max={MAX_NIGHTS}
                      step={1}
                      value={isNightFocused ? nightDraft : String(tripLength || "")}
                      onChange={(e) => updateTripLength(e.target.value)}
                      onFocus={(e) => {
                        setIsNightFocused(true);
                        setNightDraft(String(tripLength || ""));
                        setTimeout(() => e.target.select(), 0);
                      }}
                      onBlur={(e) => {
                        updateTripLength(e.target.value, { commitFallback: true });
                        setIsNightFocused(false);
                      }}
                      disabled={isSearching}
                      aria-label="Number of nights"
                      placeholder="Nights"
                    />
                    <span>nights</span>
                  </div>
                </div>
              </div>

              <div className="fa-monthCompare">
                <div className="fa-monthCompareTop">
                  <div>
                    <div className="fa-label" style={{ marginBottom: 2 }}>Explore months</div>
                    <div className="fa-monthCompareSub">Pick a month first. Farely will then show travel days so you can compare flights.</div>
                  </div>
                  <div className="fa-monthCompareRoute">{routeFromCode} → {routeToCode}</div>
                </div>
                <div className="fa-monthGrid">
                  {monthOptions.map((month) => (
                    <button
                      key={month.value}
                      type="button"
                      className={cx("fa-monthCard", month.value === flexMonth && "isSelected", month.isCheapest && "isCheapest")}
                      onClick={() => {
                        setFlexMonth(month.value);
                        clearSearchState();
                      }}
                      disabled={isSearching}
                    >
                      <span className="fa-monthYear">{month.year}</span>
                      <span className="fa-monthName">{month.month}</span>
                      <span className="fa-monthPrice">from £{month.price}</span>
                      {month.isCheapest && <span className="fa-cheapestBadge">Lowest guide price</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fa-dateExplorerHint">
                Next: choose a travel day, compare flights, then confirm the final fare on the partner site.
              </div>
            </div>
          )}

          <button className={cx("fa-searchBtn", isSearching && "isLoading")} type="button" onClick={onSearch} disabled={isSearching} aria-busy={isSearching}>
            {isSearching && <span className="fa-btnSpinner" aria-hidden />}
            <span>{flexibleSearchButtonLabel({ isSearching, tripType, flexMode })}</span>
          </button>

          <div className="fa-miniNote">
            {tripType === "multicity" ? (
              <>
                Route plan uses{" "}
                <span className="fa-miniStrong">
                  {multiLegs.map((leg) => leg.from).filter(Boolean)[0] || "Start"} →{" "}
                  {multiLegs.map((leg) => leg.to).filter(Boolean).join(" → ") || "destinations"}
                </span>
              </>
            ) : (
              <>
                Live search uses:{" "}
                <span className="fa-miniStrong">
                  {routeFromCode} → {routeToCode}
                </span>{" "}
                {exactMode ? (
                  <>
                    on <span className="fa-miniStrong">{departDate}</span>
                  </>
                ) : (
                  <>
                    Flexible dates: <span className="fa-miniStrong">{selectedMonthOption.month} {selectedMonthOption.year}</span>
                  </>
                )}
              </>
            )}
          </div>

          {!!apiWarning && !searchError && (
            <div className="fa-providerWarning">
              <div className="fa-providerWarningTitle">{exactMode ? "Partner price check" : "Provider availability"}</div>
              <div>
                {exactMode
                  ? "Farely checks current partner fares. Final price and rules are confirmed on the partner site."
                  : apiWarning}
              </div>
            </div>
          )}

          {!!searchError && <div className="fa-error">{searchError}</div>}
        </div>
      </div>
    </div>
  );
}
