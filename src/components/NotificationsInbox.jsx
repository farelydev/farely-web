import { useEffect, useState } from "react";

const DEFAULT_NOTIFICATION_EMAIL = "fadumo5007@gmail.com";

export default function NotificationsInbox() {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState(DEFAULT_NOTIFICATION_EMAIL);
  const [status, setStatus] = useState("Loading Farely inbox…");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInbox() {
      try {
        const res = await fetch("/api/notifications/pending");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Could not load notifications.");
        if (cancelled) return;
        setItems(Array.isArray(json?.items) ? json.items : []);
        setSettings(json?.email || null);
        setEmail(json?.email?.to || DEFAULT_NOTIFICATION_EMAIL);
        setStatus(json?.email?.ready ? "Ready to email your action list." : "Email sending needs provider setup first.");
      } catch (err) {
        if (!cancelled) setStatus(err?.message || "Could not load Farely inbox.");
      }
    }

    loadInbox();

    return () => {
      cancelled = true;
    };
  }, []);

  async function sendSummary() {
    setSending(true);
    setStatus("Sending notification summary…");

    try {
      const res = await fetch("/api/notifications/email-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Email summary could not be sent.");
      setStatus(`Sent to ${json.to}. Sender: ${json.from}.`);
      if (json.email) setSettings(json.email);
    } catch (err) {
      setStatus(err?.message || "Email summary could not be sent.");
    } finally {
      setSending(false);
    }
  }

  const fromAddress = settings?.from || "info@tryfarely.com";
  const needsSetup = settings && !settings.ready;

  return (
    <section id="farely-inbox" className="fa-inboxSection" aria-label="Farely inbox notifications">
      <div className="fa-inboxPanel">
        <div className="fa-inboxHeader">
          <div>
            <div className="fa-infoKicker">Farely Inbox</div>
            <h3>Notifications that need your action</h3>
            <p>
              Use this as your single approval list while you are at work. Email summaries will come from <strong>{fromAddress}</strong> so you can filter them into another Gmail inbox or label.
            </p>
          </div>
          <div className="fa-inboxCount">{items.length}</div>
        </div>

        <div className="fa-emailBox">
          <label htmlFor="farelyNotificationEmail">Send action list to</label>
          <div className="fa-emailControls">
            <input
              id="farelyNotificationEmail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your Gmail address"
              type="email"
            />
            <button onClick={sendSummary} disabled={sending || !email.trim()}>
              {sending ? "Sending…" : "Email me"}
            </button>
          </div>
          <p className={needsSetup ? "fa-inboxStatus isWarning" : "fa-inboxStatus"}>{status}</p>
        </div>

        <div className="fa-inboxList">
          {items.map((item) => (
            <article className="fa-inboxItem" key={item.id}>
              <div className={`fa-inboxPriority ${item.priority}`}>{item.priority}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
                <span>{item.action}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
