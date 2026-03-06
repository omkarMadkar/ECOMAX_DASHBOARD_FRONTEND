import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardLayout from './pages/dashboard/DashboardLayout.jsx';
import SalesPage from './pages/sales/SalesPage.jsx';
import EnquiriesPage from './pages/sales/EnquiriesPage.jsx';
import QuotationsPage from './pages/sales/QuotationsPage.jsx';
import ProformaInvoicesPage from './pages/sales/ProformaInvoicesPage.jsx';
import SalesInvoicesPage from './pages/sales/SalesInvoicesPage.jsx';
import PurchaseOrdersPage from './pages/sales/PurchaseOrdersPage.jsx';
import WorkOrdersPage from './pages/sales/WorkOrdersPage.jsx';
import PreSalesMasterPage from './pages/sales/PreSalesMasterPage.jsx';
import LeadManagementPage from './pages/sales/LeadManagementPage.jsx';
import OpportunitiesPage from './pages/sales/OpportunitiesPage.jsx';
import AMCClientsPage from './pages/sales/AMCClientsPage.jsx';
import NonAMCPage from './pages/sales/NonAMCPage.jsx';
import VendorsPage from './pages/sales/VendorsPage.jsx';
import ServicePage from './pages/service/ServicePage.jsx';
import AdminPage from './pages/admin/AdminPage.jsx';
import DirectorDashboard from './pages/analytics/DirectorDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading Configuration...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'sales') return <Navigate to="/sales" />;
  if (user.role === 'service') return <Navigate to="/service" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/sales" replace />} />

      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DirectorDashboard />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/enquiries" element={<EnquiriesPage />} />
        <Route path="/sales/quotations" element={<QuotationsPage />} />
        <Route path="/sales/proforma" element={<ProformaInvoicesPage />} />
        <Route path="/sales/invoices" element={<SalesInvoicesPage />} />
        <Route path="/sales/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/sales/work-orders" element={<WorkOrdersPage />} />
        <Route path="/sales/presales" element={<PreSalesMasterPage />} />
        <Route path="/sales/leads" element={<LeadManagementPage />} />
        <Route path="/sales/opportunities" element={<OpportunitiesPage />} />
        <Route path="/sales/amc" element={<AMCClientsPage />} />
        <Route path="/sales/non-amc" element={<NonAMCPage />} />
        <Route path="/sales/vendors" element={<VendorsPage />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;