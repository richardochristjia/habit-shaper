import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Shaper",
  description: "Build desired behaviours and leave unwanted ones behind.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
