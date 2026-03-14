import { Quotation, Order } from '../types';

export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'ORC-2026-001',
    customerId: '1',
    customerName: 'Agro Industrial Vale do Sol',
    date: '2026-03-10',
    validUntil: '2026-03-25',
    totalAmount: 12500.00,
    status: 'sent',
    margin: 18.5,
    items: [
      { id: '1', productId: '1', productName: 'Saco Ráfia Convencional 50x70', quantity: 10000, unitPrice: 1.25, totalPrice: 12500.00 }
    ]
  },
  {
    id: 'ORC-2026-002',
    customerId: '2',
    customerName: 'Cooperativa Agrícola Regional',
    date: '2026-03-12',
    validUntil: '2026-03-27',
    totalAmount: 5250.00,
    status: 'approved',
    margin: 15.0,
    items: [
      { id: '2', productId: '2', productName: 'Saco Ráfia Laminado 60x90', quantity: 2500, unitPrice: 2.10, totalPrice: 5250.00 }
    ]
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'PED-2026-001',
    quotationId: 'ORC-2026-002',
    customerId: '2',
    customerName: 'Cooperativa Agrícola Regional',
    date: '2026-03-12',
    deliveryDate: '2026-03-25',
    totalAmount: 5250.00,
    status: 'production',
    items: [
      { id: '2', productId: '2', productName: 'Saco Ráfia Laminado 60x90', quantity: 2500, unitPrice: 2.10, totalPrice: 5250.00 }
    ]
  }
];
