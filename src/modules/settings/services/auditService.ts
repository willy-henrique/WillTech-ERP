import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  userEmail?: string;
  changes?: Record<string, unknown>;
  reason?: string;
  timestamp: number | string;
}

export async function queryAuditLogs(params: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  const fn = httpsCallable<typeof params, AuditLogEntry[]>(functions, 'queryAuditLogs');
  const res = await fn(params);
  return res.data ?? [];
}
