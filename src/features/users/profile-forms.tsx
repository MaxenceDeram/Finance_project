"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileEmailAction } from "@/features/users/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdateProfileEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action] = useActionState(updateProfileEmailAction, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier l'email</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <div className="grid gap-2">
            <Label htmlFor="email">Nouvel email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={currentEmail}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="emailCurrentPassword">Mot de passe actuel</Label>
            <Input
              id="emailCurrentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Une nouvelle adresse doit etre confirmee par email avant de reutiliser
            l'espace prive.
          </p>
          <SubmitButton>Demander la modification Waren</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier le mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmation</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Apres modification, toutes les sessions sont fermees et une reconnexion est
            demandee.
          </p>
          <SubmitButton>Changer le mot de passe</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
