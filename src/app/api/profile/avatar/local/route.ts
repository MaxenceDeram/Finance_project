import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { getSafeErrorMessage } from "@/lib/errors";
import { storeLocalAvatarUpload } from "@/server/storage/avatar-storage";
import { writeAuditLog } from "@/server/security/audit";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const requestMetadata = await getRequestMetadata();
    assertRateLimit({
      key: `avatar:local-upload:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Aucun fichier valide n'a ete envoye." },
        { status: 400 }
      );
    }

    const updatedUser = await storeLocalAvatarUpload({
      userId: user.id,
      file
    });

    await writeAuditLog({
      userId: user.id,
      action: AuditAction.PROFILE_AVATAR_UPDATED,
      metadata: { storageKey: updatedUser.avatarStorageKey, provider: "LOCAL" },
      ipHash: requestMetadata.ipHash
    });

    return NextResponse.json({
      ok: true,
      avatarUpdatedAt: updatedUser.avatarUpdatedAt
    });
  } catch (error) {
    console.error("avatar_local_upload_failed", error);
    return NextResponse.json(
      { message: getSafeErrorMessage(error, "Impossible d'enregistrer l'avatar.") },
      { status: 400 }
    );
  }
}
