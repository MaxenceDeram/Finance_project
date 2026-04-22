import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell title="Connexion securisee" subtitle="Connectez-vous pour acceder a vos simulations.">
      <LoginForm next={params.next} />
    </AuthShell>
  );
}
