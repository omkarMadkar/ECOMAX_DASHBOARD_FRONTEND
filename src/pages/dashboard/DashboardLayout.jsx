import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar.jsx';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#f4f7fe] overflow-hidden font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
             <Outlet />
          </div>
          <footer className="mt-12 mb-4 text-center text-sm text-slate-500 font-medium flex items-center justify-center gap-4">
            <p>© 2026 CALYONIX TECHNOLOGIES. All rights reserved.</p>
            <a href="mailto:support@calyonix.com" className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              support@calyonix.com
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
