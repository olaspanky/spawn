"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Nav from "./Nav";
import Navbar from "./Navbar";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const isDeclutterRoute = pathname.startsWith("/pages");
  const isLoginOrSignup = pathname === "/declutter/login" || pathname === "/declutter/signup";

  return (
    <div className="min-h-screen flex flex-col">
      { !isLoginOrSignup && (isDeclutterRoute ? <Navbar /> : <Nav searchTerm={searchTerm} setSearchTerm={setSearchTerm} />)}
      <main className="flex-1 pt-12">{children}</main>
    </div>
  );
};

export default LayoutWrapper;
