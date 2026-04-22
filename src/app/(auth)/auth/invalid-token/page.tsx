import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvalidTokenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <XCircle className="mx-auto size-12 text-red-600" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-semibold tracking-normal">Lien invalide ou expire</h1>
        <p className="mt-3 text-muted-foreground">Vous pouvez demander un nouveau lien securise.</p>
        <Button asChild className="mt-6">
          <Link href="/auth/resend-confirmation">Renvoyer le lien</Link>
        </Button>
      </div>
    </main>
  );
}
