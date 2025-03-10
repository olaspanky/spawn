"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Nav from "./Nav";
import Navbar from "./Navbar";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const isDeclutterRoute = pathname.startsWith("/pages");

  return (
    <div className="min-h-screen flex flex-col">
      {isDeclutterRoute ? <Navbar /> : <Nav searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default LayoutWrapper;
