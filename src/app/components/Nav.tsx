"use client";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import {
  BellIcon,
  ShoppingCartIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
  UserIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import logo from "../../../public/splogo1.png";
import Image from "next/image";

interface NavbarProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const { token, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Fetch user stores
  useEffect(() => {
    if (!token || !user) return;
    
    const fetchStores = async () => {
      try {
        const res = await fetch(`https://spawnback.vercel.app/api/store/user/${user.id}`, {
          headers: { "x-auth-token": token }
        });
        if (res.ok) {
          const stores = await res.json();
          const ownedStore = stores.find((store: any) => 
            (typeof store.owner === "string" ? store.owner : store.owner?._id) === user.id
          );
          setStoreId(ownedStore?._id || null);
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };

    fetchStores();
  }, [token, user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeAllMenus = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const NavButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} onClick={closeAllMenus}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {children}
      </motion.div>
    </Link>
  );

  const MobileNavItem = ({ href, icon: Icon, label }: { 
    href: string; 
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <Link href={href} onClick={closeAllMenus}>
      <div className="flex items-center p-4 hover:bg-gray-800 rounded-lg transition-colors">
        <Icon className="h-5 w-5 mr-3" />
        <span>{label}</span>
      </div>
    </Link>
  );

  return (
    <header className="fixed w-full z-50 ">
      {/* Desktop Navbar */}
      <nav 
        className={`hidden md:block text-white bg-gray-900/95 backdrop-blur-md border-b border-gray-800 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src={logo} 
              alt="Logo" 
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {token ? (
              <>
                <NavButton href="/declutter/manage-items">Sell Items</NavButton>
                <NavButton href="/appstore/stores">Marketplace</NavButton>
                
                {/* Notifications */}
                <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                  <BellIcon className="h-5 w-5" />
                </button>

                {/* Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span>{user?.name || "Account"}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
                      >
                        <Link 
                          href="/pages/chat" 
                          onClick={closeAllMenus}
                          className="block px-4 py-3 hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          Messages
                        </Link>
                        <Link 
                          href="/declutter/purchases" 
                          onClick={closeAllMenus}
                          className="block px-4 py-3 hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Transactions
                        </Link>
                        {storeId && (
                          <Link 
                            href={`/appstore/managestore/${storeId}`}
                            onClick={closeAllMenus}
                            className="block px-4 py-3 hover:bg-gray-700 transition-colors flex items-center"
                          >
                            <StarIcon className="h-5 w-5 mr-2" />
                            Manage Store
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            closeAllMenus();
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <NavButton href="/appstore/stores">Marketplace</NavButton>
                <NavButton href="/declutter/upload">Sell Items</NavButton>
                <Link href="/declutter/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2 rounded-lg font-medium"
                  >
                    Sign In
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className={`md:hidden bg-gray-900/95 backdrop-blur-md border-b border-gray-800 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}>
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <Image 
              src={logo} 
              alt="Logo" 
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-4">
            {token && (
              <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                <BellIcon className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <UserIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 bg-gray-900/95 backdrop-blur-md z-40 pt-16 overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-2">
              {token ? (
                <>
                  <div className="px-4 py-3 mb-4 border-b border-gray-800">
                    <p className="font-medium">Welcome back</p>
                    <p className="text-orange-400">{user?.name || "User"}</p>
                  </div>

                  <MobileNavItem href="/" icon={HomeIcon} label="Home" />
                  <MobileNavItem href="/declutter/manage-items" icon={ShoppingCartIcon} label="Sell Items" />
                  <MobileNavItem href="/appstore/stores" icon={StarIcon} label="Marketplace" />
                  <MobileNavItem href="/pages/chat" icon={ChatBubbleLeftIcon} label="Messages" />
                  <MobileNavItem href="/declutter/purchases" icon={CreditCardIcon} label="Transactions" />
                  
                  {storeId && (
                    <MobileNavItem 
                      href={`/appstore/managestore/${storeId}`} 
                      icon={Cog6ToothIcon} 
                      label="Manage Store" 
                    />
                  )}

                  <button
                    onClick={() => {
                      logout();
                      closeAllMenus();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors flex items-center mt-4"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavItem href="/" icon={HomeIcon} label="Home" />
                  <MobileNavItem href="/appstore/stores" icon={StarIcon} label="Marketplace" />
                  <MobileNavItem href="/declutter/upload" icon={ShoppingCartIcon} label="Sell Items" />
                  <Link href="/declutter/login">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {!pathname.startsWith("/declutter/products/") && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-30">
          <div className="flex justify-around py-3">
            <Link href="/" className="p-2">
              <HomeIcon className="h-6 w-6" />
            </Link>
            <Link href="/appstore/stores" className="p-2">
              <StarIcon className="h-6 w-6" />
            </Link>
            <Link href="/declutter/purchases" className="p-2">
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>
            <button onClick={toggleMobileMenu} className="p-2">
              <UserIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}