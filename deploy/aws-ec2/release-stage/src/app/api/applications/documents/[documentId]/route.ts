import { AppError } from "@/lib/errors";
import { readApplicationDocumentForUser } from "@/features/applications/document-service";
import { getCurrentUser } from "@/server/security/sessions";

export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { documentId } = await context.params;

  try {
    const { document, content } = await readApplicationDocumentForUser(documentId, user.id);

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(content.byteLength),
        "Content-Disposition": `inline; filename="${encodeURIComponent(document.originalFilename)}"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const message =
      error instanceof AppError ? error.message : "Le document n'a pas pu etre charge.";

    return new Response(message, { status });
  }
}
