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
  origin: ["London", "Manchester", "Birmingham", "Flexible UK airport"],
  umrahStart: ["Makkah first via Jeddah", "Madinah first", "I am flexible"],
  timing: ["Next weekend", "This month", "August 2026", "November 2026", "Flexible"],
  nights: ["2 nights", "3 nights", "5 nights", "7 nights"],
  umrahNights: ["7 nights", "10 nights", "14 nights", "5 Makkah + 4 Madinah"],
  tripFormat: ["Flights only", "Package", "Direct flights preferred", "Ramadan travel"],
  budget: ["Under £200", "Under £300", "Under £500", "Flexible budget"],
  style: ["Beach", "City break", "Family friendly", "Halal friendly", "Non-stop only", "Avoid Ryanair"],
};

const DESTINATIONS = [
  {
    id: "paris",
    name: "Paris",
    code: "CDG",
    from: "LON",
    theme: ["weekend", "city", "short-break"],
    weakFor: ["warm", "halal"],
    priceFrom: 125,
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
    theme: ["warm", "beach", "cheapmonth", "halal", "family"],
    priceFrom: 165,
    tripLength: 5,
    flexMonth: null,
    reason: "I suggested Malaga because it is a stronger warm-weather fit than a city-only option, has good UK flight coverage, and can work for halal-aware beach trips with local checks.",
    note: "Weather and fares should be checked live before booking.",
  },
  {
    id: "faro",
    name: "Faro",
    code: "FAO",
    from: "LON",
    theme: ["warm", "beach", "family", "cheapmonth"],
    priceFrom: 155,
    tripLength: 5,
    flexMonth: null,
    reason: "I suggested Faro because it is a simple warm-weather option with beaches and a relaxed trip style.",
    note: "Farely will use this as a search starting point, not a booking guarantee.",
  },
  {
    id: "marrakech",
    name: "Marrakech",
    code: "RAK",
    from: "LON",
    theme: ["warm", "halal", "city", "culture"],
    priceFrom: 190,
    tripLength: 5,
    flexMonth: null,
    reason: "I suggested Marrakech because it is warm, culturally strong, and usually a better halal-friendly match than a generic European city break.",
    note: "Check hotel location, airport transfers, and live fare rules before booking.",
  },
  {
    id: "antalya",
    name: "Antalya",
    code: "AYT",
    from: "LON",
    theme: ["warm", "halal", "beach", "family"],
    priceFrom: 210,
    tripLength: 7,
    flexMonth: null,
    reason: "I suggested Antalya because it is a warm beach destination with many halal-aware resort options and a good fit for longer summer trips.",
    note: "Farely can start the flight search, but hotel and halal facilities still need checking before booking.",
  },
  {
    id: "jeddah",
    name: "Jeddah",
    code: "JED",
    from: "LON",
    theme: ["umrah", "halal"],
    priceFrom: 420,
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
    priceFrom: 430,
    tripLength: 10,
    flexMonth: null,
    reason: "I suggested Madinah because it works well if you want to visit Madinah before Makkah.",
    note: "You should still check visa, package, hotel, and pilgrimage requirements before booking.",
  },
  {
    id: "umrah-split",
    name: "Makkah + Madinah split",
    code: "JED",
    from: "LON",
    theme: ["umrah", "halal", "makkah-first", "madinah", "multi-city"],
    priceFrom: 450,
    tripLength: 9,
    flexMonth: null,
    reason: "I suggested a Makkah and Madinah split because your prompt sounds like an Umrah route rather than a generic holiday search.",
    note: "Farely will prepare a multi-city planning draft. Live multi-city pricing is still not connected.",
  },
];

const MONTHS = [
  ["january", 1],
  ["february", 2],
  ["march", 3],
  ["april", 4],
  ["may", 5],
  ["june", 6],
  ["july", 7],
  ["august", 8],
  ["september", 9],
  ["october", 10],
  ["november", 11],
  ["december", 12],
];

