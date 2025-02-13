import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';


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

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 font-semibold">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Greeting */}
        <div className="hidden md:flex items-center space-x-2 text-lg text-gray-800">
          <span>{greeting},</span>
          <span className="text-orange-600">{user?.name || "User"}</span>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center justify-center">
          <Link href="/">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 hover:text-orange-600 transition-colors">
              SP<span className="text-orange-600">V</span>WN
            </div>
          </Link>
        </div>

        {/* Right: Navigation Links */}
        <div className="hidden md:flex items-center space-x-4">
  {token ? (
    <>
      <button
        onClick={logout}
        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
      >
        Logout
      </button>
     
      <Link href="/notifications">
        <BellIcon className="h-6 w-6 text-gray-700 hover:text-orange-600" />
      </Link>
    </>
  ) : (
    <Link href="/declutter/login">
      <div className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
        LogIn
      </div>
    </Link>
  )}
</div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
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
        <div className="md:hidden bg-white/90 backdrop-blur-lg shadow-lg">
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-lg text-gray-800">
                <span>{greeting},</span>
                <span className="text-orange-600">{user?.name || "User"}</span>
              </div>
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-orange-600 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-4">
  {token ? (
    <>
      <button
        onClick={logout}
        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
      >
        Logout
      </button>
      <Link href="http://localhost:5173">
        <div className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Sell Item
          <ShoppingCartIcon className="ml-2 h-5 w-5" />
        </div>
      </Link>
      <Link href="/declutter/upload">
        <div className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
         Chat now
        </div>
      </Link>
      <Link href="/notifications">
        <BellIcon className="h-6 w-6 text-gray-700 hover:text-orange-600" />
      </Link>
    </>
  ) : (
    <Link href="/declutter/login">
      <div className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
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