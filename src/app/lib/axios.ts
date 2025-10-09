
// import axios from "axios";

// const axiosInstance = axios.create({
//   // baseURL: process.env.NODE_ENV === "development" ? "https://chatapp-jwtsecret.up.railway.app/api" : "https://452dcdfb-45d4-413e-a5e8-39706dd532ac.us-east-1.cloud.genez.io/api",});
//   baseURL: process.env.NODE_ENV === "development" ? "api" : "http://localhost:5173/api",});

// // Add a request interceptor to include the token
// axiosInstance.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

// export default axiosInstance;


import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "https://spawnback.vercel.app/api" // Express backend
      : "https://spawnback.vercel.app/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // For cookies if needed
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Sending token in Authorization header:", token);
    } else {
      console.log("No token found in localStorage for request");
    }
  }
  return config;
});

export default axiosInstance;