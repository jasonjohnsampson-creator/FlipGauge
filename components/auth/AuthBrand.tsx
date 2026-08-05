import Link from "next/link";

export function AuthBrand() {
  return (
    <section className="auth-brand">
      <Link className="brand" href="/">
        <span className="brand-mark">FG</span>
        <span className="brand-copy">
          FlipGauge
          <span>An NHLabs product</span>
        </span>
      </Link>
      <div>
        <span className="eyebrow">AMAZON SELLER INTELLIGENCE</span>
        <h1>Know the numbers before you buy.</h1>
        <p>
          Profit, ROI, fees, market signals, and decision support in one
          focused sourcing workspace.
        </p>
      </div>
      <small style={{ color: "#8fa2b8" }}>
        Building software that helps people make smarter decisions.
      </small>
    </section>
  );
}
