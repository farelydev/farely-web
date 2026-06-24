import AirportAutocomplete from "./AirportAutocomplete";
import { airportLabel, cx, todayPlus } from "../utils/flightHelpers";

const CABIN_OPTIONS = ["Economy", "Premium economy", "Business", "First"];

export default function SearchCard({
  tripType, setTripType, exactMode, flexMode, setDateMode, clearSearchState,
  fromText, setFromText, fromAirport, setFromAirport, toText, setToText, toAirport, setToAirport,
  multiLegs, setMultiLegs, passengers, setPassengers, cabin, setCabin,
  departDate, setDepartDate, returnDate, setReturnDate, showReturn,
  flexMonth, setFlexMonth, tripLength, setTripLength, flexWindow, setFlexWindow,
  onSearch, isSearching, routeFromCode, routeToCode, apiWarning, searchError,
}) {
  return (
    <div className="fa-card">
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
            </div>
          )}

          {tripType !== "multicity" && flexMode && (
            <div className="fa-flexBox">
              <div className="fa-flexRow">
                <div className="fa-field">
                  <div className="fa-label">Month</div>
                  <div className="fa-inputWrap">
                    <div className="fa-icon" aria-hidden>
                      🗓️
                    </div>
                    <input className="fa-dateInput" type="month" value={flexMonth} onChange={(e) => { setFlexMonth(e.target.value); clearSearchState(); }} />
                  </div>
                </div>

                <div className="fa-field">
                  <div className="fa-label">Trip length</div>
                  <div className="fa-inputWrap">
                    <div className="fa-icon" aria-hidden>
                      ⏱️
                    </div>
                    <select className="fa-select" value={tripLength} onChange={(e) => { setTripLength(Number(e.target.value)); clearSearchState(); }}>
                      {[2, 3, 4, 5, 7, 10, 14].map((n) => (
                        <option key={n} value={n}>
                          {n} days
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="fa-sliderWrap">
                <div className="fa-sliderTop">
                  <div className="fa-label" style={{ marginBottom: 0 }}>
                    Flex window
                  </div>
                  <div className="fa-sliderVal">± {flexWindow} days</div>
                </div>
                <input className="fa-slider" type="range" min={0} max={21} step={1} value={flexWindow} onChange={(e) => { setFlexWindow(Number(e.target.value)); clearSearchState(); }} />
              </div>

              <div className="fa-miniNote">
                Flexible month scans dates around the middle of the month. Increase the window to cover more days.
              </div>
            </div>
          )}

          <button className="fa-searchBtn" type="button" onClick={onSearch} disabled={isSearching}>
            {isSearching ? "Searching…" : tripType === "multicity" ? "Review multi-city plan" : "Search flights"}
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
                    in <span className="fa-miniStrong">{flexMonth}</span>
                  </>
                )}
              </>
            )}
          </div>

          {!!apiWarning && (
            <div className="fa-providerWarning">
              <div className="fa-providerWarningTitle">Development mode</div>
              <div>{apiWarning}</div>
            </div>
          )}

          {!!searchError && <div className="fa-error">{searchError}</div>}
        </div>
      </div>
    </div>
  );
}
