import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="auth-orb absolute left-[-4rem] top-16 size-72 rounded-full bg-[#dfe3ff]" />
        <div className="auth-orb absolute right-[-2rem] top-12 size-80 rounded-full bg-[#d8e9ff] [animation-delay:2s]" />
        <div className="auth-orb absolute bottom-[-5rem] left-[22%] size-96 rounded-full bg-[#ece6ff] [animation-delay:4s]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl overflow-hidden rounded-[36px] border border-white/60 bg-white/70 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <section className="auth-gradient-panel relative hidden w-[48%] overflow-hidden px-10 py-10 text-white lg:flex lg:flex-col">
          <div className="auth-grid-overlay absolute inset-0 opacity-60" />
          <div className="auth-line absolute left-[-10%] top-[18%] h-px w-[72%] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="auth-line absolute left-[8%] top-[42%] h-px w-[58%] bg-gradient-to-r from-transparent via-[#a5b4ff]/70 to-transparent [animation-delay:2s]" />
          <div className="auth-line absolute bottom-[22%] left-[-6%] h-px w-[78%] bg-gradient-to-r from-transparent via-white/30 to-transparent [animation-delay:4s]" />
          <div className="auth-pulse-dot absolute left-[70%] top-[24%] size-2 rounded-full bg-[#a5b4ff]" />
          <div className="auth-pulse-dot absolute bottom-[28%] left-[38%] size-2 rounded-full bg-white [animation-delay:1.4s]" />

          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-semibold tracking-normal"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-white/12 text-sm font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]">
                W
              </span>
              Waren
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              Workspace premium
              <Sparkles className="size-3.5" aria-hidden="true" />
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/75">
              Suivi de candidatures
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-normal">
              Suivez vos candidatures dans une interface calme, premium et nette.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
              Centralisez chaque opportunite, contact recruteur, etape d&apos;entretien et
              prochaine relance dans un environnement elegant, securise et concentre.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: CheckCircle2,
                  title: "Pipeline clair",
                  body: "Statuts, prochaines actions et decisions reunis au meme endroit."
                },
                {
                  icon: Clock3,
                  title: "Relances",
                  body: "Identifiez vite ce qui merite votre attention cette semaine."
                },
                {
                  icon: Sparkles,
                  title: "Experience",
                  body: "Un produit que l&apos;on peut vraiment avoir envie d&apos;ouvrir tous les jours."
                }
              ].map(({ icon: Icon, title: cardTitle, body }) => (
                <div
                  key={cardTitle}
                  className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                >
                  <div className="inline-flex size-9 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-sm font-semibold">{cardTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10 grid grid-cols-3 gap-4">
            {[
              ["Dashboard", "Relances, entretiens et offres"],
              ["Candidatures", "Chaque role bien organise"],
              ["Documents", "CV et lettre par opportunite"]
            ].map(([label, body]) => (
              <div
                key={label}
                className="rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4 text-sm text-white/72"
              >
                <p className="font-semibold text-white">{label}</p>
                <p className="mt-1 leading-6">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,rgba(248,250,255,0.78),rgba(255,255,255,0.96))] px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <Link href="/" className="text-lg font-semibold tracking-normal lg:hidden">
              Waren
            </Link>

            <div className="mt-4 rounded-[30px] border border-white/70 bg-white/96 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-9">
              <p className="text-sm font-medium text-[#4f46e5]">Espace candidatures</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>

              <div className="mt-8">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
