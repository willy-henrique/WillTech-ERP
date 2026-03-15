"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.convertQuotationToOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.convertQuotationToOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { quotationId, deliveryDate } = data ?? {};
    if (!quotationId)
        throw new functions.https.HttpsError('invalid-argument', 'quotationId required');
    const qSnap = await db.collection('quotations').doc(quotationId).get();
    if (!qSnap.exists)
        throw new functions.https.HttpsError('not-found', 'Quotation not found');
    const q = qSnap.data();
    if (q.status !== 'approved')
        throw new functions.https.HttpsError('failed-precondition', 'Quotation must be approved');
    const orderRef = await db.collection('orders').add({
        quotationId,
        customerId: q.customerId,
        customerName: q.customerName,
        number: null,
        status: 'pending',
        deliveryDate: deliveryDate || null,
        items: q.items ?? [],
        totalAmount: q.totalAmount ?? 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: context.auth.uid,
    });
    const numSnap = await db.collection('orders').orderBy('createdAt', 'desc').limit(1).get();
    const nextNum = numSnap.empty ? 1 : (numSnap.docs[0].data().number ?? 0) + 1;
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
exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { customerId, customerName, items, deliveryDate } = data ?? {};
    if (!customerId || !customerName || !items?.length)
        throw new functions.https.HttpsError('invalid-argument', 'customerId, customerName and items required');
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
    const nextNum = numSnap.empty ? 1 : (numSnap.docs[0].data().number ?? 0) + 1;
    await orderRef.update({ number: nextNum });
    return { id: orderRef.id, number: nextNum };
});
//# sourceMappingURL=callable.js.map