function addMonthsISO(monthsAhead) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthToFlexValue(monthName, explicitYear) {
  const found = MONTHS.find(([name]) => name === monthName);
  if (!found) return "";

  const current = new Date();
  const month = found[1];
  let year = explicitYear ? Number(explicitYear) : current.getFullYear();

  if (!explicitYear && month < current.getMonth() + 1) year += 1;

  return `${year}-${String(month).padStart(2, "0")}`;
}

function todayPlus(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function addDaysISO(dateValue, days) {
  const [year, month, day] = String(dateValue || "").split("-").map(Number);
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + Number(days || 0));
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
  if (/direct|non-stop|nonstop/.test(lower)) tags.add("non-stop");
  if (/flights?\s*only/.test(lower)) tags.add("flights-only");
  if (/package|hotel/.test(lower)) tags.add("package");
  if (/ramadan/.test(lower)) tags.add("ramadan");
  if (/makkah|mecca|jeddah first/.test(lower)) tags.add("makkah-first");
  if (/madinah|medina/.test(lower)) tags.add("madinah");
  if (/split|multi-city|makkah.+madinah|madinah.+makkah/.test(lower)) tags.add("multi-city");

  if (lower.includes("paris")) tags.add("paris");
  if (lower.includes("malaga") || lower.includes("spain")) tags.add("malaga");
  if (lower.includes("faro") || lower.includes("portugal")) tags.add("faro");
  if (lower.includes("marrakech") || lower.includes("morocco")) tags.add("marrakech");
  if (lower.includes("antalya") || lower.includes("turkey") || lower.includes("türkiye")) tags.add("antalya");

  const nights = lower.match(/\b(\d{1,2})\s*(?:nights?|days?)\b/)?.[1] || "";
  const budget = lower.match(/\b(?:under|below|max|budget|£)\s*£?\s*(\d{2,5})\b/)?.[1] || "";
  const monthMatch = MONTHS.find(([name]) => lower.includes(name));
  const explicitYear = lower.match(/\b(20\d{2})\b/)?.[1] || "";
  const flexMonth = monthMatch ? monthToFlexValue(monthMatch[0], explicitYear) : "";
  const makkahNights = lower.match(/makkah\s+(\d{1,2})\s*nights?/)?.[1] || "";
  const madinahMatch = lower.match(/madinah\s+(\d{1,2})\s*nights?|medina\s+(\d{1,2})\s*nights?/);
  const madinahNights = madinahMatch?.[1] || madinahMatch?.[2] || "";
  const origin = lower.includes("manchester") ? "Manchester" : lower.includes("birmingham") ? "Birmingham" : lower.includes("london") ? "London" : "";
  const umrahStart = tags.has("madinah") && !tags.has("makkah-first") ? "Madinah first" : tags.has("makkah-first") ? "Makkah first via Jeddah" : "";
  const tripFormat = tags.has("flights-only") ? "Flights only" : tags.has("package") ? "Package" : tags.has("non-stop") ? "Direct flights preferred" : tags.has("ramadan") ? "Ramadan travel" : "";

  return {
    tags: Array.from(tags),
    nights,
    budget,
    flexMonth,
    monthLabel: monthMatch?.[0] || "",
    explicitYear,
    makkahNights: makkahNights || "",
    madinahNights: madinahNights || "",
    origin,
    umrahStart,
    tripFormat,
  };
}

