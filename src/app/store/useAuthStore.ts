import { create } from "zustand";
import toast from "react-hot-toast";
import { Socket} from "socket.io-client"; // Combined imports
import { AuthStore } from "../types/chat"; // Ensure this is correctly imported
import axios from "axios"; // Import axios
import axiosInstance from "../lib/axios";
import io from "socket.io-client"; // Import Socket.IO client

const BASE_URL =
  process.env.PORT || (process.env.NODE_ENV === "development" ? "http://localhost:5001" : "/");

export const useAuthStore = create<AuthStore>((set, get) => {
  let storedToken: string | null = null;
  let storedUser: any = null;

  if (typeof window !== "undefined") {
    storedToken = localStorage.getItem("authToken");
    storedUser = localStorage.getItem("authUser");
  }

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
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token found");

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });

        get().connectSocket(); // Connect Socket.IO after successful authentication
      } catch (error) {
        console.error("Error in checkAuth:", axios.isAxiosError(error) ? error.response?.data?.message : error);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    signup: async (data: { fullName: string; email: string; password: string }) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", res.data.token);
          localStorage.setItem("authUser", JSON.stringify(res.data));
        }
        set({ authUser: res.data, token: res.data.token });
        toast.success("Account created successfully");
        get().connectSocket();
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.response?.data?.message || "Signup failed" : "An unexpected error occurred");
      } finally {
        set({ isSigningUp: false });
      }
    },

    login: async (data: { email: string; password: string } | string) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", res.data.token);
          localStorage.setItem("authUser", JSON.stringify(res.data));
        }
        set({ authUser: res.data, token: res.data.token });
        toast.success("Logged in successfully");
        get().connectSocket();
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.response?.data?.message || "Login failed" : "An unexpected error occurred");
      } finally {
        set({ isLoggingIn: false });
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post("/auth/logout");
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
        }
        set({ authUser: null, token: null });
        toast.success("Logged out successfully");
        get().disconnectSocket();
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.response?.data?.message || "Logout failed" : "An unexpected error occurred");
      }
    },

    updateProfile: async (data: { profilePic?: string }) => {
      set({ isUpdatingProfile: true });
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        if (typeof window !== "undefined") {
          localStorage.setItem("authUser", JSON.stringify(res.data));
        }
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error(axios.isAxiosError(error) ? error.response?.data?.message || "Profile update failed" : "An unexpected error occurred");
      } finally {
        set({ isUpdatingProfile: false });
      }
    },

    connectSocket: () => {
      const { authUser, socket } = get();
      if (!authUser || socket?.connected) return;

      const newSocket = io(BASE_URL, {
        query: { userId: authUser._id, token: typeof window !== "undefined" ? localStorage.getItem("authToken") : "" },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected successfully");
        set({ socket: newSocket }); // Set socket after successful connection
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        set({ socket: null });
      });

      newSocket.on("getOnlineUsers", (userIds: string[]) => {
        console.log("Online Users:", userIds);
        set({ onlineUsers: userIds });
      });

      newSocket.connect();
    },

    disconnectSocket: () => {
      const socket = get().socket;
      if (socket?.connected) socket.disconnect();
      set({ socket: null });
    },
  };
});
