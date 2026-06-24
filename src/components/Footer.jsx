export default function Footer() {
  return (
    <footer className="fa-footer">
      <div className="fa-footerInner">
        <div>
          <strong>Farely</strong>
          <span>Smart trip search. Compare ideas, then book with travel partners.</span>
        </div>

        <nav className="fa-footerLinks" aria-label="Legal links">
          <a href="/affiliate-disclosure">Affiliate Disclosure</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>

      <p className="fa-footerDisclosure">
        Farely may earn commission when you click or book through partner links. Prices and availability are provided by
        third parties and can change.
      </p>
    </footer>
  );
}
