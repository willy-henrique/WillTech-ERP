import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';

export interface CalculatePriceRawParams {
  width: number;
  length: number;
  grammage: number;
  materialType: 'laminado' | 'convencional';
  printType: 'liso' | 'frente' | 'frente_verso';
  quantity: number;
}

export interface PricingResultCloud {
  unitCost: number;
  unitPrice: number;
  totalPrice: number;
  totalCost: number;
  taxAmount: number;
  marginAmount: number;
  steps: Array<{ name: string; output: number }>;
  rawMaterialCost?: number;
  printingCost?: number;
  cuttingCost?: number;
  lineCost?: number;
}

export async function calculatePriceFromParams(params: CalculatePriceRawParams): Promise<PricingResultCloud> {
  const fn = httpsCallable<{ rawParams: CalculatePriceRawParams }, PricingResultCloud>(functions, 'calculatePrice');
  const res = await fn({ rawParams: params });
  return res.data;
}

export async function calculatePriceFromVariant(productVariantId: string, quantity: number, overrides?: { manualPrice?: number; reason?: string }): Promise<PricingResultCloud> {
  const fn = httpsCallable<{ productVariantId: string; quantity: number; overrides?: typeof overrides }, PricingResultCloud>(functions, 'calculatePrice');
  const res = await fn({ productVariantId, quantity, overrides });
  return res.data;
}
