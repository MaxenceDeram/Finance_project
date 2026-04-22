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
    <AuthShell
      title="Connexion Waren"
      subtitle="Accedez a vos portefeuilles fictifs securises."
    >
      <LoginForm next={params.next} />
    </AuthShell>
  );
}
