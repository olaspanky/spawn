"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function ClientAuthProvider() {
  useEffect(() => {
    useAuthStore.getState().checkAuth(); // Ensures auth & socket setup
  }, []);

  return null; // This component doesn't render anything, it just runs auth logic
}
