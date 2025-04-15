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
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const { token, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false); // New state for mobile popup
  const [storeId, setStoreId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null); // Ref for mobile popup
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Hub'); // State to track active tab


  const now = new Date();
  const hour = now.getHours();
  let greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Fetch user's stores
  useEffect(() => {
    if (!token || !user) {
      setStoreId(null);
      return;
    }
    const fetchUserStores = async () => {
      try {
        const response = await fetch(`https://spawnback.onrender.com/api/store/user/${user.id}`, {
          headers: {
            "x-auth-token": token,
          },
        });
        if (response.ok) {
          const stores = await response.json();
          const ownedStore = stores.find((store: { _id: string; owner: string | { _id: string } }) => {
            const ownerId = typeof store.owner === "string" ? store.owner : store.owner?._id;
            return ownerId === user.id;
          });
          setStoreId(ownedStore ? ownedStore._id : null);
        } else {
          setStoreId(null);
        }
      } catch (err) {
        console.error("Failed to fetch user stores:", err);
        setStoreId(null);
      }
    };
    fetchUserStores();
  }, [token, user]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);
  const toggleMobileAccount = () => setIsMobileAccountOpen(!isMobileAccountOpen);
  const closeMobileAccount = () => setIsMobileAccountOpen(false);

  const Greeting = () => (
    <motion.div
      className="flex items-center space-x-2 text-sm sm:text-base dark:text-black text-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span>{greeting}</span>
      <span className=" font-medium">{user?.name || "User"}</span>
    </motion.div>
  );

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

  // Popup animation for mobile account menu
  const mobileAccountVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const flipVariants = {
    initial: { rotateY: 0, opacity: 1 },
    flip: {
      rotateY: 180,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
    enter: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const isAppStore = pathname.includes("/appstore");
  const isDeclutter = pathname.includes("/declutter") || pathname === "/";

  // Close dropdown and mobile account menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && isDropdownOpen) {
        closeDropdown();
      }
      if (
        mobileAccountRef.current &&
        !mobileAccountRef.current.contains(event.target as Node) &&
        isMobileAccountOpen
      ) {
        closeMobileAccount();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isMobileAccountOpen]);

  // Reusable Market/Declutter Button Component
  const MarketDeclutterButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <AnimatePresence mode="wait">
      {isDeclutter && (
        <motion.div
          key="market"
          variants={flipVariants}
          initial="initial"
          animate="enter"
          exit="flip"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className={isMobile ? "flex" : ""}
        >
          <Link href="/appstore/stores">
            {isMobile ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-white hover:text-orange-300 transition-colors duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            ) : (
              <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg">
                Market
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="ml-2 size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
              </div>
            )}
          </Link>
        </motion.div>
      )}
      {isAppStore && (
        <motion.div
          key="declutter"
          variants={flipVariants}
          initial="initial"
          animate="enter"
          exit="flip"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className={isMobile ? "flex" : ""}
        >
          <Link href="/">
            {isMobile ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-white hover:text-orange-300 transition-colors duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            ) : (
              <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                Declutter
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="ml-2 size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
              </div>
            )}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <nav className="font-sans">
      {/* Top Navbar (Desktop) */}
      <div className="backdrop-blur-lg bg-white  shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-xl sm:text-2xl font-extrabold text-white dark:text-gray-800">
            <Link href="/">
              <div className="inline-flex items-center text-black hover:text-orange-400 transition-colors duration-300">
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
                <Link href="/">
                  <BellIcon className="h-6 w-6 lg:h-7 lg:w-7 text-white hover:text-orange-400 transition-colors duration-300" />
                </Link>
              </motion.div>
              <MarketDeclutterButton />
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/manage-items">
                <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg">
                Sell Item
                    <ShoppingCartIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                </Link>
              </motion.div>
              <div className="relative" ref={dropdownRef}>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <button
                    onClick={toggleDropdown}
                    className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg"
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
                      className="absolute right-0 mt-2 w-56 bg-black overflow-hidden rounded-xl"
                    >
                      <Link href="/pages/chat" onClick={closeDropdown}>
                        <div className="px-4 py-2 text-white  hover:bg-gray-100 hover:text-black  transition-colors duration-200 flex items-center">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          View Messages
                        </div>
                      </Link>
                      <Link href="/declutter/purchases" onClick={closeDropdown}>
                        <div className="px-4 py-2 text-white  hover:bg-gray-100 hover:text-black transition-colors duration-200 flex items-center">
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Transactions
                        </div>
                      </Link>
                      <Link href="/declutter/manage-items" onClick={closeDropdown}>
                        <div className="px-4 py-2 text-white  hover:bg-gray-100 hover:text-black  transition-colors duration-200 flex items-center">
                          <Cog6ToothIcon className="h-5 w-5 mr-2" />
                          Manage Products
                        </div>
                      </Link>
                      {storeId && (
                        <Link href={`/appstore/managestore/${storeId}`} onClick={closeDropdown}>
                          <div className="px-4 py-2 text-white  hover:bg-gray-100 hover:text-black  transition-colors duration-200 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0 1.125.504 1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                              />
                            </svg>
                            Manage Store
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          closeDropdown();
                        }}
                        className="w-full text-left px-4 py-2 text-white hover:bg-gray-100 hover:text-black transition-colors duration-200 flex items-center"
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
            <div className="flex items-center space-x-6 lg:space-x-8">
              <MarketDeclutterButton />
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/upload">
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                    Sell Item
                    <ShoppingCartIcon className="ml-2 h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Link href="/declutter/login">
                  <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
                    Login
                  </div>
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Placeholder */}
        <div className="md:hidden flex items-center space-x-2">
          {token && <Greeting />}
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex justify-between items-center px-4 py-2 border-t border-white/10 ">
        <div className="relative flex w-full">
          <Link href="/" className="flex-1">
            <button
              onClick={() => setActiveTab('Hub')}
              className={`w-full py-2 text-center text-black font-medium ${
                activeTab === 'Hub' ? 'text-black' : 'text-black'
              }`}
            >
              Hub
            </button>
          </Link>
          <Link href="/appstore/stores" className="flex-1">
            <button
              onClick={() => setActiveTab('Market')}
              className={`w-full py-2 text-center text-black font-medium ${
                activeTab === 'Market' ? 'text-black' : 'text-black'
              }`}
            >
              Market
            </button>
          </Link>
          {/* Sliding Underline */}
          <motion.div
            className="absolute bottom-0 h-1 bg-[#36454F] rounded-full"
            initial={false}
            animate={{
              x: activeTab === 'Hub' ? '0%' : '100%',
              width: '50%',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>

      {/* Bottom Navbar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black z-50 py-1  rounded-t-2xl shadow-lg">
        <div className="flex justify-around items-center py-3">
          {/* Home */}
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
            <Link href="/">
              <HomeIcon className="size-6 text-white hover:text-orange-300 transition-colors duration-300" />
            </Link>
          </motion.div>

          {/* Market/Declutter */}
          {/* <MarketDeclutterButton isMobile /> */}

          {/* Sell Item */}
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
            <Link href="/declutter/purchases">
              <ShoppingCartIcon className="size-6 text-white hover:text-orange-300 transition-colors duration-300" />
            </Link>
          </motion.div>

          {/* Account (Popup Menu) */}
          <div className="relative">
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <button onClick={toggleMobileAccount}>
                <UserIcon className="size-6 text-white hover:text-orange-300 transition-colors duration-300" />
              </button>
            </motion.div>
            <AnimatePresence>
              {isMobileAccountOpen && (
                <motion.div
                  ref={mobileAccountRef}
                  variants={mobileAccountVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute bottom-16 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden"
                >
                  {token ? (
                    <>
                      <Link href="/pages/chat" onClick={closeMobileAccount}>
                        <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          View Messages
                        </div>
                      </Link>
                      <Link href="/declutter/purchases" onClick={closeMobileAccount}>
                        <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                          <CreditCardIcon className="h-5 w-5 mr-2" />
                          Transactions
                        </div>
                      </Link>
                      <Link href="/declutter/manage-items" onClick={closeMobileAccount}>
                        <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                          <Cog6ToothIcon className="h-5 w-5 mr-2" />
                          Manage Products
                        </div>
                      </Link>
                      {storeId && (
                        <Link href={`/appstore/managestore/${storeId}`} onClick={closeMobileAccount}>
                          <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                              />
                            </svg>
                            Manage Store
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          closeMobileAccount();
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/declutter/login" onClick={closeMobileAccount}>
                      <div className="px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors duration-200 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Sign In
                      </div>
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}