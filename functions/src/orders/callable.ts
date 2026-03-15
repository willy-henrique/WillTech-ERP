import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const convertQuotationToOrder = functions.https.onCall(async (data: { quotationId: string; deliveryDate?: string }, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  const { quotationId, deliveryDate } = data ?? {};
  if (!quotationId) throw new functions.https.HttpsError('invalid-argument', 'quotationId required');
  const qSnap = await db.collection('quotations').doc(quotationId).get();
  if (!qSnap.exists) throw new functions.https.HttpsError('not-found', 'Quotation not found');
  const q = qSnap.data()!;
  if ((q as { status: string }).status !== 'approved') throw new functions.https.HttpsError('failed-precondition', 'Quotation must be approved');
  const orderRef = await db.collection('orders').add({
    quotationId,
    customerId: (q as { customerId: string }).customerId,
    customerName: (q as { customerName: string }).customerName,
    number: null,
    status: 'pending',
    deliveryDate: deliveryDate || null,
    items: (q as { items: unknown[] }).items ?? [],
    totalAmount: (q as { totalAmount: number }).totalAmount ?? 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: context.auth.uid,
  });
  const numSnap = await db.collection('orders').orderBy('createdAt', 'desc').limit(1).get();
  const nextNum = numSnap.empty ? 1 : ((numSnap.docs[0].data() as { number?: number }).number ?? 0) + 1;
  await orderRef.update({ number: nextNum });
  await db.collection('quotations').doc(quotationId).update({ status: 'converted', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  await db.collection('audit_logs').add({
    action: 'convert_to_order',
    entityType: 'order',
    entityId: orderRef.id,
    userId: context.auth.uid,
    userEmail: context.auth.token.email ?? '',
    changes: { quotationId },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: orderRef.id, number: nextNum };
});

export const createOrder = functions.https.onCall(
  async (data: { customerId: string; customerName: string; items: Array<{ productVariantId: string; quantity: number; unitPrice: number; totalPrice: number }>; deliveryDate?: string }, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { customerId, customerName, items, deliveryDate } = data ?? {};
    if (!customerId || !customerName || !items?.length) throw new functions.https.HttpsError('invalid-argument', 'customerId, customerName and items required');
    const totalAmount = items.reduce((s, i) => s + (i.totalPrice ?? i.unitPrice * i.quantity), 0);
    const orderRef = await db.collection('orders').add({
      customerId,
      customerName,
      number: null,
      status: 'pending',
      deliveryDate: deliveryDate || null,
      items,
      totalAmount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid,
    });
    const numSnap = await db.collection('orders').orderBy('createdAt', 'desc').limit(1).get();
    const nextNum = numSnap.empty ? 1 : ((numSnap.docs[0].data() as { number?: number }).number ?? 0) + 1;
    await orderRef.update({ number: nextNum });
    return { id: orderRef.id, number: nextNum };
  }
);
