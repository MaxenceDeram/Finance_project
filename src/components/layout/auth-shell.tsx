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
      <section className="waren-auth-grid relative hidden overflow-hidden bg-[#090a09] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="waren-flow-line absolute left-[-10%] top-[18%] h-px w-[70%] bg-gradient-to-r from-transparent via-[#32d46b]/60 to-transparent" />
          <div className="waren-flow-line absolute left-[5%] top-[44%] h-px w-[55%] bg-gradient-to-r from-transparent via-white/35 to-transparent [animation-delay:2s]" />
          <div className="waren-flow-line absolute bottom-[22%] left-[-5%] h-px w-[78%] bg-gradient-to-r from-transparent via-[#32d46b]/45 to-transparent [animation-delay:4s]" />
          <div className="waren-pulse-dot absolute left-[68%] top-[28%] size-2 rounded-full bg-[#32d46b]" />
          <div className="waren-pulse-dot absolute bottom-[32%] left-[38%] size-2 rounded-full bg-white [animation-delay:1.5s]" />
          <svg
            className="absolute bottom-24 left-8 h-52 w-[calc(100%-4rem)] opacity-35"
            viewBox="0 0 760 220"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 162 C68 162 72 122 126 122 C188 122 180 74 238 74 C296 74 300 138 358 138 C430 138 406 42 480 42 C548 42 540 102 604 102 C664 102 690 58 760 58"
              stroke="#32d46b"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M0 188 C80 188 96 168 156 168 C220 168 244 104 304 104 C360 104 380 154 434 154 C504 154 512 92 582 92 C650 92 688 118 760 118"
              stroke="white"
              strokeOpacity="0.25"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <Link href="/" className="relative z-10 text-xl font-semibold tracking-normal">
          Waren
        </Link>
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-medium text-[#32d46b]">
            Simulation d'investissement live
          </p>
          <h1 className="mt-5 max-w-lg text-5xl font-semibold tracking-normal">
            Un cockpit de marché personnel, sans argent réel.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Portefeuilles fictifs, ordres simulés, données de marché connectées et veille
            financière dans une expérience sobre, lisible et sécurisée.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {["Auth sécurisée", "Prix live", "Suivi quotidien"].map((item) => (
              <div
                key={item}
                className="rounded-md border border-white/10 bg-white/[0.04] p-3 backdrop-blur"
              >
                <p className="text-xs font-medium leading-5 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs leading-6 text-white/50">
          Aucun ordre réel. Aucun conseil financier. Aucun service de courtage.
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
