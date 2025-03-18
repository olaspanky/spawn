// Import Socket as a type
import type { Socket } from "socket.io-client";

// types/chat.ts
export interface ChatMessage {
  sender: string;
  message: string;
}

// types.ts
export interface User {
  _id: string;
  username: string;
  email?: string;
  profilePic?: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  text?: string;
  image?: string;
  createdAt: string;
}

export interface AuthStore {
  authUser: User | null;
  token: string | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: any; // Temporarily use `any` to bypass the error
  checkAuth: () => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string } | string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { profilePic?: string }) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export interface ChatStore {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  setSelectedUserById: (userId: string) => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setMessages: (messages: Message[]) => void; // Added setMessages property

  sendMessage: (messageData: { text: string; image?: string | null }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (user: User | null) => void;
}



export interface ThemeStore {
  theme: string;
  setTheme: (theme: string) => void;
}



export interface User2 {
  _id: string;
  username: string;
  verified?: boolean;
  rating?: number;
  ratingCount?: number;
  scamReports?: number;
  phone?: string;
}

export interface MeetingDetails {
  location: string;
  time: string; // ISO string
}

export interface Item {
  _id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  status: string;
}

export interface Order {
  _id: string;
  buyer: string | User;
  seller: string | User;
  item: Item;
  price: number;
  paymentReference: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refund_requested';
  trackingStatus: 'paid' | 'meeting_scheduled' | 'completed' | 'refund_requested' | 'refunded';
  meetingDetails?: MeetingDetails;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}