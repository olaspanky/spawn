// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import LayoutWrapper from "./components/LayoutWrapper";
import { Montserrat } from "next/font/google";
import { Roboto_Slab } from "next/font/google";
import ClientAuthProvider from "./components/ClientAuthProvider";
import DisableZoom from "./components/DisableZoom";
import InstallPWA from "./components/InstallPWA";


import Theme from "./components/Theme";
import { Toaster } from "react-hot-toast"; // Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const font1 = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});
const font2 = Roboto_Slab({
  variable: "--font-robo-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpawnHub",
  description: "Sell your clutter easily",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover', // Ensures the viewport accounts for the notch
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent', // Blends status bar with background
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      
        <meta name="theme-color" content="#f97316" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon512_rounded.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
  className={`${geistSans.variable} ${geistMono.variable} ${font1.variable} ${font2.variable} antialiased`}
>
  <DisableZoom />
  <InstallPWA /> {/* ← MOVE HERE */}

  <Theme />
  <AuthProvider>
    <ClientAuthProvider />
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
    <Toaster />
  </AuthProvider>
</body>

    </html>
  );
}
