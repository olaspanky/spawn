"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For redirection
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const SignUpPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { signup, isSigningUp, verifyOTP, isVerifyingOTP, resendOTP, isResendingOTP, googleSignup } = useAuth();
  const router = useRouter(); // For navigation

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      await signup(formData);
      setIsOtpSent(true);
      toast.success(`OTP sent to ${formData.email}. Please check your inbox (and spam/junk folder).`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Signup failed:", (error as any)?.response?.data || error.message);
      } else {
        console.error("Signup failed:", error);
      }
      // Error handling is already in AuthContext, but toast is shown there
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      await verifyOTP({ email: formData.email, otp });
      toast.success("Account verified! Redirecting to login...");
      setTimeout(() => router.push("/shop/login"), 1500); // Delay for user to see success message
    } catch (error) {
      if (error instanceof Error) {
        console.error("OTP verification failed:", (error as any)?.response?.data || error.message);
      } else {
        console.error("OTP verification failed:", error);
      }
      // Error handling is already in AuthContext, but toast is shown there
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(formData.email);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Resend OTP failed:", (error as any)?.response?.data || error.message);
      } else {
        console.error("Resend OTP failed:", error);
      }
      // Error handling is already in AuthContext
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      await googleSignup(response.credential);
      toast.success("Signed up with Google! Redirecting to login...");
      setTimeout(() => router.push("/shop/login"), 1500);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Google signup failed:", (error as any)?.response?.data || error.message);
      } else {
        console.error("Google signup failed:", error);
      }
      toast.error("Google signup failed. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                <p className="text-base-content/60">Get started with your free account</p>
              </div>
            </div>

            {!isOtpSent ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Full Name</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="size-5 text-base-content/40" />
                      </div>
                      <input
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="size-5 text-base-content/40" />
                      </div>
                      <input
                        type="email"
                        className="input input-bordered w-full pl-10"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="size-5 text-base-content/40" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="input input-bordered w-full pl-10"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-5 text-base-content/40" />
                        ) : (
                          <Eye className="size-5 text-base-content/40" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
                    {isSigningUp ? (
                      <>
                        <Loader2 className="size-5 animate-spin" /> Loading...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </form>
                <div className="divider">OR</div>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google signup failed")}
                />
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-base-content/80">
                    An OTP has been sent to <span className="font-semibold">{formData.email}</span>. Please check your inbox (and spam/junk folder).
                  </p>
                </div>
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Enter OTP</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={isVerifyingOTP}>
                    {isVerifyingOTP ? (
                      <>
                        <Loader2 className="size-5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>
                
                <div className="text-center">
                  <p className="text-base-content/60 text-sm">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResendingOTP}
                      className="link link-primary font-medium"
                    >
                      {isResendingOTP ? "Sending..." : "Resend OTP"}
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-base-content/60">
                Already have an account?{" "}
                <Link href="/shop/login" className="link link-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
       
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUpPage;