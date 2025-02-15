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

export default function Navbar() {
  const { token, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine a greeting based on the current hour.
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const Greeting = () => (
    <div className="flex items-center space-x-2 text-lg text-gray-800">
      <span>{greeting},</span>
      <span className="text-orange-600 font-medium">{user?.name || "User"}</span>
    </div>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-semibold">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/">
            <div className="lg:text-3xl text-xl sm:text-4xl font-bold text-gray-900 hover:text-orange-600 transition-colors">
              SP<span className="text-orange-600">V</span>WN
            </div>
          </Link>
        </div>

        {/* Center: Greeting (visible on desktop) */}
        <div className="hidden md:block text-[8px] lg:text-md">
          <Greeting />
        </div>

        {/* Right: Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {token ? (
            <>
              <Link href="/notifications">
                <BellIcon className="h-6 w-6 text-gray-700 hover:text-orange-600" />
              </Link>
              <Link href="http://localhost:5173">
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
            <Link href="/declutter/login">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                Sign In
              </div>
            </Link>
          )}
        </div>

        {/* Mobile: Greeting + Menu Button */}
        <div className="md:hidden flex items-center justify-end space-x-4">
          <Greeting />
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-orange-600 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-end">
            
            </div>
            <div className="space-y-4">
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
        </div>
      )}
    </nav>
  );
}