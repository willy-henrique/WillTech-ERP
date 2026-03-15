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
exports.approveQuotation = exports.createQuotation = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.createQuotation = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { customerId, customerName, items, validUntil } = data ?? {};
    if (!customerId || !customerName || !items?.length)
        throw new functions.https.HttpsError('invalid-argument', 'customerId, customerName and items required');
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
    const nextNum = numSnap.empty ? 1 : (numSnap.docs[0].data().number ?? 0) + 1;
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
exports.approveQuotation = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { quotationId } = data ?? {};
    if (!quotationId)
        throw new functions.https.HttpsError('invalid-argument', 'quotationId required');
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
//# sourceMappingURL=callable.js.map