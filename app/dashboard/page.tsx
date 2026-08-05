import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: scanCount }, { count: alertCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_active", true),
    ]);

  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user.user_metadata.full_name?.split(" ")[0] ||
    "Seller";

  return (
    <main className="dashboard-shell">
      <Sidebar />
      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Good evening, {firstName}.</h1>
            <p>Your production account and private workspace are active.</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="button button-secondary" type="submit">
              Sign out
            </button>
          </form>
        </header>

        {params.message ? (
          <div className="message message-success" style={{ marginTop: 18 }}>
            {params.message}
          </div>
        ) : null}

        <div className="dashboard-grid">
          <article className="metric-card"><span>Saved scans</span><strong>{scanCount ?? 0}</strong></article>
          <article className="metric-card"><span>Active alerts</span><strong>{alertCount ?? 0}</strong></article>
          <article className="metric-card"><span>Buy-list items</span><strong>0</strong></article>
          <article className="metric-card"><span>Account status</span><strong style={{ color: "#22c55e" }}>Ready</strong></article>
        </div>

        <section className="dashboard-panel">
          <h2>Production foundation status</h2>
          <div className="status-list">
            <div className="status-item"><span>Supabase authentication</span><span className="status status-ready">Ready</span></div>
            <div className="status-item"><span>Private PostgreSQL workspace</span><span className="status status-ready">Ready</span></div>
            <div className="status-item"><span>Row-level security</span><span className="status status-ready">Ready</span></div>
            <div className="status-item"><span>Amazon seller verification</span><span className="status status-pending">Waiting</span></div>
            <div className="status-item"><span>Amazon SP-API connection</span><span className="status status-pending">Next milestone</span></div>
          </div>
        </section>
      </section>
    </main>
  );
}
