"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/useAuth";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  mode: "login" | "signup",
  fields: { name: string; email: string; password: string; confirm: string }
): string | null {
  if (mode === "signup" && !fields.name.trim()) return "Full name is required.";
  if (!emailRx.test(fields.email))              return "Enter a valid email address.";
  if (fields.password.length < 8)               return "Password must be at least 8 characters.";
  if (mode === "signup" && fields.password !== fields.confirm)
                                                return "Passwords don't match.";
  return null;
}

// ─── Password strength meter ──────────────────────────────────────────────────
function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8)             s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;

  if (s <= 1) return { score: s, label: "Weak",   color: "#ef4444" };
  if (s === 2) return { score: s, label: "Fair",   color: "#f97316" };
  if (s === 3) return { score: s, label: "Good",   color: "#eab308" };
  return             { score: s, label: "Strong",  color: "#10b981" };
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({
  label, type, value, onChange, placeholder, autoComplete, right,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 13, fontWeight: 500,
        color: "var(--color-text-secondary)",
        letterSpacing: "0.02em",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: right ? "12px 44px 12px 16px" : "12px 16px",
            borderRadius: 14,
            border: "1.5px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#10b981")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--color-border-secondary)")}
        />
        {right && (
          <div style={{
            position: "absolute", right: 14, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-tertiary)", cursor: "pointer",
          }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Auth page ────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [mode,    setMode]    = useState<"login" | "signup">("login");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/admin");
  }, [isAuthenticated, isLoading, router]);

  const pwStrength = pw ? strength(pw) : null;

  const resetForm = () => {
    setName(""); setEmail(""); setPw(""); setConfirm("");
    setError(null); setSuccess(null); setShowPw(false);
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const err = validate(mode, { name, email, password: pw, confirm });
    if (err) { setError(err); return; }

    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, pw);
        router.replace("/admin");
      } else {
        await signup(name, email, pw);
        setSuccess("Account created! Redirecting…");
        setTimeout(() => router.replace("/admin"), 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--color-background-tertiary)",
      }}>
        <div style={{ fontSize: 28, animation: "spin 1s linear infinite" }}>🛍️</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-background-tertiary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Card */}
      <div style={{
        background: "var(--color-background-primary)",
        borderRadius: 28,
        border: "1px solid var(--color-border-tertiary)",
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
        boxSizing: "border-box",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 20,
            background: "#dcfce7", fontSize: 28, marginBottom: 16,
          }}>
            🛍️
          </div>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 600,
            color: "var(--color-text-primary)",
          }}>
            MarketRuz
          </h1>
          <p style={{
            margin: "4px 0 0", fontSize: 14,
            color: "var(--color-text-secondary)",
          }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", gap: 4,
          background: "var(--color-background-secondary)",
          borderRadius: 14, padding: 4,
          marginBottom: 28,
        }}>
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: "9px 0",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                fontSize: 14, fontWeight: 500,
                transition: "all 0.15s",
                background: mode === m
                  ? "var(--color-background-primary)"
                  : "transparent",
                color: mode === m
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                boxShadow: mode === m
                  ? "0 1px 4px rgba(0,0,0,0.08)"
                  : "none",
              }}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "signup" && (
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Your name"
              autoComplete="name"
            />
          )}

          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={setPw}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              right={
                <span onClick={() => setShowPw((v) => !v)}>
                  <EyeIcon open={showPw} />
                </span>
              }
            />
            {/* Strength meter — only on signup */}
            {mode === "signup" && pw && pwStrength && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <div style={{
                  flex: 1, height: 4, borderRadius: 99,
                  background: "var(--color-background-secondary)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(pwStrength.score / 4) * 100}%`,
                    background: pwStrength.color,
                    borderRadius: 99,
                    transition: "width 0.25s, background 0.25s",
                  }} />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: pwStrength.color, minWidth: 44,
                }}>
                  {pwStrength.label}
                </span>
              </div>
            )}
          </div>

          {mode === "signup" && (
            <Field
              label="Confirm password"
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span> {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
              fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>✅</span> {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: busy ? "#a7f3d0" : "#059669",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: busy ? "not-allowed" : "pointer",
              transition: "background 0.15s, transform 0.1s",
              marginTop: 4,
            }}
            onMouseEnter={(e) => { if (!busy) e.currentTarget.style.background = "#047857"; }}
            onMouseLeave={(e) => { if (!busy) e.currentTarget.style.background = "#059669"; }}
            onMouseDown={(e)  => { if (!busy) e.currentTarget.style.transform  = "scale(0.98)"; }}
            onMouseUp={(e)    => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {busy
              ? (mode === "login" ? "Signing in…" : "Creating account…")
              : (mode === "login" ? "Sign in"     : "Create account")}
          </button>
        </form>

        {/* Footer link */}
        <p style={{
          textAlign: "center", marginTop: 24, fontSize: 13,
          color: "var(--color-text-secondary)",
        }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            style={{
              background: "none", border: "none", padding: 0,
              color: "#059669", fontWeight: 500, cursor: "pointer",
              fontSize: 13,
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}