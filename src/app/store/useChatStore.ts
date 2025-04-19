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
        if (usersList.length === 0) {
          toast.error("No users available");
          return;
        }
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
      
      // Optimistically update UI
      set({ messages: [...messages, res.data] });
      
      // No need to manually handle socket here - backend will emit the event
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Failed to send message");
      } else {
        toast.error("An unexpected error occurred");
      }
      // Optionally: Revert optimistic update if needed
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const { socket, authUser } = useAuthStore.getState();
  
    if (!selectedUser || !socket || !authUser) {
      console.error("Missing required data for message subscription");
      return;
    }
  
    socket.off("newMessage");
  
    socket.on("newMessage", (newMessage: Message) => {
      console.log("Received new message:", newMessage);
  
      const isRelevant =
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id) ||
        (newMessage.receiverId === selectedUser._id && newMessage.senderId === authUser._id);
  
      if (isRelevant) {
        set((state) => {
          if (!state.messages.some((msg) => msg._id === newMessage._id)) {
            return { messages: [...state.messages, newMessage] };
          }
          return state;
        });
      }
    });
  
    return () => {
      socket.off("newMessage");
    };
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