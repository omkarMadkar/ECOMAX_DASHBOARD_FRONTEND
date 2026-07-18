import { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Validate token with backend / mock
          const res = await axiosInstance.get("/api/auth/me");
          if (res.data) {
            setUser(res.data);
          } else {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          // Token invalid — clear and redirect
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else if (storedUser) {
        // Fallback: no token but user object exists (legacy mock mode)
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      const userData = res.data;

      if (res.status === 200 && userData) {
        if (userData.token) {
          localStorage.setItem("token", userData.token);
        }
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return;
      }
    } catch (error) {
      // If the mock/backend returns 400, throw a clean message
      const msg =
        error?.response?.data?.message || "Invalid email or password";
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear mock DB caches so fresh data loads next session
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("mock_db_")) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
