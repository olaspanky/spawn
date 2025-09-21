'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Upload, BellIcon, UserIcon, MessageCircle, CreditCardIcon, Settings2, ArrowRightCircleIcon, ChevronDownIcon, HomeIcon, Menu, X, UploadCloud } from 'lucide-react';
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

  const MobileNavItem = ({
    href,
    icon: Icon,
    label,
    badge,
    highlight = false,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: string | number;
    highlight?: boolean;
  }) => (
    <Link href={href} onClick={closeAllMenus}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between p-4 mx-4 rounded-xl transition-all ${
          highlight
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
            : 'bg-gray-50 hover:bg-white text-gray-800 shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-4 ${
            highlight ? 'bg-white/20' : 'bg-gray-100'
          }`}>
            <Icon className={`h-5 w-5 ${highlight ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className="font-medium">{label}</span>
        </div>
        {badge && (
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            highlight 
              ? 'bg-white/20 text-white' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navbar */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <Link href="/" className="flex flex-col items-center">
                  <Image src="/oja.png" alt="Oja Logo" width={80} height={80} className="rounded-lg" />
                    <p className="text-xs text-gray-500 italic">Keep moving, let's do the running</p>
                </Link>
              </div>

              <div className="flex items-center space-x-3">
                {token && (
                  <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    <Link href="/goods/list" className="font-medium">
                      {goodsCount} Items
                    </Link>
                  </div>
                )}

                <button
                  
                  className="relative bg-white border-2 border-[#8d4817] text-gray-700 px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all flex items-center group"
                  aria-label="Open Cart"
                >
                  <Link href="/goods/list" className="flex items-center">
                  <UploadCloud className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Upload List
                  </Link>
                 
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-white border-2 border-[#8d4817] text-gray-700 px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all flex items-center group"
                  aria-label="Open Cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Cart
                  {getItemCount() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    >
                      {getItemCount()}
                    </motion.span>
                  )}
                </button>

                {token && user ? (
                  <>
                    <button className="p-3 rounded-xl hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
                      <BellIcon className="h-5 w-5 text-gray-600" />
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#8d4817] rounded-full"></div>
                    </button>

                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                        aria-label="User Menu"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-gray-800">{user?.name || 'Account'}</span>
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                          >
                            <div className="p-4 border-b border-[#8d4817]">
                              <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                              <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                            </div>
                            
                            <div className="py-2">
                              <Link
                                href="/goods/list"
                                onClick={closeAllMenus}
                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <Upload className="h-5 w-5 mr-3 text-gray-500" />
                                <span className="text-gray-700">Upload List</span>
                              </Link>
                              <Link
                                href="/pages/chat"
                                onClick={closeAllMenus}
                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <MessageCircle className="h-5 w-5 mr-3 text-gray-500" />
                                <span className="text-gray-700">Messages</span>
                              </Link>
                              <Link
                                href="/declutter/purchases"
                                onClick={closeAllMenus}
                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <CreditCardIcon className="h-5 w-5 mr-3 text-gray-500" />
                                <span className="text-gray-700">Transactions</span>
                              </Link>
                              {storeId && (
                                <Link
                                  href={`/appstore/managestore/${storeId}`}
                                  onClick={closeAllMenus}
                                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                                >
                                  <Settings2 className="h-5 w-5 mr-3 text-gray-500" />
                                  <span className="text-gray-700">Manage Store</span>
                                </Link>
                              )}
                            </div>
                            
                            <div className="border-t border-gray-100 p-2">
                              <button
                                onClick={() => {
                                  logout();
                                  closeAllMenus();
                                }}
                                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                aria-label="Logout"
                              >
                                <ArrowRightCircleIcon className="h-5 w-5 mr-3" />
                                <span>Logout</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <Link href="/declutter/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-[#8d4817] text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      aria-label="Sign In"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="flex space-x-1 pb-4">
              <div className="bg-gray-100 p-1 rounded-xl flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-[#8d4817] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                    aria-label={`Select ${tab.label} tab`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Navbar */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center py-3">
              <Link href="/" className="flex items-center">
                <Image src="/oja.png" alt="Oja Logo" width={60} height={60} className="rounded-lg" />
                <span className="ml-2 text-lg font-bold text-gray-900">Oja</span>
              </Link>

              <div className="flex items-center space-x-2">
                {/* Cart Button - Mobile */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label="Open Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {getItemCount() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    >
                      {getItemCount()}
                    </motion.span>
                  )}
                </button>

                {/* Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                >
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5 text-gray-700" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-5 w-5 text-gray-700" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="py-3">
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-[#8d4817] text-white shadow-lg'
                        : 'bg-gray-100 text-[#8d4817] hover:bg-gray-200'
                    }`}
                    aria-label={`Select ${tab.shortLabel} tab`}
                  >
                    {tab.shortLabel} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Action Button for Upload List */}
      <Link href="/goods/list">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 bg-[#8d4817] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all group z-[60] sm:bottom-8 sm:right-8"
          aria-label="Upload List"
        >
          <div className="absolute inset-0 bg-[#8d4817] opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
          <div className="relative flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
        </motion.button>
      </Link>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeAllMenus}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Image src="/oja.png" alt="Oja Logo" width={40} height={40} className="rounded-lg" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Oja</h1>
                  <p className="text-xs text-gray-500 italic">Keep moving, let's do the running</p>
                </div>
              </div>

              {token && user ? (
                <>
                  <div className="mb-6 border-b border-gray-200 pb-4">
                    <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                  </div>
                  <MobileNavItem href="/" icon={HomeIcon} label="Home" />
                  <MobileNavItem href="/goods/list" icon={Upload} label="Upload List" highlight />
                  <MobileNavItem href="/pages/chat" icon={MessageCircle} label="Messages" />
                  <MobileNavItem href="/declutter/purchases" icon={CreditCardIcon} label="Transactions" />
                  {storeId && (
                    <MobileNavItem href={`/appstore/managestore/${storeId}`} icon={Settings2} label="Manage Store" />
                  )}
                  <div className="pt-4 mt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        logout();
                        closeAllMenus();
                      }}
                      className="w-full flex items-center justify-center p-4 mx-4 rounded-lg bg-gray-100 text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Logout"
                    >
                      <ArrowRightCircleIcon className="h-5 w-5 mr-3" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <MobileNavItem href="/" icon={HomeIcon} label="Home" />
                  <MobileNavItem href="/goods/list" icon={Upload} label="Upload List" highlight />
                  <div className="pt-4">
                    <Link href="/declutter/login" onClick={closeAllMenus}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white p-4 mx-4 rounded-lg font-semibold flex items-center justify-center transition-colors"
                        aria-label="Sign In"
                      >
                        <UserIcon className="h-5 w-5 mr-3" />
                        Sign In
                      </motion.button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Navbar;