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
      <section className="hidden bg-[#111827] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em]">
          PAPER INVEST
        </Link>
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.18em] text-white/60">
            Simulation uniquement
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-normal">
            Construisez votre discipline d'investisseur sans capital reel.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70">
            Portefeuilles fictifs, ordres simules, snapshots quotidiens et emails de synthese
            dans une base securisee et extensible.
          </p>
        </div>
        <p className="text-xs leading-6 text-white/50">
          Aucun ordre reel. Aucun conseil financier. Aucun service de courtage.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-sm font-semibold tracking-[0.16em] text-muted-foreground">
              PAPER INVEST
            </Link>
            <h1 className="mt-6 text-3xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
