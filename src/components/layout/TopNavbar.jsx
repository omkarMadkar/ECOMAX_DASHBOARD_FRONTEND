import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Bell, Search, UserCircle } from 'lucide-react';

const TopNavbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
      {/* Left section: Search or Breadcrumbs placeholder */}
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
             <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right section: Profile & Notifications */}
      <div className="flex items-center gap-5">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-teal-600 transition-colors">
              {user?.name || 'Loading'}
            </p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">
              {user?.role || ''}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex justify-center items-center shadow-inner text-white">
             {/* Uses the initial of user's name */}
            <span className="font-bold text-sm tracking-widest">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
