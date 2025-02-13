// import axios from "axios";

// // Create an Axios instance with TypeScript
// export const axiosInstance = axios.create({
//   baseURL: process.env.NODE_ENV === "development" ? "http://localhost:5001/api" : "/api",
//   withCredentials: true, // Ensure cookies are sent with requests
// });

// lib/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? "https://chatapp-r2c3.onrender.com/api" : "https://452dcdfb-45d4-413e-a5e8-39706dd532ac.us-east-1.cloud.genez.io/api",});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;
