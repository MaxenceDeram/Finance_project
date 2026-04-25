import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { getSafeErrorMessage } from "@/lib/errors";
import { finalizeAvatarUpload } from "@/server/storage/avatar-storage";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { writeAuditLog } from "@/server/security/audit";
import { avatarUploadCompleteSchema } from "@/validation/avatar";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const requestMetadata = await getRequestMetadata();
    assertRateLimit({
      key: `avatar:complete:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    const payload = avatarUploadCompleteSchema.parse(await request.json());
    const updatedUser = await finalizeAvatarUpload({
      userId: user.id,
      storageKey: payload.storageKey,
      contentType: payload.contentType
    });

    await writeAuditLog({
      userId: user.id,
      action: AuditAction.PROFILE_AVATAR_UPDATED,
      metadata: { storageKey: payload.storageKey },
      ipHash: requestMetadata.ipHash
    });

    return NextResponse.json({
      ok: true,
      avatarUpdatedAt: updatedUser.avatarUpdatedAt
    });
  } catch (error) {
    console.error("avatar_complete_failed", error);
    return NextResponse.json(
      { message: getSafeErrorMessage(error, "Impossible de finaliser l'avatar.") },
      { status: 400 }
    );
  }
}
