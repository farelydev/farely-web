import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState("LHR");
  const [destination, setDestination] = useState("JFK");
  const [departDate, setDepartDate] = useState("2026-03-10");
  const [adults, setAdults] = useState(1);
  const [currency, setCurrency] = useState("GBP");
  const [loading] = useState(false);

  const canSearch = useMemo(
    () =>
      origin.trim() &&
      destination.trim() &&
      departDate.trim() &&
      adults >= 1,
    [origin, destination, departDate, adults]
  );

  function searchFlights() {
    if (!canSearch || loading) return;

    navigate(
      `/flights?origin=${origin.toUpperCase()}` +
        `&destination=${destination.toUpperCase()}` +
        `&departDate=${departDate}` +
        `&adults=${adults}` +
        `&currency=${currency.toUpperCase()}` +
        `&sort=best`
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1>Farely</h1>
      <p style={{ opacity: 0.7 }}>Budget-first flight search.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="From (IATA)" />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="To (IATA)" />
        <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
        <input type="number" min="1" value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
        <input value={currency} onChange={(e) => setCurrency(e.target.value)} />
        <button onClick={searchFlights} disabled={!canSearch}>
          Search
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/flights")}>
          Go to Flights →
        </button>
      </div>
    </div>
  );
}

