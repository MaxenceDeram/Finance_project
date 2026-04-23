import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Waren",
    template: "%s | Waren"
  },
  description:
    "Waren est un espace personnel moderne pour suivre vos candidatures, relances, entretiens et offres."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
