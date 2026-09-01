import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/auth-form";
import { getSession } from "@/lib/session";

export default async function RegisterPage() {
  if (await getSession()) redirect("/app");
  return (
    <main className="auth-shell">
      <section className="brand-panel" aria-labelledby="brand-heading">
        <div className="brand-mark" aria-hidden="true">
          HS
        </div>
        <p className="eyebrow">Habit Shaper</p>
        <h1 id="brand-heading">Begin with one honest day.</h1>
        <p>
          Your record stays private. Your browser time zone keeps every Tracking
          Day grounded where you are.
        </p>
        <div className="privacy-note">
          <strong>Private by design</strong>
          <span>Only your authenticated session can access your record.</span>
        </div>
      </section>
      <section className="auth-card" aria-labelledby="register-heading">
        <p className="eyebrow">Start shaping</p>
        <h2 id="register-heading">Create your record</h2>
        <p className="muted">
          No profile or display name—just your email and password.
        </p>
        <AuthForm mode="register" />
        <p className="auth-switch">
          Already registered? <Link href="/sign-in">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
