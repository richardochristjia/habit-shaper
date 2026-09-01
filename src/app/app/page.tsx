import { signOutAction } from "@/features/auth/actions";
import { requireSession } from "@/lib/session";

export default async function ApplicationPage() {
  const session = await requireSession();
  return (
    <main className="application-shell">
      <header className="app-header">
        <a className="wordmark" href="/app" aria-label="Habit Shaper home">
          <span className="brand-mark small" aria-hidden="true">
            HS
          </span>
          Habit Shaper
        </a>
        <form action={signOutAction}>
          <button className="button button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <section className="welcome-card" aria-labelledby="welcome-heading">
        <p className="eyebrow">Your private record</p>
        <h1 id="welcome-heading">Welcome to Habit Shaper.</h1>
        <p>
          You are securely signed in as <strong>{session.user.email}</strong>.
        </p>
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <title>Calendar check</title>
              <path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 9 2 2 4-5" />
            </svg>
          </div>
          <div>
            <h2>Your foundation is ready</h2>
            <p>
              Habits and daily tracking arrive in the next slice. Your
              authenticated, database-backed record is active.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
