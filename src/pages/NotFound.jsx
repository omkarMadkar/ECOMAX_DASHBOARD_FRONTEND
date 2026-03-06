import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full flex flex-col items-center">
        <div className="p-4 bg-teal-50 rounded-full text-teal-600 mb-6">
           <FileQuestion className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-8">The requested system endpoint does not exist or has been relocated by the administrator.</p>
        
        <Link 
          to="/dashboard" 
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors w-full shadow-sm inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
