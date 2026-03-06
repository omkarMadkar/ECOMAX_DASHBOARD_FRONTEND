import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      if (user.role === 'sales') navigate('/sales');
      else if (user.role === 'service') navigate('/service');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      // navigation handled by useEffect upon user change
    } catch (err) {
       setErrorMsg('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 via-slate-800 to-teal-600 flex items-center justify-center p-4">
      {/* Centered White Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center bg-slate-50 border-b border-slate-100">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ECOMAX 360</h1>
          <p className="text-sm font-medium text-teal-600 mt-1 uppercase tracking-widest">
            powered by CALYONIX
          </p>
        </div>

        {/* Tabs Section */}
        <div className="flex border-b border-slate-200">
          {['sales', 'service', 'admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 ${
                activeTab === tab 
                  ? 'bg-white text-slate-800 border-b-2 border-teal-500' 
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border-b-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow font-medium"
                placeholder="Ex. demo@calyonix.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 flex justify-center items-center"
            >
              ACCESS DASHBOARD
            </button>
          </form>
        </div>

        {/* Footer / Demo Credentials */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Demo Credentials
          </h3>
          <div className="text-sm font-medium text-slate-600 space-y-2">
            <p><span className="text-teal-600">Admin:</span> admin@ecomax.com / admin123</p>
            <p><span className="text-teal-600">Sales:</span> sales@ecomax.com / sales123</p>
            <p><span className="text-teal-600">Service:</span> service@ecomax.com / service123</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
