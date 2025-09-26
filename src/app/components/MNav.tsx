"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  id: string;
  label: string;
}

interface EnhancedNavbarProps {
  navItems: NavItem[];
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

const EnhancedNavbar: React.FC<EnhancedNavbarProps> = ({ navItems, activeSection, scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
        : 'bg-white/80 backdrop-blur-md shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
              <Image src="/oj.png" alt="Oja Logo" width={40} height={40} className="rounded-lg sm:w-12 sm:h-12" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Ojarunz</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-3 py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 group ${
                  activeSection === item.id 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-green-600 transition-all duration-300 ${
                  activeSection === item.id ? 'w-6' : 'w-0 group-hover:w-6'
                }`}></span>
              </button>
            ))}
            <div className="hidden lg:block ml-6">
              <button className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm">
                <span className="font-medium">Market Floor</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-2 border-t border-gray-100">
            <button className="w-full flex items-center justify-between px-4 py-3 text-left text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <span className="font-medium text-sm">Market Floor</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 transform ${
                  activeSection === item.id 
                    ? 'text-green-600 bg-green-50 scale-105' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default EnhancedNavbar;