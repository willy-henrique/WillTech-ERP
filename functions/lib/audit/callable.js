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
exports.queryAuditLogs = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.queryAuditLogs = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    let q = db.collection('audit_logs').orderBy('timestamp', 'desc');
    if (data?.entityType)
        q = q.where('entityType', '==', data.entityType);
    if (data?.entityId)
        q = q.where('entityId', '==', data.entityId);
    if (data?.userId)
        q = q.where('userId', '==', data.userId);
    if (data?.startDate)
        q = q.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(new Date(data.startDate)));
    if (data?.endDate)
        q = q.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(new Date(data.endDate)));
    const limit = Math.min(data?.limit ?? 100, 500);
    const snap = await q.limit(limit).get();
    return snap.docs.map((d) => {
        const x = d.data();
        return { id: d.id, ...x, timestamp: x.timestamp?.toMillis?.() ?? x.timestamp };
    });
});
//# sourceMappingURL=callable.js.map