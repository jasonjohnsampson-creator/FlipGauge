import type { Metadata } from "next";
import Link from "next/link";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { signIn } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-layout">
      <AuthBrand />
      <section className="auth-panel">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to your FlipGauge workspace.</p>
          <AuthMessage error={params.error} success={params.message} />
          <form className="form" action={signIn}>
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <label className="field">
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <div className="form-row">
              <Link className="text-link" href="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <button className="button button-primary button-block" type="submit">
              Sign in
            </button>
          </form>
          <p className="muted" style={{ marginTop: 22 }}>
            New to FlipGauge?{" "}
            <Link className="text-link" href="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
