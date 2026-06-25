import { useMemo, useState } from "react";
import { CONTACT_EMAIL, CONTACT_HREF, CONTACT_LABEL } from "../config/site";

const QUICK_TOPICS = [
  "Booking help",
  "Refunds or changes",
  "Flight prices",
  "Umrah trips",
  "Partner enquiries",
];

function answerFor(message) {
  const text = String(message || "").toLowerCase();

  if (!text.trim()) {
    return "Tell me what you need help with, or choose one of the quick topics below.";
  }

  if (text.includes("refund") || text.includes("cancel") || text.includes("change")) {
    return "Farely does not take bookings or payments directly. If you booked after clicking a partner link, the airline or travel provider handles refunds, changes, baggage, and ticket support.";
  }

  if (text.includes("book") || text.includes("ticket") || text.includes("payment")) {
    return "Farely helps you compare trip ideas and flight results. The final booking happens on the partner website after you choose View deal.";
  }

  if (text.includes("price") || text.includes("fare") || text.includes("availability")) {
    return "Flight prices can change quickly. Farely shows useful search results, but always confirm the final fare, baggage, and rules on the partner website before booking.";
  }

  if (text.includes("umrah") || text.includes("makkah") || text.includes("madinah") || text.includes("jeddah")) {
    return "For Umrah planning, Farely can help compare flight routes such as London to Jeddah or Madinah. Hotel/package support is planned next.";
  }

  if (text.includes("partner") || text.includes("affiliate") || text.includes("business")) {
    return "Farely is open to travel partners for flights, hotels, Umrah, and package journeys. A business contact email will be added once the Farely domain email is ready.";
  }

  return "I can help with bookings, prices, route searches, Umrah trip planning, and partner questions. If this needs a human reply, use the handoff option below once Farely's business email is connected.";
}

export default function SupportAssistant() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Tell me what you need help with, or choose one of the quick topics below.");

  const handoffHref = useMemo(() => {
    if (!CONTACT_EMAIL) return "";

    const subject = encodeURIComponent("Farely support request");
    const body = encodeURIComponent(
      `Hi Farely,\n\nI need help with:\n\n${message || "[Please describe the issue]"}\n\nThanks.`
    );

    return `${CONTACT_HREF}?subject=${subject}&body=${body}`;
  }, [message]);

  function askSupport(nextMessage = message) {
    setMessage(nextMessage);
    setReply(answerFor(nextMessage));
  }

  return (
    <section className="fa-supportAssistant" aria-label="Farely support assistant">
      <div className="fa-infoKicker">Support assistant</div>
      <h2>Ask Farely first</h2>
      <p className="fa-supportIntro">
        Get a quick answer about searches, bookings, prices, Umrah routes, or partner questions.
      </p>

      <div className="fa-supportQuick">
        {QUICK_TOPICS.map((topic) => (
          <button key={topic} type="button" onClick={() => askSupport(topic)}>
            {topic}
          </button>
        ))}
      </div>

      <label className="fa-supportLabel" htmlFor="farely-support-message">
        Your question
      </label>
      <textarea
        id="farely-support-message"
        className="fa-supportTextarea"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="e.g. I clicked View deal but need help with baggage"
      />

      <div className="fa-supportActions">
        <button className="fa-supportPrimary" type="button" onClick={() => askSupport()}>
          Ask assistant
        </button>
        {CONTACT_EMAIL ? (
          <a className="fa-supportSecondary" href={handoffHref}>
            Email {CONTACT_LABEL}
          </a>
        ) : (
          <span className="fa-supportMuted">Human email handoff will appear once Farely's business email is connected.</span>
        )}
      </div>

      <div className="fa-supportReply">{reply}</div>
    </section>
  );
}

