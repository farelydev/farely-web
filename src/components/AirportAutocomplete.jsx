import { useEffect, useMemo, useRef, useState } from "react";
import { AIRPORTS } from "../data/airports";
import { airportLabel, cx } from "../utils/flightHelpers";

export default function AirportAutocomplete({
  label,
  valueText,
  selected,
  onChangeText,
  onSelectAirport,
  placeholder = "City or airport",
  icon = "📍",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);

  const results = useMemo(() => {
    const q = (valueText || "").trim().toLowerCase();
    if (!q) return [];

    return AIRPORTS.map((a) => {
      const hay = `${a.city} ${a.country} ${a.name} ${a.iata} ${(a.tags || []).join(" ")}`.toLowerCase();
      const starts = hay.startsWith(q) ? 2 : 0;
      const includes = hay.includes(q) ? 1 : 0;
      return { a, score: starts + includes };
    })
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 8)
      .map((x) => x.a);
  }, [valueText]);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) setActiveIndex(0);
  }, [open, valueText]);

  const showDropdown = open && results.length > 0;

  return (
    <div className="fa-field" ref={wrapRef}>
      <div className="fa-label">{label}</div>

      <div className={cx("fa-inputWrap", disabled && "isDisabled")}>
        <div className="fa-icon" aria-hidden>
          {icon}
        </div>

        <input
          className="fa-input"
          value={valueText}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onChangeText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showDropdown) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }

            if (e.key === "Enter") {
              e.preventDefault();
              const pick = results[activeIndex];
              if (pick) {
                onSelectAirport(pick);
                setOpen(false);
              }
            }

            if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>

      {showDropdown && (
        <div className="fa-dropdown" role="listbox">
          {results.map((a, idx) => (
            <button
              key={`${a.city}-${a.iata}-${a.name}-${idx}`}
              type="button"
              className={cx("fa-item", idx === activeIndex && "isActive")}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelectAirport(a);
                setOpen(false);
              }}
            >
              <div className="fa-itemMain">
                <div className="fa-itemTitle">
                  {a.city}, {a.country} — <span className="fa-itemStrong">{a.name}</span>
                </div>
                <div className="fa-itemSub">
                  {(a.tags || []).slice(0, 4).map((t) => (
                    <span key={t} className="fa-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="fa-itemCode">{a.iata}</div>
            </button>
          ))}
          <div className="fa-hint">Tip: you can also type any IATA code, for example LHR, JED, MED, or JFK.</div>
        </div>
      )}

      {!!selected && (
        <div className="fa-selectedHint">
          Selected: <span className="fa-selectedStrong">{airportLabel(selected)}</span> ({selected.iata})
        </div>
      )}
    </div>
  );
}
