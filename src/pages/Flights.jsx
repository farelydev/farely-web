import { useEffect, useState } from "react";

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFlights();
  }, []);

  async function loadFlights() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "/api/flights/search?origin=LHR&destination=JFK&date=2026-03-10&adults=1&max=10"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch flights");
      }

      const data = await res.json();
      setFlights(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Flights</h1>

      {loading && <p>Loading flights…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && flights.length === 0 && (
        <p>No flights found</p>
      )}

      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        {flights.map((f) => (
          <div
            key={f.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{f.airlineName}</strong>
              <strong>
                {f.currency} {f.price}
              </strong>
            </div>

            <div style={{ marginTop: 8 }}>
              {f.departure.airport} → {f.arrival.airport}
            </div>

            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Stops: {f.stops} • Duration: {f.duration}
            </div>

            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Depart: {f.departure.time}
              <br />
              Arrive: {f.arrival.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
