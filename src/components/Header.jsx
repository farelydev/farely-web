import { useEffect, useRef } from "react";

const LOGO_SRC = "/brand/B4492AEF-3192-42F5-B006-5D933BE036C2.PNG";

const MENU_ITEMS = [
  { label: "Search Flights", target: "farely-search" },
  { label: "Plan with Farely AI", action: "ai" },
  { label: "Cheapest Month", action: "cheapmonth" },
  { label: "Umrah", action: "umrah" },
  { label: "Saved Trips / Sign in", target: "farely-signin", badge: "Coming soon" },
  { label: "Help Centre", target: "farely-support" },
  { label: "Contact Farely", href: "mailto:support@tryfarely.com" },
  { label: "Business & Partners", target: "farely-partner" },
  { label: "About Farely", target: "farely-about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Analytics", target: "farely-analytics" },
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

  function onMenuItemClick(item) {
    setMenuOpen(false);
    if (item?.action) openPlanner(item.action);
  }

  return (
    <div className="fa-headerShell" ref={menuRef}>
      <div className="fa-topbar">
        <div className="fa-topbarLeft">
          <img className="fa-logo" src={LOGO_SRC} alt="Farely logo" />
          <div className="fa-brandText">
            <span className="fa-brandName">Farely</span>
            <span className="fa-brandSub">Smart trip search</span>
          </div>
        </div>

        <div className="fa-menuWrap">
          <button
            className="fa-menuBtn"
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="fa-menuIcon">☰</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            className="fa-menuOverlay"
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fa-menuDropdown">
            <div className="fa-menuPanelTop">
              <div>
                <div className="fa-menuPanelTitle">Farely menu</div>
                <div className="fa-menuPanelSub">Quick links</div>
              </div>
              <button className="fa-menuClose" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                x
              </button>
            </div>
            <div className="fa-menuLinks">
              {visibleMenuItems.map((item) => {
                const content = (
                  <>
                    <span>{item.label}</span>
                    {item.badge ? <span className="fa-menuBadge">{item.badge}</span> : null}
                  </>
                );

                if (item.action) {
                  return (
                    <button key={item.label} type="button" onClick={() => onMenuItemClick(item)}>
                      {content}
                    </button>
                  );
                }

                return (
                  <a key={item.label} href={item.href || `#${item.target}`} onClick={() => onMenuItemClick(item)}>
                    {content}
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}

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
    </div>
  );
}
