import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

export const metadata: Metadata = { title: "Choose new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Open a valid password recovery link first."));
  }

  return (
    <main className="auth-layout">
      <AuthBrand />
      <section className="auth-panel">
        <div className="auth-card">
          <h2>Choose a new password</h2>
          <p>Use a strong password you do not reuse elsewhere.</p>
          <AuthMessage error={params.error} />
          <form className="form" action={updatePassword}>
            <label className="field">
              New password
              <input name="password" type="password" autoComplete="new-password" required />
            </label>
            <button className="button button-primary button-block" type="submit">
              Update password
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
