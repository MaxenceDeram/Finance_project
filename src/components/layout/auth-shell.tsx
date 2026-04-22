import Link from "next/link";

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
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[#11110f] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-xl font-semibold tracking-normal">
          Waren
        </Link>
        <div className="max-w-xl">
          <p className="text-sm font-medium text-white/60">
            Simulation d'investissement premium
          </p>
          <h1 className="mt-5 max-w-lg text-5xl font-semibold tracking-normal">
            Une salle de marche personnelle, sans argent reel.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Portefeuilles fictifs, ordres simules, snapshots quotidiens et emails de
            synthese dans une experience sobre, lisible et securisee.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {["Auth securisee", "Capital fictif", "Suivi quotidien"].map((item) => (
              <div
                key={item}
                className="rounded-md border border-white/10 bg-white/[0.04] p-3"
              >
                <p className="text-xs font-medium leading-5 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs leading-6 text-white/50">
          Aucun ordre reel. Aucun conseil financier. Aucun service de courtage.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-xl font-semibold tracking-normal">
              Waren
            </Link>
            <h1 className="mt-8 text-3xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
