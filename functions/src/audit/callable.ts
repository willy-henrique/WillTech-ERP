import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const queryAuditLogs = functions.https.onCall(
  async (
    data: { entityType?: string; entityId?: string; userId?: string; startDate?: string; endDate?: string; limit?: number },
    context
  ) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    let q: admin.firestore.Query = db.collection('audit_logs').orderBy('timestamp', 'desc');
    if (data?.entityType) q = q.where('entityType', '==', data.entityType);
    if (data?.entityId) q = q.where('entityId', '==', data.entityId);
    if (data?.userId) q = q.where('userId', '==', data.userId);
    if (data?.startDate) q = q.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(new Date(data.startDate)));
    if (data?.endDate) q = q.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(new Date(data.endDate)));
    const limit = Math.min(data?.limit ?? 100, 500);
    const snap = await q.limit(limit).get();
    return snap.docs.map((d) => {
      const x = d.data();
      return { id: d.id, ...x, timestamp: x.timestamp?.toMillis?.() ?? x.timestamp };
    });
  }
);
