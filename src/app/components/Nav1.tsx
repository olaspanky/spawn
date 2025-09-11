'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Upload } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  tabs: { id: string; label: string; shortLabel: string; count: number }[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  goodsCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ tabs, activeTab, setActiveTab, setIsCartOpen, goodsCount }) => {
  const { getItemCount } = useCart();

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex items-center justify-between py-4 sm:py-6">
          <div className="flex items-center min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <img src="/assets/oja.jpeg" alt="Oja Logo" className="h-12 mb-1" />
              <p className="text-[10px] italic text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                Keep moving. let's do the running
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Link
              href="/goods/list"
              className="bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Upload List</span>
            </Link>
            {/* Items count - hidden on mobile */}
            <div className="hidden sm:block bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-medium text-sm">
              <Link className="inline-flex items-center space-x-1" href="/goods/list">
                {goodsCount} Items
              </Link>
            </div>
            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                  {getItemCount()}
                </span>
              )}
            </button>
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

        {/* Navigation Tabs - Mobile (Horizontal Scroll) */}
        <div className="sm:hidden pb-4">
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
  );
};

export default Navbar;