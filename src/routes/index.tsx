import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

// Management Pages
import { IncomePage } from '../pages/management/IncomePage';
import { ExpensePage } from '../pages/management/ExpensePage';
import { SalaryPage } from '../pages/management/SalaryPage';
import { OfficeRentPage } from '../pages/management/OfficeRentPage';
import { TaDaPage } from '../pages/management/TaDaPage';
import { OthersPage } from '../pages/management/OthersPage';

// Service Pages
import { LabInPage } from '../pages/service/LabInPage';
import { LabOutPage } from '../pages/service/LabOutPage';

// Customer Corporate Pages
import { CorporateBillPage } from '../pages/customer/corporate/CorporateBillPage';
import { CorporateRequisitionPage } from '../pages/customer/corporate/CorporateRequisitionPage';
import { CorporateGatePassPage } from '../pages/customer/corporate/CorporateGatePassPage';

// Customer Non-Corporate Pages
import { NonCorporateRequisitionPage } from '../pages/customer/nonCorporate/NonCorporateRequisitionPage';
import { NonCorporateBillPage } from '../pages/customer/nonCorporate/NonCorporateBillPage';
import { NonCorporateGatePassPage } from '../pages/customer/nonCorporate/NonCorporateGatePassPage';

// Settings Pages
import { ProfileSettingsPage } from '../pages/settings/ProfileSettingsPage';
import { ChangePasswordPage } from '../pages/settings/ChangePasswordPage';
import { SystemSettingsPage } from '../pages/settings/SystemSettingsPage';
import { ProblemTemplatesPage } from '../pages/settings/ProblemTemplatesPage';
import { EmployeePage } from '../pages/employee/EmployeePage';
import { BillVoucherPrintPage } from '../pages/customer/BillVoucherPrintPage';
import { RequisitionPrintPage } from '../pages/customer/RequisitionPrintPage';
import { GatePassPrintPage } from '../pages/customer/GatePassPrintPage';
import { TaDaPrintPage } from '../pages/management/TaDaPrintPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes: Root redirects directly to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Standalone Printable Invoice Route (Opened in New Tab) */}
          <Route
            path="/billing/vouchers/:id/print"
            element={
              <ProtectedRoute>
                <BillVoucherPrintPage />
              </ProtectedRoute>
            }
          />

          {/* Standalone Printable Requisition Estimate Route (Opened in New Tab) */}
          <Route
            path="/billing/requisitions/:id/print"
            element={
              <ProtectedRoute>
                <RequisitionPrintPage />
              </ProtectedRoute>
            }
          />

          {/* Standalone Printable Gate Pass Route (Opened in New Tab) */}
          <Route
            path="/billing/gate-passes/:id/print"
            element={
              <ProtectedRoute>
                <GatePassPrintPage />
              </ProtectedRoute>
            }
          />

          {/* Standalone Printable TA/DA Claim Bill Route (Opened in New Tab) */}
          <Route
            path="/management/ta-da/:id/print"
            element={
              <ProtectedRoute>
                <TaDaPrintPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes rendered within DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Main Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Management Routes */}
            <Route path="/management/income" element={<IncomePage />} />
            <Route path="/management/expense" element={<ExpensePage />} />
            <Route path="/management/salary" element={<SalaryPage />} />
            <Route path="/management/office-rent" element={<OfficeRentPage />} />
            <Route path="/management/ta-da" element={<TaDaPage />} />
            <Route path="/management/others" element={<OthersPage />} />
            <Route path="/management" element={<Navigate to="/management/income" replace />} />

            {/* Service Routes */}
            <Route path="/service/lab-in" element={<LabInPage />} />
            <Route path="/service/lab-out" element={<LabOutPage />} />
            <Route path="/service" element={<Navigate to="/service/lab-in" replace />} />

            {/* Customer Corporate Routes */}
            <Route path="/customer/corporate/bill" element={<CorporateBillPage />} />
            <Route path="/customer/corporate/requisition" element={<CorporateRequisitionPage />} />
            <Route path="/customer/corporate/gate-pass" element={<CorporateGatePassPage />} />

            {/* Customer Non-Corporate Routes */}
            <Route path="/customer/non-corporate/requisition" element={<NonCorporateRequisitionPage />} />
            <Route path="/customer/non-corporate/bill" element={<NonCorporateBillPage />} />
            <Route path="/customer/non-corporate/gate-pass" element={<NonCorporateGatePassPage />} />

            <Route path="/customer/corporate" element={<Navigate to="/customer/corporate/bill" replace />} />
            <Route path="/customer/non-corporate" element={<Navigate to="/customer/non-corporate/requisition" replace />} />
            <Route path="/customer" element={<Navigate to="/customer/corporate/bill" replace />} />

            {/* Employee Management Routes */}
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/employee-management" element={<Navigate to="/employees" replace />} />

            {/* Settings Routes */}
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/settings/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings/system" element={<SystemSettingsPage />} />
            <Route path="/settings/problem-templates" element={<ProblemTemplatesPage />} />
            <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
