import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/server/security/sessions";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}
