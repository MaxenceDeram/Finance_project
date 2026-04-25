import { NextResponse } from "next/server";
import { deleteUserAvatar } from "@/features/users/service";
import { getSafeErrorMessage } from "@/lib/errors";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin, getRequestMetadata } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";

export async function DELETE() {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    const requestMetadata = await getRequestMetadata();
    assertRateLimit({
      key: `avatar:remove:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    await deleteUserAvatar({
      userId: user.id,
      ipHash: requestMetadata.ipHash
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("avatar_delete_failed", error);
    return NextResponse.json(
      { message: getSafeErrorMessage(error, "Impossible de supprimer la photo de profil.") },
      { status: 400 }
    );
  }
}
