import Footer from "./Footer";
import SupportAssistant from "./SupportAssistant";
import {
  CONTACT_EMAIL,
  CONTACT_HREF,
  PRIVACY_EMAIL,
  PRIVACY_HREF,
  SECURITY_EMAIL,
  SECURITY_HREF,
  SUPPORT_EMAIL,
  SUPPORT_HREF,
} from "../config/site";

const UPDATED = "25 June 2026";

const PAGES = {
  "/affiliate-disclosure": {
    title: "Affiliate Disclosure",
    intro:
      "Farely is a trip comparison and discovery tool. Some links may be partner or affiliate links, and bookings are completed away from Farely.",
    sections: [
      {
        heading: "How Farely may earn money",
        body:
          "Farely may earn a commission if you click a partner link or complete a booking with a third-party travel provider. This does not change the price you pay.",
      },
      {
        heading: "How results are shown",
        body:
          "We aim to show useful flight and trip options based on your search. Some results may come from live providers, and fallback results may be clearly marked when provider availability is limited.",
      },
      {
        heading: "Third-party bookings",
        body:
          "When you choose View deal, you may leave Farely and continue with a third-party website. Their prices, terms, payment process, cancellation rules, baggage rules, and customer support apply.",
      },
      {
        heading: "Farely does not take travel payments",
        body:
          "Farely does not currently collect payment for flight or travel bookings on your behalf. The travel provider is responsible for payment processing, ticket issuance, booking confirmation, and post-booking support.",
      },
      {
        heading: "Our promise",
        body:
          "We will keep affiliate relationships clear. If Farely may earn commission from a link, we will disclose that relationship in plain language.",
      },
    ],
  },
  "/privacy": {
    title: "Privacy Policy",
    intro:
      "This privacy policy explains the basic information Farely may collect while you use the website.",
    sections: [
      {
        heading: "Information you provide",
        body:
          "Farely may process the trip details you enter, such as origin, destination, travel dates, passenger count, cabin class, and natural-language trip ideas.",
      },
      {
        heading: "Technical and usage data",
        body:
          "The website and hosting provider may collect standard technical information such as IP address, browser type, device information, pages visited, timestamps, and server logs. Farely may also record deal-click events to understand which routes and partners are useful.",
      },
      {
        heading: "Affiliate and partner links",
        body:
          "If you click a partner link, the partner website may receive information needed to open the relevant search or booking page. That partner's privacy policy will apply once you leave Farely.",
      },
      {
        heading: "Cookies and analytics",
        body:
          "Farely currently keeps tracking minimal. If analytics, advertising pixels, or non-essential cookies are added later, the site should present an appropriate cookie notice or consent option where required.",
      },
      {
        heading: "Contact",
        body:
          PRIVACY_EMAIL
            ? `For privacy or GDPR questions, contact Farely at ${PRIVACY_EMAIL}.`
            : "For privacy questions, use the support page.",
      },
    ],
  },
  "/security": {
    title: "Security Reports",
    intro:
      "Use this page for responsible disclosure and security-related reports about Farely.",
    sections: [
      {
        heading: "Responsible disclosure",
        body:
          SECURITY_EMAIL
            ? `If you find a security issue, contact Farely at ${SECURITY_EMAIL}. Please include enough detail for us to reproduce and understand the issue.`
            : "If you find a security issue, use the support page and include enough detail for us to reproduce and understand the issue.",
      },
      {
        heading: "What to include",
        body:
          "Include the affected page or endpoint, steps to reproduce, potential impact, and whether any data may have been exposed. Do not publicly disclose issues before Farely has had a chance to review them.",
      },
    ],
  },
  "/support": {
    title: "Support",
    intro:
      "Use Farely AI for quick travel-search guidance, or contact the right Farely inbox for human help.",
    sections: [
      {
        heading: "What Farely can help with",
        body:
          "Farely can help with website questions, search guidance, route ideas, partner-link questions, and what to check before booking.",
      },
      {
        heading: "Booking support",
        body:
          "Bookings, payments, refunds, cancellations, and ticket changes are managed by the airline or travel partner you book with.",
      },
    ],
  },
  "/terms": {
    title: "Terms of Use",
    intro:
      "These terms explain the basic rules for using Farely. By using the website, you agree to use it responsibly.",
    sections: [
      {
        heading: "Farely is not a booking agent",
        body:
          "Farely helps you search and compare travel ideas. Farely does not sell flights, issue tickets, take payment for bookings, or operate airline services.",
      },
      {
        heading: "Farely is not the travel organiser",
        body:
          "Unless Farely clearly states otherwise in writing for a specific product, Farely is not acting as the organiser of your holiday, package, or travel arrangement. The provider you book with is responsible for the booking contract and fulfilment.",
      },
      {
        heading: "Third-party providers",
        body:
          "Bookings are completed with third-party travel providers. Their terms, prices, availability, fees, baggage rules, cancellation rules, and support policies apply.",
      },
      {
        heading: "Accuracy of information",
        body:
          "Flight prices and availability can change quickly. Farely aims to show useful information, but it cannot guarantee that every price, route, schedule, or fare rule will remain available.",
      },
      {
        heading: "Responsible use",
        body:
          "Do not misuse the website, interfere with the service, attempt to access private analytics, scrape excessively, or use Farely for unlawful activity.",
      },
      {
        heading: "No travel advice guarantee",
        body:
          "Farely may provide planning prompts and suggestions, but you are responsible for checking visas, passport validity, health rules, pilgrimage requirements, airline conditions, and destination restrictions before booking.",
      },
      {
        heading: "Liability limit for search content",
        body:
          "Farely aims to present useful search content and partner links, but does not accept responsibility for losses caused by third-party booking errors, provider cancellations, fare changes, ticketing problems, or information on external websites.",
      },
    ],
  },
};

