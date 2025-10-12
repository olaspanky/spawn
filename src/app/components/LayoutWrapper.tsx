


"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Navbar from "./MNav"; // For home page only
import Navbar2 from "./Nav"; // For all other pages

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Only show MNav on home page
  const isHomePage = pathname === "/";
  // Exclude navbar from /shop route
  const isShopPage = pathname === "/shop";

  // Define tabs for Nav1 with proper structure
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

  return (
    <div className="min-h-screen flex flex-col gap-3">
      {/* Show MNav only on home page, Nav1 on all other pages, no navbar on /shop */}
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