import type { Metadata } from "next";
import Link from "next/link";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { requestPasswordReset } from "./actions";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({
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
          <h2>Reset your password</h2>
          <p>We will send a secure recovery link to your email.</p>
          <AuthMessage error={params.error} success={params.message} />
          <form className="form" action={requestPasswordReset}>
            <label className="field">
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <button className="button button-primary button-block" type="submit">
              Send recovery link
            </button>
          </form>
          <p style={{ marginTop: 22 }}>
            <Link className="text-link" href="/login">Return to sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
