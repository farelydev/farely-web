export default function PlannerModal({
  open,
  mode,
  onClose,
  onChooseUmrah,
  onChooseWeekend,
  onChooseCheapest,
  onChooseAiSuggestion,
  aiText,
}) {
  if (!open) return null;

  const title =
    mode === "umrah"
      ? "Plan your Umrah trip"
      : mode === "weekend"
        ? "Plan a weekend getaway"
        : mode === "cheapmonth"
          ? "Find the cheapest month"
          : "Plan with Farely";

  return (
    <div className="fa-modalOverlay" onMouseDown={onClose}>
      <div className="fa-planner" onMouseDown={(e) => e.stopPropagation()}>
        <div className="fa-plannerTop">
          <div>
            <div className="fa-plannerKicker">Farely trip planner</div>
            <h3 className="fa-plannerTitle">{title}</h3>
          </div>
          <button type="button" className="fa-closeBtn" onClick={onClose} aria-label="Close planner">
            ✕
          </button>
        </div>

        {mode === "umrah" && (
          <>
            <div className="fa-chatBubble isBot">
              Before we fill the search form, how would you like to start your Umrah journey?
            </div>

            <div className="fa-choiceGrid">
              <button type="button" className="fa-choiceCard" onClick={() => onChooseUmrah("jeddah-first")}>
                <span className="fa-choiceIcon">🕋</span>
                <span className="fa-choiceTitle">Fly to Jeddah first</span>
                <span className="fa-choiceText">Best if you want to go to Makkah first.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseUmrah("madinah-first")}>
                <span className="fa-choiceIcon">🕌</span>
                <span className="fa-choiceTitle">Fly to Madinah first</span>
                <span className="fa-choiceText">Best if you want to visit Madinah before Makkah.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseUmrah("flexible")}>
                <span className="fa-choiceIcon">💸</span>
                <span className="fa-choiceTitle">I’m flexible</span>
                <span className="fa-choiceText">Use flexible dates and compare the cheaper entry city.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseUmrah("package")}>
                <span className="fa-choiceIcon">🏨</span>
                <span className="fa-choiceTitle">Flight + hotel package</span>
                <span className="fa-choiceText">Set up the flight search now. Hotels can come next.</span>
              </button>
            </div>

            <div className="fa-plannerNote">
              Later we can expand this into Makkah nights, Madinah nights, hotel distance from Haram/Masjid Nabawi, and package pricing.
            </div>
          </>
        )}

        {mode === "weekend" && (
          <>
            <div className="fa-chatBubble isBot">
              Choose the kind of weekend trip you want. I’ll fill the form and clear old results.
            </div>

            <div className="fa-choiceGrid">
              <button type="button" className="fa-choiceCard" onClick={() => onChooseWeekend("paris")}>
                <span className="fa-choiceIcon">🥐</span>
                <span className="fa-choiceTitle">Paris weekend</span>
                <span className="fa-choiceText">London to Paris, return trip, 3 nights.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseWeekend("malaga")}>
                <span className="fa-choiceIcon">☀️</span>
                <span className="fa-choiceTitle">Sunny Spain weekend</span>
                <span className="fa-choiceText">London to Malaga, return trip, 3 nights.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseWeekend("rome")}>
                <span className="fa-choiceIcon">🍝</span>
                <span className="fa-choiceTitle">Rome weekend</span>
                <span className="fa-choiceText">London to Rome, return trip, 3 nights.</span>
              </button>
            </div>
          </>
        )}

        {mode === "cheapmonth" && (
          <>
            <div className="fa-chatBubble isBot">
              I’ll switch the form to flexible dates. Pick a destination idea.
            </div>

            <div className="fa-choiceGrid">
              <button type="button" className="fa-choiceCard" onClick={() => onChooseCheapest("anywhere-sunny")}>
                <span className="fa-choiceIcon">☀️</span>
                <span className="fa-choiceTitle">Sunny Europe</span>
                <span className="fa-choiceText">Start with Malaga and flexible month.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseCheapest("new-york")}>
                <span className="fa-choiceIcon">🗽</span>
                <span className="fa-choiceTitle">New York</span>
                <span className="fa-choiceText">London to JFK with flexible month.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseCheapest("doha")}>
                <span className="fa-choiceIcon">🌙</span>
                <span className="fa-choiceTitle">Doha</span>
                <span className="fa-choiceText">London to Doha with flexible month.</span>
              </button>
            </div>
          </>
        )}

        {mode === "ai" && (
          <>
            <div className="fa-chatBubble isUser">{aiText || "Plan my trip"}</div>
            <div className="fa-chatBubble isBot">
              I can turn this into a search. Pick the closest option for now.
            </div>

            <div className="fa-choiceGrid">
              <button type="button" className="fa-choiceCard" onClick={() => onChooseAiSuggestion("south-spain")}>
                <span className="fa-choiceIcon">☀️</span>
                <span className="fa-choiceTitle">Sunny south of Spain</span>
                <span className="fa-choiceText">London to Malaga, flexible month.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseAiSuggestion("spain-morocco")}>
                <span className="fa-choiceIcon">🧭</span>
                <span className="fa-choiceTitle">Spain + Morocco multi-city</span>
                <span className="fa-choiceText">London → Malaga → Marrakech.</span>
              </button>

              <button type="button" className="fa-choiceCard" onClick={() => onChooseAiSuggestion("umrah")}>
                <span className="fa-choiceIcon">🕋</span>
                <span className="fa-choiceTitle">Umrah trip</span>
                <span className="fa-choiceText">Open the Umrah planning options.</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
