
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isSigningUp: boolean;
  isVerifyingOTP: boolean;
  isLoggingIn: boolean; // Add loading state for login
  signup: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  verifyOTP: (data: { email: string; otp: string }) => Promise<void>;
  googleSignup: (token: string) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>; // Update login signature
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL = "https://spawnback.vercel.app/api";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({ id: parsedUser.id, name: parsedUser.name, email: parsedUser.email, isVerified: parsedUser.isVerified });
    }
  }, []);
  const signup = async (data: { fullName: string; email: string; password: string }) => {
    setIsSigningUp(true);
    try {
      const payload = { username: data.fullName, email: data.email, password: data.password };
      const res = await axios.post(`${BASE_URL}/users/signup`, payload);
      const { token, user } = res.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify({ ...user, isVerified: false }));
      setToken(token);
      setUser({ ...user, isVerified: false });
      toast.success("OTP sent to your email. Please verify to continue.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Signup error:", error.response?.data, error.message);
      } else {
        console.error("Signup error:", error);
      }
      toast.error(
        axios.isAxiosError(error) ? error.response?.data?.message || "Signup failed" : "An unexpected error occurred"
      );
    } finally {
      setIsSigningUp(false);
    }
  };

  const verifyOTP = async (data: { email: string; otp: string }) => {
    setIsVerifyingOTP(true);
    try {
      const res = await axios.post(`${BASE_URL}/users/verify-otp`, data);
      if (user) {
        const updatedUser = { ...user, isVerified: true };
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      toast.success("Email verified successfully");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) ? error.response?.data?.message || "OTP verification failed" : "An unexpected error occurred"
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const googleSignup = async (token: string) => {
    setIsSigningUp(true);
    try {
      const res = await axios.post(`${BASE_URL}/users/google-signup`, { token });
      const { token: newToken, user } = res.data;
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("authUser", JSON.stringify({ ...user, isVerified: true }));
      setToken(newToken);
      setUser({ ...user, isVerified: true });
      toast.success("Signed up with Google successfully");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) ? error.response?.data?.message || "Google signup failed" : "An unexpected error occurred"
      );
    } finally {
      setIsSigningUp(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setIsLoggingIn(true);
    try {
      const res = await axios.post(`${BASE_URL}/users/login`, data);
      const { token, user } = res.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      setToken(token);
      setUser(user);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error) ? error.response?.data?.message || "Login failed" : "An unexpected error occurred"
      );
      throw error; // Re-throw to let the caller handle it
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isSigningUp, isVerifyingOTP, isLoggingIn, signup, verifyOTP, googleSignup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};