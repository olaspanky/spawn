"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle form
  const [error, setError] = useState("");
  const { login, isLoggingIn, forgotPassword, isForgettingPassword } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await forgotPassword(forgotPasswordEmail);
      toast.success("Password reset email sent. Please check your email.");
      setForgotPasswordEmail(""); // Clear input
      setIsForgotPassword(false); // Switch back to login form
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {isForgotPassword ? "Forgot Password" : "Welcome Back"}
        </h1>

        {isForgotPassword ? (
          <>
            <p className="text-sm text-gray-600 mb-6">
              Enter your email address to receive a password reset link.
            </p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={isForgettingPassword}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isForgettingPassword ? "Sending..." : "Send Reset Email"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                }}
                className="text-orange-600 hover:underline"
              >
                Log in
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="text-sm text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError("");
                    setFormData({ email: "", password: "" }); // Clear login form
                  }}
                  className="text-orange-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? "Logging In..." : "Log In"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link href="/shop/signup" className="text-orange-600 hover:underline">
                Sign up
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}