// import axios from "axios";

// // Create an Axios instance with TypeScript
// export const axiosInstance = axios.create({
//   baseURL: process.env.NODE_ENV === "development" ? "http://localhost:5001/api" : "/api",
//   withCredentials: true, // Ensure cookies are sent with requests
// });

// lib/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Adjust the base URL as needed
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;