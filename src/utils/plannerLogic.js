export const MONTH_NAMES = {
  january: "01", jan: "01", february: "02", feb: "02", march: "03", mar: "03", april: "04", apr: "04",
  may: "05", june: "06", jun: "06", july: "07", jul: "07", august: "08", aug: "08", september: "09", sep: "09", sept: "09",
  october: "10", oct: "10", november: "11", nov: "11", december: "12", dec: "12",
};

export const UMRAH_PATTERN = /\b(umrah|makkah|mecca|madinah|medina|jeddah|pilgrimage|haram|ziyarah)\b/i;

export function monthFromPrompt(prompt, now = new Date()) {
  const lower = String(prompt || "").toLowerCase();
  const match = lower.match(/\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\b/);
  if (!match) return "";
  const month = MONTH_NAMES[match[1]];
  const currentMonth = now.getMonth() + 1;
  let year = now.getFullYear();
  if (Number(month) < currentMonth) year += 1;
  return `${year}-${month}`;
}

export function parsePlannerPrompt(prompt, mode = "ai", now = new Date()) {
  const lower = String(prompt || "").toLowerCase();
  const tags = new Set();

  if (mode === "weekend" || lower.includes("weekend")) tags.add("weekend");
  if (mode === "cheapmonth" || /cheap|cheapest|budget|under|below|max|flexible/.test(lower)) tags.add("cheapmonth");
  if (mode === "umrah" || UMRAH_PATTERN.test(lower)) tags.add("umrah");
  if (/warm|sun|sunny|beach|hot/.test(lower)) tags.add("warm");
  if (/beach|coast|sea/.test(lower)) tags.add("beach");
  if (/city|paris|rome|italy/.test(lower)) tags.add("city");
  if (/family|kids|children/.test(lower)) tags.add("family");
  if (/halal|muslim/.test(lower)) tags.add("halal");
  if (/direct|non[ -]?stop|no stops?/.test(lower)) tags.add("direct");
  if (/makkah first|mecca first|jeddah first/.test(lower)) tags.add("makkah-first");
  if (/madinah first|medina first/.test(lower)) tags.add("madinah-first");

  if (lower.includes("paris")) tags.add("paris");
  if (lower.includes("malaga") || lower.includes("spain")) tags.add("malaga");

  const nights = lower.match(/\b(\d{1,2})\s*(?:nights?|days?)\b/)?.[1] || "";
  const budget = lower.match(/\b(?:under|below|max|budget|£)\s*£?\s*(\d{2,5})\b/)?.[1] || "";
  return { tags: Array.from(tags), nights, budget, flexMonth: monthFromPrompt(prompt, now) };
}
