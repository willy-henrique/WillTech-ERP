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
exports.getActivePricingParameters = exports.calculatePrice = void 0;
const functions = __importStar(require("firebase-functions"));
const engine_1 = require("./engine");
exports.calculatePrice = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { productVariantId, rawParams, quantity, overrides } = data ?? {};
    const qty = quantity ?? rawParams?.quantity ?? 0;
    if (!qty || qty <= 0)
        throw new functions.https.HttpsError('invalid-argument', 'quantity is required and must be positive');
    if (!productVariantId && !rawParams)
        throw new functions.https.HttpsError('invalid-argument', 'productVariantId or rawParams required');
    return (0, engine_1.calculatePrice)({ productVariantId, rawParams, quantity: qty, overrides }, context.auth.uid);
});
exports.getActivePricingParameters = functions.https.onCall(async (_data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
    const snap = await admin.firestore().collection('pricing_parameters').orderBy('validFrom', 'desc').limit(1).get();
    if (snap.empty)
        return null;
    const doc = snap.docs[0];
    const d = doc.data();
    return {
        id: doc.id,
        ...d,
        validFrom: typeof d.validFrom?.toMillis === 'function' ? d.validFrom.toMillis() : d.validFrom,
    };
});
//# sourceMappingURL=callable.js.map