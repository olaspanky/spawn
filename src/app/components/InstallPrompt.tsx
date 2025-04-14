// components/InstallPrompt.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const InstallPrompt: React.FC = () => {
 const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
 const [isIos, setIsIos] = useState(false);
 const [isInstalled, setIsInstalled] = useState(false);

 useEffect(() => {
 // Check if the app is already installed (standalone mode)
 if (window.matchMedia("(display-mode: standalone)").matches) {
 setIsInstalled(true);
 return;
 }

 // Detect iOS devices
 const userAgent = window.navigator.userAgent.toLowerCase();
 const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !("serviceWorker" in navigator);
 setIsIos(isIosDevice);

 // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
 const handleBeforeInstallPrompt = (e: Event) => {
 e.preventDefault(); // Prevent the default mini-infobar on mobile
 setDeferredPrompt(e); // Store the event for later use
 };

 window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

 // Cleanup the event listener
 return () => {
 window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
 };
 }, []);

 const handleInstallClick = async () => {
 if (isIos) {
 // Show instructions for iOS users
 toast(
 "To install DeclutterNG, tap the Share button in Safari and select 'Add to Home Screen'.",
 {
 duration: 5000,
 position: "top-center",
 }
 );
 return;
 }

 if (!deferredPrompt) return;

 // Show the install prompt
 (deferredPrompt as any).prompt();

 // Wait for the user to respond to the prompt
 const { outcome } = await (deferredPrompt as any).userChoice;
 if (outcome === "accepted") {
 toast.success("DeclutterNG has been installed!");
 setIsInstalled(true);
 } else {
 toast("You can install DeclutterNG anytime from the browser menu.", {
 duration: 3000,
 });
 }

 // Clear the deferred prompt
 setDeferredPrompt(null);
 };

 // Don't show the button if the app is already installed
 if (isInstalled) return null;

 return (
 <div className="fixed bottom-16 right-4 z-50">
 <button
 onClick={handleInstallClick}
 className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-orange-700 hover:to-orange-600 transition-all duration-300"
 >
 {isIos ? "Add to Home Screen" : "Install DeclutterNG"}
 </button>
 </div>
 );
};

export default InstallPrompt;