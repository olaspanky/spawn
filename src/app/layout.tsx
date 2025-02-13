import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import LayoutWrapper from "./components/LayoutWrapper";
import { Montserrat } from "next/font/google";
import { Roboto_Slab } from "next/font/google";
import ClientAuthProvider from "./components/ClientAuthProvider"; // Import the client component
import Theme from "./components/Theme"; 

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
  title: "DeclutterNG",
  description: "Sell your clutter easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${font1.variable} ${font2.variable} antialiased`} >
        <Theme /> {/* Ensure Theme component is added here */}
        <AuthProvider>
          <ClientAuthProvider />
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
