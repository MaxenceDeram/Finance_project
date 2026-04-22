import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmEmailToken } from "@/features/auth/service";
import { Button } from "@/components/ui/button";

export default async function ConfirmEmailPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (!params.token) {
    return <InvalidToken />;
  }

  try {
    await confirmEmailToken(params.token);
  } catch {
    return <InvalidToken />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-semibold tracking-normal">Email confirme</h1>
        <p className="mt-3 text-muted-foreground">
          Votre compte est actif. Vous pouvez maintenant vous connecter.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Se connecter</Link>
        </Button>
      </div>
    </main>
  );
}

function InvalidToken() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <XCircle className="mx-auto size-12 text-red-600" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-semibold tracking-normal">Lien invalide ou expire</h1>
        <p className="mt-3 text-muted-foreground">
          Demandez un nouveau lien si votre compte n'a pas encore ete confirme.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/auth/resend-confirmation">Renvoyer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Connexion</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
