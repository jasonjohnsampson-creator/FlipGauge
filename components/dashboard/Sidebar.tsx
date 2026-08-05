import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">
        <span className="brand-mark">FG</span>
        <span className="brand-copy">
          FlipGauge
          <span style={{ color: "#91a3b8" }}>An NHLabs product</span>
        </span>
      </Link>
      <nav>
        <Link className="active" href="/dashboard">Dashboard</Link>
        <Link href="/dashboard">Scan product</Link>
        <Link href="/dashboard">History</Link>
        <Link href="/dashboard">Buy lists</Link>
        <Link href="/dashboard">Alerts</Link>
        <Link href="/dashboard">Settings</Link>
      </nav>
    </aside>
  );
}
