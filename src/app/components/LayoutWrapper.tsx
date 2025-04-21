"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "./Nav"; // Use Navbar instead of Nav

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const isDeclutterRoute = pathname.startsWith("/pages");
  const isLoginOrSignupOrProduct =
    pathname === "/declutter/login" ||
    pathname === "/declutter/signup" ||
    pathname.startsWith("/declutter/products") ||
    pathname.startsWith("/appstore/store/");

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginOrSignupOrProduct && (
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      )}
      <main className="flex-1 lg:pt-[88px] pb-[80px] md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default LayoutWrapper;