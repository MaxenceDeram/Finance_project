"use client";

import { useActionState } from "react";
import {
  adminResendConfirmationAction,
  adminUpdateUserRoleAction,
  adminUpdateUserStatusAction
} from "@/features/admin/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";

export function AdminUserManagementForms({
  userId,
  userEmail,
  userRole,
  userStatus,
  emailVerified,
  actorRole,
  actorUserId
}: {
  userId: string;
  userEmail: string;
  userRole: "USER" | "ADMIN" | "OWNER";
  userStatus: "ACTIVE" | "SUSPENDED" | "DELETED";
  emailVerified: boolean;
  actorRole: "USER" | "ADMIN" | "OWNER";
  actorUserId: string;
}) {
  const [roleState, roleAction] = useActionState(
    adminUpdateUserRoleAction,
    initialActionState
  );
  const [statusState, statusAction] = useActionState(
    adminUpdateUserStatusAction,
    initialActionState
  );
  const [resendState, resendAction] = useActionState(
    adminResendConfirmationAction,
    initialActionState
  );

  const isSelf = actorUserId === userId;
  const canChangeRole = actorRole === "OWNER" && userRole !== "OWNER" && !isSelf;
  const canChangeStatus =
    !isSelf && userRole !== "OWNER" && (actorRole === "OWNER" || userRole === "USER");

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-border bg-[color:var(--surface)] p-4">
        <h3 className="font-semibold tracking-normal">Role</h3>
        {roleState.message ? <Alert className="mt-3">{roleState.message}</Alert> : null}
        <form action={roleAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="userId" value={userId} />
          <Select name="role" defaultValue={userRole} disabled={!canChangeRole}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <SubmitButton disabled={!canChangeRole} variant="outline">
            Mettre a jour
          </SubmitButton>
        </form>
        {!canChangeRole ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Seul le OWNER peut modifier les roles, hors compte OWNER et hors son propre
            compte.
          </p>
        ) : null}
      </div>

      <div className="rounded-md border border-border bg-[color:var(--surface)] p-4">
        <h3 className="font-semibold tracking-normal">Statut</h3>
        {statusState.message ? (
          <Alert className="mt-3">{statusState.message}</Alert>
        ) : null}
        <form action={statusAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="userId" value={userId} />
          <Select name="status" defaultValue={userStatus} disabled={!canChangeStatus}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </Select>
          <SubmitButton disabled={!canChangeStatus} variant="outline">
            Mettre a jour
          </SubmitButton>
        </form>
      </div>

      <div className="rounded-md border border-border bg-[color:var(--surface)] p-4">
        <h3 className="font-semibold tracking-normal">Confirmation email</h3>
        {resendState.message ? (
          <Alert className="mt-3">{resendState.message}</Alert>
        ) : null}
        <form action={resendAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="userId" value={userId} />
          <SubmitButton disabled={emailVerified} variant="outline">
            Renvoyer le lien
          </SubmitButton>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Destinataire: {userEmail}. En local sans SMTP, le lien est dans .dev-emails.log.
        </p>
      </div>
    </div>
  );
}
