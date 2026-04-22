"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Erreur
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Une erreur est survenue</h1>
        <p className="mt-3 text-muted-foreground">
          L'action n'a pas pu aboutir. Les details techniques ne sont pas exposes cote client.
        </p>
        <Button className="mt-6" onClick={reset}>
          Reessayer
        </Button>
      </div>
    </main>
  );
}
