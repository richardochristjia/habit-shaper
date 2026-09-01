import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/auth-form";
import { getSession } from "@/lib/session";

export default async function SignInPage() {
  if (await getSession()) redirect("/app");
  return (
    <main className="auth-shell">
      <section className="brand-panel" aria-labelledby="brand-heading">
        <div className="brand-mark" aria-hidden="true">
          HS
        </div>
        <p className="eyebrow">Habit Shaper</p>
        <h1 id="brand-heading">Small days shape a meaningful life.</h1>
        <p>
          Keep a private record of the behaviours you want to build—and the ones
          you are ready to break.
        </p>
        <ul className="benefit-list">
          <li>Daily progress in your local time</li>
          <li>A record that belongs only to you</li>
          <li>Simple, intentional habit shaping</li>
        </ul>
      </section>
      <section className="auth-card" aria-labelledby="sign-in-heading">
        <p className="eyebrow">Welcome back</p>
        <h2 id="sign-in-heading">Sign in to your record</h2>
        <p className="muted">Continue shaping your days.</p>
        <AuthForm mode="sign-in" />
        <p className="auth-switch">
          New here? <Link href="/register">Create your private record</Link>
        </p>
      </section>
    </main>
  );
}
