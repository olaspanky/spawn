"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({
  children,
  redirectTo = "/auth",
  requireAdmin = false,
}: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace(redirectTo); return; }
    if (requireAdmin && !user?.isAdmin) { router.replace("/"); }
  }, [isLoading, isAuthenticated, user, requireAdmin, redirectTo, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-tertiary)" }}>
        <div style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>🛍️</div>
          <p style={{ fontSize: 14, margin: 0 }}>Loading…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requireAdmin && !user?.isAdmin) return null;

  return <>{children}</>;
}