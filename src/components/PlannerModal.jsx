import { useMemo, useState } from "react";

const INITIAL_MESSAGES = {
  ai: "Tell me what you have in mind. I will ask a few quick questions before preparing a search.",
  weekend: "Weekend trips need dates first. Which weekend are you thinking of?",
  cheapmonth: "I can help compare a cheaper month. What kind of trip should I look for?",
  umrah: "I can help shape an Umrah route. Would you prefer to start with Makkah/Jeddah, Madinah, or stay flexible?",
};

const MODE_TITLES = {
  ai: "Plan with Farely AI",
  weekend: "Plan a weekend getaway",
  cheapmonth: "Find a cheaper month",
  umrah: "Plan an Umrah trip",
};

const QUICK_OPTIONS = {
  timing: ["Next weekend", "This month", "Choose dates", "Flexible"],
  nights: ["2 nights", "3 nights", "5 nights", "7 nights"],
  budget: ["Under £200", "Under £300", "Under £500", "Flexible budget"],
  style: ["Beach", "City break", "Family friendly", "Halal friendly", "Non-stop only", "Avoid Ryanair"],
};

const DESTINATIONS = [
  {
    id: "paris",
    name: "Paris",
    code: "CDG",
    from: "LON",
    theme: ["weekend", "city"],
    tripLength: 3,
    flexMonth: null,
    reason: "I suggested Paris because it fits a short trip from London, has frequent direct flights, and works well for a city break.",
    note: "Confirm the exact weekend before searching live prices.",
  },
  {
    id: "malaga",
    name: "Malaga",
    code: "AGP",
    from: "LON",
    theme: ["warm", "beach", "cheapmonth"],
    tripLength: 5,
    flexMonth: "2026-07",
    reason: "I suggested Malaga because it matches warm-weather and beach prompts, usually has good UK flight coverage, and suits flexible dates.",
    note: "Weather and fares should be checked live before booking.",
  },
  {
    id: "faro",
    name: "Faro",
    code: "FAO",
    from: "LON",
    theme: ["warm", "beach", "family"],
    tripLength: 5,
    flexMonth: "2026-07",
    reason: "I suggested Faro because it is a simple warm-weather option with beaches and a relaxed trip style.",
    note: "Farely will use this as a search starting point, not a booking guarantee.",
  },
  {
    id: "jeddah",
    name: "Jeddah",
    code: "JED",
    from: "LON",
    theme: ["umrah", "halal"],
    tripLength: 10,
    flexMonth: null,
    reason: "I suggested Jeddah because it is a common entry point for travellers going to Makkah first.",
    note: "You should still check visa, package, hotel, and pilgrimage requirements before booking.",
  },
  {
    id: "madinah",
    name: "Madinah",
    code: "MED",
    from: "LON",
    theme: ["umrah", "halal"],
    tripLength: 10,
    flexMonth: null,
    reason: "I suggested Madinah because it works well if you want to visit Madinah before Makkah.",
    note: "You should still check visa, package, hotel, and pilgrimage requirements before booking.",
  },
];

