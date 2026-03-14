/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { CustomerListPage } from './modules/customers/pages/CustomerListPage';
import { CustomerDetailPage } from './modules/customers/pages/CustomerDetailPage';
import { ProductListPage } from './modules/products/pages/ProductListPage';
import { ProductDetailPage } from './modules/products/pages/ProductDetailPage';
import { PricingPage } from './modules/pricing/pages/PricingPage';
import { QuotationListPage } from './modules/orders/pages/QuotationListPage';
import { OrderListPage } from './modules/orders/pages/OrderListPage';
import { ProductionPage } from './modules/production/pages/ProductionPage';
import { InventoryPage } from './modules/inventory/pages/InventoryPage';
import { FinancePage } from './modules/finance/pages/FinancePage';
import { MaterialsPage } from './modules/pricing/pages/MaterialsPage';
import { ReportsPage } from './modules/reports/pages/ReportsPage';
import { SettingsPage } from './modules/settings/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="quotations" element={<QuotationListPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="production" element={<ProductionPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
