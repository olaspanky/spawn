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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const { token, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true); // Track navbar visibility
  const [lastScrollY, setLastScrollY] = useState(0); // Track last scroll position
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Hub");

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Scroll handling for hiding/showing navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px, hide navbar
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top, show navbar
        setIsNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Fetch user's stores
  useEffect(() => {
    if (!token || !user) {
      setStoreId(null);
      return;
    }
    const fetchUserStores = async () => {
      try {
        const response = await fetch(`https://spawnback.vercel.app/api/store/user/${user.id}`, {
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
      className="flex items-center space-x-2 text-sm sm:text-base text-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span>{greeting}</span>
      <span className="font-medium">{user?.name || "User"}</span>
    </motion.div>
  );

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
  };

  const mobileAccountVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const buttonVariants = {
    initial: { opacity: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const isAppStore = pathname.includes("/appstore");
  const isDeclutter = pathname.includes("/declutter") || pathname === "/";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isMobileAccountOpen]);

  const MarketDeclutterButton = ({ isMobile = false }: { isMobile?: boolean }) => (
    <AnimatePresence mode="wait">
      {isDeclutter && (
        <motion.div
          key="market"
          variants={buttonVariants}
          initial="initial"
          animate="initial"
          whileHover="hover"
          className={isMobile ? "flex" : ""}
        >
          <Link href="/appstore/stores">
            {isMobile ? (
              <StarIcon className="size-6 text-white hover:text-orange-400 transition-colors duration-300" />
            ) : (
              <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg">
                Market
                <StarIcon className="ml-2 size-5" />
              </div>
            )}
          </Link>
        </motion.div>
      )}
      {isAppStore && (
        <motion.div
          key="declutter"
          variants={buttonVariants}
          initial="initial"
          animate="initial"
          whileHover="hover"
          className={isMobile ? "flex" : ""}
        >
          <Link href="/">
            {isMobile ? (
              <StarIcon className="size-6 text-white hover:text-orange-400 transition-colors duration-300" />
            ) : (
              <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow обратно

-md hover:shadow-lg">
                Declutter
                <StarIcon className="ml-2 size-5" />
              </div>
            )}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Hide bottom navbar on dynamic product routes
  const hideBottomNavbar = pathname.startsWith("/declutter/products/");

  return (
    <nav className="font-sans h-full w-full">
      {/* Top Navbar (Desktop) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg shadow-lg transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-extrabold">
              <Link href="/">
                <div className="items-center text-white hover:text-orange-400 transition-colors duration-300">
                  <Image src={logo} alt="logo" className="h-auto lg:w-32 w-20" />
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
                  <Link href="/notifications" aria-label="Notifications">
                    <BellIcon className="h-6 w-6 text-white hover:text-orange-400 transition-colors duration-300" />
                  </Link>
                </motion.div>
                <MarketDeclutterButton />
                <motion.div variants={buttonVariants} initial="initial" whileHover="hover">
                  <Link href="/declutter/manage-items">
                    <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      Sell Item
                      <ShoppingCartIcon className="ml-2 h-5 w-5" />
                    </div>
                  </Link>
                </motion.div>
                <div className="relative" ref={dropdownRef}>
                  <motion.div variants={buttonVariants} initial="initial" whileHover="hover">
                    <button
                      onClick={toggleDropdown}
                      className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      aria-label="Account menu"
                    >
                      Account
                      <ChevronDownIcon className="ml-2 h-5 w-5" />
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                      >
                        <Link href="/pages/chat" onClick={closeDropdown}>
                          <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                            View Messages
                          </div>
                        </Link>
                        <Link href="/declutter/purchases" onClick={closeDropdown}>
                          <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                            <CreditCardIcon className="h-5 w-5 mr-2" />
                            Transactions
                          </div>
                        </Link>
                        <Link href="/declutter/manage-items" onClick={closeDropdown}>
                          <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            Manage Products
                          </div>
                        </Link>
                        {storeId && (
                          <Link href={`/appstore/managestore/${storeId}`} onClick={closeDropdown}>
                            <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                              <StarIcon className="h-5 w-5 mr-2" />
                              Manage Store
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            closeDropdown();
                          }}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
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
                <motion.div variants={buttonVariants} initial="initial" whileHover="hover">
                  <Link href="/declutter/upload">
                    <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      Sell Item
                      <ShoppingCartIcon className="ml-2 h-5 w-5" />
                    </div>
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} initial="initial" whileHover="hover">
                  <Link href="/declutter/login">
                    <div className="inline-flex items-center px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      Login
                    </div>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Placeholder */}
          <div className="md:hidden flex items-center space-x-4">
            {token && <Greeting />}
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <button onClick={toggleMobileAccount} aria-label="Account menu">
                <UserIcon className="h-6 w-6 text-white hover:text-orange-400 transition-colors duration-300" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Tabs (Only on Homepage) */}
        {pathname === "/" && (
          <div className="md:hidden flex justify-between items-center px-4 py-2 border-t border-gray-700">
            <div className="relative flex w-full">
              <Link href="/" className="flex-1">
                <button
                  onClick={() => setActiveTab("Hub")}
                  className={`w-full py-2 text-center font-medium text-sm transition-colors duration-300 ${
                    activeTab === "Hub" ? "text-orange-400" : "text-gray-300"
                  }`}
                >
                  Hub
                </button>
              </Link>
              <Link href="/appstore/stores" className="flex-1">
                <button
                  onClick={() => setActiveTab("Market")}
                  className={`w-full py-2 text-center font-medium text-sm transition-colors duration-300 ${
                    activeTab === "Market" ? "text-orange-400" : "text-gray-300"
                  }`}
                >
                  Market
                </button>
              </Link>
              <motion.div
                className="absolute bottom-0 h-1 bg-orange-400 rounded-full"
                initial={false}
                animate={{
                  x: activeTab === "Hub" ? "0%" : "100%",
                  width: "50%",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navbar (Mobile Only, Hidden on Dynamic Product Routes) */}
      {!hideBottomNavbar && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 z-50 py-2 rounded-t-2xl shadow-lg">
          <div className="flex justify-around items-center py-3">
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <Link href="/" aria-label="Home">
                <HomeIcon className="size-6 text-white hover:text-orange-400 transition-colors duration-300" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <MarketDeclutterButton isMobile />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <Link href="/declutter/purchases" aria-label="Purchases">
                <ShoppingCartIcon className="size-6 text-white hover:text-orange-400 transition-colors duration-300" />
              </Link>
            </motion.div>
            <div className="relative">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                <button
                  onClick={toggleMobileAccount}
                  aria-label="Account menu"
                  className="focus:outline-none"
                >
                  <UserIcon className="size-6 text-white hover:text-orange-400 transition-colors duration-300" />
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
                    className="absolute bottom-16 right-0 w-56 bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                  >
                    {token ? (
                      <>
                        <Link href="/pages/chat" onClick={closeMobileAccount}>
                          <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                            View Messages
                          </div>
                        </Link>
                        <Link href="/declutter/purchases" onClick={closeMobileAccount}>
                          <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                            <CreditCardIcon className="h-5 w-5 mr-2" />
                            Transactions
                          </div>
                        </Link>
                        <Link href="/declutter/manage-items" onClick={closeMobileAccount}>
                          <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            Manage Products
                          </div>
                        </Link>
                        {storeId && (
                          <Link href={`/appstore/managestore/${storeId}`} onClick={closeMobileAccount}>
                            <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
                              <StarIcon className="h-5 w-5 mr-2" />
                              Manage Store
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            closeMobileAccount();
                          }}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link href="/declutter/login" onClick={closeMobileAccount}>
                        <div className="px-4 py-2 text-white hover:bg-gray-700 transition-colors duration-200 flex items-center">
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
      )}
    </nav>
  );
}