import { createContext, useState, useEffect } from 'react';
// import axiosInstance from '../utils/axiosInstance'; // ← COMMENTED OUT: no backend for Vercel deploy

export const AuthContext = createContext();

// =====================================================================
// 🚫 BACKEND DISCONNECTED — MOCK AUTH FOR VERCEL FRONTEND DEPLOYMENT
// To reconnect: uncomment axiosInstance import & real login/checkUser logic
//               and remove the MOCK USER block below
// =====================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- MOCK USER (replace with real API call when reconnecting) ---
    setUser({ name: 'Demo User', role: 'sales', email: 'demo@ecomax.com' });
    setLoading(false);
    // --- END MOCK USER ---

    // const checkUser = async () => {   // ← REAL auth check (commented out)
    //   const token = localStorage.getItem('token');
    //   if (token) {
    //     try {
    //       const res = await axiosInstance.get('/api/auth/me');
    //       setUser(res.data);
    //     } catch (error) {
    //       localStorage.removeItem('token');
    //     }
    //   }
    //   setLoading(false);
    // };
    // checkUser();
  }, []);

  const login = async (email, password) => {   // eslint-disable-line no-unused-vars
    // --- MOCK LOGIN (no backend) ---
    setUser({ name: 'Demo User', role: 'sales', email });
    // --- REAL login (commented out) ---
    // const res = await axiosInstance.post('/api/auth/login', { email, password });
    // localStorage.setItem('token', res.data.token);
    // setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
