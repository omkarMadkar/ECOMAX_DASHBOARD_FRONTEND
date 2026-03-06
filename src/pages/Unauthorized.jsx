import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-red-100 max-w-sm w-full flex flex-col items-center">
        <div className="p-4 bg-red-50 rounded-full text-red-600 mb-6">
           <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">401</h1>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-8">Your systemic organizational role does not contain the mandatory security clearances to access this operational sector.</p>
        
        <Link 
          to="/dashboard" 
          className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition-colors w-full shadow-sm inline-block"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
