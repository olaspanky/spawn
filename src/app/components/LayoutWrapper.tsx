// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Nav from "./Nav";
import Navbar from "./Navbar";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const isDeclutterRoute = pathname.startsWith("/pages");
  // Include routes starting with /declutter/products
  const isLoginOrSignupOrProduct = 
    pathname === "/declutter/login" ||
    pathname === "/declutter/signup" ||
    pathname === "/declutter/reset-password" ||
    pathname.startsWith("/declutter/products");

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginOrSignupOrProduct && (isDeclutterRoute ? <Navbar /> : <Nav searchTerm={searchTerm} setSearchTerm={setSearchTerm} />)}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default LayoutWrapper;