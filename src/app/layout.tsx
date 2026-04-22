import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "Paper Invest Premium",
    template: "%s | Paper Invest Premium"
  },
  description:
    "Plateforme personnelle de simulation d'investissement avec argent fictif."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
