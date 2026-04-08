"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const TOKEN_KEY = "mruz_token";
const USER_KEY  = "mruz_user";
const API       = process.env.NEXT_PUBLIC_API_URL;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  // Server renders this exact state — no localStorage touched at init
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  // Runs only on the client after hydration
  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const raw   = localStorage.getItem(USER_KEY);
      const user  = raw ? (JSON.parse(raw) as AuthUser) : null;

      setState(
        token && user
          ? { token, user, isLoading: false }
          : { token: null, user: null, isLoading: false }
      );
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setState({ token: null, user: null, isLoading: false });
    }
  }, []);

  const persist = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ token, user, isLoading: false });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res  = await fetch(`${API}/api/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    const { token, user } = data.data as { token: string; user: AuthUser };
    persist(token, user);
  }, [persist]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res  = await fetch(`${API}/api/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");
    const { token, user } = data.data as { token: string; user: AuthUser };
    persist(token, user);
  }, [persist]);

  const logout = useCallback(() => clear(), [clear]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.token && !!state.user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}