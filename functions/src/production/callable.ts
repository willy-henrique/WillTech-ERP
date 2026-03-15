import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const createProductionOrder = functions.https.onCall(
  async (data: { orderId: string; orderItemIds?: string[]; productVariantId: string; quantity: number; productSnapshot?: Record<string, unknown> }, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { orderId, productVariantId, quantity, productSnapshot } = data ?? {};
    if (!productVariantId || !quantity || quantity <= 0) throw new functions.https.HttpsError('invalid-argument', 'productVariantId and quantity required');
    const ref = await db.collection('production_orders').add({
      orderId: orderId || null,
      orderItemIds: data?.orderItemIds ?? [],
      productVariantId,
      productSnapshot: productSnapshot ?? {},
      quantity,
      status: 'open',
      actualConsumption: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    });
    await db.collection('audit_logs').add({
      action: 'create',
      entityType: 'production_order',
      entityId: ref.id,
      userId: context.auth.uid,
      userEmail: context.auth.token.email ?? '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: ref.id };
  }
);

export const reportConsumption = functions.https.onCall(
  async (data: { productionOrderId: string; materialId: string; quantityUsed: number; quantityPlanned?: number; waste?: number }, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { productionOrderId, materialId, quantityUsed, quantityPlanned, waste } = data ?? {};
    if (!productionOrderId || !materialId) throw new functions.https.HttpsError('invalid-argument', 'productionOrderId and materialId required');
    await db.collection('production_orders').doc(productionOrderId).collection('production_consumptions').add({
      materialId,
      quantityPlanned: quantityPlanned ?? 0,
      quantityUsed: quantityUsed ?? 0,
      waste: waste ?? 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    });
    const opRef = db.collection('production_orders').doc(productionOrderId);
    await opRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
);

export const completeProductionOrder = functions.https.onCall(async (data: { productionOrderId: string }, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  const { productionOrderId } = data ?? {};
  if (!productionOrderId) throw new functions.https.HttpsError('invalid-argument', 'productionOrderId required');
  await db.collection('production_orders').doc(productionOrderId).update({
    status: 'completed',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection('audit_logs').add({
    action: 'complete',
    entityType: 'production_order',
    entityId: productionOrderId,
    userId: context.auth.uid,
    userEmail: context.auth.token.email ?? '',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});
