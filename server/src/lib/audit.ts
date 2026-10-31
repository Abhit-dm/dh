import type { Prisma } from '@/generated/prisma/client';

export async function recordAudit(
  transaction: Prisma.TransactionClient,
  input: {
    actorId: string;
    action: string;
    resource: string;
    resourceId?: string;
    fields?: string[];
  },
) {
  await transaction.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: input.fields ? { fields: input.fields } : undefined,
    },
  });
}
