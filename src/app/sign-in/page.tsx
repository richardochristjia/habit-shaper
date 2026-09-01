import { redirect } from "next/navigation";
import { AuthPage } from "@/features/auth/auth-page";
import { getSession } from "@/lib/session";

const benefits = [
  "Daily progress in your local time",
  "A record that belongs only to you",
  "Simple, intentional habit shaping",
];

export default async function SignInPage() {
  if (await getSession()) redirect("/app");

  return (
    <AuthPage
      mode="sign-in"
      brand={{
        heading: "Small days shape a meaningful life.",
        description:
          "Keep a private record of the behaviours you want to build—and the ones you are ready to break.",
        support: (
          <ul className="mt-6 hidden list-none gap-3 p-0 sm:grid">
            {benefits.map((benefit) => (
              <li
                className="flex items-center gap-3 before:size-2.5 before:rounded-full before:border-3 before:border-accent before:content-['']"
                key={benefit}
              >
                {benefit}
              </li>
            ))}
          </ul>
        ),
      }}
      form={{
        eyebrow: "Welcome back",
        heading: "Sign in to your record",
        description: "Continue shaping your days.",
        switchPrompt: "New here?",
        switchHref: "/register",
        switchLabel: "Create your private record",
      }}
    />
  );
}
