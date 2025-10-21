// components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "./MNav"; // For home page only
import Navbar2 from "./Nav"; // For all other pages
import AdminNav from "./AdminNav"; // For admin pages
import AdminProtectedRoute from "./AdminProtectedRoute"; // For admin protection

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith("/goods");
  
  // Check if it's the admin login page (no nav needed)
  const isAdminLoginPage = pathname === "/goods/login";
  
  // Only show MNav on home page
  const isHomePage = pathname === "/";
  
  // Exclude navbar from /shop route
  const isShopPage = pathname === "/shop";

  // Define tabs for regular navigation
  const tabs = [
    { id: "home", label: "Home", shortLabel: "Home", count: 0 },
    { id: "products", label: "Products", shortLabel: "Products", count: 0 },
    { id: "about", label: "About Us", shortLabel: "About", count: 0 },
    { id: "contact", label: "Contact", shortLabel: "Contact", count: 0 },
  ];

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'location', label: 'Location' },
    { id: 'photos', label: 'Photos' },
    { id: 'contact', label: 'Contact' },
  ];

  // Render admin layout for admin routes
  if (isAdminRoute) {
    // Don't show nav on admin login page
    if (isAdminLoginPage) {
      return (
        <div className="min-h-screen">
          {children}
        </div>
      );
    }

    // Protected admin routes with AdminNav
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-slate-900">
          <AdminNav />
          <main className=" ">
            {children}
          </main>
        </div>
      </AdminProtectedRoute>
    );
  }

  // Regular layout for non-admin routes
  return (
    <div className="min-h-screen flex flex-col gap-3">
      {/* Show MNav only on home page, Nav2 on all other pages, no navbar on /shop */}
      {!isShopPage && (
        isHomePage ? (
          <Navbar 
            navItems={navItems} 
            activeSection="" 
            scrollToSection={() => {}} 
          />
        ) : (
          <Navbar2 
            navItems={navItems} 
            activeSection="" 
            scrollToSection={() => {}} 
          />
        )
      )}
      
      <main className="">
        {children}
      </main>
    </div>
  );
};

export default LayoutWrapper;