export function getLegalPage(pathname) {
  return PAGES[pathname] || null;
}

export default function LegalPage({ page }) {
  const isSupport = page.title === "Support";

  return (
    <div className="fa-app">
      <style>{legalStyles}</style>

      <main className="fa-legalPage">
        <a className="fa-backLink" href="/">← Back to Farely</a>
        <div className="fa-legalCard">
          <div className="fa-infoKicker">{isSupport ? "Farely support" : "Farely legal"}</div>
          <h1>{page.title}</h1>
          <p className="fa-legalIntro">{page.intro}</p>
          {!isSupport && <p className="fa-legalUpdated">Last updated: {UPDATED}</p>}
          {isSupport ? (
            <div className="fa-supportTrustNotice">
              Farely gives travel-search guidance and compares options. Bookings, payments, ticketing, refunds, and
              changes are handled by the airline or travel partner. <a href="/terms">Learn more</a>.
            </div>
          ) : (
            <div className="fa-legalNote">
              Important: Farely currently acts as a comparison and referral website. Unless Farely explicitly says
              otherwise for a specific product, Farely does not take booking payments, issue tickets, or manage travel
              fulfilment.
            </div>
          )}

          {isSupport && (
            <div className="fa-contactGrid" aria-label="Farely contact options">
              <a className="fa-contactTile" href={SUPPORT_HREF}>
                <span>Customer support</span>
                <strong>{SUPPORT_EMAIL || CONTACT_EMAIL || "info@tryfarely.com"}</strong>
              </a>
              <a className="fa-contactTile" href={CONTACT_HREF}>
                <span>Partnerships & general enquiries</span>
                <strong>{CONTACT_EMAIL || "info@tryfarely.com"}</strong>
              </a>
              <a className="fa-contactTile" href={PRIVACY_HREF}>
                <span>Privacy & GDPR requests</span>
                <strong>{PRIVACY_EMAIL || CONTACT_EMAIL || "info@tryfarely.com"}</strong>
              </a>
              <a className="fa-contactTile" href={SECURITY_HREF}>
                <span>Security reports</span>
                <strong>{SECURITY_EMAIL || CONTACT_EMAIL || "info@tryfarely.com"}</strong>
              </a>
            </div>
          )}

          {page.sections.map((section) => (
            <section key={section.heading} className="fa-legalSection">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          {isSupport && (
            <>
              <div className="fa-supportLinks">
                <a href="/affiliate-disclosure">Affiliate disclosure</a>
                <a href="/privacy">Privacy policy</a>
                <a href="/terms">Terms of use</a>
              </div>
              <SupportAssistant />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

const legalStyles = `
  body{ margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#eef5ff; color:#111827; }
  *{ box-sizing:border-box; }
  .fa-app{ min-height:100vh; background:linear-gradient(180deg, #eef5ff, #f8fbff); }
  .fa-legalPage{ width:min(860px, calc(100% - 32px)); margin:0 auto; padding:42px 0 28px; }
  .fa-backLink{ display:inline-flex; margin-bottom:16px; color:#235fff; font-weight:900; text-decoration:none; }
  .fa-legalCard{ border-radius:22px; background:rgba(255,255,255,.92); border:1px solid rgba(10,20,70,.08); box-shadow:0 18px 55px rgba(10,20,70,.10); padding:24px; }
  .fa-infoKicker{ margin-bottom:8px; font-size:11px; font-weight:1000; text-transform:uppercase; letter-spacing:.08em; color:#235fff; }
  .fa-legalCard h1{ margin:0; font-size:clamp(34px, 5vw, 54px); letter-spacing:-.05em; }
  .fa-legalIntro{ margin:12px 0 0; max-width:680px; color:rgba(8,16,35,.68); font-size:16px; line-height:1.55; font-weight:750; }
  .fa-legalUpdated{ margin:10px 0 20px; color:rgba(8,16,35,.48); font-size:13px; font-weight:850; }
  .fa-legalSection{ padding:18px 0; border-top:1px solid rgba(10,20,70,.08); }
  .fa-legalSection h2{ margin:0 0 8px; font-size:20px; letter-spacing:-.03em; }
  .fa-legalSection p{ margin:0; color:rgba(8,16,35,.66); font-size:14px; line-height:1.65; font-weight:700; }
  .fa-legalNote{ margin-top:14px; border-radius:16px; padding:14px; background:rgba(255,248,225,.95); border:1px solid rgba(180,120,0,.18); color:rgba(105,65,0,1); font-size:13px; line-height:1.5; font-weight:800; }
  .fa-supportTrustNotice{ margin-top:14px; border-radius:16px; padding:14px; background:rgba(240,246,255,.95); border:1px solid rgba(35,95,255,.12); color:rgba(8,16,35,.68); font-size:13px; line-height:1.5; font-weight:850; }
  .fa-supportTrustNotice a{ color:#235fff; font-weight:1000; text-decoration:none; }
  .fa-contactGrid{ display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px; margin-top:16px; }
  .fa-contactTile{ display:block; border-radius:16px; padding:14px; background:#fff; border:1px solid rgba(10,20,70,.08); text-decoration:none; box-shadow:0 10px 28px rgba(10,20,70,.06); }
  .fa-contactTile span{ display:block; color:rgba(8,16,35,.52); font-size:11px; line-height:1.35; font-weight:1000; text-transform:uppercase; letter-spacing:.06em; }
  .fa-contactTile strong{ display:block; margin-top:6px; color:#235fff; font-size:14px; line-height:1.3; font-weight:1000; overflow-wrap:anywhere; }
  .fa-supportLinks{ display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
  .fa-supportLinks a{ color:#235fff; font-size:13px; font-weight:1000; text-decoration:none; }
  .fa-supportButton{ display:inline-flex; margin-top:14px; border-radius:14px; padding:12px 16px; background:#235fff; color:#fff; text-decoration:none; font-weight:1000; }
  .fa-supportAssistant{ margin-top:18px; border-radius:20px; border:1px solid rgba(35,95,255,.12); background:linear-gradient(135deg, rgba(255,255,255,.98), rgba(240,246,255,.96)); padding:18px; box-shadow:0 16px 42px rgba(35,95,255,.10); }
  .fa-supportAssistant h2{ margin:0; font-size:clamp(26px, 4vw, 34px); letter-spacing:-.04em; color:rgba(8,16,35,.94); }
  .fa-supportIntro{ margin:8px 0 14px; max-width:650px; color:rgba(8,16,35,.66); font-size:15px; line-height:1.55; font-weight:800; }
  .fa-supportQuick{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
  .fa-supportQuick button{ border:1px solid rgba(35,95,255,.14); border-radius:999px; padding:9px 12px; background:rgba(255,255,255,.86); color:rgba(8,16,35,.78); font-weight:900; cursor:pointer; }
  .fa-supportLabel{ display:block; margin:8px 0 6px; color:rgba(8,16,35,.64); font-size:12px; font-weight:1000; text-transform:uppercase; letter-spacing:.06em; }
  .fa-supportTextarea{ width:100%; min-height:112px; resize:vertical; border:1px solid rgba(10,20,70,.10); border-radius:16px; padding:13px; color:rgba(8,16,35,.86); font:inherit; font-weight:750; background:#fff; box-shadow:inset 0 1px 0 rgba(10,20,70,.02); }
  .fa-supportInput{ width:100%; border:1px solid rgba(10,20,70,.10); border-radius:14px; padding:12px; color:rgba(8,16,35,.86); font:inherit; font-weight:750; background:#fff; }
  .fa-supportActions{ display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px; }
  .fa-supportPrimary, .fa-supportSecondary{ border:0; border-radius:14px; padding:11px 14px; background:#235fff; color:#fff; text-decoration:none; font-weight:1000; cursor:pointer; }
  .fa-supportPrimary:disabled{ opacity:.65; cursor:not-allowed; }
  .fa-supportSecondary{ background:rgba(35,95,255,.10); color:#235fff; }
  .fa-supportMuted{ color:rgba(8,16,35,.54); font-size:12px; font-weight:850; }
  .fa-supportReply{ margin-top:12px; border-radius:16px; padding:14px; background:#fff; color:rgba(8,16,35,.76); font-size:14px; line-height:1.55; font-weight:850; border:1px solid rgba(35,95,255,.10); }
  .fa-supportHandoff{ margin-top:14px; border-radius:18px; padding:14px; border:1px solid rgba(10,20,70,.08); background:rgba(248,250,255,.9); }
  .fa-supportHandoffTitle{ color:rgba(8,16,35,.88); font-size:16px; font-weight:1000; }
  .fa-supportHandoff p{ margin:6px 0 12px; color:rgba(8,16,35,.62); font-size:13px; line-height:1.5; font-weight:800; }
  .fa-supportStatus{ margin-top:10px; border-radius:14px; padding:12px; font-size:13px; line-height:1.45; font-weight:850; }
  .fa-supportStatus.is-sent{ background:rgba(226,255,238,.95); color:rgba(15,95,50,1); border:1px solid rgba(15,95,50,.14); }
  .fa-supportStatus.is-fallback{ background:rgba(255,248,225,.95); color:rgba(105,65,0,1); border:1px solid rgba(180,120,0,.18); }
  .fa-supportStatus.is-error{ background:rgba(255,236,236,.95); color:rgba(135,30,30,1); border:1px solid rgba(135,30,30,.16); }
  .fa-footer{ padding:22px 18px 28px; color:rgba(8,16,35,.62); }
  .fa-footerInner{ width:min(980px, 100%); margin:0 auto; display:flex; align-items:flex-start; justify-content:space-between; gap:18px; border-top:1px solid rgba(10,20,70,.08); padding-top:18px; }
  .fa-footerInner strong{ display:block; color:rgba(8,16,35,.92); }
  .fa-footerInner span{ display:block; margin-top:4px; font-size:13px; font-weight:750; }
  .fa-footerLinks{ display:flex; flex-wrap:wrap; gap:12px; }
  .fa-footerLinks a{ color:#235fff; font-weight:900; text-decoration:none; font-size:13px; }
  .fa-footerDisclosure{ width:min(980px, 100%); margin:12px auto 0; font-size:12px; line-height:1.5; font-weight:750; }
  @media (max-width:620px){ .fa-contactGrid{ grid-template-columns:1fr; } }
  @media (max-width:680px){ .fa-footerInner{ flex-direction:column; } }
`;
