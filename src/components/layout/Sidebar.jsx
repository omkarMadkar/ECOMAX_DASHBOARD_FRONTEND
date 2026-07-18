import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { 
  Home, 
  HelpCircle, 
  FileText, 
  FileCheck, 
  FileSpreadsheet, 
  ShoppingCart, 
  ClipboardList, 
  Database,
  Users,
  Target,
  UserCheck,
  UserX,
  Truck,
  LogOut,
  BarChart3,
  Wrench,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based badge colors
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'director': return 'bg-purple-600';
      case 'admin': return 'bg-rose-500';
      case 'sales': return 'bg-[#2196f3]';
      case 'service': return 'bg-emerald-500';
      default: return 'bg-[#2196f3]';
    }
  };

  // Build navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'director':
        return [
          { name: 'Analytics Dashboard', path: '/dashboard', icon: BarChart3, badge: 0 },
          { name: 'Sales Overview', path: '/sales', icon: Home, badge: 0 },
          { name: 'Enquiries', path: '/sales/enquiries', icon: HelpCircle, badge: 7 },
          { name: 'Quotations', path: '/sales/quotations', icon: FileText, badge: 7 },
          { name: 'Proforma Invoices', path: '/sales/proforma', icon: FileCheck, badge: 7 },
          { name: 'Sales Invoices', path: '/sales/invoices', icon: FileSpreadsheet, badge: 7 },
          { name: 'Purchase Orders', path: '/sales/purchase-orders', icon: ShoppingCart, badge: 7 },
          { name: 'Work Orders', path: '/sales/work-orders', icon: ClipboardList, badge: 7 },
          { name: 'Service Queue', path: '/service', icon: Wrench, badge: 7 },
          { name: 'User Management', path: '/admin', icon: ShieldCheck, badge: 0 },
        ];

      case 'admin':
        return [
          { name: 'User Management', path: '/admin', icon: ShieldCheck, badge: 0 },
        ];

      case 'service':
        return [
          { name: 'Service Tickets', path: '/service', icon: Wrench, badge: 7 },
        ];

      case 'sales':
      default:
        return [
          { name: 'Dashboard', path: '/sales', icon: Home, badge: 0 },
          { name: 'Enquiries', path: '/sales/enquiries', icon: HelpCircle, badge: 7 },
          { name: 'Quotations', path: '/sales/quotations', icon: FileText, badge: 7 },
          { name: 'Proforma Invoices', path: '/sales/proforma', icon: FileCheck, badge: 7 },
          { name: 'Sales Invoices', path: '/sales/invoices', icon: FileSpreadsheet, badge: 7 },
          { name: 'Purchase Orders', path: '/sales/purchase-orders', icon: ShoppingCart, badge: 7 },
          { name: 'Work Orders', path: '/sales/work-orders', icon: ClipboardList, badge: 7 },
          { name: 'Pre-sales Master', path: '/sales/presales', icon: Database, badge: 7 },
          { name: 'Lead Management', path: '/sales/leads', icon: Users, badge: 7 },
          { name: 'Opportunities', path: '/sales/opportunities', icon: Target, badge: 7 },
          { name: 'AMC Clients', path: '/sales/amc', icon: UserCheck, badge: 7 },
          { name: 'Non-AMC', path: '/sales/non-amc', icon: UserX, badge: 7 },
          { name: 'Vendors', path: '/sales/vendors', icon: Truck, badge: 7 },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="w-[260px] bg-[#0e1726] flex flex-col h-full z-10 transition-all duration-300">
      {/* Brand */}
      <div className="pt-8 pb-6 px-6">
        <h1 className="text-[26px] font-black text-white tracking-wide">
          ECOMAX <span className="text-[#00d0e6]">360</span>
        </h1>
        <div className={`inline-block ${getRoleBadgeColor(user?.role)} text-white text-[10px] font-bold px-3 py-0.5 rounded-full mt-1 tracking-widest uppercase`}>
          {user?.role || 'GUEST'}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1.5 custom-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg text-[13px] font-bold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-transparent text-[#00d0e6] relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#00d0e6] before:rounded-r-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-[18px] h-[18px]" />
                {link.name}
              </div>
              {link.badge > 0 && (
                <span className="bg-[#e7515a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Log Out */}
      <div className="p-4 bg-[#0e1726] border-t border-white/5 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default Sidebar;
