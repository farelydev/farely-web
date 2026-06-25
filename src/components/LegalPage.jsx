import Footer from "./Footer";
import SupportAssistant from "./SupportAssistant";
import { CONTACT_EMAIL, CONTACT_HREF, CONTACT_LABEL } from "../config/site";

const UPDATED = "24 June 2026";

const PAGES = {
  "/affiliate-disclosure": {
    title: "Affiliate Disclosure",
    intro:
      "Farely is a flight comparison and trip discovery tool. Some links may be partner or affiliate links.",
    sections: [
      {
        heading: "How Farely may earn money",
        body:
          "Farely may earn a commission if you click a partner link or complete a booking with a third-party travel provider. This does not change the price you pay.",
      },
      {
        heading: "How results are shown",
        body:
          "We aim to show useful flight and trip options based on your search. Some results may come from live providers, and some development results may be clearly marked as demo fallback while provider access is being tested.",
      },
      {
        heading: "Third-party bookings",
        body:
          "When you choose View deal, you may leave Farely and continue with a third-party website. Their prices, terms, payment process, cancellation rules, baggage rules, and customer support apply.",
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
          CONTACT_EMAIL
            ? `For privacy questions, contact Farely at ${CONTACT_EMAIL}.`
            : "For privacy questions, use the support page. A dedicated support email should be added before full public launch.",
      },
    ],
  },
  "/support": {
    title: "Support",
    intro:
      "Farely is a new travel search project. This page explains how to get help and what Farely can and cannot handle.",
    sections: [
      {
        heading: "Contact",
        body: CONTACT_EMAIL
          ? `For support, email ${CONTACT_EMAIL}.`
          : "A dedicated support email is being set up. Until then, Farely should be treated as an early public MVP.",
      },
      {
        heading: "Bookings and payments",
        body:
          "Farely does not currently take bookings or payments directly. If you book through a travel partner, contact that provider for ticketing, payment, cancellation, refund, baggage, or schedule-change support.",
      },
      {
        heading: "Search help",
        body:
          "Farely can help compare routes, dates, and trip ideas. Prices and availability can change quickly, so always confirm final fare rules on the partner or airline website before booking.",
      },
      {
        heading: "Partners",
        body:
          "Travel partners interested in working with Farely can use the contact channel listed on this page once the dedicated email is active.",
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
    ],
  },
};

export function getLegalPage(pathname) {
  return PAGES[pathname] || null;
}

export default function LegalPage({ page }) {
  return (
    <div className="fa-app">
      <style>{legalStyles}</style>

      <main className="fa-legalPage">
        <a className="fa-backLink" href="/">← Back to Farely</a>
        <div className="fa-legalCard">
          <div className="fa-infoKicker">Farely legal</div>
          <h1>{page.title}</h1>
          <p className="fa-legalIntro">{page.intro}</p>
          <p className="fa-legalUpdated">Last updated: {UPDATED}</p>

          {page.sections.map((section) => (
            <section key={section.heading} className="fa-legalSection">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          {!CONTACT_EMAIL && page.title === "Support" && (
            <div className="fa-legalNote">
              Next step: create a real public email such as hello@yourdomain.com, then set VITE_CONTACT_EMAIL in your
              hosting environment and redeploy.
            </div>
          )}

          {CONTACT_EMAIL && page.title === "Support" && (
            <a className="fa-supportButton" href={CONTACT_HREF}>
              Email {CONTACT_LABEL}
            </a>
          )}

          {page.title === "Support" && <SupportAssistant />}

          <div className="fa-legalNote">
            This page is a practical MVP policy, not legal advice. Farely should get professional legal review before
            taking payments directly or signing direct travel-supplier contracts.
          </div>
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
  .fa-supportButton{ display:inline-flex; margin-top:14px; border-radius:14px; padding:12px 16px; background:#235fff; color:#fff; text-decoration:none; font-weight:1000; }
  .fa-supportAssistant{ margin-top:18px; border-top:1px solid rgba(10,20,70,.08); padding-top:18px; }
  .fa-supportAssistant h2{ margin:0; font-size:24px; letter-spacing:-.04em; }
  .fa-supportIntro{ margin:8px 0 12px; color:rgba(8,16,35,.64); font-size:14px; line-height:1.55; font-weight:750; }
  .fa-supportQuick{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
  .fa-supportQuick button{ border:1px solid rgba(10,20,70,.10); border-radius:999px; padding:9px 12px; background:#fff; color:rgba(8,16,35,.78); font-weight:900; cursor:pointer; }
  .fa-supportLabel{ display:block; margin:8px 0 6px; color:rgba(8,16,35,.64); font-size:12px; font-weight:1000; text-transform:uppercase; letter-spacing:.06em; }
  .fa-supportTextarea{ width:100%; min-height:96px; resize:vertical; border:1px solid rgba(10,20,70,.10); border-radius:14px; padding:12px; color:rgba(8,16,35,.86); font:inherit; font-weight:750; background:#fff; }
  .fa-supportActions{ display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px; }
  .fa-supportPrimary, .fa-supportSecondary{ border:0; border-radius:14px; padding:11px 14px; background:#235fff; color:#fff; text-decoration:none; font-weight:1000; cursor:pointer; }
  .fa-supportSecondary{ background:rgba(35,95,255,.10); color:#235fff; }
  .fa-supportMuted{ color:rgba(8,16,35,.54); font-size:12px; font-weight:850; }
  .fa-supportReply{ margin-top:12px; border-radius:16px; padding:14px; background:rgba(240,245,255,.95); color:rgba(8,16,35,.76); font-size:14px; line-height:1.55; font-weight:800; }
  .fa-footer{ padding:22px 18px 28px; color:rgba(8,16,35,.62); }
  .fa-footerInner{ width:min(980px, 100%); margin:0 auto; display:flex; align-items:flex-start; justify-content:space-between; gap:18px; border-top:1px solid rgba(10,20,70,.08); padding-top:18px; }
  .fa-footerInner strong{ display:block; color:rgba(8,16,35,.92); }
  .fa-footerInner span{ display:block; margin-top:4px; font-size:13px; font-weight:750; }
  .fa-footerLinks{ display:flex; flex-wrap:wrap; gap:12px; }
  .fa-footerLinks a{ color:#235fff; font-weight:900; text-decoration:none; font-size:13px; }
  .fa-footerDisclosure{ width:min(980px, 100%); margin:12px auto 0; font-size:12px; line-height:1.5; font-weight:750; }
  @media (max-width:680px){ .fa-footerInner{ flex-direction:column; } }
`;
