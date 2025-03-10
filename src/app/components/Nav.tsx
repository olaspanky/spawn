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
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function Navbar({ searchTerm, setSearchTerm }: NavbarProps) {
  const { token, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const Greeting = () => (
    <div className="flex items-center space-x-2 text-lg text-white">
      <span>{greeting},</span>
      <span className="text-orange-600 font-medium">{user?.name || "User"}</span>
    </div>
  );

  return (
    <nav className="backdrop-blur-md bg-black/40 border-b border-white/5 shadow-md sticky top-0 z-50 font-semibold">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div>
          <h2 className="text-xl font-bold text-white">
            <Link href="/">
              <div className="inline-flex items-center hover:text-orange-400 transition-colors">
                TRADE<span className="text-orange-500">HUB</span>
              </div>
            </Link>
          </h2>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full py-2 pl-10 pr-10 text-sm rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {token ? (
            <>
              <Link href="/notifications">
                <BellIcon className="h-6 w-6 text-gray-700 hover:text-orange-600" />
              </Link>
              <Link href="/declutter/upload">
                <div className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Sell Item
                  <ShoppingCartIcon className="ml-2 h-5 w-5" />
                </div>
              </Link>
              <Link href="/declutter/requests">
                <div className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  View Requests
                  <ClipboardDocumentListIcon className="ml-2 h-5 w-5" />
                </div>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="hidden md:flex space-x-6 items-center">
              <Link href="/declutter/upload">
                <div className="inline-flex items-center bg-orange-600 text-white px-4 py-2 text-sm rounded-full font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl">
                  Sell Item
                  <ShoppingCartIcon className="h-4 w-4 ml-2" />
                </div>
              </Link>
              <Link href="/declutter/login">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                  Sign In
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Search + Menu */}
        <div className="md:hidden flex items-center justify-end space-x-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <Greeting />
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-orange-600 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden px-4 py-2 border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full py-2 pl-10 pr-10 text-sm rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 py-4 space-y-4">
            {token ? (
              <>
                <Link href="/notifications">
                  <div className="flex items-center space-x-2 py-2">
                    <BellIcon className="h-6 w-6 text-gray-700" />
                    <span className="text-gray-700">Notifications</span>
                  </div>
                </Link>
                <Link href="http://localhost:5173">
                  <div className="flex items-center space-x-2 py-2">
                    <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                    <span className="text-gray-700">Sell Item</span>
                  </div>
                </Link>
                <Link href="/declutter/requests">
                  <div className="flex items-center space-x-2 py-2">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-700" />
                    <span className="text-gray-700">View Requests</span>
                  </div>
                </Link>
                <hr className="my-2" />
                <button
                  onClick={logout}
                  className="flex items-center text-gray-700 hover:text-orange-600 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/declutter/login">
                <div className="flex items-center text-gray-700 hover:text-orange-600 py-2">
                  Sign In
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}