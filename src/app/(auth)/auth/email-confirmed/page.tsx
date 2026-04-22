import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailConfirmedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-semibold tracking-normal">Email confirme</h1>
        <p className="mt-3 text-muted-foreground">Votre compte est pret.</p>
        <Button asChild className="mt-6">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </main>
  );
}
