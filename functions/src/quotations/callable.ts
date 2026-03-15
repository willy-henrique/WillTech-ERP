import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const createQuotation = functions.https.onCall(async (data: { customerId: string; customerName: string; items: Array<{ productVariantId: string; quantity: number; unitPrice: number; totalPrice: number }>; validUntil?: string }, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  const { customerId, customerName, items, validUntil } = data ?? {};
  if (!customerId || !customerName || !items?.length) throw new functions.https.HttpsError('invalid-argument', 'customerId, customerName and items required');
  const totalAmount = items.reduce((s, i) => s + (i.totalPrice ?? i.unitPrice * i.quantity), 0);
  const ref = await db.collection('quotations').add({
    customerId,
    customerName,
    number: null,
    version: 1,
    status: 'draft',
    validUntil: validUntil || null,
    items,
    totalAmount,
    margin: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: context.auth.uid,
  });
  const numSnap = await db.collection('quotations').orderBy('createdAt', 'desc').limit(1).get();
  const nextNum = numSnap.empty ? 1 : ((numSnap.docs[0].data() as { number?: number }).number ?? 0) + 1;
  await ref.update({ number: nextNum });
  await db.collection('audit_logs').add({
    action: 'create',
    entityType: 'quotation',
    entityId: ref.id,
    userId: context.auth.uid,
    userEmail: context.auth.token.email ?? '',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: ref.id, number: nextNum };
});

export const approveQuotation = functions.https.onCall(async (data: { quotationId: string; reserveStock?: boolean }, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  const { quotationId } = data ?? {};
  if (!quotationId) throw new functions.https.HttpsError('invalid-argument', 'quotationId required');
  const ref = db.collection('quotations').doc(quotationId);
  await ref.update({
    status: 'approved',
    approvedBy: context.auth.uid,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection('audit_logs').add({
    action: 'approve',
    entityType: 'quotation',
    entityId: quotationId,
    userId: context.auth.uid,
    userEmail: context.auth.token.email ?? '',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});
