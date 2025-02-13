import { create } from "zustand";
import { ThemeStore } from "../types/chat";

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: typeof window !== "undefined" ? localStorage.getItem("chat-theme") || "coffee" : "coffee",
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
    set({ theme });
  },
}));