function buildRecommendations(intent, mode) {
  const extraTags = [
    String(intent.umrahStart || "").toLowerCase().includes("makkah") ? "makkah-first" : "",
    String(intent.umrahStart || "").toLowerCase().includes("madinah") ? "madinah" : "",
    String(intent.umrahStart || "").toLowerCase().includes("flexible") ? "multi-city" : "",
    String(intent.tripFormat || "").toLowerCase().includes("direct") ? "non-stop" : "",
    String(intent.tripFormat || "").toLowerCase().includes("package") ? "package" : "",
    String(intent.tripFormat || "").toLowerCase().includes("ramadan") ? "ramadan" : "",
  ];
  const promptTags = new Set([mode, ...intent.tags, ...(intent.style || []), ...extraTags].filter(Boolean));
  const maxBudget = Number(String(intent.budget || "").match(/\d+/)?.[0] || 0);

  const scored = DESTINATIONS.map((destination) => {
    let score = 0;

    destination.theme.forEach((tag) => {
      if (promptTags.has(tag)) score += 4;
    });

    if (promptTags.has(destination.id)) score += 4;
    if (destination.weakFor?.some((tag) => promptTags.has(tag))) score -= 8;
    if (promptTags.has("warm") && !destination.theme.includes("warm") && !destination.theme.includes("umrah")) score -= 5;
    if (promptTags.has("halal") && !destination.theme.includes("halal")) score -= 5;
    if (maxBudget && destination.priceFrom <= maxBudget) score += 3;
    if (maxBudget && destination.priceFrom > maxBudget) score -= Math.min(6, Math.ceil((destination.priceFrom - maxBudget) / 60));
    if (mode === "weekend" && destination.id === "paris") score += 2;
    if (mode === "cheapmonth" && destination.id === "malaga") score += 2;
    if ((mode === "umrah" || promptTags.has("umrah")) && ["jeddah", "madinah", "umrah-split"].includes(destination.id)) score += 8;
    if (promptTags.has("makkah-first") && destination.id === "jeddah") score += 4;
    if (promptTags.has("madinah") && destination.id === "madinah") score += 4;
    if (promptTags.has("multi-city") && destination.id === "umrah-split") score += 8;

    return { ...destination, score };
  });

  const ranked = scored.sort((a, b) => b.score - a.score);
  return ranked.filter((destination) => destination.score > -2).slice(0, mode === "umrah" || promptTags.has("umrah") ? 3 : 4);
}

function nextQuestion(intent) {
  const isUmrah = intent.tags?.includes("umrah");
  if (!intent.origin) return { key: "origin", text: "Which airport or city are you flying from?" };
  if (isUmrah && !intent.umrahStart) return { key: "umrahStart", text: "Would you prefer Makkah first via Jeddah, Madinah first, or stay flexible?" };
  if (!intent.timing && !intent.flexMonth) return { key: "timing", text: "Which dates or timing should I use?" };
  if (!intent.nights) return { key: isUmrah ? "umrahNights" : "nights", text: isUmrah ? "How should I split the trip?" : "How many nights should I plan for?" };
  if (isUmrah && !intent.tripFormat) return { key: "tripFormat", text: "Are you looking for flights only, a package, direct flights, or Ramadan travel?" };
  if (!intent.budget) return { key: "budget", text: "What budget should I aim for?" };
  if (!intent.style?.length) return { key: "style", text: "What matters most for this trip?" };
  return null;
}

function normalizeStyle(value) {
  const clean = String(value || "").toLowerCase();
  if (clean.includes("halal")) return "halal";
  if (clean.includes("beach")) return "beach";
  if (clean.includes("city")) return "city";
  if (clean.includes("family")) return "family";
  if (clean.includes("non-stop") || clean.includes("nonstop") || clean.includes("direct")) return "non-stop";
  if (clean.includes("ryanair")) return "avoid-ryanair";
  return clean.replace(/\s+/g, "-");
}

function responseToIntent(questionKey, value) {
  if (questionKey === "origin") return { origin: value };
  if (questionKey === "umrahStart") return { umrahStart: value };
  if (questionKey === "timing") return { timing: value };
  if (questionKey === "nights" || questionKey === "umrahNights") {
    const makkah = value.match(/(\d{1,2})\s*makkah/i)?.[1] || "";
    const madinah = value.match(/(\d{1,2})\s*madinah/i)?.[1] || "";
    return {
      nights: value.match(/\d+/)?.[0] || value,
      makkahNights: makkah,
      madinahNights: madinah,
    };
  }
  if (questionKey === "tripFormat") return { tripFormat: value, style: [normalizeStyle(value)] };
  if (questionKey === "budget") return { budget: value };
  if (questionKey === "style") return { style: [normalizeStyle(value)] };
  return {};
}

function originCodeFromIntent(origin) {
  const value = String(origin || "").toLowerCase();
  if (value.includes("manchester")) return "MAN";
  if (value.includes("birmingham")) return "BHX";
  return "LON";
}

