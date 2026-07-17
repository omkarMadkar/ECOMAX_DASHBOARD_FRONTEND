import { createContext, useState, useEffect } from "react";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const users = [
      {
        email: "director@ecomax.com",
        password: "director123",
        role: "director",
        name: "Director",
      },
      {
        email: "admin@ecomax.com",
        password: "admin123",
        role: "admin",
        name: "Admin",
      },
      {
        email: "sales@ecomax.com",
        password: "sales123",
        role: "sales",
        name: "Sales",
      },
      {
        email: "service@ecomax.com",
        password: "service123",
        role: "service",
        name: "Service",
      },
    ];

    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
