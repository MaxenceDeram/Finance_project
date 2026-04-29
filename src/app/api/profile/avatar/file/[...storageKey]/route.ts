import { NextResponse } from "next/server";
import { AppError, getSafeErrorMessage } from "@/lib/errors";
import {
  isLocalAvatarStorageKey,
  readLocalAvatarFile
} from "@/server/storage/avatar-storage";
import { requireUser } from "@/server/security/sessions";

export async function GET(
  _request: Request,
  context: { params: Promise<{ storageKey: string[] }> }
) {
  const user = await requireUser();
  const { storageKey: storageKeyParts } = await context.params;
  const storageKey = storageKeyParts.map(decodeURIComponent).join("/");

  try {
    if (
      !isLocalAvatarStorageKey(storageKey) ||
      user.avatarStorageKey !== storageKey
    ) {
      throw new AppError("NOT_FOUND", "Avatar introuvable.", 404);
    }

    const content = await readLocalAvatarFile(storageKey);

    return new Response(content, {
      headers: {
        "Content-Type": user.avatarMimeType ?? "application/octet-stream",
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (error) {
    const message = getSafeErrorMessage(error, "Avatar introuvable.");
    return NextResponse.json({ message }, { status: 404 });
  }
}
