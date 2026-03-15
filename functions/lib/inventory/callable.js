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
exports.recordMovement = exports.reserveStock = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.reserveStock = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { refType, refId, items } = data ?? {};
    if (!refType || !refId || !items?.length)
        throw new functions.https.HttpsError('invalid-argument', 'refType, refId and items required');
    const batch = db.batch();
    for (const item of items) {
        const invRef = db.collection('inventory_items').doc(item.materialIdOrVariantId);
        const snap = await invRef.get();
        const current = snap.exists ? (snap.data().reservedQuantity ?? 0) : 0;
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
});
exports.recordMovement = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { type, refType, refId, itemId, quantity, reason } = data ?? {};
    if (!type || !itemId || quantity === undefined)
        throw new functions.https.HttpsError('invalid-argument', 'type, itemId and quantity required');
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
    const current = snap.exists ? (snap.data().quantity ?? 0) : 0;
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
});
//# sourceMappingURL=callable.js.map