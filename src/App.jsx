import React, { useState, useEffect, useMemo, useRef } from "react";

/*
FARELY – Clean MVP UI
Whole-file replacement
*/

const AIRPORTS = [
  { city: "Oslo", code: "OSL", country: "Norway" },
  { city: "Doha", code: "DOH", country: "Qatar" },
];

function formatPrice(n) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function useAutoTheme() {
  const [dark, setDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e) => setDark(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return dark;
}

function AirportInput({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="field" ref={ref}>
      <label>{label}</label>
      <input
        value={value?.city || ""}
        onFocus={() => setOpen(true)}
        readOnly
        placeholder="Select airport"
      />
      {open && (
        <div className="dropdown">
          {AIRPORTS.map((a) => (
            <button
              key={a.code}
              onClick={() => {
                onChange(a);
                setOpen(false);
              }}
            >
              {a.city} ({a.code})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const dark = useAutoTheme();

  const [from, setFrom] = useState(AIRPORTS[0]);
  const [to, setTo] = useState(AIRPORTS[1]);

  const [dateMode, setDateMode] = useState("exact");
  const [depart, setDepart] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [searched, setSearched] = useState(false);
  const [active, setActive] = useState("best");

  const results = useMemo(() => {
    return {
      cheapest: { price: 189, duration: "9h 40m" },
      fastest: { price: 249, duration: "6h 15m" },
      best: { price: 215, duration: "7h 05m" },
    };
  }, []);

  const activeResult = results[active];

  return (
    <div className={dark ? "app dark" : "app"}>
      <style>{`
        body { margin:0; font-family: Inter, sans-serif; }
        .app { min-height:100vh; background:#f6f6f7; color:#111; }
        .dark { background:#111; color:#f6f6f7; }

        header {
          padding:20px 40px;
        }

        .logo {
          height:40px;
        }

        .hero {
          max-width:900px;
          margin:60px auto;
          padding:40px;
          border-radius:20px;
          background:rgba(255,255,255,0.6);
          backdrop-filter:blur(20px);
        }

        .dark .hero {
          background:rgba(255,255,255,0.05);
        }

        h1 {
          font-size:40px;
          margin-bottom:30px;
          font-weight:600;
        }

        .searchGrid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
        }

        .field {
          display:flex;
          flex-direction:column;
          gap:6px;
          position:relative;
        }

        input, select {
          padding:12px;
          border-radius:12px;
          border:1px solid #ccc;
          background:white;
        }

        .dark input {
          background:#1a1a1a;
          border:1px solid #333;
          color:white;
        }

        .dropdown {
          position:absolute;
          top:70px;
          background:white;
          border-radius:12px;
          width:100%;
          box-shadow:0 10px 30px rgba(0,0,0,0.1);
          overflow:hidden;
          z-index:10;
        }

        .dark .dropdown {
          background:#1a1a1a;
        }

        .dropdown button {
          width:100%;
          padding:12px;
          border:none;
          text-align:left;
          background:none;
          cursor:pointer;
        }

        .dropdown button:hover {
          background:rgba(0,0,0,0.05);
        }

        .searchBtn {
          margin-top:30px;
          padding:14px;
          border:none;
          border-radius:14px;
          font-size:16px;
          cursor:pointer;
          background:black;
          color:white;
        }

        .results {
          max-width:900px;
          margin:40px auto;
        }

        .tabs {
          display:flex;
          gap:12px;
        }

        .tab {
          padding:10px 16px;
          border-radius:12px;
          cursor:pointer;
          background:rgba(0,0,0,0.05);
        }

        .dark .tab {
          background:rgba(255,255,255,0.08);
        }

        .activeTab {
          background:black;
          color:white;
        }

        .card {
          margin-top:20px;
          padding:24px;
          border-radius:20px;
          background:rgba(0,0,0,0.05);
        }

        .dark .card {
          background:rgba(255,255,255,0.08);
        }

        .price {
          font-size:32px;
          font-weight:600;
        }

        .cta {
          margin-top:20px;
          padding:12px 18px;
          border:none;
          border-radius:14px;
          background:black;
          color:white;
          cursor:pointer;
        }
      `}</style>

      <header>
        <img src="/brand/farely-logo.png" alt="Farely" className="logo" />
      </header>

      <section className="hero">
        <h1>Find flights without overthinking.</h1>

        <div className="searchGrid">
          <AirportInput label="From" value={from} onChange={setFrom} />
          <AirportInput label="To" value={to} onChange={setTo} />

          {dateMode === "exact" && (
            <>
              <div className="field">
                <label>Depart</label>
                <input
                  type="date"
                  value={depart}
                  onChange={(e) => setDepart(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <button className="searchBtn" onClick={() => setSearched(true)}>
          Search
        </button>
      </section>

      {searched && (
        <section className="results">
          <div className="tabs">
            {["cheapest", "fastest", "best"].map((t) => (
              <div
                key={t}
                className={`tab ${active === t ? "activeTab" : ""}`}
                onClick={() => setActive(t)}
              >
                {t}
              </div>
            ))}
          </div>

          <div className="card">
            <div className="price">
              {formatPrice(activeResult.price)}
            </div>
            <div>{activeResult.duration}</div>

            <button
              className="cta"
              onClick={() =>
                window.location.href = "https://example.com"
              }
            >
              Continue to booking →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}