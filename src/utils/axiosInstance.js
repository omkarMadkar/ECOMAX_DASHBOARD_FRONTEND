import axios from "axios";

// =====================================================================
// 🚫 BACKEND DISCONNECTED — FOR VERCEL FRONTEND DEPLOYMENT ONLY
// To reconnect: uncomment the real baseURL and comment out the dummy one
// =====================================================================
const axiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001", // ← REAL (commented out)
  baseURL: "http://BACKEND_DISCONNECTED_FOR_VERCEL_DEPLOY", // ← DUMMY (remove when reconnecting)
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) { // ← COMMENTED OUT: no backend to trigger 401
    //   localStorage.removeItem("token");
    //   window.location.href = "/";
    // }
    return Promise.reject(error);
  }
);

export default axiosInstance;
