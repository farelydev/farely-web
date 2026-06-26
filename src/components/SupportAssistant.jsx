import { useMemo, useState } from "react";
import {
  CONTACT_EMAIL,
  CONTACT_HREF,
  CONTACT_LABEL,
  NOREPLY_EMAIL,
  PRIVACY_EMAIL,
  SECURITY_EMAIL,
  SUPPORT_EMAIL,
  SUPPORT_HREF,
  SUPPORT_LABEL,
} from "../config/site";

const QUICK_TOPICS = [
  "Help with bookings",
  "Refund guidance",
  "Flight price questions",
  "Baggage and stopovers",
  "Umrah travel help",
  "Business & partner enquiries",
];

function answerFor(message) {
  const text = String(message || "").toLowerCase();

  if (!text.trim()) {
    return "Ask about flights, baggage, stopovers, visas, Umrah routes, flexible dates, or cheaper options.";
  }

  if (text.includes("refund") || text.includes("cancel") || text.includes("change")) {
    return "Farely can explain the usual next steps, but refunds, changes, cancellations, and ticket support are handled by the airline or travel partner you booked with.";
  }

  if (text.includes("book") || text.includes("ticket") || text.includes("payment")) {
    return "Farely helps you compare trip ideas and flight results. The final booking, payment, ticketing, and booking changes happen on the airline or travel partner website.";
  }

  if (text.includes("price") || text.includes("fare") || text.includes("availability")) {
    return "Flight prices can change quickly. Farely shows useful search results, but always confirm the final fare, baggage, and rules on the partner website before booking.";
  }

  if (text.includes("umrah") || text.includes("makkah") || text.includes("madinah") || text.includes("jeddah")) {
    return "For Umrah planning, Farely can help compare flight routes such as London to Jeddah or Madinah. Always check visa, baggage, hotel, and package details with the travel provider before booking.";
  }

  if (text.includes("partner") || text.includes("affiliate") || text.includes("business")) {
    return CONTACT_EMAIL
      ? `Farely is open to travel partners for flights, hotels, Umrah, and package journeys. For partnerships and general enquiries, email ${CONTACT_EMAIL}.`
      : "Farely is open to travel partners for flights, hotels, Umrah, and package journeys. Use the support option below for partner enquiries.";
  }

  return "I can help with route searches, prices, Umrah trip planning, baggage questions, stopovers, flexible dates, and cheaper-option ideas. If this needs a human reply, use the support option below.";
}

export default function SupportAssistant() {
  const [message, setMessage] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reply, setReply] = useState("Ask Farely AI about routes, prices, baggage, stopovers, Umrah travel, or what to check before booking with a partner.");
  const [sendStatus, setSendStatus] = useState("idle");
  const [sendMessage, setSendMessage] = useState("");

  const handoffHref = useMemo(() => {
    if (!SUPPORT_EMAIL && !CONTACT_EMAIL) return "";

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
          : `Please use the Email ${SUPPORT_LABEL} button to contact Farely support directly. Replies can take up to 7 working days.`
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
            If Farely AI cannot answer your question, contact our team at <a className="fa-inlineLink" href={SUPPORT_HREF}>{SUPPORT_EMAIL || "support@tryfarely.com"}</a>. Use <a className="fa-inlineLink" href={CONTACT_HREF}>{CONTACT_EMAIL || "info@tryfarely.com"}</a> for partnerships and general enquiries.
          </p>
          <p className="fa-supportMuted">
            Privacy: {PRIVACY_EMAIL || "privacy@tryfarely.com"} · Security: {SECURITY_EMAIL || "security@tryfarely.com"} · Automated emails only: {NOREPLY_EMAIL || "noreply@tryfarely.com"}.
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
