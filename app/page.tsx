import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let user = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // The public page still renders before environment variables are configured.
  }

  return (
    <>
      <header className="site-header shell">
        <Link className="brand" href="/">
          <span className="brand-mark">FG</span>
          <span className="brand-copy">
            FlipGauge
            <span>An NHLabs product</span>
          </span>
        </Link>
        <div className="header-actions">
          {user ? (
            <Link className="button button-primary" href="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link className="button button-secondary" href="/login">
                Sign in
              </Link>
              <Link className="button button-primary" href="/signup">
                Create account
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="home-main shell">
        <section className="hero">
          <div style={{ zIndex: 2 }}>
            <span className="eyebrow">FLIPGAUGE PRODUCTION FOUNDATION</span>
            <h1>Source with confidence.</h1>
            <p>
              A secure account and database foundation for live Amazon seller
              intelligence, saved scans, alerts, and personalized sourcing rules.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={user ? "/dashboard" : "/signup"}>
                {user ? "Open dashboard" : "Start building your account"}
              </Link>
              <Link className="button button-secondary" href="/login">
                Sign in
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-sun" />
            <div className="hero-arc" />
            <div className="hero-line" />
          </div>
        </section>
      </main>
    </>
  );
}
