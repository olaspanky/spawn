import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { ChatStore, Message, User } from "../types/chat";
import axios from "axios";
import axiosInstance from "../lib/axios";

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Failed to fetch users");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  setSelectedUserById: async (sellerId: string) => {
    try {
      let usersList = get().users;
      if (usersList.length === 0) {
        await get().getUsers();
        usersList = get().users;
      }

      const user = usersList.find((u) => u._id === sellerId);

      if (!user) {
        toast.error("User not found");
        return;
      }

      get().setSelectedUser(user);
      await get().getMessages(sellerId);
    } catch (error) {
      toast.error("Failed to load user chat");
      console.error("Error loading user:", error);
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Failed to fetch messages");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: { text: string; image?: string | null }) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Failed to send message");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      console.error("No user selected for chat.");
      return;
    }

    let socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not available. Attempting to reconnect...");
      useAuthStore.getState().connectSocket();

      setTimeout(() => {
        socket = useAuthStore.getState().socket;
        if (!socket) {
          console.error("Socket is still not available after reconnecting.");
          return;
        }
        socket.on("newMessage", (newMessage: Message) => {
          if (newMessage.senderId !== selectedUser._id) return;
          set((state) => ({ messages: [...state.messages, newMessage] }));
        });
      }, 2000); // Delay to allow socket reconnection
    } else {
      socket.on("newMessage", (newMessage: Message) => {
        if (newMessage.senderId !== selectedUser._id) return;
        set((state) => ({ messages: [...state.messages, newMessage] }));
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage"); // Use optional chaining in case socket is null
  },

  setSelectedUser: (selectedUser: User | null) => {
    set({ selectedUser });
    if (selectedUser) {
      get().getMessages(selectedUser._id);
    }
  },

  setMessages: (messages: Message[] | ((prevMessages: Message[]) => Message[])) => {
    set((state) =>
      typeof messages === "function" ? { messages: messages(state.messages) } : { messages }
    );
  },
}));