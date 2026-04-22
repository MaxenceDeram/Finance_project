import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Waren",
    template: "%s | Waren"
  },
  description:
    "Waren est une plateforme personnelle premium de simulation d'investissement avec argent fictif."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
