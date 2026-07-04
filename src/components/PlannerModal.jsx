import { useEffect, useMemo, useState } from "react";

const INITIAL_MESSAGES = {
  ai: "Tell me what you have in mind. I will ask a few quick questions before preparing a search.",
  weekend: "Weekend trips need dates first. Which weekend are you thinking of?",
  cheapmonth: "I can help compare cheaper travel dates. What kind of trip should I look for?",
  umrah: "I can help shape an Umrah route. Would you prefer to start with Makkah/Jeddah, Madinah, or stay flexible?",
};

const MODE_TITLES = {
  ai: "Plan with Farely AI",
  weekend: "Plan a weekend getaway",
  cheapmonth: "Find flexible dates",
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
  style: ["Sunny beach", "Romantic", "City break", "Food and culture", "Family friendly", "Halal friendly", "Non-stop only"],
};

const ANALYSIS_STEPS = ["Analysing destinations...", "Checking budget fit...", "Comparing flexible options..."];

const DESTINATION_ALIASES = [
  { id: "bosnia", terms: ["bosnia", "sarajevo", "bosnia and herzegovina"] },
  { id: "paris", terms: ["paris", "france"] },
  { id: "malaga", terms: ["malaga", "spain", "andalusia"] },
  { id: "faro", terms: ["faro", "portugal", "algarve"] },
  { id: "marrakech", terms: ["marrakech", "morocco"] },
  { id: "antalya", terms: ["antalya", "turkey", "türkiye"] },
  { id: "jeddah", terms: ["jeddah", "makkah", "mecca"] },
  { id: "madinah", terms: ["madinah", "medina"] },
];

