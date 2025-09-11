'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Upload, BellIcon, UserIcon, MessageCircle, CreditCardIcon, Settings2, ArrowRightCircleIcon, ChevronDownIcon, HomeIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface NavbarProps {
  tabs: { id: string; label: string; shortLabel: string; count: number }[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  goodsCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ tabs, activeTab, setActiveTab, setIsCartOpen, goodsCount }) => {
  const { token, logout, user } = useAuth();
  const { getItemCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fetch user stores
  useEffect(() => {
    if (!token || !user) return;

    const fetchStores = async () => {
      try {
        const res = await fetch(`https://spawnback.vercel.app/api/store/user/${user.id}`, {
          headers: { 'x-auth-token': token },
        });
        if (res.ok) {
          const stores = await res.json();
          const ownedStore = stores.find((store: any) =>
            (typeof store.owner === 'string' ? store.owner : store.owner?._id) === user.id
          );
          setStoreId(ownedStore?._id || null);
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const MobileNavItem = ({
    href,
    icon: Icon,
    label,
  }: {
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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl lg:mx-auto  lg:px-8">
        {/* Desktop Navbar */}
        <div className="hidden md:block  text-white">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <img src="/assets/oja.jpeg" alt="Oja Logo" className="h-12 mb-1" />
                <p className="text-[10px] italic text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
                  Keep moving. let's do the running
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
              {token ? (
                <>
                  <Link
                    href="/goods/list"
                    className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload List
                  </Link>
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-medium text-sm">
                    <Link className="inline-flex items-center space-x-1" href="/goods/list">
                      {goodsCount} Items
                    </Link>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <BellIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Cart
                    {getItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {getItemCount()}
                      </span>
                    )}
                  </button>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <span>{user?.name || 'Account'}</span>
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
                            <MessageCircle className="h-5 w-5 mr-2" />
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
                              <Settings2 className="h-5 w-5 mr-2" />
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
                            <ArrowRightCircleIcon className="h-5 w-5 mr-2" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/goods/list"
                    className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload List
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Cart
                    {getItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {getItemCount()}
                      </span>
                    )}
                  </button>
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
        </div>

        {/* Navigation Tabs - Desktop */}
        <div className="hidden sm:flex space-x-1 pb-4 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden text-black">
          <div className="px-4 py-3 flex justify-between items-center">
            <Link href="/">
              <img src="/assets/oja.jpeg" alt="Oja Logo" className="h-8" />
            </Link>
                                              <MobileNavItem href="/goods/list" icon={Upload} label="Upload List" />

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
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed inset-0 bg-[#1A1A1A] backdrop-blur-md z-40 pt-16 overflow-y-auto"
            >
              <div className="px-4 py-6 space-y-2">
                {token ? (
                  <>
                    <div className="px-4 py-3 mb-4 border-b border-gray-800">
                      <p className="font-medium">Welcome back</p>
                      <p className="text-white">{user?.name || 'User'}</p>
                    </div>
                    <MobileNavItem href="/" icon={HomeIcon} label="Home" />
                    <MobileNavItem href="/pages/chat" icon={MessageCircle} label="Messages" />
                    <MobileNavItem href="/declutter/purchases" icon={CreditCardIcon} label="Transactions" />
                    {storeId && (
                      <MobileNavItem
                        href={`/appstore/managestore/${storeId}`}
                        icon={Settings2}
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
                      <ArrowRightCircleIcon className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavItem href="/" icon={HomeIcon} label="Home" />
                    <MobileNavItem href="/goods/list" icon={Upload} label="Upload List" />
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

        {/* Navigation Tabs - Mobile (Horizontal Scroll) */}
        <div className="sm:hidden py-4 px-2">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.shortLabel} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </header>
  );
};

export default Navbar;