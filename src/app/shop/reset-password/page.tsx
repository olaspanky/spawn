"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const { resetPassword, isResettingPassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Get token from URL on mount
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token") || "";
    setToken(tokenFromUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    try {
      await resetPassword({ token, newPassword });
      toast.success("Password reset successfully. You can now log in.");
      setNewPassword("");
      setTimeout(() => router.push("/shop/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isResettingPassword || !token}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isResettingPassword ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Back to{" "}
          <Link href="/shop/login" className="text-orange-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}