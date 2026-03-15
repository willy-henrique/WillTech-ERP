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
exports.completeProductionOrder = exports.reportConsumption = exports.createProductionOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.createProductionOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { orderId, productVariantId, quantity, productSnapshot } = data ?? {};
    if (!productVariantId || !quantity || quantity <= 0)
        throw new functions.https.HttpsError('invalid-argument', 'productVariantId and quantity required');
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
});
exports.reportConsumption = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { productionOrderId, materialId, quantityUsed, quantityPlanned, waste } = data ?? {};
    if (!productionOrderId || !materialId)
        throw new functions.https.HttpsError('invalid-argument', 'productionOrderId and materialId required');
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
});
exports.completeProductionOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { productionOrderId } = data ?? {};
    if (!productionOrderId)
        throw new functions.https.HttpsError('invalid-argument', 'productionOrderId required');
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
//# sourceMappingURL=callable.js.map