import { useEffect, useRef } from "react";

const LOGO_SRC = "/brand/B4492AEF-3192-42F5-B006-5D933BE036C2.PNG";

const MENU_ITEMS = [
  { label: "About Farely", target: "farely-about" },
  { label: "How it works", target: "farely-how" },
  { label: "Support", target: "farely-support" },
  { label: "Partner with us", target: "farely-partner" },
  { label: "Analytics", target: "farely-analytics" },
  { label: "Sign in (coming soon)", target: "farely-signin" },
];

export default function Header({
  aiText,
  setAiText,
  handleAiButton,
  openPlanner,
  menuOpen,
  setMenuOpen,
  showAnalytics = false,
}) {
  const menuRef = useRef(null);
  const visibleMenuItems = MENU_ITEMS.filter((item) => item.target !== "farely-analytics" || showAnalytics);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function onDocumentClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [menuOpen, setMenuOpen]);

  function onMenuItemClick() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="fa-topbar">
        <div className="fa-topbarLeft">
          <img className="fa-logo" src={LOGO_SRC} alt="Farely logo" />
          <div className="fa-brandText">
            <span className="fa-brandName">Farely</span>
            <span className="fa-brandSub">Smart trip search</span>
          </div>
        </div>

        <div className="fa-menuWrap" ref={menuRef}>
          <button
            className="fa-menuBtn"
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="fa-menuIcon">☰</span>
          </button>

          {menuOpen && (
            <div className="fa-menuDropdown">
              {visibleMenuItems.map((item) => (
                <a key={item.target} href={`#${item.target}`} onClick={onMenuItemClick}>
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fa-heroCopy">
        <h1 className="fa-title">
          Plan my trip <span className="fa-sparkle">✨</span>
        </h1>
        <p className="fa-subtitle">Tell us about your dream holiday, and we&apos;ll help plan the perfect trip.</p>

        <div className="fa-aiBar">
          <input
            className="fa-aiInput"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="e.g. 3 days in south of Spain and Morocco"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAiButton();
            }}
          />
          <button className="fa-aiButton" type="button" onClick={handleAiButton}>
            Get Started
          </button>
        </div>

        <div className="fa-chipRow">
          <button className="fa-chip" type="button" onClick={() => openPlanner("weekend")}>
            <span className="fa-chipIcon">📅</span> Weekend getaway
          </button>
          <button className="fa-chip" type="button" onClick={() => openPlanner("cheapmonth")}>
            <span className="fa-chipIcon">🗓️</span> Cheapest month to fly
          </button>
          <button className="fa-chip" type="button" onClick={() => openPlanner("umrah")}>
            <span className="fa-chipIcon">🕋</span> Umrah packages
          </button>
        </div>
      </div>
    </>
  );
}
