import { AppShell } from "@/components/layout/app-shell";
import { getUserPresentation } from "@/features/users/service";
import { requireUser } from "@/server/security/sessions";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const presentation = await getUserPresentation(user);

  return (
    <AppShell
      userEmail={user.email}
      userDisplayName={presentation.displayName}
      userAvatarUrl={presentation.avatarUrl}
      userRole={user.role}
    >
      {children}
    </AppShell>
  );
}
