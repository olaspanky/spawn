"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";
import Navbar from "./Navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDeclutterRoute = pathname.startsWith("/pages");

  return (
    <div className="min-h-screen flex flex-col">
      {isDeclutterRoute ? <Navbar /> : <Nav/>}
      <main className="flex-1">{children}</main>
    </div>
  );
}