export default function PlannerModal({
  open,
  mode,
  onClose,
  onApplyTrip,
  aiText,
}) {
  const effectiveMode = mode === "ai" && /umrah|makkah|mecca|madinah|medina|jeddah|ramadan/.test(String(aiText || "").toLowerCase())
    ? "umrah"
    : mode;
  const initialIntent = useMemo(() => {
    const parsed = parsePrompt(aiText, effectiveMode);
    return {
      tags: parsed.tags,
      origin: parsed.origin,
      flexMonth: parsed.flexMonth,
      monthLabel: parsed.monthLabel,
      nights: parsed.nights,
      budget: parsed.budget ? `Under £${parsed.budget}` : "",
      style: parsed.tripFormat ? [normalizeStyle(parsed.tripFormat)] : [],
      makkahNights: parsed.makkahNights,
      madinahNights: parsed.madinahNights,
      umrahStart: parsed.umrahStart,
      tripFormat: parsed.tripFormat,
    };
  }, [aiText, effectiveMode]);
  const initialQuestion = useMemo(() => nextQuestion(initialIntent), [initialIntent]);
  const initialMessages = useMemo(() => [
    ...(aiText ? [{ role: "user", text: aiText }] : []),
    { role: "bot", text: INITIAL_MESSAGES[effectiveMode] || INITIAL_MESSAGES.ai },
    ...(initialQuestion ? [{ role: "bot", text: initialQuestion.text }] : []),
  ], [aiText, effectiveMode, initialQuestion]);

  const [messages, setMessages] = useState(initialMessages);
  const [intent, setIntent] = useState(initialIntent);
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const title = MODE_TITLES[effectiveMode] || MODE_TITLES.ai;
  const recommendations = useMemo(() => buildRecommendations(intent, effectiveMode), [intent, effectiveMode]);

  if (!open) return null;

  function addAnswer(value) {
    const clean = String(value || "").trim();
    if (!clean) return;

    const nextIntent = {
      ...intent,
      ...responseToIntent(question?.key, clean),
    };
    if (question?.key === "timing") {
      const parsedTiming = parsePrompt(clean, effectiveMode);
      if (parsedTiming.flexMonth) {
        nextIntent.flexMonth = parsedTiming.flexMonth;
        nextIntent.monthLabel = parsedTiming.monthLabel;
      }
    }
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
    const flexible = intent.timing === "Flexible" || effectiveMode === "cheapmonth" || Boolean(recommendation.flexMonth) || Boolean(intent.flexMonth);
    const departDate = flexible ? null : todayPlus(effectiveMode === "weekend" ? 10 : 30);
    const nights = Number(intent.nights || recommendation.tripLength || 5);
    const originCode = originCodeFromIntent(intent.origin);
    const flexMonth = intent.flexMonth || recommendation.flexMonth || addMonthsISO(1);

    if (recommendation.id === "umrah-split") {
      const makkahStay = Number(intent.makkahNights || 5);
      const madinahStay = Number(intent.madinahNights || Math.max(1, nights - makkahStay) || 4);
      const firstDate = flexMonth ? `${flexMonth}-15` : todayPlus(45);
      const secondDate = addDaysISO(firstDate, makkahStay);
      const returnDate = addDaysISO(secondDate, madinahStay);
      const originCity = originCode === "MAN" ? "Manchester" : originCode === "BHX" ? "Birmingham" : "London";

      onApplyTrip({
        tripType: "multicity",
        dateMode: "exact",
        flexMonth,
        tripLength: makkahStay + madinahStay,
        cabin: "Economy",
        label: "Umrah split route",
        reason: recommendation.reason,
        multiLegs: [
          { from: originCity, to: "Jeddah", date: firstDate },
          { from: "Jeddah", to: "Madinah", date: secondDate },
          { from: "Madinah", to: originCity, date: returnDate },
        ],
      });
      return;
    }

    onApplyTrip({
      tripType: "return",
      dateMode: flexible ? "flex" : "exact",
      originCode,
      destinationCode: recommendation.code,
      departDate,
      returnDate: departDate ? todayPlus((effectiveMode === "weekend" ? 10 : 30) + nights) : null,
      flexMonth,
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
