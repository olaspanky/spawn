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
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react"; // Added useEffect and useRef
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const { token, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for mobile menu
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown

  const now = new Date();
  const hour = now.getHours();
  let greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  const Greeting = () => (
    <motion.div
      className="flex items-center space-x-2 text-sm sm:text-base dark:text-black text-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span>{greeting},</span>
      <span className="text-orange-400 font-medium">{user?.name || "User"}</span>
    </motion.div>
  );

  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.4, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
  };

  // Close menu and dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isMenuOpen) {
        closeMenu();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && isDropdownOpen) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isDropdownOpen]);

  return (
    <nav className="backdrop-blur-lg bg-gradient-to-r from-black/80 via-black/70 to-black/80 dark:from-white dark:via-white dark:to-white border-b border-white/10 dark:border-gray-200/20 shadow-2xl sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-xl sm:text-2xl font-extrabold text-white dark:text-gray-800">
            <Link href="/" onClick={closeMenu}>
              <div className="inline-flex items-center hover:text-orange-400 transition-colors duration-300">
                TRADE<span className="text-orange-500">HUB</span>
              </div>
            </Link>
          </h2>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {token ? (
            <>
              <Greeting />
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                <Link href="/" onClick={closeMenu}>
                  <BellIcon className="h-6 w-6 lg:h-7 lg:w-7 text-white hover:text-orange-400 transition-colors duration-300" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/manage-items" onClick={closeMenu}>
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                    Sell Item
                    <ShoppingCartIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                </Link>
              </motion.div>

              {/* Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <button
                    onClick={toggleDropdown}
                    className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Account
                    <ChevronDownIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </button>
                </motion.div>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden"
                    >
                      <Link href="/pages/chat" onClick={() => { closeMenu(); closeDropdown(); }}>
                        <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          View Messages
                        </div>
                      </Link>
                      <Link href="/declutter/purchases" onClick={() => { closeMenu(); closeDropdown(); }}>
                        <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Transactions
                        </div>
                      </Link>
                      <Link href="/declutter/manage-items" onClick={() => { closeMenu(); closeDropdown(); }}>
                        <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                          <Cog6ToothIcon className="h-5 w-5 mr-2" />
                          Manage Products
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          closeMenu();
                          closeDropdown();
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ThemeToggle />
            </>
          ) : (
            <div className="flex items-center space-x-6 lg:space-x-8">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/upload" onClick={closeMenu}>
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                    Sell Item
                    <ShoppingCartIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/login" onClick={closeMenu}>
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                    Login
                  </div>
                </Link>
              </motion.div>
              <ThemeToggle />
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          {token ? (
            <Greeting />
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Link href="/declutter/login" onClick={closeMenu}>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                  Login
                </div>
              </Link>
            </motion.div>
          )}
          <motion.button
            onClick={toggleMenu}
            className="text-white hover:text-orange-400 dark:text-black focus:outline-none p-2 rounded-full"
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
            ref={menuRef} // Attach ref to mobile menu
            className="md:hidden bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-2xl border-t border-gray-200/20 dark:border-gray-700/20"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-6 py-6 space-y-4">
              {token ? (
                <>
                  <motion.div variants={itemVariants}>
                    <Link href="/" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <BellIcon className="h-6 w-6" />
                        <span className="font-medium">Notifications</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/declutter/manage-items" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <ShoppingCartIcon className="h-6 w-6" />
                        <span className="font-medium">Sell Item</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/pages/chat" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <ChatBubbleLeftIcon className="h-6 w-6" />
                        <span className="font-medium">View Messages</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/declutter/purchases" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <CreditCardIcon className="h-6 w-6" />
                        <span className="font-medium">Transactions</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/declutter/manage-items" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <Cog6ToothIcon className="h-6 w-6" />
                        <span className="font-medium">Manage Products</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200">
                      <ThemeToggle />
                      <span className="font-medium">Toggle Theme</span>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <hr className="my-2 border-gray-200 dark:border-gray-700/50" />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200 w-full"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <Link href="/declutter/upload" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <ShoppingCartIcon className="h-6 w-6" />
                        <span className="font-medium">Sell Item</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/declutter/login" onClick={closeMenu}>
                      <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200 hover:text-orange-500 transition-colors duration-200">
                        <span className="font-medium">Sign In</span>
                      </div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center space-x-3 py-3 text-gray-800 dark:text-gray-200">
                      <ThemeToggle />
                      <span className="font-medium">Toggle Theme</span>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}