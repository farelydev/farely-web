import { useMemo, useState } from "react";
import { CONTACT_EMAIL, CONTACT_HREF, CONTACT_LABEL, NOREPLY_EMAIL, SUPPORT_EMAIL, SUPPORT_HREF, SUPPORT_LABEL } from "../config/site";

const QUICK_TOPICS = [
  "Cheaper flight options",
  "Baggage and stopovers",
  "Flexible travel dates",
  "Umrah trips",
  "Visa route questions",
];

function answerFor(message) {
  const text = String(message || "").toLowerCase();

  if (!text.trim()) {
    return "Ask about flights, baggage, stopovers, visas, Umrah routes, flexible dates, or cheaper options.";
  }

  if (text.includes("refund") || text.includes("cancel") || text.includes("change")) {
    return "Farely does not take bookings or payments directly. If you booked after clicking a partner link, the airline or travel provider handles refunds, changes, baggage, and ticket support.";
  }

  if (text.includes("book") || text.includes("ticket") || text.includes("payment")) {
    return "Farely helps you compare trip ideas and flight results. The final booking, payment, and ticketing happen on the partner website after you choose View deal.";
  }

  if (text.includes("price") || text.includes("fare") || text.includes("availability")) {
    return "Flight prices can change quickly. Farely shows useful search results, but always confirm the final fare, baggage, and rules on the partner website before booking.";
  }

  if (text.includes("umrah") || text.includes("makkah") || text.includes("madinah") || text.includes("jeddah")) {
    return "For Umrah planning, Farely can help compare flight routes such as London to Jeddah or Madinah. Always check visa, baggage, hotel, and package details with the travel provider before booking.";
  }

  if (text.includes("partner") || text.includes("affiliate") || text.includes("business")) {
    return CONTACT_EMAIL
      ? `Farely is open to travel partners for flights, hotels, Umrah, and package journeys. For partner enquiries, email ${CONTACT_EMAIL}.`
      : "Farely is open to travel partners for flights, hotels, Umrah, and package journeys. Use the support option below for partner enquiries.";
  }

  return "I can help with route searches, prices, Umrah trip planning, baggage questions, stopovers, flexible dates, and cheaper-option ideas. If this needs a human reply, use the support option below.";
}

export default function SupportAssistant() {
  const [message, setMessage] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reply, setReply] = useState("Tell me what you need help with, or choose one of the quick topics below.");
  const [sendStatus, setSendStatus] = useState("idle");
  const [sendMessage, setSendMessage] = useState("");

  const handoffHref = useMemo(() => {
    if (!CONTACT_EMAIL) return "";

    const subject = encodeURIComponent("Farely support request");
    const body = encodeURIComponent(
      `Hi Farely,\n\nI need help with:\n\n${message || "[Please describe the issue]"}\n\nThanks.`
    );

    return `${SUPPORT_HREF || CONTACT_HREF}?subject=${subject}&body=${body}`;
  }, [message]);

  function askSupport(nextMessage = message) {
    setMessage(nextMessage);
    setReply(answerFor(nextMessage));
    setSendMessage("");
  }

  async function sendToSupport() {
    setSendStatus("sending");
    setSendMessage("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          message,
          topic: "Support assistant",
          assistantReply: reply,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        throw new Error(json?.message || "Support could not receive this query.");
      }

      setSendStatus(json.emailSent ? "sent" : "fallback");
      setSendMessage(
        json.emailSent
          ? json.message || "Your query has been received. Please allow up to 7 working days for a reply."
          : `Please use the Email ${SUPPORT_LABEL} button to complete sending this request. Replies can take up to 7 working days.`
      );
    } catch (err) {
      setSendStatus("error");
      setSendMessage(err?.message || "Support could not receive this query. Please email Farely directly.");
    }
  }

  return (
    <section className="fa-supportAssistant" aria-label="Farely AI Assistant">
      <div className="fa-infoKicker">AI travel assistant</div>
      <h2>Farely AI Assistant</h2>
      <p className="fa-supportIntro">
        Ask anything about flights, baggage, stopovers, visas, Umrah routes, flexible travel dates or finding cheaper options.
      </p>

      <div className="fa-supportQuick">
        {QUICK_TOPICS.map((topic) => (
          <button key={topic} type="button" onClick={() => askSupport(topic)}>
            {topic}
          </button>
        ))}
      </div>

      <label className="fa-supportLabel" htmlFor="farely-support-message">
        Ask the assistant
      </label>
      <textarea
        id="farely-support-message"
        className="fa-supportTextarea"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="e.g. Find cheaper London to Jeddah routes with sensible stopovers"
      />

      <div className="fa-supportActions">
        <button className="fa-supportPrimary" type="button" onClick={() => askSupport()}>
          Ask assistant
        </button>
      </div>

      <div className="fa-supportReply">{reply}</div>

      <div className="fa-supportHandoff">
        <div>
          <div className="fa-supportHandoffTitle">Still need help?</div>
          <p>
            Use {CONTACT_EMAIL || "info@tryfarely.com"} for general enquiries and partnerships, {SUPPORT_EMAIL || "support@tryfarely.com"} for customer support, and {NOREPLY_EMAIL || "noreply@tryfarely.com"} for automated emails only.
          </p>
        </div>

        <label className="fa-supportLabel" htmlFor="farely-customer-email">
          Your email for replies
        </label>
        <input
          id="farely-customer-email"
          className="fa-supportInput"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
        />

        <div className="fa-supportActions">
          <button
            className="fa-supportPrimary"
            type="button"
            onClick={sendToSupport}
            disabled={sendStatus === "sending"}
          >
            {sendStatus === "sending" ? "Sending..." : "Send to support"}
          </button>

          {(SUPPORT_EMAIL || CONTACT_EMAIL) && (
            <a className="fa-supportSecondary" href={handoffHref}>
              Email {SUPPORT_LABEL || CONTACT_LABEL}
            </a>
          )}
        </div>

        {sendMessage && (
          <div className={`fa-supportStatus is-${sendStatus}`}>
            {sendMessage}
          </div>
        )}
      </div>
    </section>
  );
}
