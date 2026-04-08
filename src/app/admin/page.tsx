"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/useAuth";
import ProtectedRoute from "../components/Protectedroute";
// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "pending" | "accepted" | "in_market" | "delivered" | "completed";
type ServiceType = "timeframe" | "express";

type Order = {
  _id: string;
  name: string;
  phone: string;
  address: string;
  service: ServiceType;
  notes?: string;
  file?: { url: string; originalName: string; mimeType: string } | null;
  status: Status;
  createdAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_FLOW: Status[] = [
  "pending",
  "accepted",
  "in_market",
  "delivered",
  "completed",
];

const STATUS_META: Record<
  Status,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending:   { label: "Pending",   color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-200",   icon: "🕐" },
  accepted:  { label: "Accepted",  color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       icon: "✅" },
  in_market: { label: "In Market", color: "text-purple-700",  bg: "bg-purple-50 border-purple-200",   icon: "🛒" },
  delivered: { label: "Delivered", color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",   icon: "🚚" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "🎉" },
};

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${meta.bg} ${meta.color}`}
    >
      {meta.icon} {meta.label}
    </span>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  token,
  onUpdated,
}: {
  order: Order;
  token: string;
  onUpdated: (updated: Order) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1] as Status | undefined;

  const advanceStatus = async () => {
    if (!nextStatus) return;
    setError(null);
    setUpdating(true);
    try {
      const res = await fetch(`${API}/api/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      onUpdated(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const nextMeta = nextStatus ? STATUS_META[nextStatus] : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="p-5 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 truncate">{order.name}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  order.service === "express"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {order.service === "express" ? "⚡ Express" : "🕐 Scheduled"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{order.phone}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={order.status} />
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Address</p>
              <p className="text-gray-700">{order.address}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Order ID</p>
              <p className="text-gray-500 font-mono text-xs break-all">{order._id}</p>
            </div>
          </div>

          {order.file && (
            <a
              href={order.file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              📎 {order.file.originalName}
            </a>
          )}

          {/* Progress bar */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Progress</p>
            <div className="flex items-center gap-1">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`h-1.5 rounded-full w-full transition-all ${done ? "bg-emerald-500" : "bg-gray-200"}`} />
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? "bg-emerald-500" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {STATUS_FLOW.map((s) => (
                <p key={s} className="text-xs text-gray-400 text-center" style={{ flex: 1 }}>
                  {STATUS_META[s].icon}
                </p>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              ⚠️ {error}
            </p>
          )}

          {nextStatus && nextMeta && (
            <button
              onClick={advanceStatus}
              disabled={updating}
              className="w-full py-3 rounded-2xl font-semibold text-sm transition-all disabled:opacity-60 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {updating ? "Updating…" : `Mark as ${nextMeta.icon} ${nextMeta.label}`}
            </button>
          )}

          {order.status === "completed" && (
            <p className="text-center text-emerald-600 font-semibold text-sm py-2">
              🎉 Order completed
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard inner (assumes auth is valid) ──────────────────────────────────
function DashboardInner() {
  const { token, user, logout } = useAuth();

  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [filterStatus,  setFilterStatus]  = useState<Status | "all">("all");
  const [filterService, setFilterService] = useState<ServiceType | "all">("all");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus  !== "all") params.set("status",  filterStatus);
      if (filterService !== "all") params.set("service", filterService);

      const res = await fetch(`${API}/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Token expired / revoked — force logout
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      setOrders(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterService, logout]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleOrderUpdated = (updated: Order) =>
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));

  const counts = STATUS_FLOW.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl text-gray-900">🛍️ MarketRuz</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Logged-in user */}
            {user && (
              <p className="text-sm text-gray-500 hidden sm:block">
                {user.name || user.email}
              </p>
            )}
            <button
              onClick={fetchOrders}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
              title="Refresh"
            >
              🔄
            </button>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FLOW.map((s) => {
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-medium whitespace-nowrap transition-all ${
                  filterStatus === s
                    ? `${meta.bg} ${meta.color} border-current`
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {meta.icon} {meta.label}
                <span className="bg-white/70 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {counts[s] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Service filter */}
        <div className="flex gap-2">
          {(["all", "timeframe", "express"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterService(s)}
              className={`px-4 py-2 rounded-2xl border text-sm font-medium transition-all ${
                filterService === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "all" ? "All Services" : s === "express" ? "⚡ Express" : "🕐 Scheduled"}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3 animate-spin inline-block">🔄</p>
            <p>Loading orders…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchOrders} className="text-sm text-emerald-600 underline">
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">
              {filterStatus !== "all" || filterService !== "all"
                ? "Try clearing the filters"
                : "New orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                token={token!}
                onUpdated={handleOrderUpdated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Default export: wrapped in ProtectedRoute ────────────────────────────────
export default function AdminDashboard() {
  return (
      <DashboardInner />
  );
}