import { connectToDatabase } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";

export async function auditLog(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  before: unknown = null,
  after: unknown = null,
) {
  await connectToDatabase();
  await AuditLog.create({ actorId, action, entity, entityId, before, after });
}
