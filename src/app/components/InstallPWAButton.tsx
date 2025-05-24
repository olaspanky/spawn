"use client";

import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      console.log("beforeinstallprompt event captured");
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log("No deferred prompt available");
      return;
    }
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log("User choice:", choiceResult.outcome);
    setShowButton(false);
    setDeferredPrompt(null);
  };

  if (!showButton) {
    console.log("Install button hidden");
    return null;
  }

  console.log("Install button showing");

  return (
    <button
      onClick={handleInstall}
      className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition"
      aria-label="Install app"
    >
      Install App
    </button>
  );
}
