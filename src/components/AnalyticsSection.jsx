import { useMemo, useState } from "react";

function topEntries(group = {}, limit = 5) {
  return Object.entries(group)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default function AnalyticsSection() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("locked");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [draftToken, setDraftToken] = useState("");

  async function loadAnalytics(nextToken = token) {
    if (!nextToken) {
      setStatus("locked");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/analytics/deal-clicks", {
        headers: {
          "x-farely-admin-token": nextToken,
        },
      });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "Analytics could not be loaded.");
      }

      setData(json);
      setStatus("ready");
    } catch (err) {
      setError(err?.message || "Analytics could not be loaded.");
      setStatus("error");
    }
  }

  function unlockAnalytics(event) {
    event.preventDefault();

    const nextToken = draftToken.trim();
    if (!nextToken) {
      setError("Enter your Farely admin token.");
      setStatus("locked");
      return;
    }

    setToken(nextToken);
    window.dispatchEvent(new Event("farely-admin-token-changed"));
    loadAnalytics(nextToken);
  }

  function lockAnalytics() {
    setToken("");
    setDraftToken("");
    setData(null);
    setStatus("locked");
    setError("");
    window.dispatchEvent(new Event("farely-admin-token-changed"));
  }

  const topRoutes = useMemo(() => topEntries(data?.byRoute), [data]);
  const topCarriers = useMemo(() => topEntries(data?.byCarrier), [data]);
  const topSources = useMemo(() => topEntries(data?.bySource), [data]);

  return (
    <section id="farely-analytics" className="fa-analyticsSection" aria-label="Farely analytics">
      <div className="fa-analyticsInner">
        <div className="fa-analyticsTop">
          <div>
            <div className="fa-infoKicker">Founder dashboard</div>
            <h2 className="fa-analyticsTitle">Deal-click analytics</h2>
            <p className="fa-analyticsText">
              This is the first money-path dashboard: it shows whether people are clicking flight deals,
              which routes they click, and which partners or carriers get attention.
            </p>
          </div>

          <div className="fa-analyticsActions">
            {token && (
              <button className="fa-secondaryBtn" type="button" onClick={lockAnalytics}>
                Lock
              </button>
            )}
            <button className="fa-refreshBtn" type="button" onClick={() => loadAnalytics()} disabled={status === "loading"}>
              {status === "loading" ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {status === "error" && <div className="fa-error">{error}</div>}
        {(status === "locked" || (!token && status !== "loading")) && (
          <form className="fa-adminUnlock" onSubmit={unlockAnalytics}>
            <div>
              <div className="fa-metricLabel">Private analytics</div>
              <p>Enter your Farely admin token to view deal-click analytics.</p>
            </div>
            <input
              className="fa-adminInput"
              type="password"
              value={draftToken}
              onChange={(event) => setDraftToken(event.target.value)}
              placeholder="Admin token"
              autoComplete="off"
            />
            <button className="fa-refreshBtn" type="submit">Unlock</button>
          </form>
        )}

        {token && (
          <>
        <div className="fa-metricGrid">
          <div className="fa-metricCard">
            <div className="fa-metricLabel">Total deal clicks</div>
            <div className="fa-metricValue">{data?.totalClicks ?? 0}</div>
          </div>
          <div className="fa-metricCard">
            <div className="fa-metricLabel">Top route</div>
            <div className="fa-metricValue isSmall">{topRoutes[0]?.[0] || "No clicks yet"}</div>
          </div>
          <div className="fa-metricCard">
            <div className="fa-metricLabel">Top carrier</div>
            <div className="fa-metricValue isSmall">{topCarriers[0]?.[0] || "No clicks yet"}</div>
          </div>
        </div>

        <div className="fa-analyticsGrid">
          <div className="fa-analyticsPanel">
            <h3>Top routes</h3>
            {topRoutes.length ? (
              topRoutes.map(([route, count]) => (
                <div className="fa-rankRow" key={route}>
                  <span>{route}</span>
                  <strong>{count}</strong>
                </div>
              ))
            ) : (
              <div className="fa-emptyMini">No route clicks yet.</div>
            )}
          </div>

          <div className="fa-analyticsPanel">
            <h3>Top carriers</h3>
            {topCarriers.length ? (
              topCarriers.map(([carrier, count]) => (
                <div className="fa-rankRow" key={carrier}>
                  <span>{carrier}</span>
                  <strong>{count}</strong>
                </div>
              ))
            ) : (
              <div className="fa-emptyMini">No carrier clicks yet.</div>
            )}
          </div>

          <div className="fa-analyticsPanel">
            <h3>Deal sources</h3>
            {topSources.length ? (
              topSources.map(([source, count]) => (
                <div className="fa-rankRow" key={source}>
                  <span>{source}</span>
                  <strong>{count}</strong>
                </div>
              ))
            ) : (
              <div className="fa-emptyMini">No source clicks yet.</div>
            )}
          </div>
        </div>

        <div className="fa-analyticsPanel">
          <h3>Recent clicks</h3>
          {data?.recent?.length ? (
            <div className="fa-clickTable">
              {data.recent.slice(0, 8).map((click, idx) => (
                <div className="fa-clickRow" key={`${click.at}-${idx}`}>
                  <span>{click.origin} → {click.destination}</span>
                  <span>{click.departureDate}</span>
                  <span>{click.carrier || "Carrier TBC"}</span>
                  <span>{click.target}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="fa-emptyMini">
              No clicks yet. Click a result’s “View deal” button, then refresh this panel.
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </section>
  );
}
