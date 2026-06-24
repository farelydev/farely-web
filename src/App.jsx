import { useEffect, useMemo, useState } from "react";
import AnalyticsSection from "./components/AnalyticsSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LegalPage, { getLegalPage } from "./components/LegalPage";
import PlannerModal from "./components/PlannerModal";
import ResultsSection from "./components/ResultsSection";
import SearchCard from "./components/SearchCard";
import { CONTACT_HREF, CONTACT_LABEL } from "./config/site";
import {
  addDaysISO,
  airportLabel,
  findAirport,
  getIataCode,
  isoDurationToMinutes,
  pad2,
  parseMoneyToNumber,
  todayPlus,
} from "./utils/flightHelpers";

/**
 * Farely — split UI
 * ✅ Exact dates: /api/flights
 * ✅ Flexible month: /api/flexible
 * ✅ Demo fallback warning
 * ✅ Planner chatbox for idea chips
 * ✅ Bigger logo
 * ✅ Working menu dropdown
 */

const HERO_BG =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=70";

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

const PLACE_ALIASES = [
  { code: "LON", label: "London", keys: ["london"] },
  { code: "DXB", label: "Dubai", keys: ["dubai"] },
  { code: "DOH", label: "Doha", keys: ["doha"] },
  { code: "PAR", label: "Paris", keys: ["paris"] },
  { code: "NCE", label: "Nice", keys: ["nice", "south of france", "south france", "french riviera", "france"] },
  { code: "AGP", label: "Malaga", keys: ["malaga", "south of spain", "south spain", "sunny spain", "beach"] },
  { code: "RAK", label: "Marrakech", keys: ["marrakech", "morocco"] },
  { code: "CMN", label: "Casablanca", keys: ["casablanca"] },
  { code: "JED", label: "Jeddah", keys: ["jeddah", "makkah", "umrah"] },
  { code: "MED", label: "Madinah", keys: ["madinah", "medina"] },
  { code: "NYC", label: "New York", keys: ["new york", "nyc"] },
  { code: "FCO", label: "Rome", keys: ["rome"] },
  { code: "IST", label: "Istanbul", keys: ["istanbul"] },
];

function nextMonthValue(monthNumber) {
  const now = new Date();
  let year = now.getFullYear();
  if (monthNumber <= now.getMonth() + 1) year += 1;
  return `${year}-${String(monthNumber).padStart(2, "0")}`;
}

function firstDateOfMonth(monthValue) {
  return `${monthValue}-01`;
}

function matchPlace(text) {
  const lower = String(text || "").toLowerCase();
  return PLACE_ALIASES.find((place) => place.keys.some((key) => lower.includes(key))) || null;
}

function parseTripPrompt(prompt) {
  const text = String(prompt || "").trim();
  const lower = text.toLowerCase();

  if (!lower) return { kind: "suggestions", reason: "empty" };

  const monthMatch = MONTHS.find(([name]) => lower.includes(name));
  const flexMonth = monthMatch ? nextMonthValue(monthMatch[1]) : null;

  const durationMatch = lower.match(/\b(\d{1,2})\s*(?:days?|nights?)\b/);
  const tripLength = durationMatch ? Number(durationMatch[1]) : null;

  const budgetMatch = lower.match(/\b(?:under|below|max|maximum|budget)\s*£?\s*(\d{2,5})\b/);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  const isUmrah = /\b(umrah|makkah|madinah|medina|jeddah)\b/.test(lower);
  const isPackage = /\b(package|hotel)\b/.test(lower) || isUmrah;
  const isWeekend = /\bweekend\b/.test(lower);
  const isCheap = /\b(cheap|cheapest|budget|under|below)\b/.test(lower);
  const isSunny = /\b(sunny|sun|beach|warm)\b/.test(lower);
  const isEurope = /\beurope\b/.test(lower);

  const routeMatch = lower.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s+(?:in|for|under|below|with|then)\b|$)/);
  const origin = matchPlace(routeMatch?.[1] || lower.match(/\bfrom\s+(.+?)(?:\s+to\b|\s+in\b|$)/)?.[1]) || matchPlace("london");
  let destination = matchPlace(routeMatch?.[2] || lower.match(/\b(?:to|in)\s+(.+?)(?:\s+in\b|\s+for\b|$)/)?.[1]);

  if (!destination && isUmrah) destination = matchPlace("jeddah");
  if (!destination && isSunny && !isEurope) destination = matchPlace("malaga");

  if (lower.includes("then") || lower.includes("multi-city") || (lower.includes("morocco") && lower.includes("france"))) {
    return {
      kind: "multi-city",
      origin,
      budget,
      flexMonth,
      tripLength: tripLength || 3,
      legs: [
        { from: "London", to: "Nice" },
        { from: "Nice", to: "Marrakech" },
        { from: "Marrakech", to: "London" },
      ],
    };
  }

  if (!destination || (isEurope && !routeMatch?.[2]) || (isCheap && isSunny)) {
    return {
      kind: "suggestions",
      reason: "vague-destination",
      origin,
      destination,
      budget,
      flexMonth,
      tripLength,
      theme: isUmrah ? "umrah" : isWeekend ? "weekend" : isSunny ? "sunny" : isEurope ? "europe" : "general",
    };
  }

  return {
    kind: isPackage ? "package" : "simple",
    origin,
    destination,
    budget,
    flexMonth,
    tripLength: tripLength || (isUmrah ? 10 : isWeekend ? 3 : 5),
    dateMode: flexMonth || isCheap ? "flex" : "exact",
    tripType: lower.includes("one way") || lower.includes("one-way") ? "oneway" : "return",
    theme: isUmrah ? "umrah" : isSunny ? "sunny" : isEurope ? "europe" : "general",
  };
}

