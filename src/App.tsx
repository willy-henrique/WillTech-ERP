/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { CustomerListPage } from './modules/customers/pages/CustomerListPage';
import { CustomerDetailPage } from './modules/customers/pages/CustomerDetailPage';
import { ProductListPage } from './modules/products/pages/ProductListPage';
import { ProductDetailPage } from './modules/products/pages/ProductDetailPage';
import { PricingPage } from './modules/pricing/pages/PricingPage';
import { PricingTablePage } from './modules/pricing/pages/PricingTablePage';
import { OrderListPage } from './modules/orders/pages/OrderListPage';
import { InventoryPage } from './modules/inventory/pages/InventoryPage';
import { FinancePage } from './modules/finance/pages/FinancePage';
import { MaterialsPage } from './modules/pricing/pages/MaterialsPage';
import { SettingsPage } from './modules/settings/pages/SettingsPage';
import { PricingConfigPage } from './modules/settings/pages/PricingConfigPage';
import { AdminRoute } from './components/auth/AdminRoute';
import { ModuleRoute } from './components/auth/ModuleRoute';
import { AdminUsersPage } from './modules/admin/pages/AdminUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ModuleRoute moduleId="dashboard"><DashboardPage /></ModuleRoute>} />
            <Route path="customers" element={<ModuleRoute moduleId="customers"><CustomerListPage /></ModuleRoute>} />
            <Route path="customers/:id" element={<ModuleRoute moduleId="customers"><CustomerDetailPage /></ModuleRoute>} />
            <Route path="products" element={<ModuleRoute moduleId="products"><ProductListPage /></ModuleRoute>} />
            <Route path="products/:id" element={<ModuleRoute moduleId="products"><ProductDetailPage /></ModuleRoute>} />
            <Route path="materials" element={<ModuleRoute moduleId="materials"><MaterialsPage /></ModuleRoute>} />
            <Route path="pricing" element={<ModuleRoute moduleId="pricing"><PricingPage /></ModuleRoute>} />
            <Route path="pricing/table" element={<ModuleRoute moduleId="pricing-table"><PricingTablePage /></ModuleRoute>} />
            <Route path="configurar-precos" element={<ModuleRoute moduleId="configurar-precos"><PricingConfigPage /></ModuleRoute>} />
            <Route path="orders" element={<ModuleRoute moduleId="orders"><OrderListPage /></ModuleRoute>} />
            <Route path="inventory" element={<ModuleRoute moduleId="inventory"><InventoryPage /></ModuleRoute>} />
            <Route path="finance" element={<ModuleRoute moduleId="finance"><FinancePage /></ModuleRoute>} />
            <Route path="settings" element={<ModuleRoute moduleId="settings"><SettingsPage /></ModuleRoute>} />
            <Route path="admin" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
