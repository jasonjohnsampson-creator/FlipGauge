import type { Metadata } from "next";
import Link from "next/link";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { signUp } from "./actions";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-layout">
      <AuthBrand />
      <section className="auth-panel">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p>Your scans and settings will be protected by your sign-in.</p>
          <AuthMessage error={params.error} success={params.message} />
          <form className="form" action={signUp}>
            <label className="field">
              Full name
              <input name="fullName" autoComplete="name" required />
            </label>
            <label className="field">
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              Password
              <input name="password" type="password" autoComplete="new-password" required />
            </label>
            <small className="muted">
              Use 10+ characters with uppercase, lowercase, and a number.
            </small>
            <button className="button button-primary button-block" type="submit">
              Create account
            </button>
          </form>
          <p className="muted" style={{ marginTop: 22 }}>
            Already registered?{" "}
            <Link className="text-link" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
