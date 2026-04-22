import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Waren
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          La ressource demandee n'existe pas ou n'est pas accessible avec votre compte.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Retour a Waren</Link>
        </Button>
      </div>
    </main>
  );
}