const DESTINATIONS = [
  {
    id: "bosnia",
    name: "Bosnia",
    country: "Bosnia and Herzegovina",
    code: "SJJ",
    from: "LON",
    theme: ["culture", "nature", "halal", "city", "short-break"],
    priceFrom: 145,
    priceRange: "£120-£290 flights",
    flightTime: "2h 40m flight",
    weatherVibe: "Mountain air, warm summers",
    tripType: "Culture, nature, halal-friendly",
    category: "Closest to your request",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=72",
    reason: "Best option because it matches your original request and works well for a short flexible trip.",
    budgetConcern: "Bosnia is a good match, but fares can sit near the top of a tight budget. I kept it first and added better-value alternatives.",
    note: "Check live fares before booking because Bosnia routes can move quickly by date.",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    code: "CDG",
    from: "LON",
    theme: ["weekend", "city", "short-break"],
    weakFor: ["warm", "halal"],
    priceFrom: 95,
    priceRange: "£80-£170 flights",
    flightTime: "1h 20m flight",
    weatherVibe: "City break, mild weather",
    tripType: "City break, food, museums",
    category: "Cheapest short break",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=72",
    reason: "Good value from London with frequent flights, but less close to your Bosnia preference.",
    note: "Confirm the exact weekend before searching live prices.",
  },
  {
    id: "malaga",
    name: "Malaga",
    country: "Spain",
    code: "AGP",
    from: "LON",
    theme: ["warm", "beach", "cheapmonth", "halal", "family"],
    priceFrom: 135,
    priceRange: "£110-£230 flights",
    flightTime: "2h 55m flight",
    weatherVibe: "Sunny, beach-friendly",
    tripType: "Beach, family, halal-aware",
    category: "Best weather",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=72",
    reason: "Strong warm-weather value with good London flight coverage.",
    note: "Weather and fares should be checked live before booking.",
  },
  {
    id: "faro",
    name: "Faro",
    country: "Portugal",
    code: "FAO",
    from: "LON",
    theme: ["warm", "beach", "family", "cheapmonth"],
    priceFrom: 125,
    priceRange: "£100-£220 flights",
    flightTime: "2h 50m flight",
    weatherVibe: "Relaxed coast, warm days",
    tripType: "Beach, relaxed, family",
    category: "Best value",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=72",
    reason: "Simple beach option with a strong chance of staying within a low budget.",
    note: "Farely will use this as a search starting point, not a booking guarantee.",
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    code: "LIS",
    from: "LON",
    theme: ["warm", "city", "culture", "romantic", "food", "weekend"],
    priceFrom: 120,
    priceRange: "£95-£230 flights",
    flightTime: "2h 45m flight",
    weatherVibe: "Warm city, river views",
    tripType: "Romantic, food, city break",
    category: "Best romantic city",
    image: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=900&q=72",
    reason: "Strong fit for a romantic short break with warm weather, food, views, and frequent London flights.",
    note: "Use Flexible dates if you can travel across a month because Lisbon fares move by weekend.",
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    code: "FCO",
    from: "LON",
    theme: ["city", "culture", "romantic", "food", "weekend"],
    priceFrom: 145,
    priceRange: "£120-£260 flights",
    flightTime: "2h 35m flight",
    weatherVibe: "Historic city, warm summers",
    tripType: "Romantic, culture, food",
    category: "Best culture break",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=72",
    reason: "Good option when the prompt sounds romantic or food-focused and the budget allows a little flexibility.",
    note: "Rome is usually better for 3-5 nights than a very short weekend.",
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    code: "RAK",
    from: "LON",
    theme: ["warm", "halal", "city", "culture"],
    priceFrom: 165,
    priceRange: "£140-£280 flights",
    flightTime: "3h 40m flight",
    weatherVibe: "Warm, dry, colourful",
    tripType: "Culture, halal-friendly, city",
    category: "Best halal-friendly",
    image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=900&q=72",
    reason: "Warm, culturally strong, and usually a better halal-friendly match than a generic European city break.",
    note: "Check hotel location, airport transfers, and live fare rules before booking.",
  },
  {
    id: "antalya",
    name: "Antalya",
    country: "Türkiye",
    code: "AYT",
    from: "LON",
    theme: ["warm", "halal", "beach", "family"],
    priceFrom: 210,
    priceRange: "£180-£340 flights",
    flightTime: "4h 15m flight",
    weatherVibe: "Hot coast, resort-friendly",
    tripType: "Beach, family, halal-aware",
    category: "Best for resorts",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=72",
    reason: "Warm beach destination with many halal-aware resort options and a good fit for longer summer trips.",
    note: "Hotel and halal facilities still need checking before booking.",
  },
  {
    id: "jeddah",
    name: "Jeddah",
    country: "Saudi Arabia",
    code: "JED",
    from: "LON",
    theme: ["umrah", "halal"],
    priceFrom: 420,
    priceRange: "£390-£620 flights",
    flightTime: "6h 15m flight",
    weatherVibe: "Hot, pilgrimage gateway",
    tripType: "Umrah, halal-friendly",
    category: "Makkah gateway",
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=900&q=72",
    reason: "Common entry point for travellers going to Makkah first.",
    note: "Check visa, package, hotel, and pilgrimage requirements before booking.",
  },
  {
    id: "madinah",
    name: "Madinah",
    country: "Saudi Arabia",
    code: "MED",
    from: "LON",
    theme: ["umrah", "halal"],
    priceFrom: 430,
    priceRange: "£400-£650 flights",
    flightTime: "6h 25m flight",
    weatherVibe: "Hot, pilgrimage-focused",
    tripType: "Umrah, halal-friendly",
    category: "Madinah first",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=72",
    reason: "Works well if you want to visit Madinah before Makkah.",
    note: "Check visa, package, hotel, and pilgrimage requirements before booking.",
  },
  {
    id: "umrah-split",
    name: "Makkah + Madinah split",
    country: "Saudi Arabia",
    code: "JED",
    from: "LON",
    theme: ["umrah", "halal", "makkah-first", "madinah", "multi-city"],
    priceFrom: 450,
    priceRange: "£420-£700 flights",
    flightTime: "Multi-city route",
    weatherVibe: "Hot, pilgrimage-focused",
    tripType: "Umrah, multi-city",
    category: "Best overall",
    image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=72",
    reason: "Your prompt sounds like an Umrah route rather than a generic holiday search.",
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function detectRequestedDestination(lower) {
  return DESTINATION_ALIASES.find((entry) => entry.terms.some((term) => lower.includes(term))) || null;
}

function parsePrompt(prompt, mode) {
  const lower = String(prompt || "").toLowerCase();
  const tags = new Set();
  const requestedDestination = detectRequestedDestination(lower);

  if (mode === "weekend" || lower.includes("weekend")) tags.add("weekend");
  if (mode === "cheapmonth" || /cheap|cheapest|budget|under|flexible/.test(lower)) tags.add("cheapmonth");
  if (mode === "umrah" || /umrah|makkah|madinah|medina|jeddah/.test(lower)) tags.add("umrah");
  if (/warm|sun|sunny|beach|hot/.test(lower)) tags.add("warm");
  if (/beach|coast|sea/.test(lower)) tags.add("beach");
  if (/city|paris|rome|italy|sarajevo|lisbon|europe/.test(lower)) tags.add("city");
  if (/culture|history|old town|bosnia|sarajevo/.test(lower)) tags.add("culture");
  if (/nature|mountain|lake|waterfall/.test(lower)) tags.add("nature");
  if (/family|kids|children/.test(lower)) tags.add("family");
  if (/halal|muslim|bosnia|sarajevo/.test(lower)) tags.add("halal");
  if (/romantic|romance|anniversary|couple/.test(lower)) tags.add("romantic");
  if (/food|restaurant|eat|eating/.test(lower)) tags.add("food");
  if (/ski|snow|skiing/.test(lower)) tags.add("ski");
  if (/europe|european/.test(lower)) tags.add("europe");
  if (/direct|non-stop|nonstop/.test(lower)) tags.add("non-stop");
  if (/flights?\s*only/.test(lower)) tags.add("flights-only");
  if (/package|hotel/.test(lower)) tags.add("package");
  if (/ramadan/.test(lower)) tags.add("ramadan");
  if (/makkah|mecca|jeddah first/.test(lower)) tags.add("makkah-first");
  if (/madinah|medina/.test(lower)) tags.add("madinah");
  if (/split|multi-city|makkah.+madinah|madinah.+makkah/.test(lower)) tags.add("multi-city");

  if (requestedDestination) tags.add(requestedDestination.id);

  const nights = lower.match(/\b(\d{1,2})\s*(?:nights?|days?)\b/)?.[1] || "";
  const budget = lower.match(/\b(?:under|below|max|budget|£)\s*£?\s*(\d{2,5})\b/)?.[1] || "";
  const monthMatch = MONTHS.find(([name]) => lower.includes(name));
  const explicitYear = lower.match(/\b(20\d{2})\b/)?.[1] || "";
  const flexMonth = monthMatch ? monthToFlexValue(monthMatch[0], explicitYear) : "";
  const timing = lower.includes("next weekend")
    ? "Next weekend"
    : lower.includes("this month")
      ? "This month"
      : lower.includes("flexible")
        ? "Flexible"
        : flexMonth
          ? `${monthMatch[0]} ${explicitYear || new Date(flexMonth).getFullYear()}`
          : "";
  const makkahNights = lower.match(/makkah\s+(\d{1,2})\s*nights?/)?.[1] || "";
  const madinahMatch = lower.match(/madinah\s+(\d{1,2})\s*nights?|medina\s+(\d{1,2})\s*nights?/);
  const madinahNights = madinahMatch?.[1] || madinahMatch?.[2] || "";
  const explicitOrigin = lower.includes("manchester")
    ? "Manchester"
    : lower.includes("birmingham")
      ? "Birmingham"
      : lower.includes("london")
        ? "London"
        : "";
  const origin = explicitOrigin || "London";
  const umrahStart = tags.has("madinah") && !tags.has("makkah-first") ? "Madinah first" : tags.has("makkah-first") ? "Makkah first via Jeddah" : "";
  const tripFormat = tags.has("flights-only") || /\bflights?\b/.test(lower) ? "Flights only" : tags.has("package") ? "Package" : tags.has("non-stop") ? "Direct flights preferred" : tags.has("ramadan") ? "Ramadan travel" : "";
  const styleTags = Array.from(tags).filter((tag) =>
    ["warm", "beach", "city", "culture", "nature", "family", "halal", "romantic", "food", "ski", "non-stop"].includes(tag)
  );

  return {
    tags: Array.from(tags),
    nights,
    budget,
    flexMonth,
    monthLabel: monthMatch?.[0] || "",
    timing,
    explicitYear,
    makkahNights: makkahNights || "",
    madinahNights: madinahNights || "",
    origin,
    originInferred: !explicitOrigin,
    umrahStart,
    tripFormat,
    styleTags,
    requestedDestinationId: requestedDestination?.id || "",
    requestedDestinationName: requestedDestination ? DESTINATIONS.find((destination) => destination.id === requestedDestination.id)?.name || "" : "",
  };
}

function estimateMatchScore(destination, score, requestedDestinationId, maxBudget) {
  let match = 78 + score * 3;
  if (destination.id === requestedDestinationId) match = 94;
  if (maxBudget && destination.priceFrom > maxBudget) match -= 8;
  return clamp(match, 62, requestedDestinationId && destination.id !== requestedDestinationId ? 90 : 96);
}

function buildRecommendationPlan(intent, mode) {
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
  const requestedDestinationId = intent.requestedDestinationId || "";

  const scored = DESTINATIONS.map((destination) => {
    let score = 0;

    destination.theme.forEach((tag) => {
      if (promptTags.has(tag)) score += 4;
    });

    if (promptTags.has(destination.id)) score += 8;
    if (destination.id === requestedDestinationId) score += 18;
    if (destination.weakFor?.some((tag) => promptTags.has(tag))) score -= 8;
    if (promptTags.has("warm") && !destination.theme.includes("warm") && !destination.theme.includes("umrah")) score -= 5;
    if (promptTags.has("halal") && !destination.theme.includes("halal")) score -= 5;
    if (maxBudget && destination.priceFrom <= maxBudget) score += 3;
    if (maxBudget && destination.priceFrom > maxBudget) score -= Math.min(8, Math.ceil((destination.priceFrom - maxBudget) / 45));
    if (promptTags.has("romantic") && destination.theme.includes("romantic")) score += 7;
    if (promptTags.has("food") && destination.theme.includes("food")) score += 4;
    if (promptTags.has("europe") && ["paris", "malaga", "faro", "lisbon", "rome", "bosnia"].includes(destination.id)) score += 3;
    if (promptTags.has("ski") && !destination.theme.includes("ski")) score -= 4;
    if (mode === "weekend" && destination.id === "paris") score += 2;
    if (mode === "cheapmonth" && ["malaga", "faro", "bosnia"].includes(destination.id)) score += 2;
    if ((mode === "umrah" || promptTags.has("umrah")) && ["jeddah", "madinah", "umrah-split"].includes(destination.id)) score += 8;
    if (promptTags.has("makkah-first") && destination.id === "jeddah") score += 4;
    if (promptTags.has("madinah") && destination.id === "madinah") score += 4;
    if (promptTags.has("multi-city") && destination.id === "umrah-split") score += 8;

    return {
      ...destination,
      score,
      matchScore: estimateMatchScore(destination, score, requestedDestinationId, maxBudget),
      category: destination.id === requestedDestinationId ? "Closest to your request" : destination.category,
    };
  });

  const limit = mode === "umrah" || promptTags.has("umrah") ? 3 : 4;
  const requested = requestedDestinationId ? scored.find((destination) => destination.id === requestedDestinationId) : null;
  const alternatives = scored
    .filter((destination) => destination.id !== requestedDestinationId)
    .sort((a, b) => b.score - a.score)
    .filter((destination) => destination.score > -2)
    .slice(0, requested ? limit - 1 : limit);
  const recommendations = requested ? [requested, ...alternatives] : alternatives;
  const requestedNearBudget = requested && maxBudget && requested.priceFrom >= maxBudget * 0.48;
  const requestedOverBudget = requested && maxBudget && requested.priceFrom > maxBudget;
  const contextParts = [
    intent.budget || "your budget",
    intent.nights ? `${intent.nights}-night stay` : "your trip length",
    intent.timing || intent.monthLabel || "flexible dates",
    `${intent.origin || "London"} departure`,
    intent.requestedDestinationName ? `your ${intent.requestedDestinationName} preference` : "your trip style",
  ];

  return {
    recommendations,
    whyText: `Farely considered ${contextParts.join(", ")}.`,
    insightText: requestedOverBudget
      ? `${requested.name} is a good match, but it may be harder to keep under ${intent.budget}. Here are better-value alternatives.`
      : requestedNearBudget
        ? `${requested.name} is a good match, but fares can sit near the top of ${intent.budget}. I kept it first and added better-value alternatives.`
        : requested
          ? `${requested.name} is first because it matches your original request. The other cards are alternatives, not replacements.`
          : "I ranked these by budget fit, trip style, flight practicality, and flexible-date potential.",
  };
}

function nextQuestion(intent) {
  const isUmrah = intent.tags?.includes("umrah");
  if (!intent.origin) return { key: "origin", text: "Which airport or city are you flying from?" };
  if (isUmrah && !intent.umrahStart) return { key: "umrahStart", text: "Would you prefer Makkah first via Jeddah, Madinah first, or stay flexible?" };
  if (!intent.timing && !intent.flexMonth) return { key: "timing", text: "Which dates or timing should I use?" };
  if (!intent.nights) return { key: isUmrah ? "umrahNights" : "nights", text: isUmrah ? "How should I split the trip?" : "How many nights should I plan for?" };
  if (isUmrah && !intent.tripFormat) return { key: "tripFormat", text: "Are you looking for flights only, a package, direct flights, or Ramadan travel?" };
  if (!intent.budget) return { key: "budget", text: "What budget should I aim for?" };
  if (!intent.style?.length && !intent.tags?.some((tag) => ["warm", "beach", "city", "culture", "nature", "family", "halal", "romantic", "food"].includes(tag))) {
    return { key: "style", text: "What matters most for this trip?" };
  }
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
      timing: parsed.timing,
      nights: parsed.nights,
      budget: parsed.budget ? `Under £${parsed.budget}` : "",
      style: [...parsed.styleTags, ...(parsed.tripFormat ? [normalizeStyle(parsed.tripFormat)] : [])],
      makkahNights: parsed.makkahNights,
      madinahNights: parsed.madinahNights,
      umrahStart: parsed.umrahStart,
      tripFormat: parsed.tripFormat,
      originInferred: parsed.originInferred,
      requestedDestinationId: parsed.requestedDestinationId,
      requestedDestinationName: parsed.requestedDestinationName,
    };
  }, [aiText, effectiveMode]);
  const initialQuestion = useMemo(() => nextQuestion(initialIntent), [initialIntent]);
  const initialMessages = useMemo(() => [
    ...(aiText ? [{ role: "user", text: aiText }] : []),
    { role: "bot", text: INITIAL_MESSAGES[effectiveMode] || INITIAL_MESSAGES.ai },
    ...(initialIntent.originInferred && aiText ? [{ role: "bot", text: "I will start from London unless you tell me another airport." }] : []),
    ...(initialQuestion ? [{ role: "bot", text: initialQuestion.text }] : []),
  ], [aiText, effectiveMode, initialIntent.originInferred, initialQuestion]);

  const [messages, setMessages] = useState(initialMessages);
  const [intent, setIntent] = useState(initialIntent);
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const title = MODE_TITLES[effectiveMode] || MODE_TITLES.ai;
  const recommendationPlan = useMemo(() => buildRecommendationPlan(intent, effectiveMode), [intent, effectiveMode]);

  useEffect(() => {
    if (!isAnalyzing) return undefined;

    const timer = window.setTimeout(() => {
      setIsAnalyzing(false);
      setShowRecommendations(true);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I found the strongest matches. Pick one and I will prepare the search form so you can review it before live prices." },
      ]);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!open || question || showRecommendations || isAnalyzing || !aiText) return undefined;

    const timer = window.setTimeout(() => {
      setIsAnalyzing(true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [aiText, isAnalyzing, open, question, showRecommendations]);

  if (!open) return null;

  function addAnswer(value) {
    const clean = String(value || "").trim();
    if (!clean || isAnalyzing) return;

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
      if (parsedTiming.timing) nextIntent.timing = parsedTiming.timing;
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
    setShowRecommendations(false);
    setIsAnalyzing(true);
    setMessages((prev) => [...prev, { role: "user", text: clean }]);
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

  const optionList = question && !isAnalyzing ? QUICK_OPTIONS[question.key] || [] : [];

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

        {isAnalyzing && (
          <div className="fa-analyzingBox" aria-live="polite">
            {ANALYSIS_STEPS.map((step) => (
              <div key={step} className="fa-analyzingStep">
                <span className="fa-analyzingDot" aria-hidden />
                {step}
              </div>
            ))}
          </div>
        )}

        <div className="fa-plannerInputRow">
          <input
            className="fa-plannerInput"
            value={input}
            disabled={isAnalyzing}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addAnswer(input);
            }}
            placeholder={isAnalyzing ? "Preparing recommendations..." : "Type naturally, e.g. I want Bosnia for 3 nights under £300"}
          />
          <button type="button" className="fa-plannerSend" disabled={isAnalyzing} onClick={() => addAnswer(input)}>
            Send
          </button>
        </div>

        {showRecommendations && (
          <>
            <div className="fa-plannerInsight">{recommendationPlan.insightText}</div>
            <div className="fa-intentSummary" aria-label="Interpreted trip intent">
              <span>From {intent.origin || "London"}</span>
              <span>{intent.timing || intent.monthLabel || "Flexible dates"}</span>
              <span>{intent.nights ? `${intent.nights} nights` : "Flexible length"}</span>
              <span>{intent.budget || "Flexible budget"}</span>
            </div>
            <div className="fa-recommendationGrid">
              {recommendationPlan.recommendations.map((recommendation) => (
                <article key={recommendation.id} className="fa-recommendationCard">
                  <div className="fa-recImage" style={{ backgroundImage: `url(${recommendation.image})` }}>
                    <span>{recommendation.matchScore}% match</span>
                  </div>
                  <div className="fa-recBody">
                    <div className="fa-recTopLine">
                      <div>
                        <div className="fa-choiceTitle">{recommendation.name}</div>
                        <div className="fa-recCountry">{recommendation.country}</div>
                      </div>
                      <span className="fa-recBadge">{recommendation.category}</span>
                    </div>
                    <div className="fa-recFacts">
                      <span>{recommendation.priceRange}</span>
                      <span>{recommendation.flightTime}</span>
                      <span>{recommendation.weatherVibe}</span>
                      <span>{recommendation.tripType}</span>
                    </div>
                    <p className="fa-recReason">{recommendation.reason}</p>
                    <button type="button" className="fa-useTripBtn" onClick={() => applyRecommendation(recommendation)}>
                      Find flights
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="fa-whyDestinations">
              <strong>Why these destinations?</strong>
              <span>{recommendationPlan.whyText}</span>
            </div>
          </>
        )}

        <div className="fa-plannerNote">
          Choosing a card fills the search form first. You can still edit the route, dates, nights, and cabin before searching live partner prices.
        </div>
      </div>
    </div>
  );
}
