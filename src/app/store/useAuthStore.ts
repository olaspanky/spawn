

import io from "socket.io-client"; // Import Socket.IO client
import { create } from "zustand";
import toast from "react-hot-toast";
import type { Socket } from "socket.io-client";           // ✔ correct import as type
import axios from "axios";
import axiosInstance from "../lib/axios";
import { AuthStore } from "../types/chat";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "https://spawnback.vercel.app/api"
    : "https://spawnback.vercel.app/api");

const SOCKET_URL = "https://chatapp-jwtsecret.up.railway.app";

export const useAuthStore = create<AuthStore>((set, get) => {
  // Load from localStorage (if in browser)
  let storedToken: string | null = null;
  let storedUser: any = null;
  if (typeof window !== "undefined") {
    storedToken = localStorage.getItem("authToken");
    storedUser = localStorage.getItem("authUser");
  }

  return {
    authUser: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
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
        // Set cookie for server check
        document.cookie = `jwt=${token}; path=/; SameSite=Strict`;
        const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });
        get().connectSocket();
      } catch (err) {
        console.error(err);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    signup: async (data) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data, token: res.data.token });
        toast.success("Account created successfully");
        get().connectSocket();
      } catch (err) {
        toast.error(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Signup failed"
            : "Unexpected error"
        );
      } finally {
        set({ isSigningUp: false });
      }
    },

    login: async (data) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data, token: res.data.token });
        toast.success("Logged in successfully");
        get().connectSocket();
      } catch (err) {
        toast.error(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Login failed"
            : "Unexpected error"
        );
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
      } catch (err) {
        toast.error(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Logout failed"
            : "Unexpected error"
        );
      }
    },

    updateProfile: async (data) => {
      set({ isUpdatingProfile: true });
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (err) {
        toast.error(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Update failed"
            : "Unexpected error"
        );
      } finally {
        set({ isUpdatingProfile: false });
      }
    },

    connectSocket: () => {
      const { authUser, socket } = get();
      if (!authUser) return;

      // Clean up any existing socket
      if (socket) socket.disconnect();

      console.log("🔗 Connecting socket:", authUser._id);
      const newSocket: Socket = io(SOCKET_URL, {
        auth: {                                         // use auth instead of query :contentReference[oaicite:4]{index=4}
          token: localStorage.getItem("authToken"),
          userId: authUser._id
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected");
        set({ socket: newSocket });
      });

      newSocket.on("disconnect", (reason: string) => {   // reason is a string :contentReference[oaicite:5]{index=5}
        console.log("❌ Disconnected:", reason);
        if (reason === "io server disconnect") {
          newSocket.connect();
        }
      });

      newSocket.on("connect_error", (err: Error) => {
        console.error("Socket error:", err.message);
            });

      newSocket.on("getOnlineUsers", (users: string[]) => {
        set({ onlineUsers: users });
      });

      newSocket.connect();
    },

    disconnectSocket: () => {
      const s = get().socket;
      if (s?.connected) s.disconnect();
      set({ socket: null });
    },
  };
});
