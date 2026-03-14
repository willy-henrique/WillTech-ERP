export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted';
  margin: number;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  date: string;
  deliveryDate: string;
  totalAmount: number;
  status: 'pending' | 'production' | 'shipped' | 'delivered' | 'cancelled';
  items: QuotationItem[];
}