function addMonthsISO(monthsAhead) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function todayPlus(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function parsePrompt(prompt, mode) {
  const lower = String(prompt || "").toLowerCase();
  const tags = new Set();

  if (mode === "weekend" || lower.includes("weekend")) tags.add("weekend");
  if (mode === "cheapmonth" || /cheap|cheapest|budget|under|flexible/.test(lower)) tags.add("cheapmonth");
  if (mode === "umrah" || /umrah|makkah|madinah|medina|jeddah/.test(lower)) tags.add("umrah");
  if (/warm|sun|sunny|beach|hot/.test(lower)) tags.add("warm");
  if (/beach|coast|sea/.test(lower)) tags.add("beach");
  if (/city|paris|rome|italy/.test(lower)) tags.add("city");
  if (/family|kids|children/.test(lower)) tags.add("family");
  if (/halal|muslim/.test(lower)) tags.add("halal");

  if (lower.includes("paris")) tags.add("paris");
  if (lower.includes("malaga") || lower.includes("spain")) tags.add("malaga");

  const nights = lower.match(/\b(\d{1,2})\s*(?:nights?|days?)\b/)?.[1] || "";
  const budget = lower.match(/\b(?:under|below|max|budget|£)\s*£?\s*(\d{2,5})\b/)?.[1] || "";

  return { tags: Array.from(tags), nights, budget };
}

function buildRecommendations(intent, mode) {
  const promptTags = new Set([mode, ...intent.tags, ...(intent.style || [])].filter(Boolean));
  const scored = DESTINATIONS.map((destination) => {
    let score = 0;
    destination.theme.forEach((tag) => {
      if (promptTags.has(tag)) score += 2;
    });
    if (promptTags.has(destination.id)) score += 4;
    if (mode === "weekend" && destination.id === "paris") score += 2;
    if (mode === "cheapmonth" && destination.id === "malaga") score += 2;
    if (mode === "umrah" && ["jeddah", "madinah"].includes(destination.id)) score += 3;
    return { ...destination, score };
  });

  const ranked = scored.sort((a, b) => b.score - a.score);
  return ranked.slice(0, mode === "umrah" ? 2 : 3);
}

function nextQuestion(intent) {
  if (!intent.timing) return { key: "timing", text: "Which dates or timing should I use?" };
  if (!intent.nights) return { key: "nights", text: "How many nights should I plan for?" };
  if (!intent.budget) return { key: "budget", text: "What budget should I aim for?" };
  if (!intent.style?.length) return { key: "style", text: "What matters most for this trip?" };
  return null;
}

function responseToIntent(questionKey, value) {
  if (questionKey === "timing") return { timing: value };
  if (questionKey === "nights") return { nights: value.match(/\d+/)?.[0] || value };
  if (questionKey === "budget") return { budget: value };
  if (questionKey === "style") return { style: [value.toLowerCase().replace(/\s+/g, "-")] };
  return {};
}

export default function PlannerModal({
  open,
  mode,
  onClose,
  onApplyTrip,
  aiText,
}) {
  const initialIntent = useMemo(() => {
    const parsed = parsePrompt(aiText, mode);
    return {
      tags: parsed.tags,
      nights: parsed.nights,
      budget: parsed.budget ? `Under £${parsed.budget}` : "",
      style: [],
    };
  }, [aiText, mode]);
  const initialQuestion = useMemo(() => nextQuestion(initialIntent), [initialIntent]);
  const initialMessages = useMemo(() => [
    ...(aiText ? [{ role: "user", text: aiText }] : []),
    { role: "bot", text: INITIAL_MESSAGES[mode] || INITIAL_MESSAGES.ai },
    ...(initialQuestion ? [{ role: "bot", text: initialQuestion.text }] : []),
  ], [aiText, initialQuestion, mode]);

  const [messages, setMessages] = useState(initialMessages);
  const [intent, setIntent] = useState(initialIntent);
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const title = MODE_TITLES[mode] || MODE_TITLES.ai;
  const recommendations = useMemo(() => buildRecommendations(intent, mode), [intent, mode]);

  if (!open) return null;

  function addAnswer(value) {
    const clean = String(value || "").trim();
    if (!clean) return;

    const nextIntent = {
      ...intent,
      ...responseToIntent(question?.key, clean),
    };
    const followingQuestion = nextQuestion(nextIntent);

    setIntent(nextIntent);
    setInput("");

    if (followingQuestion) {
      setQuestion(followingQuestion);
      setMessages((prev) => [...prev, { role: "user", text: clean }, { role: "bot", text: followingQuestion.text }]);
      return;
    }

    setQuestion(null);
    setShowRecommendations(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: clean },
      { role: "bot", text: "Thanks. Based on that, I would start with these options. Choose one and I will prepare the search form for you." },
    ]);
  }

  function applyRecommendation(recommendation) {
    const flexible = intent.timing === "Flexible" || mode === "cheapmonth" || Boolean(recommendation.flexMonth);
    const departDate = flexible ? null : todayPlus(mode === "weekend" ? 10 : 30);
    const nights = Number(intent.nights || recommendation.tripLength || 5);

    onApplyTrip({
      tripType: "return",
      dateMode: flexible ? "flex" : "exact",
      originCode: recommendation.from,
      destinationCode: recommendation.code,
      departDate,
      returnDate: departDate ? todayPlus((mode === "weekend" ? 10 : 30) + nights) : null,
      flexMonth: recommendation.flexMonth || addMonthsISO(1),
      tripLength: nights,
      cabin: "Economy",
      label: `${recommendation.name} trip`,
      reason: recommendation.reason,
    });
  }

  const optionList = question ? QUICK_OPTIONS[question.key] || [] : [];

  return (
    <div className="fa-modalOverlay" onMouseDown={onClose}>
      <div className="fa-planner" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="fa-plannerTop">
          <div>
            <div className="fa-plannerKicker">Farely AI Assistant</div>
            <h3 className="fa-plannerTitle">{title}</h3>
          </div>
          <button type="button" className="fa-closeBtn" onClick={onClose} aria-label="Close planner">
            x
          </button>
        </div>

        <div className="fa-plannerStream" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`fa-chatBubble ${message.role === "user" ? "isUser" : "isBot"}`}>
              {message.text}
            </div>
          ))}
        </div>

        {optionList.length > 0 && (
          <div className="fa-answerChips">
            {optionList.map((option) => (
              <button key={option} type="button" className="fa-answerChip" onClick={() => addAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        )}

        <div className="fa-plannerInputRow">
          <input
            className="fa-plannerInput"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addAnswer(input);
            }}
            placeholder="Type naturally, e.g. I want beaches and direct flights"
          />
          <button type="button" className="fa-plannerSend" onClick={() => addAnswer(input)}>
            Send
          </button>
        </div>

        {showRecommendations && (
          <div className="fa-recommendationGrid">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="fa-recommendationCard">
                <div className="fa-choiceTitle">{recommendation.name}</div>
                <div className="fa-choiceText">{recommendation.reason}</div>
                <div className="fa-choiceText">{recommendation.note}</div>
                <button type="button" className="fa-useTripBtn" onClick={() => applyRecommendation(recommendation)}>
                  Use this trip for search
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="fa-plannerNote">
          Farely AI will ask before it changes your search form. You can review and edit the form before searching live partner prices.
        </div>
      </div>
    </div>
  );
}
