import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Budy — Make room for what matters",
  description:
    "Turn study materials into a clear daily plan. Track progress and adapt your schedule.",
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
