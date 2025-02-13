"use client";

import { useEffect } from "react";
import { useThemeStore } from "../store/useThemeStore";

export default function Theme() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return null;
}
