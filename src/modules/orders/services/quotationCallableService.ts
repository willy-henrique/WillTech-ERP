import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';

export interface CreateQuotationInput {
  customerId: string;
  customerName: string;
  items: Array<{ productVariantId?: string; productId?: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }>;
  validUntil?: string;
}

export async function createQuotationCallable(data: CreateQuotationInput): Promise<{ id: string; number: number }> {
  const fn = httpsCallable<CreateQuotationInput, { id: string; number: number }>(functions, 'createQuotation');
  const res = await fn(data);
  return res.data;
}

export async function approveQuotationCallable(quotationId: string): Promise<{ success: boolean }> {
  const fn = httpsCallable<{ quotationId: string }, { success: boolean }>(functions, 'approveQuotation');
  const res = await fn({ quotationId });
  return res.data;
}

export async function convertQuotationToOrderCallable(quotationId: string, deliveryDate?: string): Promise<{ id: string; number: number }> {
  const fn = httpsCallable<{ quotationId: string; deliveryDate?: string }, { id: string; number: number }>(functions, 'convertQuotationToOrder');
  const res = await fn({ quotationId, deliveryDate });
  return res.data;
}
