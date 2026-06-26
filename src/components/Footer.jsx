import { CONTACT_HREF, CONTACT_LABEL } from "../config/site";

export default function Footer() {
  return (
    <footer className="fa-footer">
      <div className="fa-footerInner">
        <div>
          <strong>Farely</strong>
          <span>Compare trip ideas and partner fares. Farely does not take booking payments directly.</span>
        </div>

        <nav className="fa-footerLinks" aria-label="Legal links">
          <a href={CONTACT_HREF}>{CONTACT_LABEL}</a>
          <a href="/support">Support</a>
          <a href="/affiliate-disclosure">Affiliate Disclosure</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>

      <p className="fa-footerDisclosure">
        Farely compares travel options for free. If you book with one of our trusted partners, we may earn a commission
        at no extra cost to you.
      </p>
    </footer>
  );
}
