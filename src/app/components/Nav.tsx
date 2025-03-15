"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const { token, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine greeting based on current hour
  const now = new Date();
  const hour = now.getHours();
  let greeting = "";
  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const Greeting = () => (
    <motion.div
      className="flex items-center space-x-2 text-sm sm:text-base text-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span>{greeting},</span>
      <span className="text-orange-400 font-medium">{user?.name || "User"}</span>
    </motion.div>
  );

  // Animation variants for mobile menu
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <nav className="backdrop-blur-lg dark:bg-white bg-black/70 border-b border-white/10 shadow-xl sticky top-0 z-20 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            <Link href="/" onClick={closeMenu}>
              <div className="inline-flex items-center dark:text-black hover:text-orange-400 transition-colors duration-300">
                TRADE<span className="text-orange-500">HUB</span>
              </div>
            </Link>
          </h2>
        </motion.div>

        {/* Right: Navigation Links */}
        <div className="hidden md:flex items-center dark:text-black space-x-6 lg:space-x-8">
          {token ? (
            <>
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                <Link href="/" onClick={closeMenu}>
                  <BellIcon className="h-6 w-6 lg:h-7 lg:w-7 text-white  hover:text-orange-400 transition-colors duration-300" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/manage-items" onClick={closeMenu}>
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                    Sell Item
                    <ShoppingCartIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/pages/chat" onClick={closeMenu}>
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                    View Messages
                    <ClipboardDocumentListIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                </Link>
              </motion.div>
              <motion.button
                onClick={logout}
                className="px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium text-white hover:text-orange-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <div className="hidden md:flex space-x-6 lg:space-x-8 dark:text-black items-center">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/upload" onClick={closeMenu}>
                  <div className="inline-flex items-center bg-orange-600 dark:text-black text-white px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base rounded-full font-semibold hover:bg-orange-700 transition-colors duration-300 shadow-md hover:shadow-lg">
                    Sell Item
                    <ShoppingCartIcon className="h-4 w-4 lg:h-5 lg:w-5 ml-2" />
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/login" onClick={closeMenu}>
                  <div className="px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium dark:text-black text-white hover:text-orange-400 transition-colors duration-300">
                    Sign In
                  </div>
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile: Greeting + Menu Toggle */}
        <div className="md:hidden flex items-center justify-end space-x-4">
          <Greeting />
          <motion.button
            onClick={toggleMenu}
            className="text-white hover:text-orange-400 focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white/95 backdrop-blur-md shadow-xl border-t border-white/10"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-4 py-6 space-y-4">
              {token ? (
                <>
                  <Link href="/" onClick={closeMenu}>
                    <motion.div
                      className="flex items-center space-x-2 py-2 text-gray-800 hover:text-orange-600"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <BellIcon className="h-6 w-6" />
                      <span>Notifications</span>
                    </motion.div>
                  </Link>
                  <Link href="/declutter/manage-items" onClick={closeMenu}>
                    <motion.div
                      className="flex items-center space-x-2 py-2 text-gray-800 hover:text-orange-600"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ShoppingCartIcon className="h-6 w-6" />
                      <span>Sell Item</span>
                    </motion.div>
                  </Link>
                  <Link href="/declutter/requests" onClick={closeMenu}>
                    <motion.div
                      className="flex items-center space-x-2 py-2 text-gray-800 hover:text-orange-600"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ClipboardDocumentListIcon className="h-6 w-6" />
                      <span>                    View Messages
                      </span>
                    </motion.div>
                  </Link>
                  <Link href="/declutter/manage-items" onClick={closeMenu}>
                    <motion.div
                      className="flex items-center space-x-2 py-2 text-gray-800 hover:text-orange-600"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ClipboardDocumentListIcon className="h-6 w-6" />
                      <span>Manage Products</span>
                    </motion.div>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <motion.button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center text-gray-800 hover:text-orange-600 py-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <Link href="/declutter/login" onClick={closeMenu}>
                  <motion.div
                    className="flex items-center text-gray-800 hover:text-orange-600 py-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Sign In
                  </motion.div>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}