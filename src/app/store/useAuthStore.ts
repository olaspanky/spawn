import { create } from "zustand";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client"; // Ensure this is correctly imported
import { AuthStore } from "../types/chat"; // Ensure this is correctly imported
import io from "socket.io-client";
import axios from "axios"; // Import axios
import axiosInstance from "../lib/axios";

const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create<AuthStore>((set, get) => {
  const storedToken = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("authUser");

  return {
    authUser: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
      set({ isCheckingAuth: true });
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token found");
    
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
        const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });
    
        get().connectSocket(); // Connect Socket.IO after successful authentication
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error in checkAuth:", error.response?.data?.message || error.message);
        } else if (error instanceof Error) {
          console.error("Error in checkAuth:", error.message);
        } else {
          console.error("An unknown error occurred in checkAuth:", error);
        }
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },
    signup: async (data: { fullName: string; email: string; password: string }) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data, token: res.data.token });
        toast.success("Account created successfully");
        get().connectSocket();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Signup failed");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        set({ isSigningUp: false });
      }
    },

    login: async (data: { email: string; password: string } | string) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data, token: res.data.token });
        toast.success("Logged in successfully");
        get().connectSocket();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Login failed");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        set({ isLoggingIn: false });
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post("/auth/logout");
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        set({ authUser: null, token: null });
        toast.success("Logged out successfully");
        get().disconnectSocket();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Logout failed");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    },

    updateProfile: async (data: { profilePic?: string }) => {
      set({ isUpdatingProfile: true });
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Profile update failed");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        set({ isUpdatingProfile: false });
      }
    },

    connectSocket: () => {
      const { authUser } = get();
      if (!authUser || get().socket?.connected) return;
    
      const socket = io(BASE_URL, {
        query: { userId: authUser._id, token: localStorage.getItem("authToken") },
      });
    
      socket.on("connect", () => {
        console.log("Socket connected successfully");
        set({ socket }); // Only set after successful connection
      });
    
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        set({ socket: null });
      });
    
      // Listen for online users
      socket.on("getOnlineUsers", (userIds: string[]) => {
        console.log("Online Users:", userIds);
        set({ onlineUsers: userIds });
      });
    
      socket.connect();
    },
    

    disconnectSocket: () => {
      if (get().socket?.connected) get().socket.disconnect();
    },
  };
});