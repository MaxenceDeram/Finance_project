import { Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const items = [
    {
      href: "/settings/email",
      title: "Rappels email",
      description: "Activer ou desactiver le recap des suivis et relances.",
      icon: Mail
    },
    {
      href: "/profile",
      title: "Profil",
      description: "Consulter les informations du compte.",
      icon: UserRound
    },
    {
      href: "/settings",
      title: "Securite",
      description: "Authentification, confirmation email et base prete pour aller plus loin.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Configuration
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">Parametres</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.title} href={item.href}>
            <Card className="h-full transition hover:border-ring">
              <CardContent className="p-5">
                <div className="flex size-10 items-center justify-center rounded-md border border-border/80 bg-[color:var(--surface)]">
                  <item.icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-4 font-semibold tracking-normal">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
