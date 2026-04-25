import { NextResponse } from "next/server";
import { getSafeErrorMessage } from "@/lib/errors";
import { createAvatarUpload } from "@/server/storage/avatar-storage";
import { assertRateLimit } from "@/server/security/rate-limit";
import { assertSameOrigin } from "@/server/security/request";
import { requireUser } from "@/server/security/sessions";
import { avatarUploadRequestSchema } from "@/validation/avatar";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    await assertSameOrigin();
    assertRateLimit({
      key: `avatar:upload-url:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000
    });

    const payload = avatarUploadRequestSchema.parse(await request.json());
    const upload = await createAvatarUpload({
      userId: user.id,
      filename: payload.filename,
      contentType: payload.contentType,
      size: payload.size
    });

    return NextResponse.json(upload);
  } catch (error) {
    console.error("avatar_upload_url_failed", error);
    return NextResponse.json(
      { message: getSafeErrorMessage(error, "Impossible de preparer l'upload de l'avatar.") },
      { status: 400 }
    );
  }
}
