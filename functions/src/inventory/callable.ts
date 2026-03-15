import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const reserveStock = functions.https.onCall(
  async (data: { refType: string; refId: string; items: Array<{ materialIdOrVariantId: string; quantity: number }> }, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { refType, refId, items } = data ?? {};
    if (!refType || !refId || !items?.length) throw new functions.https.HttpsError('invalid-argument', 'refType, refId and items required');
    const batch = db.batch();
    for (const item of items) {
      const invRef = db.collection('inventory_items').doc(item.materialIdOrVariantId);
      const snap = await invRef.get();
      const current = snap.exists ? ((snap.data() as { reservedQuantity?: number }).reservedQuantity ?? 0) : 0;
      batch.set(invRef, { reservedQuantity: current + item.quantity, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    await batch.commit();
    await db.collection('audit_logs').add({
      action: 'reserve_stock',
      entityType: refType,
      entityId: refId,
      userId: context.auth.uid,
      changes: { items },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
);

export const recordMovement = functions.https.onCall(
  async (data: { type: 'in' | 'out' | 'transfer' | 'adjust'; refType?: string; refId?: string; itemId: string; quantity: number; reason?: string }, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { type, refType, refId, itemId, quantity, reason } = data ?? {};
    if (!type || !itemId || quantity === undefined) throw new functions.https.HttpsError('invalid-argument', 'type, itemId and quantity required');
    await db.collection('inventory_movements').add({
      type,
      refType: refType ?? 'manual',
      refId: refId ?? null,
      itemId,
      quantity,
      reason: reason ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    });
    const invRef = db.collection('inventory_items').doc(itemId);
    const snap = await invRef.get();
    const current = snap.exists ? ((snap.data() as { quantity?: number }).quantity ?? 0) : 0;
    const delta = type === 'in' || type === 'transfer' ? quantity : -quantity;
    await invRef.set({ quantity: current + delta, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    await db.collection('audit_logs').add({
      action: 'inventory_movement',
      entityType: 'inventory_movement',
      entityId: itemId,
      userId: context.auth.uid,
      reason: reason ?? undefined,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
);
