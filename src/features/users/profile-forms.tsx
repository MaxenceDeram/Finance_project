"use client";

import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  changePasswordAction,
  updateProfileEmailAction,
  updateProfileIdentityAction
} from "@/features/users/actions";
import { initialActionState } from "@/lib/errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/users/user-avatar";
import {
  isAllowedAvatarMimeType,
  MAX_AVATAR_FILE_SIZE_BYTES
} from "@/validation/avatar";

export function ProfileAvatarCard({
  currentAvatarUrl,
  currentDisplayName,
  currentEmail
}: {
  currentAvatarUrl?: string | null;
  currentDisplayName?: string | null;
  currentEmail: string;
}) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsUploading(true);

    try {
      if (!isAllowedAvatarMimeType(selectedFile.type)) {
        throw new Error("Formats autorises: JPG, PNG ou WebP.");
      }

      if (selectedFile.size > MAX_AVATAR_FILE_SIZE_BYTES) {
        throw new Error("L'image depasse 3 Mo.");
      }

      const uploadUrlResponse = await fetch("/api/profile/avatar/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error("Impossible de preparer l'upload.");
      }

      const upload = await uploadUrlResponse.json();

      const putResponse = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type
        },
        body: selectedFile
      });

      if (!putResponse.ok) {
        throw new Error("L'envoi vers le stockage securise a echoue.");
      }

      const completeResponse = await fetch("/api/profile/avatar/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          storageKey: upload.storageKey,
          contentType: selectedFile.type
        })
      });

      if (!completeResponse.ok) {
        throw new Error("Impossible de finaliser la photo de profil.");
      }

      setSelectedFile(null);
      setMessage("Photo de profil mise a jour.");
      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossible de mettre a jour la photo."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setMessage(null);

    if (selectedFile) {
      setSelectedFile(null);
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer la photo de profil.");
      }

      setMessage("Photo de profil supprimee.");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la photo."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo de profil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            avatarUrl={previewUrl || currentAvatarUrl}
            name={currentDisplayName}
            email={currentEmail}
            className="size-24 rounded-[28px] text-xl"
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Ajoutez une photo nette et legere
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Upload direct vers S3 via URL pre-signee. Formats: JPG, PNG, WebP. Taille
              max 3 Mo.
            </p>
          </div>
        </div>

        {message ? <Alert>{message}</Alert> : null}
        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-3">
          <Label htmlFor="avatarFile">Choisir une image</Label>
          <Input
            id="avatarFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setSelectedFile(nextFile);
              setError(null);
              setMessage(null);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
            <UploadCloud aria-hidden="true" />
            {isUploading ? "Envoi..." : "Televerser l'avatar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedFile(null)}
            disabled={!selectedFile}
          >
            <ImagePlus aria-hidden="true" />
            Reinitialiser la preview
          </Button>
          {(currentAvatarUrl || selectedFile) ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 aria-hidden="true" />
              {selectedFile ? "Annuler la nouvelle image" : "Supprimer la photo"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function UpdateProfileIdentityForm({
  currentDisplayName
}: {
  currentDisplayName?: string | null;
}) {
  const [state, action] = useActionState(updateProfileIdentityAction, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identite</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {state.message ? <Alert>{state.message}</Alert> : null}
          <div className="grid gap-2">
            <Label htmlFor="displayName">Nom affiche</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={currentDisplayName ?? ""}
              placeholder="Maxence Deram"
            />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Utilise dans l&apos;interface et pour personnaliser les emails de relance.
          </p>
          <SubmitButton>Enregistrer le profil</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

export function UpdateProfileEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action] = useActionState(updateProfileEmailAction, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier l&apos;email</CardTitle>
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
            Une nouvelle adresse doit etre confirmee par email avant de reutiliser votre
            espace prive.
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