export default function App() {
  const legalPage = getLegalPage(window.location.pathname);

  const [aiText, setAiText] = useState("");

  const [tripType, setTripType] = useState("return");
  const [dateMode, setDateMode] = useState("exact");

  const [fromText, setFromText] = useState("London");
  const [toText, setToText] = useState("Doha");
  const [fromAirport, setFromAirport] = useState(findAirport("LON"));
  const [toAirport, setToAirport] = useState(findAirport("DOH"));

  const [departDate, setDepartDate] = useState(todayPlus(30));
  const [returnDate, setReturnDate] = useState(todayPlus(34));

  const [flexMonth, setFlexMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  });

  const [tripLength, setTripLength] = useState(5);
  const [flexWindow, setFlexWindow] = useState(7);

  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState("Economy");

  const [resultsTab, setResultsTab] = useState("cheapest");
  const [didSearch, setDidSearch] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [apiWarning, setApiWarning] = useState("");
  const [apiSource, setApiSource] = useState("");
  const [apiResults, setApiResults] = useState([]);

  const [flexDays, setFlexDays] = useState([]);
  const [selectedFlexDate, setSelectedFlexDate] = useState("");

  const [plannerOpen, setPlannerOpen] = useState(false);
  const [plannerMode, setPlannerMode] = useState("ai");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAdminAnalytics, setShowAdminAnalytics] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      Boolean(localStorage.getItem("farelyAdminToken")) ||
      Boolean(params.get("admin") || params.get("adminToken")) ||
      window.location.hash === "#farely-analytics"
    );
  });

  const [multiLegs, setMultiLegs] = useState([
    { from: "London", to: "Paris", date: todayPlus(20) },
    { from: "Paris", to: "Istanbul", date: todayPlus(24) },
  ]);

  const showReturn = tripType === "return";
  const showMulti = tripType === "multicity";
  const exactMode = dateMode === "exact";
  const flexMode = dateMode === "flex";

  useEffect(() => {
    function syncAdminAnalyticsVisibility() {
      const params = new URLSearchParams(window.location.search);
      setShowAdminAnalytics(
        Boolean(localStorage.getItem("farelyAdminToken")) ||
          Boolean(params.get("admin") || params.get("adminToken")) ||
          window.location.hash === "#farely-analytics"
      );
    }

    window.addEventListener("hashchange", syncAdminAnalyticsVisibility);
    window.addEventListener("farely-admin-token-changed", syncAdminAnalyticsVisibility);
    syncAdminAnalyticsVisibility();

    return () => {
      window.removeEventListener("hashchange", syncAdminAnalyticsVisibility);
      window.removeEventListener("farely-admin-token-changed", syncAdminAnalyticsVisibility);
    };
  }, []);

  const routeFromCode = useMemo(
    () => getIataCode({ selected: fromAirport, text: fromText, fallback: "FROM" }),
    [fromAirport, fromText]
  );

  const routeToCode = useMemo(
    () => getIataCode({ selected: toAirport, text: toText, fallback: "TO" }),
    [toAirport, toText]
  );

  const routeTitle = useMemo(() => {
    if (tripType === "multicity") {
      const start = multiLegs[0]?.from || "Start";
      const destinations = multiLegs.map((leg) => leg.to).filter(Boolean);
      return [start, ...destinations].join(" → ");
    }

    const left = (fromAirport?.city || fromText || "From").trim();
    const right = (toAirport?.city || toText || "To").trim();
    return `${left} → ${right}`;
  }, [fromAirport, fromText, multiLegs, toAirport, toText, tripType]);

  const shownOffers = useMemo(() => {
    const list = Array.isArray(apiResults) ? apiResults.slice() : [];
    if (list.length === 0) return [];

    const withStats = list.map((o) => {
      const price = parseMoneyToNumber(o?.price);
      const mins = isoDurationToMinutes(o?.itineraries?.[0]?.duration);
      const stops = Math.max(0, (o?.itineraries?.[0]?.segments || []).length - 1);
      return { offer: o, price, mins, stops };
    });

    if (resultsTab === "cheapest") {
      withStats.sort((a, b) => a.price - b.price || a.mins - b.mins);
    } else if (resultsTab === "fastest") {
      withStats.sort((a, b) => a.mins - b.mins || a.price - b.price);
    } else {
      withStats.sort((a, b) => {
        const scoreA = a.price * 0.7 + a.mins * 0.3 + a.stops * 40;
        const scoreB = b.price * 0.7 + b.mins * 0.3 + b.stops * 40;
        return scoreA - scoreB;
      });
    }

    return withStats.map((x) => x.offer).slice(0, 12);
  }, [apiResults, resultsTab]);

  const pricePills = useMemo(() => {
    if (flexMode && flexDays.length > 0) {
      return flexDays
        .filter((d) => d.cheapestPrice !== null)
        .slice()
        .sort((a, b) => a.cheapestPrice - b.cheapestPrice)
        .slice(0, 14)
        .map((x) => ({
          key: x.date,
          label: x.date.slice(8, 10),
          date: x.date,
          price: Math.round(x.cheapestPrice),
          source: x.source,
        }));
    }

    const seed = (routeFromCode + routeToCode).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const base = 35 + (seed % 70);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return days.map((d, i) => {
      const v = base + ((i * 13 + seed) % 60) - 20;
      return { key: d, label: d, date: "", price: Math.max(29, v), source: "preview" };
    });
  }, [routeFromCode, routeToCode, flexMode, flexDays]);

  function clearSearchState() {
    setDidSearch(false);
    setSearchError("");
    setApiWarning("");
    setApiSource("");
    setApiResults([]);
    setFlexDays([]);
    setSelectedFlexDate("");
    setResultsTab("cheapest");
  }

  function setRoute(fromCode, toCode) {
    const from = findAirport(fromCode);
    const to = findAirport(toCode);

    if (from) {
      setFromAirport(from);
      setFromText(from.city === "London" ? "London" : airportLabel(from));
    }

    if (to) {
      setToAirport(to);
      setToText(to.city === "Jeddah" || to.city === "Madinah" ? to.city : airportLabel(to));
    }
  }

  function openPlanner(mode) {
    clearSearchState();
    setPlannerMode(mode);
    setPlannerOpen(true);
    setMenuOpen(false);
  }

  function closePlanner() {
    setPlannerOpen(false);
  }

  function chooseUmrah(option) {
    clearSearchState();

    if (option === "jeddah-first") {
      setTripType("return");
      setDateMode("exact");
      setRoute("LON", "JED");
      setDepartDate(todayPlus(30));
      setReturnDate(todayPlus(40));
      setAiText("Umrah trip: fly to Jeddah first");
    }

    if (option === "madinah-first") {
      setTripType("return");
      setDateMode("exact");
      setRoute("LON", "MED");
      setDepartDate(todayPlus(30));
      setReturnDate(todayPlus(40));
      setAiText("Umrah trip: fly to Madinah first");
    }

    if (option === "flexible") {
      setTripType("return");
      setDateMode("flex");
      setRoute("LON", "JED");
      setTripLength(10);
      setAiText("Flexible Umrah dates: compare Jeddah and Madinah");
    }

    if (option === "package") {
      setTripType("return");
      setDateMode("flex");
      setRoute("LON", "JED");
      setTripLength(10);
      setAiText("Umrah flight and hotel package");
    }

    closePlanner();
  }

  function chooseWeekend(option) {
    clearSearchState();
    setTripType("return");
    setDateMode("exact");
    setDepartDate(todayPlus(10));
    setReturnDate(todayPlus(13));

    if (option === "paris") {
      setRoute("LON", "CDG");
      setAiText("Weekend getaway in Paris");
    }

    if (option === "malaga") {
      setRoute("LON", "AGP");
      setAiText("Sunny weekend in Malaga");
    }

    if (option === "rome") {
      setRoute("LON", "FCO");
      setAiText("Weekend getaway in Rome");
    }

    closePlanner();
  }

  function chooseCheapest(option) {
    clearSearchState();
    setTripType("return");
    setDateMode("flex");
    setTripLength(5);
    setFlexWindow(7);

    if (option === "anywhere-sunny") {
      setRoute("LON", "AGP");
      setAiText("Find the cheapest sunny Europe trip");
    }

    if (option === "new-york") {
      setRoute("LHR", "JFK");
      setAiText("Find the cheapest month to fly to New York");
    }

    if (option === "doha") {
      setRoute("LON", "DOH");
      setAiText("Find the cheapest month to fly to Doha");
    }

    closePlanner();
  }

  function chooseAiSuggestion(option) {
    clearSearchState();

    if (option === "south-spain") {
      setTripType("return");
      setDateMode("flex");
      setTripLength(3);
      setRoute("LON", "AGP");
      setAiText("3 days somewhere sunny in south of Spain");
      closePlanner();
    }

    if (option === "spain-morocco") {
      setTripType("multicity");
      setDateMode("exact");
      setMultiLegs([
        { from: "London", to: "Malaga", date: todayPlus(30) },
        { from: "Malaga", to: "Marrakech", date: todayPlus(33) },
        { from: "Marrakech", to: "London", date: todayPlus(37) },
      ]);
      setAiText("Multi-city trip to south of Spain and Morocco");
      closePlanner();
    }

    if (option === "umrah") {
      setPlannerMode("umrah");
    }
  }

  function handleAiButton() {
    clearSearchState();
    const parsed = parseTripPrompt(aiText);

    if (parsed.kind === "multi-city") {
      const startDate = parsed.flexMonth ? firstDateOfMonth(parsed.flexMonth) : todayPlus(30);
      const firstStay = parsed.tripLength || 3;
      const secondStay = aiText.toLowerCase().match(/\bthen\s+(\d{1,2})\s*(?:days?|nights?)\b/)?.[1];
      const secondStayDays = secondStay ? Number(secondStay) : 4;

      setTripType("multicity");
      setDateMode("exact");
      setMultiLegs([
        { from: parsed.legs[0].from, to: parsed.legs[0].to, date: startDate },
        { from: parsed.legs[1].from, to: parsed.legs[1].to, date: addDaysISO(startDate, firstStay) },
        { from: parsed.legs[2].from, to: parsed.legs[2].to, date: addDaysISO(startDate, firstStay + secondStayDays) },
      ]);
      setAiText(aiText.trim() || "Multi-city trip");
      return;
    }

    if (parsed.kind === "suggestions") {
      if (parsed.theme === "umrah") {
        openPlanner("umrah");
        return;
      }

      if (parsed.theme === "weekend") {
        openPlanner("weekend");
        return;
      }

      if (parsed.theme === "sunny" || parsed.theme === "europe") {
        setTripType("return");
        setDateMode("flex");
        setTripLength(parsed.tripLength || 5);
        setFlexWindow(7);
      }

      openPlanner("ai");
      return;
    }

    if (parsed.origin?.code && parsed.destination?.code) {
      setTripType(parsed.tripType || "return");
      setDateMode(parsed.dateMode || "exact");
      setRoute(parsed.origin.code, parsed.destination.code);

      if (parsed.flexMonth) {
        setFlexMonth(parsed.flexMonth);
        setDateMode("flex");
      }

      if (parsed.tripLength) {
        setTripLength(Math.min(Math.max(parsed.tripLength, 1), 30));
      }

      if (!parsed.flexMonth && parsed.dateMode !== "flex") {
        const depart = todayPlus(parsed.theme === "umrah" ? 150 : 30);
        setDepartDate(depart);
        setReturnDate(addDaysISO(depart, parsed.tripLength || 5));
      }

      return;
    }

    openPlanner("ai");
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    const text = await res.text();

    if (!text || !text.trim()) {
      throw new Error("Empty response from server");
    }

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Server did not return valid JSON. First part received: ${text.slice(0, 180)}`);
    }

    if (!res.ok) {
      throw new Error(json?.message || json?.error || "Request failed");
    }

    return json;
  }

  async function fetchFlightsForDate(date) {
    const params = new URLSearchParams();
    params.set("origin", routeFromCode);
    params.set("destination", routeToCode);
    params.set("date", date);
    params.set("adults", String(passengers));
    params.set("currency", "GBP");
    params.set("nonStop", "false");
    params.set("max", "25");

    if (tripType === "return") {
      const computedReturn = exactMode ? returnDate : addDaysISO(date, tripLength);
      params.set("returnDate", computedReturn);
    }

    const json = await fetchJson(`/api/flights?${params.toString()}`);

    setApiWarning(json?.warning || "");
    setApiSource(json?.source || "");

    return Array.isArray(json?.data) ? json.data : [];
  }

  async function onSearch() {
    setDidSearch(true);
    setSearchError("");
    setApiWarning("");
    setApiSource("");
    setApiResults([]);
    setFlexDays([]);
    setSelectedFlexDate("");

    if (showMulti) {
      setSearchError("Multi-city planning is ready in the UI. Live multi-city search will be added after the planner flow.");
      return;
    }

    if (!/^[A-Z]{3}$/.test(routeFromCode) || !/^[A-Z]{3}$/.test(routeToCode)) {
      setSearchError("Please use valid 3-letter airport/city codes, for example LON, JED, MED, DOH, or JFK.");
      return;
    }

    setIsSearching(true);

    try {
      if (exactMode) {
        if (!departDate) {
          setSearchError("Pick a departure date.");
          return;
        }

        const offers = await fetchFlightsForDate(departDate);
        setApiResults(offers);

        if (offers.length === 0) setSearchError("No results found for that route/date. Try another date.");
        return;
      }

      const params = new URLSearchParams();
      params.set("origin", routeFromCode);
      params.set("destination", routeToCode);
      params.set("month", flexMonth);
      params.set("adults", String(passengers));
      params.set("currency", "GBP");
      params.set("nonStop", "false");
      params.set("tripType", tripType === "return" ? "return" : "oneway");
      params.set("flexWindow", String(flexWindow));

      if (tripType === "return") params.set("tripLength", String(tripLength));

      const json = await fetchJson(`/api/flexible?${params.toString()}`);

      setApiWarning(json?.warning || "");
      setApiSource(json?.source || "");

      const days = Array.isArray(json?.days) ? json.days : [];
      setFlexDays(days);

      if (json?.best?.date && Array.isArray(json?.best?.offers)) {
        setSelectedFlexDate(json.best.date);
        setApiResults(json.best.offers);
      } else {
        setSearchError("No results found in that month. Try another month or route.");
      }
    } catch (e) {
      setSearchError(e?.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  async function onPickFlexDay(date) {
    setSelectedFlexDate(date);
    setSearchError("");
    setApiWarning("");
    setIsSearching(true);

    try {
      const offers = await fetchFlightsForDate(date);
      setApiResults(offers);

      if (offers.length === 0) setSearchError("No results for that day. Try another day.");
    } catch (e) {
      setSearchError(e?.message || "Failed to load that day");
    } finally {
      setIsSearching(false);
    }
  }

  if (legalPage) {
    return <LegalPage page={legalPage} />;
  }

  return (
    <div className="fa-app">
      <style>{styles}</style>

      <PlannerModal
        open={plannerOpen}
        mode={plannerMode}
        aiText={aiText}
        onClose={closePlanner}
        onChooseUmrah={chooseUmrah}
        onChooseWeekend={chooseWeekend}
        onChooseCheapest={chooseCheapest}
        onChooseAiSuggestion={chooseAiSuggestion}
      />

      <section className="fa-hero">
        <div className="fa-heroBg" aria-hidden />
        <div className="fa-heroTint" aria-hidden />

        <div className="fa-heroInner">
          <Header
            aiText={aiText}
            setAiText={setAiText}
            handleAiButton={handleAiButton}
            openPlanner={openPlanner}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            showAnalytics={showAdminAnalytics}
          />

          <SearchCard
            tripType={tripType}
            setTripType={setTripType}
            exactMode={exactMode}
            flexMode={flexMode}
            setDateMode={setDateMode}
            clearSearchState={clearSearchState}
            fromText={fromText}
            setFromText={setFromText}
            fromAirport={fromAirport}
            setFromAirport={setFromAirport}
            toText={toText}
            setToText={setToText}
            toAirport={toAirport}
            setToAirport={setToAirport}
            multiLegs={multiLegs}
            setMultiLegs={setMultiLegs}
            passengers={passengers}
            setPassengers={setPassengers}
            cabin={cabin}
            setCabin={setCabin}
            departDate={departDate}
            setDepartDate={setDepartDate}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            showReturn={showReturn}
            flexMonth={flexMonth}
            setFlexMonth={setFlexMonth}
            tripLength={tripLength}
            setTripLength={setTripLength}
            flexWindow={flexWindow}
            setFlexWindow={setFlexWindow}
            onSearch={onSearch}
            isSearching={isSearching}
            routeFromCode={routeFromCode}
            routeToCode={routeToCode}
            apiWarning={apiWarning}
            searchError={searchError}
          />

          <div className="fa-heroSpacer" />
        </div>
      </section>

      <ResultsSection
        didSearch={didSearch}
        routeTitle={routeTitle}
        resultsTab={resultsTab}
        setResultsTab={setResultsTab}
        apiWarning={apiWarning}
        shownOffers={shownOffers}
        apiSource={apiSource}
        pricePills={pricePills}
        flexMode={flexMode}
        selectedFlexDate={selectedFlexDate}
        onPickFlexDay={onPickFlexDay}
        isSearching={isSearching}
        exactMode={exactMode}
        routeFromCode={routeFromCode}
        routeToCode={routeToCode}
        departDate={departDate}
        tripType={tripType}
        returnDate={returnDate}
        flexMonth={flexMonth}
      />

      <section className="fa-infoSections" aria-label="Farely information">
        <div className="fa-infoInner">
          <div id="farely-about" className="fa-infoCard">
            <div className="fa-infoKicker">About Farely</div>
            <h3>Built for simple, confident trip planning.</h3>
            <p>
              Farely helps travellers compare flight ideas quickly, then narrow them down with exact dates,
              flexible months, and guided trip prompts.
            </p>
          </div>

          <div id="farely-how" className="fa-infoCard">
            <div className="fa-infoKicker">How it works</div>
            <h3>Start with an idea, then search properly.</h3>
            <p>
              Type a trip idea, choose one of the homepage chips, or enter airports directly. Farely turns that
              into a flight search while keeping demo fallback results clearly marked during development.
            </p>
          </div>

          <div id="farely-support" className="fa-infoCard">
            <div className="fa-infoKicker">Support</div>
            <h3>Help for searches and trip choices.</h3>
            <p>
              Support will cover route questions, flexible-date guidance, and help understanding provider
              availability once the live booking flow is connected. <a className="fa-inlineLink" href={CONTACT_HREF}>{CONTACT_LABEL}</a>.
            </p>
          </div>

          <div id="farely-partner" className="fa-infoCard">
            <div className="fa-infoKicker">Partner with us</div>
            <h3>Travel partners can plug into the journey.</h3>
            <p>
              Farely is being shaped for flight, hotel, Umrah, and package partners who want a clearer path from
              trip intent to booking.
            </p>
          </div>

          <div id="farely-signin" className="fa-infoCard isMuted">
            <div className="fa-infoKicker">Sign in</div>
            <h3>Accounts are coming soon.</h3>
            <p>
              Saved searches, traveller preferences, and trip shortlists can come later. For now, the homepage
              keeps the search flow open and lightweight.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {showAdminAnalytics && <AnalyticsSection />}
    </div>
  );
}

const styles = `
  :root{ color-scheme: light dark; }
  *{ box-sizing:border-box; }
  html, body, #root{ height:100%; }
  body{
    margin:0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    background: #eef4ff;
    color: #0b1220;
  }
  .fa-app{
    min-height:100%;
    background: radial-gradient(1000px 600px at 70% 30%, rgba(80,120,255,.10), transparent 60%),
                radial-gradient(900px 600px at 20% 10%, rgba(120,80,255,.10), transparent 60%),
                #eef4ff;
  }
  .fa-hero{
    position: relative;
    padding: 20px 18px 0;
    overflow:hidden;
    border-bottom-left-radius: 28px;
    border-bottom-right-radius: 28px;
  }
  .fa-heroBg{
    position:absolute; inset:0;
    background-image: url(${HERO_BG});
    background-size: cover;
    background-position: center;
    filter: saturate(1.1);
    transform: scale(1.02);
  }
  .fa-heroTint{
    position:absolute; inset:0;
    background: linear-gradient(180deg, rgba(12,28,70,.78), rgba(76,74,190,.55) 55%, rgba(238,244,255,1) 100%);
  }
  .fa-heroInner{ position:relative; max-width: 980px; margin: 0 auto; }
  .fa-topbar{
    display:flex; align-items:center; justify-content:space-between; gap: 12px;
    padding: 8px 12px 8px 14px; border-radius: 18px;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.18);
    backdrop-filter: blur(12px);
  }
  .fa-topbarLeft{ display:flex; align-items:center; gap:12px; }
  .fa-logo{
    height: clamp(66px, 8vw, 86px);
    width: auto;
    max-width: clamp(168px, 26vw, 230px);
    object-fit: contain;
    display:block;
    filter: drop-shadow(0 8px 18px rgba(0,0,0,.25));
    border-radius: 10px;
  }
  .fa-brandText{ display:flex; flex-direction:column; color:#fff; line-height:1.05; }
  .fa-brandName{ font-weight:1000; font-size:20px; letter-spacing:-.02em; }
  .fa-brandSub{ font-size:11px; opacity:.78; font-weight:700; margin-top:4px; }
  .fa-menuWrap{ position:relative; }
  .fa-menuBtn{
    width: 46px; height: 46px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,.22);
    background: rgba(255,255,255,.16);
    color:#fff; cursor:pointer; display:grid; place-items:center;
    backdrop-filter: blur(10px);
  }
  .fa-menuIcon{ font-size: 20px; line-height: 1; }
  .fa-menuDropdown{
    position:absolute;
    right:0;
    top: calc(100% + 8px);
    z-index:80;
    width:178px;
    padding:6px;
    border-radius:14px;
    background:rgba(255,255,255,.96);
    border:1px solid rgba(10,20,70,.10);
    box-shadow:0 18px 46px rgba(0,0,0,.18);
  }
  .fa-menuDropdown button,
  .fa-menuDropdown a{
    width:100%;
    border:0;
    background:transparent;
    cursor:pointer;
    text-align:left;
    text-decoration:none;
    display:block;
    padding:9px 10px;
    border-radius:10px;
    font-weight:900;
    font-size:12px;
    color:rgba(8,16,35,.78);
  }
  .fa-menuDropdown button:hover,
  .fa-menuDropdown a:hover{ background:rgba(240,245,255,1); }
  .fa-heroCopy{ text-align:center; padding: 34px 12px 16px; color:#fff; }
  .fa-title{ margin:0; font-size: clamp(34px, 4vw, 54px); letter-spacing:-0.02em; text-shadow: 0 12px 30px rgba(0,0,0,.25); }
  .fa-subtitle{ margin:10px auto 18px; max-width:520px; opacity:.92; font-size:14px; }
  .fa-aiBar{
    max-width: 640px; margin:0 auto; display:flex; border-radius:999px; overflow:hidden;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.16);
    backdrop-filter: blur(10px);
    box-shadow: 0 18px 45px rgba(0,0,0,.22);
  }
  .fa-aiInput{ flex:1; padding:14px 16px; border:0; outline:none; background:transparent; color:#fff; font-size:14px; }
  .fa-aiInput::placeholder{ color: rgba(255,255,255,.72); }
  .fa-aiButton{ padding:0 18px; border:0; cursor:pointer; font-weight:900; color:#fff; background: linear-gradient(135deg, rgba(45,95,255,1), rgba(80,65,255,1)); }
  .fa-chipRow{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:14px; }
  .fa-chip{
    border-radius:999px; padding:10px 14px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,.94);
    cursor:pointer; font-weight:700; font-size:12px;
    display:flex; align-items:center; gap:8px;
    backdrop-filter: blur(10px);
  }
  .fa-chip:hover{ outline:2px solid rgba(255,255,255,.35); }
  .fa-card{
    margin: 18px auto 0; max-width: 900px; border-radius:18px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(14,28,70,.06);
    box-shadow: 0 26px 70px rgba(10,20,70,.22);
    overflow:hidden;
  }
  .fa-cardTop{
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    padding:14px 16px; border-bottom: 1px solid rgba(10,20,70,.08);
    background: linear-gradient(180deg, rgba(248,250,255,.9), rgba(255,255,255,.92));
  }
  .fa-tabs{ display:flex; gap:18px; align-items:center; padding-left:6px; }
  .fa-tab{ border:0; background:transparent; cursor:pointer; padding:10px 2px; font-weight:900; color: rgba(8,16,35,.55); border-bottom:2px solid transparent; }
  .fa-tab.isActive{ color: rgba(25,85,255,1); border-bottom-color: rgba(25,85,255,1); }
  .fa-seg{ display:flex; gap:6px; padding:5px; border-radius:999px; background: rgba(240,245,255,1); border: 1px solid rgba(10,20,70,.08); }
  .fa-segBtn{ border:0; cursor:pointer; padding:8px 12px; border-radius:999px; background:transparent; font-weight:900; color: rgba(8,16,35,.62); font-size:12px; }
  .fa-segBtn.isActive{ background:#fff; color: rgba(8,16,35,.86); box-shadow: 0 10px 24px rgba(10,20,70,.10); }
  .fa-cardBody{ display:grid; grid-template-columns: 1.05fr 1fr; gap:14px; padding:16px; }
  @media (max-width:860px){ .fa-cardBody{ grid-template-columns: 1fr; } .fa-brandText{ display:none; } }
  .fa-rightCol{ border-radius:16px; background: rgba(248,250,255,.9); border: 1px solid rgba(10,20,70,.08); padding:14px; }
  .fa-field{ position:relative; margin-bottom:14px; }
  .fa-label{ font-weight:900; font-size:12px; color: rgba(8,16,35,.62); margin-bottom:8px; }
  .fa-inputWrap{
    display:flex; align-items:center; gap:10px;
    border-radius:14px; border: 1px solid rgba(10,20,70,.10);
    background:#fff; padding:10px 12px;
    box-shadow: 0 10px 24px rgba(10,20,70,.06);
  }
  .fa-inputWrap.isDisabled{ opacity:.55; }
  .fa-icon{ width:20px; opacity:.85; }
  .fa-input, .fa-select, .fa-dateInput{ border:0; outline:none; width:100%; font-size:14px; color: rgba(8,16,35,.88); background:transparent; }
  .fa-select{ cursor:pointer; }
  .fa-dropdown{
    position:absolute; z-index:70; top: calc(100% + 8px); left:0; right:0;
    border-radius:16px; background:#fff; border: 1px solid rgba(10,20,70,.10);
    box-shadow: 0 24px 70px rgba(10,20,70,.18); overflow:hidden;
  }
  .fa-item{ width:100%; display:flex; gap:12px; align-items:flex-start; justify-content:space-between; padding:12px; border:0; background:transparent; cursor:pointer; text-align:left; }
  .fa-item:hover, .fa-item.isActive{ background: rgba(240,245,255,1); }
  .fa-itemTitle{ font-weight:900; font-size:13px; color: rgba(8,16,35,.86); }
  .fa-itemSub{ display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
  .fa-pill{ font-size:11px; padding:3px 8px; border-radius:999px; background: rgba(240,245,255,1); border: 1px solid rgba(10,20,70,.08); color: rgba(8,16,35,.70); font-weight:900; }
  .fa-itemCode{ font-weight:1000; color: rgba(8,16,35,.55); padding-top:2px; }
  .fa-hint{ padding:10px 12px; font-size:12px; color: rgba(8,16,35,.60); border-top: 1px solid rgba(10,20,70,.08); background: rgba(248,250,255,.9); }
  .fa-selectedHint{ margin-top:8px; font-size:12px; color: rgba(8,16,35,.60); }
  .fa-selectedStrong{ font-weight:1000; color: rgba(8,16,35,.78); }
  .fa-row2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  @media (max-width:520px){ .fa-row2{ grid-template-columns: 1fr; } }
  .fa-dateGrid{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  @media (max-width:520px){ .fa-dateGrid{ grid-template-columns: 1fr; } }
  .fa-flexBox{ display:flex; flex-direction:column; gap:12px; }
  .fa-flexRow{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
  @media (max-width:520px){ .fa-flexRow{ grid-template-columns: 1fr; } }
  .fa-stepper{
    display:grid;
    grid-template-columns:44px minmax(0,1fr) 44px;
    gap:8px;
    align-items:center;
  }
  .fa-stepBtn{
    height:46px;
    border:1px solid rgba(10,20,70,.10);
    border-radius:14px;
    background:#fff;
    color:rgba(8,16,35,.78);
    cursor:pointer;
    font-size:20px;
    font-weight:1000;
    box-shadow: 0 10px 24px rgba(10,20,70,.06);
  }
  .fa-stepBtn:disabled{ opacity:.45; cursor:not-allowed; }
  .fa-stepInputWrap{
    min-height:46px;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:6px;
    border-radius:14px;
    border:1px solid rgba(10,20,70,.10);
    background:rgba(255,255,255,.88);
    color:rgba(8,16,35,.62);
    font-size:13px;
    font-weight:900;
  }
  .fa-stepInput{
    width:54px;
    border:0;
    outline:0;
    background:transparent;
    color:rgba(8,16,35,.88);
    font-size:16px;
    font-weight:1000;
    text-align:center;
  }
  .fa-searchBtn{
    width:100%; border:0; cursor:pointer; margin-top:6px; padding:14px;
    display:flex; align-items:center; justify-content:center; gap:10px;
    border-radius:14px; font-weight:1000; color:#fff;
    background: linear-gradient(135deg, rgba(35,95,255,1), rgba(74,60,255,1));
    box-shadow: 0 18px 40px rgba(35,95,255,.25);
  }
  .fa-searchBtn:disabled{ opacity:.75; cursor:not-allowed; }
  .fa-searchBtn.isLoading{ box-shadow: 0 18px 40px rgba(35,95,255,.18); }
  .fa-btnSpinner{
    width:16px;
    height:16px;
    border-radius:999px;
    border:2px solid rgba(255,255,255,.45);
    border-top-color:#fff;
    animation: faSpin .8s linear infinite;
  }
  @keyframes faSpin{ to{ transform:rotate(360deg); } }
  .fa-miniNote{ margin-top:10px; font-size:12px; color: rgba(8,16,35,.55); }
  .fa-miniStrong{ font-weight:1000; color: rgba(8,16,35,.78); }
  .fa-error{
    margin-top:10px; font-size:12px; font-weight:1000;
    color: rgba(170,30,30,1);
    background: rgba(255,235,235,1);
    border: 1px solid rgba(170,30,30,.18);
    padding:10px 12px; border-radius:14px;
    word-break: break-word;
  }
  .fa-providerWarning{
    margin-top:10px; font-size:12px; font-weight:900;
    color: rgba(130,84,0,1);
    background: rgba(255,248,225,1);
    border: 1px solid rgba(180,120,0,.20);
    padding:10px 12px; border-radius:14px;
    line-height:1.35;
  }
  .fa-providerWarningTitle{ font-weight:1000; margin-bottom:3px; color: rgba(105,65,0,1); }
  .fa-multi{ border-radius:16px; padding:12px; border: 1px solid rgba(10,20,70,.10); background: rgba(248,250,255,.9); }
  .fa-multiList{ display:flex; flex-direction:column; gap:10px; }
  .fa-multiRow{ display:grid; grid-template-columns: 1fr auto 1fr 150px auto; gap:8px; align-items:center; }
  @media (max-width:860px){ .fa-multiRow{ grid-template-columns: 1fr; } }
  .fa-miniInput, .fa-miniDate{ border-radius:12px; border: 1px solid rgba(10,20,70,.10); padding:10px 12px; background:#fff; outline:none; font-size:14px; }
  .fa-arrow{ font-weight:1000; color: rgba(8,16,35,.55); padding:0 4px; }
  .fa-miniRemove{ border:0; cursor:pointer; background: rgba(255,255,255,.8); border: 1px solid rgba(10,20,70,.10); border-radius:12px; height:40px; width:44px; font-weight:1000; }
  .fa-addLeg{ margin-top:10px; width:100%; border-radius:12px; padding:10px 12px; border: 1px dashed rgba(10,20,70,.18); background: rgba(255,255,255,.7); cursor:pointer; font-weight:1000; color: rgba(8,16,35,.72); }
  .fa-multiSummary{
    border-radius:16px;
    background:#fff;
    border:1px solid rgba(10,20,70,.10);
    padding:12px;
    box-shadow: 0 10px 24px rgba(10,20,70,.06);
  }
  .fa-multiSummaryList{ display:flex; flex-direction:column; gap:8px; }
  .fa-multiSummaryRow{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    padding:9px 10px;
    border-radius:12px;
    background:rgba(248,250,255,.95);
    color:rgba(8,16,35,.62);
    font-size:12px;
    font-weight:900;
  }
  .fa-heroSpacer{ height: 20px; }
  .fa-results{ padding: 24px 18px 42px; }
  .fa-resultsInner{ max-width: 980px; margin:0 auto; }
  .fa-resultsTitle{ margin:0 0 10px; font-size: clamp(34px, 4vw, 48px); letter-spacing:-0.03em; color: rgba(8,16,35,.92); }
  .fa-resultsSubtitle{ font-weight:900; color: rgba(8,16,35,.55); font-size:0.60em; margin-left:6px; }
  .fa-resultsTabs{
    display:inline-flex; gap:8px; padding:6px; border-radius:14px;
    background: rgba(255,255,255,.85);
    border: 1px solid rgba(10,20,70,.08);
    box-shadow: 0 10px 30px rgba(10,20,70,.08);
    margin-bottom:14px;
  }
  .fa-rTab{ border:0; cursor:pointer; padding:10px 14px; border-radius:12px; font-weight:1000; background:transparent; color: rgba(8,16,35,.58); }
  .fa-rTab.isActive{ background: rgba(35,95,255,.10); color: rgba(35,95,255,1); border: 1px solid rgba(35,95,255,.15); }
  .fa-resultsWarning{
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    margin: 0 0 14px; padding: 12px 14px; border-radius: 16px;
    background: rgba(255,248,225,.95);
    border: 1px solid rgba(180,120,0,.18);
    color: rgba(105,65,0,1);
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 10px 28px rgba(10,20,70,.06);
  }
  .fa-resultsWarningSub{ color: rgba(105,65,0,.70); white-space: nowrap; }
  .fa-pillGrid{
    display:grid; grid-template-columns: repeat(7, 1fr); gap:10px; padding:14px; border-radius:18px;
    background: rgba(255,255,255,.82); border: 1px solid rgba(10,20,70,.08);
    box-shadow: 0 14px 40px rgba(10,20,70,.08);
    margin-bottom:16px;
  }
  @media (max-width:860px){ .fa-pillGrid{ grid-template-columns: repeat(4, 1fr); } }
  @media (max-width:520px){ .fa-pillGrid{ grid-template-columns: repeat(2, 1fr); } }
  .fa-dayPill{
    border-radius:14px; border: 1px solid rgba(10,20,70,.08); background: rgba(248,250,255,.9);
    padding:12px; text-align:left;
  }
  .fa-dayPill.isSelected{ outline: 2px solid rgba(35,95,255,.35); background: rgba(35,95,255,.08); }
  .fa-dayPill.isDemo{ border-color: rgba(180,120,0,.20); background: rgba(255,250,235,.95); }
  .fa-day{ font-weight:1000; color: rgba(8,16,35,.60); font-size:11px; margin-bottom:6px; }
  .fa-demoDot{ color: rgba(150,95,0,1); font-weight:1000; margin-left:4px; }
  .fa-price{ font-weight:1000; font-size:18px; color: rgba(8,16,35,.90); }
  .fa-resultCard{
    border-radius:18px; background: rgba(255,255,255,.86);
    border: 1px solid rgba(10,20,70,.08);
    box-shadow: 0 18px 55px rgba(10,20,70,.10);
    overflow:hidden;
  }
  .fa-resultHeader{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px; border-bottom: 1px solid rgba(10,20,70,.08); color: rgba(8,16,35,.70); font-weight:1000; }
  .fa-affiliateNotice{
    padding:10px 14px;
    border-bottom:1px solid rgba(10,20,70,.08);
    background:rgba(248,250,255,.72);
    color:rgba(8,16,35,.58);
    font-size:12px;
    line-height:1.45;
    font-weight:850;
  }
  .fa-affiliateNotice a{ color:rgba(35,95,255,1); font-weight:1000; text-decoration:none; }
  .fa-affiliateNotice a:hover{ text-decoration:underline; }
  .fa-viewDeal{ border:0; cursor:pointer; padding:10px 14px; border-radius:12px; font-weight:1000; color:#fff; background: linear-gradient(135deg, rgba(35,95,255,1), rgba(74,60,255,1)); }
  .fa-viewDeal:disabled{ opacity:.6; cursor:not-allowed; }
  .fa-viewDeal.isActive{ display:inline-flex; align-items:center; justify-content:center; text-decoration:none; }
  .fa-airlineList{ padding:12px; display:flex; flex-direction:column; gap:10px; }
  .fa-airlineRow{ display:block; padding:12px; border-radius:14px; border: 1px solid rgba(10,20,70,.08); background: rgba(248,250,255,.9); }
  .fa-airlineRow.isDemo{ border-color: rgba(180,120,0,.18); background: linear-gradient(180deg, rgba(255,252,244,.95), rgba(248,250,255,.92)); }
  .fa-offerMain{ width:100%; }
  .fa-offerTop{ display:flex; align-items:flex-start; justify-content:space-between; gap:14px; }
  .fa-airlineName{ font-weight:1000; color: rgba(8,16,35,.88); display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .fa-airlineLogo{
    display:inline-grid;
    place-items:center;
    width:34px;
    height:34px;
    border-radius:11px;
    background:var(--airline-bg);
    color:var(--airline-fg);
    font-size:12px;
    font-weight:1000;
    letter-spacing:.02em;
    box-shadow:0 8px 20px rgba(10,20,70,.14);
    border:1px solid rgba(255,255,255,.34);
  }
  .fa-badge{ font-size:11px; padding:4px 10px; border-radius:999px; background: rgba(35,95,255,.12); border: 1px solid rgba(35,95,255,.16); color: rgba(35,95,255,1); font-weight:1000; text-transform: lowercase; }
  .fa-demoBadge{ font-size:11px; padding:4px 10px; border-radius:999px; background: rgba(255,240,190,1); border: 1px solid rgba(180,120,0,.20); color: rgba(130,84,0,1); font-weight:1000; }
  .fa-airlineMeta{ margin-top:6px; font-size:12px; color: rgba(8,16,35,.58); font-weight:900; }
  .fa-airlinePrice{ font-weight:1000; font-size:22px; color: rgba(8,16,35,.92); white-space:nowrap; }
  .fa-legGrid{ display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:10px; margin-top:12px; }
  @media (max-width:760px){ .fa-legGrid{ grid-template-columns:1fr; } .fa-offerTop{ flex-direction:column; } }
  .fa-legDetail{ border-radius:14px; border:1px solid rgba(10,20,70,.08); background:rgba(255,255,255,.72); padding:12px; }
  .fa-legDetail.isEmpty{ display:flex; flex-direction:column; justify-content:center; min-height:132px; }
  .fa-legTop{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
  .fa-legLabel{ font-size:11px; font-weight:1000; color:rgba(35,95,255,1); text-transform:uppercase; letter-spacing:.08em; }
  .fa-legMeta{ font-size:11px; font-weight:1000; color:rgba(8,16,35,.58); }
  .fa-legMain{ display:grid; grid-template-columns: minmax(70px, auto) 1fr minmax(70px, auto); align-items:center; gap:10px; }
  .fa-legTime{ font-size:20px; font-weight:1000; color:rgba(8,16,35,.92); }
  .fa-legAirport{ margin-top:2px; font-size:13px; font-weight:1000; color:rgba(8,16,35,.70); }
  .fa-legDate{ margin-top:2px; font-size:11px; font-weight:800; color:rgba(8,16,35,.48); }
  .fa-legLine{ display:flex; align-items:center; min-width:40px; }
  .fa-legLine span{ display:block; width:100%; height:2px; border-radius:999px; background:linear-gradient(90deg, rgba(35,95,255,.25), rgba(35,95,255,.85), rgba(35,95,255,.25)); }
  .fa-legFooter{ margin-top:10px; font-size:11px; font-weight:900; color:rgba(8,16,35,.56); }
  .fa-legEmptyText{ font-size:13px; font-weight:1000; color:rgba(8,16,35,.58); }
  .fa-offerActions{ display:flex; justify-content:flex-end; margin-top:12px; }
  .fa-tip{ padding:12px 14px 14px; font-size:12px; color: rgba(8,16,35,.58); }
  .fa-empty{ padding:16px 12px; border-radius:14px; border: 1px dashed rgba(10,20,70,.16); background: rgba(255,255,255,.65); color: rgba(8,16,35,.70); font-weight:1000; font-size:12px; }

  .fa-infoSections{ padding: 0 18px 62px; }
  .fa-infoInner{
    max-width: 980px;
    margin: 0 auto;
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap:14px;
  }
  .fa-infoCard{
    scroll-margin-top: 22px;
    border-radius:18px;
    padding:18px;
    background: rgba(255,255,255,.84);
    border: 1px solid rgba(10,20,70,.08);
    box-shadow: 0 14px 40px rgba(10,20,70,.07);
  }
  .fa-infoCard.isMuted{ background: rgba(248,250,255,.74); }
  .fa-infoKicker{
    margin-bottom:8px;
    font-size:11px;
    font-weight:1000;
    text-transform:uppercase;
    letter-spacing:.08em;
    color: rgba(35,95,255,1);
  }
  .fa-infoCard h3{
    margin:0;
    font-size:20px;
    letter-spacing:-.03em;
    color:rgba(8,16,35,.92);
  }
  .fa-infoCard p{
    margin:8px 0 0;
    font-size:13px;
    line-height:1.5;
    font-weight:750;
    color:rgba(8,16,35,.62);
  }
  .fa-inlineLink{ color:rgba(35,95,255,1); font-weight:1000; text-decoration:none; }
  .fa-inlineLink:hover{ text-decoration:underline; }
  @media (max-width:720px){ .fa-infoInner{ grid-template-columns:1fr; } }

  .fa-footer{ padding: 0 18px 44px; color: rgba(8,16,35,.62); }
  .fa-footerInner{
    max-width:980px;
    margin:0 auto;
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:18px;
    border-top:1px solid rgba(10,20,70,.08);
    padding-top:18px;
  }
  .fa-footerInner strong{ display:block; color:rgba(8,16,35,.92); font-weight:1000; }
  .fa-footerInner span{ display:block; margin-top:4px; font-size:13px; font-weight:750; }
  .fa-footerLinks{ display:flex; flex-wrap:wrap; gap:12px; }
  .fa-footerLinks a{ color:rgba(35,95,255,1); font-weight:1000; text-decoration:none; font-size:13px; }
  .fa-footerLinks a:hover{ text-decoration:underline; }
  .fa-footerDisclosure{ max-width:980px; margin:12px auto 0; font-size:12px; line-height:1.5; font-weight:750; }
  @media (max-width:720px){ .fa-footerInner{ flex-direction:column; } }

  .fa-analyticsSection{ padding: 0 18px 72px; }
  .fa-analyticsInner{
    max-width:980px;
    margin:0 auto;
    border-radius:22px;
    background:rgba(255,255,255,.84);
    border:1px solid rgba(10,20,70,.08);
    box-shadow:0 18px 55px rgba(10,20,70,.09);
    padding:18px;
  }
  .fa-analyticsTop{ display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:16px; }
  .fa-analyticsTitle{ margin:0; font-size:30px; letter-spacing:-.04em; color:rgba(8,16,35,.92); }
  .fa-analyticsText{ margin:8px 0 0; max-width:620px; color:rgba(8,16,35,.62); font-size:13px; font-weight:800; line-height:1.5; }
  .fa-analyticsActions{ display:flex; align-items:center; gap:8px; }
  .fa-refreshBtn{
    border:0;
    border-radius:12px;
    padding:10px 14px;
    cursor:pointer;
    font-weight:1000;
    color:#fff;
    background:linear-gradient(135deg, rgba(35,95,255,1), rgba(74,60,255,1));
    white-space:nowrap;
  }
  .fa-refreshBtn:disabled{ opacity:.7; cursor:not-allowed; }
  .fa-secondaryBtn{
    border:1px solid rgba(10,20,70,.10);
    border-radius:12px;
    padding:10px 14px;
    cursor:pointer;
    font-weight:1000;
    color:rgba(8,16,35,.68);
    background:rgba(255,255,255,.82);
    white-space:nowrap;
  }
  .fa-adminUnlock{
    display:grid;
    grid-template-columns:1fr minmax(180px, 260px) auto;
    align-items:center;
    gap:12px;
    border-radius:16px;
    border:1px solid rgba(10,20,70,.08);
    background:rgba(248,250,255,.9);
    padding:14px;
  }
  .fa-adminUnlock p{ margin:6px 0 0; color:rgba(8,16,35,.62); font-size:12px; font-weight:800; }
  .fa-adminInput{
    width:100%;
    box-sizing:border-box;
    border:1px solid rgba(10,20,70,.10);
    border-radius:12px;
    padding:11px 12px;
    color:rgba(8,16,35,.86);
    background:#fff;
    font-weight:850;
  }
  .fa-metricGrid{ display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom:12px; }
  .fa-metricCard, .fa-analyticsPanel{
    border-radius:16px;
    border:1px solid rgba(10,20,70,.08);
    background:rgba(248,250,255,.9);
    padding:14px;
  }
  .fa-metricLabel{ font-size:11px; font-weight:1000; text-transform:uppercase; letter-spacing:.08em; color:rgba(8,16,35,.52); }
  .fa-metricValue{ margin-top:8px; font-size:32px; line-height:1; font-weight:1000; color:rgba(8,16,35,.92); }
  .fa-metricValue.isSmall{ font-size:20px; line-height:1.15; }
  .fa-analyticsGrid{ display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px; margin-bottom:12px; }
  .fa-analyticsPanel h3{ margin:0 0 10px; font-size:15px; color:rgba(8,16,35,.84); }
  .fa-rankRow, .fa-clickRow{
    display:grid;
    gap:10px;
    align-items:center;
    padding:9px 0;
    border-top:1px solid rgba(10,20,70,.07);
    color:rgba(8,16,35,.68);
    font-size:12px;
    font-weight:900;
  }
  .fa-rankRow{ grid-template-columns:1fr auto; }
  .fa-rankRow strong{ color:rgba(35,95,255,1); }
  .fa-clickTable{ display:flex; flex-direction:column; }
  .fa-clickRow{ grid-template-columns:1.2fr .9fr .8fr 1.1fr; }
  .fa-emptyMini{ padding:10px 0; color:rgba(8,16,35,.58); font-size:12px; font-weight:900; }
  @media (max-width:820px){
    .fa-analyticsTop{ flex-direction:column; }
    .fa-analyticsActions{ width:100%; }
    .fa-adminUnlock{ grid-template-columns:1fr; }
    .fa-metricGrid, .fa-analyticsGrid{ grid-template-columns:1fr; }
    .fa-clickRow{ grid-template-columns:1fr; gap:4px; }
  }

  .fa-modalOverlay{
    position:fixed;
    inset:0;
    z-index:200;
    background:rgba(5,10,30,.48);
    backdrop-filter:blur(8px);
    display:flex;
    align-items:center;
    justify-content:center;
    padding:18px;
  }
  .fa-planner{
    width:min(760px, 100%);
    max-height:88vh;
    overflow:auto;
    border-radius:24px;
    background:rgba(255,255,255,.98);
    border:1px solid rgba(255,255,255,.35);
    box-shadow:0 34px 90px rgba(0,0,0,.34);
    padding:18px;
  }
  .fa-plannerTop{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
    padding-bottom:14px;
    border-bottom:1px solid rgba(10,20,70,.08);
    margin-bottom:14px;
  }
  .fa-plannerKicker{
    font-size:12px;
    font-weight:1000;
    color:rgba(35,95,255,1);
    text-transform:uppercase;
    letter-spacing:.08em;
  }
  .fa-plannerTitle{
    margin:4px 0 0;
    font-size:28px;
    letter-spacing:-.03em;
    color:rgba(8,16,35,.92);
  }
  .fa-closeBtn{
    width:40px;
    height:40px;
    border-radius:14px;
    border:1px solid rgba(10,20,70,.10);
    background:#fff;
    cursor:pointer;
    font-weight:1000;
  }
  .fa-chatBubble{
    max-width:620px;
    padding:12px 14px;
    border-radius:18px;
    margin-bottom:14px;
    font-size:14px;
    font-weight:800;
    line-height:1.35;
  }
  .fa-chatBubble.isBot{
    background:rgba(240,245,255,1);
    color:rgba(8,16,35,.82);
    border-top-left-radius:6px;
  }
  .fa-chatBubble.isUser{
    margin-left:auto;
    background:linear-gradient(135deg, rgba(35,95,255,1), rgba(74,60,255,1));
    color:#fff;
    border-top-right-radius:6px;
  }
  .fa-choiceGrid{
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:12px;
  }
  @media (max-width:620px){
    .fa-choiceGrid{ grid-template-columns:1fr; }
  }
  .fa-choiceCard{
    border:1px solid rgba(10,20,70,.10);
    background:rgba(248,250,255,.95);
    border-radius:18px;
    padding:14px;
    cursor:pointer;
    text-align:left;
    display:flex;
    flex-direction:column;
    gap:6px;
    min-height:132px;
  }
  .fa-choiceCard:hover{
    outline:2px solid rgba(35,95,255,.25);
    background:#fff;
  }
  .fa-choiceIcon{ font-size:24px; }
  .fa-choiceTitle{ font-weight:1000; color:rgba(8,16,35,.90); font-size:15px; }
  .fa-choiceText{ color:rgba(8,16,35,.58); font-weight:800; font-size:12px; line-height:1.35; }
  .fa-plannerNote{
    margin-top:14px;
    border-radius:16px;
    padding:12px 14px;
    background:rgba(255,248,225,.95);
    color:rgba(105,65,0,1);
    border:1px solid rgba(180,120,0,.18);
    font-size:12px;
    font-weight:800;
  }

  @media (prefers-color-scheme: dark){
    body{ background:#0b1020; color:#eaf0ff; }
    .fa-app{
      background: radial-gradient(1000px 600px at 70% 30%, rgba(80,120,255,.14), transparent 60%),
                  radial-gradient(900px 600px at 20% 10%, rgba(120,80,255,.14), transparent 60%),
                  #0b1020;
    }
    .fa-card{ background: rgba(20,28,55,.75); border-color: rgba(255,255,255,.08); }
    .fa-cardTop{ background: rgba(20,28,55,.55); border-bottom-color: rgba(255,255,255,.08); }
    .fa-tab{ color: rgba(235,240,255,.55); }
    .fa-tab.isActive{ color: rgba(120,160,255,1); border-bottom-color: rgba(120,160,255,1); }
    .fa-seg{ background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.08); }
    .fa-segBtn{ color: rgba(235,240,255,.65); }
    .fa-segBtn.isActive{ background: rgba(255,255,255,.10); color: rgba(235,240,255,.92); }
    .fa-rightCol{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); }
    .fa-inputWrap{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.10); box-shadow:none; }
    .fa-input, .fa-select, .fa-dateInput{ color: rgba(235,240,255,.92); }
    .fa-label{ color: rgba(235,240,255,.68); }
    .fa-dropdown{ background: rgba(20,28,55,.95); border-color: rgba(255,255,255,.10); }
    .fa-itemTitle{ color: rgba(235,240,255,.92); }
    .fa-itemCode{ color: rgba(235,240,255,.55); }
    .fa-hint{ background: rgba(255,255,255,.06); border-top-color: rgba(255,255,255,.10); color: rgba(235,240,255,.68); }
    .fa-pill{ background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.10); color: rgba(235,240,255,.72); }
    .fa-menuDropdown{ background:rgba(20,28,55,.98); border-color:rgba(255,255,255,.10); }
    .fa-menuDropdown button,
    .fa-menuDropdown a{ color:rgba(235,240,255,.86); }
    .fa-menuDropdown button:hover,
    .fa-menuDropdown a:hover{ background:rgba(255,255,255,.08); }
    .fa-resultsTitle{ color: rgba(235,240,255,.92); }
    .fa-resultsSubtitle{ color: rgba(235,240,255,.55); }
    .fa-resultsTabs{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); }
    .fa-rTab{ color: rgba(235,240,255,.60); }
    .fa-rTab.isActive{ background: rgba(120,160,255,.14); color: rgba(120,160,255,1); border-color: rgba(120,160,255,.18); }
    .fa-resultsWarning{ background: rgba(110,75,0,.22); border-color: rgba(255,210,120,.18); color: rgba(255,228,165,1); }
    .fa-resultsWarningSub{ color: rgba(255,228,165,.72); }
    .fa-pillGrid{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); }
    .fa-dayPill{ background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.08); }
    .fa-dayPill.isSelected{ outline-color: rgba(120,160,255,.35); background: rgba(120,160,255,.10); }
    .fa-dayPill.isDemo{ background: rgba(110,75,0,.14); border-color: rgba(255,210,120,.16); }
    .fa-day{ color: rgba(235,240,255,.60); }
    .fa-demoDot{ color: rgba(255,218,130,1); }
    .fa-price{ color: rgba(235,240,255,.92); }
    .fa-resultCard{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); }
    .fa-resultHeader{ border-bottom-color: rgba(255,255,255,.08); color: rgba(235,240,255,.72); }
    .fa-affiliateNotice{ background:rgba(255,255,255,.04); border-bottom-color:rgba(255,255,255,.08); color:rgba(235,240,255,.62); }
    .fa-affiliateNotice a{ color:rgba(120,160,255,1); }
    .fa-airlineRow{ background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.08); }
    .fa-airlineRow.isDemo{ background: rgba(110,75,0,.12); border-color: rgba(255,210,120,.16); }
    .fa-airlineName{ color: rgba(235,240,255,.92); }
    .fa-airlineLogo{ box-shadow:none; border-color:rgba(255,255,255,.16); }
    .fa-demoBadge{ background: rgba(110,75,0,.28); border-color: rgba(255,210,120,.18); color: rgba(255,228,165,1); }
    .fa-airlineMeta{ color: rgba(235,240,255,.60); }
    .fa-airlinePrice{ color: rgba(235,240,255,.92); }
    .fa-legDetail{ background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.08); }
    .fa-legMeta, .fa-legFooter, .fa-legEmptyText{ color:rgba(235,240,255,.60); }
    .fa-legTime{ color:rgba(235,240,255,.95); }
    .fa-legAirport{ color:rgba(235,240,255,.74); }
    .fa-legDate{ color:rgba(235,240,255,.48); }
    .fa-tip{ color: rgba(235,240,255,.62); }
    .fa-empty{ background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.14); color: rgba(235,240,255,.72); }
    .fa-infoCard{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); box-shadow:none; }
    .fa-infoCard.isMuted{ background: rgba(255,255,255,.04); }
    .fa-infoCard h3{ color: rgba(235,240,255,.94); }
    .fa-infoCard p{ color: rgba(235,240,255,.64); }
    .fa-footer{ color: rgba(235,240,255,.62); }
    .fa-footerInner{ border-top-color: rgba(255,255,255,.08); }
    .fa-footerInner strong{ color: rgba(235,240,255,.94); }
    .fa-footerLinks a{ color: rgba(120,160,255,1); }
    .fa-analyticsInner{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.08); box-shadow:none; }
    .fa-analyticsTitle{ color:rgba(235,240,255,.94); }
    .fa-analyticsText{ color:rgba(235,240,255,.64); }
    .fa-secondaryBtn{ color:rgba(235,240,255,.78); background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.10); }
    .fa-adminUnlock{ background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.08); }
    .fa-adminUnlock p{ color:rgba(235,240,255,.62); }
    .fa-adminInput{ color:rgba(235,240,255,.92); background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.10); }
    .fa-metricCard, .fa-analyticsPanel{ background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.08); }
    .fa-metricLabel{ color:rgba(235,240,255,.52); }
    .fa-metricValue, .fa-analyticsPanel h3{ color:rgba(235,240,255,.92); }
    .fa-rankRow, .fa-clickRow{ border-top-color:rgba(255,255,255,.08); color:rgba(235,240,255,.66); }
    .fa-emptyMini{ color:rgba(235,240,255,.58); }
    .fa-error{ color: rgba(255,190,190,1); background: rgba(120,30,30,.22); border-color: rgba(255,190,190,.18); }
    .fa-multiSummary{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.10); box-shadow:none; }
    .fa-multiSummaryRow{ background: rgba(255,255,255,.06); color: rgba(235,240,255,.68); }
    .fa-providerWarning{ color: rgba(255,228,165,1); background: rgba(110,75,0,.22); border-color: rgba(255,210,120,.18); }
    .fa-providerWarningTitle{ color: rgba(255,236,190,1); }
    .fa-planner{ background:rgba(20,28,55,.98); border-color:rgba(255,255,255,.10); }
    .fa-plannerTop{ border-bottom-color:rgba(255,255,255,.10); }
    .fa-plannerTitle{ color:rgba(235,240,255,.95); }
    .fa-closeBtn{ background:rgba(255,255,255,.08); color:#fff; border-color:rgba(255,255,255,.12); }
    .fa-chatBubble.isBot{ background:rgba(255,255,255,.08); color:rgba(235,240,255,.88); }
    .fa-choiceCard{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.10); }
    .fa-choiceCard:hover{ background:rgba(255,255,255,.10); }
    .fa-choiceTitle{ color:rgba(235,240,255,.95); }
    .fa-choiceText{ color:rgba(235,240,255,.62); }
    .fa-plannerNote{ background:rgba(110,75,0,.22); color:rgba(255,228,165,1); border-color:rgba(255,210,120,.18); }
  }
`;
