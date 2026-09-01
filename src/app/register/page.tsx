import { redirect } from "next/navigation";
import { AuthPage } from "@/features/auth/auth-page";
import { getSession } from "@/lib/session";

export default async function RegisterPage() {
  if (await getSession()) redirect("/app");

  return (
    <AuthPage
      mode="register"
      brand={{
        heading: "Begin with one honest day.",
        description:
          "Your record stays private. Your browser time zone keeps every Tracking Day grounded where you are.",
        support: (
          <div className="mt-7 hidden max-w-note rounded-panel border border-border bg-surface/70 p-5 min-[481px]:block">
            <strong className="block">Private by design</strong>
            <span className="mt-1 block text-muted-foreground">
              Only your authenticated session can access your record.
            </span>
          </div>
        ),
      }}
      form={{
        eyebrow: "Start shaping",
        heading: "Create your record",
        description: "No profile or display name—just your email and password.",
        switchPrompt: "Already registered?",
        switchHref: "/sign-in",
        switchLabel: "Sign in",
      }}
    />
  );
}
