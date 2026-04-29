import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function writeAuditLog(input: {
  userId?: string | null;
  action: AuditAction;
  metadata?: Prisma.InputJsonValue;
  ipHash?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        metadata: input.metadata,
        ipHash: input.ipHash ?? null
      }
    });
  } catch (error) {
    console.error("audit_log_write_failed", error);
  }
}
