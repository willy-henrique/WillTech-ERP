import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

export { calculatePrice, getActivePricingParameters } from './pricing/callable';
export { setUserRole, createEmployee, ensureAdminClaim } from './auth/callable';
export { createQuotation, approveQuotation } from './quotations/callable';
export { convertQuotationToOrder, createOrder } from './orders/callable';
export { createProductionOrder, reportConsumption, completeProductionOrder } from './production/callable';
export { reserveStock, recordMovement } from './inventory/callable';
export { queryAuditLogs } from './audit/callable';
