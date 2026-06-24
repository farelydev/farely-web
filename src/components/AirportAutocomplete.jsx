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
  const [remoteResults, setRemoteResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const wrapRef = useRef(null);

  const fallbackResults = useMemo(() => {
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
    const q = (valueText || "").trim();

    if (!open || q.length < 2) {
      setRemoteResults([]);
      setStatus("idle");
      return undefined;
    }

    const controller = new AbortController();
    setRemoteResults([]);
    setStatus("loading");

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/locations?keyword=${encodeURIComponent(q)}&limit=12`, {
          signal: controller.signal,
        });
        const json = await response.json();

        if (!response.ok || !Array.isArray(json?.data)) {
          throw new Error(json?.message || "Location search failed");
        }

        const nextResults = json.data;
        setRemoteResults(nextResults);
        setStatus(nextResults.length > 0 ? (json.source === "amadeus" ? "ready" : "fallback") : "empty");
      } catch (err) {
        if (err?.name === "AbortError") return;
        setRemoteResults([]);
        setStatus("empty");
      }
    }, 275);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, valueText]);

  const manualIata = useMemo(() => {
    const code = (valueText || "").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) return null;
    if (remoteResults.some((a) => a.iata === code) || fallbackResults.some((a) => a.iata === code)) return null;

    return {
      city: code,
      country: "",
      name: "Manual IATA code",
      iata: code,
      type: "airport",
      tags: ["typed code"],
    };
  }, [fallbackResults, remoteResults, valueText]);

  const results = useMemo(() => {
    const base = remoteResults.length > 0 ? remoteResults : fallbackResults;
    return manualIata ? [manualIata, ...base] : base;
  }, [fallbackResults, manualIata, remoteResults]);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [open, results.length, valueText]);

  const query = (valueText || "").trim();
  const showDropdown = open && query.length >= 2 && (results.length > 0 || status === "loading" || status === "empty");

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
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }

            if (results.length === 0) return;

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

          }}
        />
      </div>

      {showDropdown && (
        <div className="fa-dropdown" role="listbox">
          {status === "loading" && <div className="fa-hint">Searching worldwide cities and airports…</div>}
          {status === "empty" && (
            <div className="fa-hint">No live matches yet. Try the city, airport name, or a 3-letter IATA code.</div>
          )}
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
                  {a.city}{a.country ? `, ${a.country}` : ""} — <span className="fa-itemStrong">{a.name}</span>
                </div>
                <div className="fa-itemSub">
                  <span className="fa-pill">{a.type || "airport"}</span>
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
          {status === "fallback" && (
            <div className="fa-hint">Live location lookup is unavailable, so fallback matches are shown.</div>
          )}
          <div className="fa-hint">Tip: you can also type any 3-letter IATA code, for example MGQ, NBO, JED, or JFK.</div>
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
