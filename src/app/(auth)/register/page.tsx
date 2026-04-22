import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Inscription"
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Creer un compte Waren"
      subtitle="Un lien de confirmation sera envoye avant l'activation de votre espace fictif."
    >
      <RegisterForm />
    </AuthShell>
  );
}
