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
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading Configuration...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'sales') return <Navigate to="/sales" replace />;
  if (user.role === 'service') return <Navigate to="/service" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'director') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardRedirect />} />

      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<PrivateRoute roles={['director']}><DirectorDashboard /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute roles={['sales', 'director']}><SalesPage /></PrivateRoute>} />
        <Route path="/sales/enquiries" element={<PrivateRoute roles={['sales', 'director']}><EnquiriesPage /></PrivateRoute>} />
        <Route path="/sales/quotations" element={<PrivateRoute roles={['sales', 'director']}><QuotationsPage /></PrivateRoute>} />
        <Route path="/sales/proforma" element={<PrivateRoute roles={['sales', 'director']}><ProformaInvoicesPage /></PrivateRoute>} />
        <Route path="/sales/invoices" element={<PrivateRoute roles={['sales', 'director']}><SalesInvoicesPage /></PrivateRoute>} />
        <Route path="/sales/purchase-orders" element={<PrivateRoute roles={['sales', 'director']}><PurchaseOrdersPage /></PrivateRoute>} />
        <Route path="/sales/work-orders" element={<PrivateRoute roles={['sales', 'director']}><WorkOrdersPage /></PrivateRoute>} />
        <Route path="/sales/presales" element={<PrivateRoute roles={['sales', 'director']}><PreSalesMasterPage /></PrivateRoute>} />
        <Route path="/sales/leads" element={<PrivateRoute roles={['sales', 'director']}><LeadManagementPage /></PrivateRoute>} />
        <Route path="/sales/opportunities" element={<PrivateRoute roles={['sales', 'director']}><OpportunitiesPage /></PrivateRoute>} />
        <Route path="/sales/amc" element={<PrivateRoute roles={['sales', 'director']}><AMCClientsPage /></PrivateRoute>} />
        <Route path="/sales/non-amc" element={<PrivateRoute roles={['sales', 'director']}><NonAMCPage /></PrivateRoute>} />
        <Route path="/sales/vendors" element={<PrivateRoute roles={['sales', 'director']}><VendorsPage /></PrivateRoute>} />
        <Route path="/service" element={<PrivateRoute roles={['service', 'director']}><ServicePage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['admin', 'director']}><AdminPage /></PrivateRoute>} />
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