import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { ResendConfirmationForm } from "@/features/auth/resend-confirmation-form";
import { Alert } from "@/components/ui/alert";

export default async function ResendConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Confirmation Waren"
      subtitle="Validez votre email pour activer votre espace de suivi."
    >
      <div className="space-y-5">
        {params.sent ? (
          <Alert>
            Si l'adresse est eligible, un nouveau lien de confirmation vient d'etre envoye.
          </Alert>
        ) : null}
        <ResendConfirmationForm email={params.email} />
        <p className="text-center text-sm text-muted-foreground">
          Email deja confirme ?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
