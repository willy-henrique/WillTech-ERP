import * as functions from 'firebase-functions';
import { calculatePrice as runPricingEngine } from './engine';

export const calculatePrice = functions.https.onCall(
  async (
    data: {
      productVariantId?: string;
      rawParams?: { width: number; length: number; grammage: number; materialType: 'laminado' | 'convencional'; printType: 'liso' | 'frente' | 'frente_verso'; quantity: number };
      quantity?: number;
      overrides?: { manualPrice?: number; reason?: string };
    },
    context
  ) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    const { productVariantId, rawParams, quantity, overrides } = data ?? {};
    const qty = quantity ?? rawParams?.quantity ?? 0;
    if (!qty || qty <= 0)
      throw new functions.https.HttpsError('invalid-argument', 'quantity is required and must be positive');
    if (!productVariantId && !rawParams)
      throw new functions.https.HttpsError('invalid-argument', 'productVariantId or rawParams required');
    return runPricingEngine({ productVariantId, rawParams, quantity: qty, overrides }, context.auth.uid);
  }
);

export const getActivePricingParameters = functions.https.onCall(async (_data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  const admin = await import('firebase-admin');
  const snap = await admin.firestore().collection('pricing_parameters').orderBy('validFrom', 'desc').limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const d = doc.data();
  return {
    id: doc.id,
    ...d,
    validFrom: typeof d.validFrom?.toMillis === 'function' ? d.validFrom.toMillis() : d.validFrom,
  };
});
