'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Item {
  _id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  seller: {
    username: string;
  };
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const featuredItemsRef = useRef<HTMLDivElement>(null);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/items`);
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Automatic sliding for featured items
  useEffect(() => {
    if (!items.length) return;
    
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prevIndex) => 
        prevIndex === Math.min(items.length - 1, 3) ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [items]);

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = items.map(item => item.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, items]);

  // Featured items - first 4 items or all if less than 4
  const featuredItems = useMemo(() => {
    return items.slice(0, Math.min(4, items.length));
  }, [items]);

  // Navigation for featured slider
  const handlePrevFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === 0 ? Math.min(featuredItems.length - 1, 3) : prevIndex - 1
    );
  };

  const handleNextFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === Math.min(featuredItems.length - 1, 3) ? 0 : prevIndex + 1
    );
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen font-font2 relative overflow-hidden">
      {/* Gradient blurry background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-0"></div>
      <div className="fixed inset-0 bg-[url('/noise-texture.png')] opacity-5 z-0"></div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header section */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-black/40 border-b border-white/5">
          <div className="mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  <Link href="/">
                    <div className="inline-flex items-center hover:text-orange-400 transition-colors">
                      TRADE<span className="text-orange-500">HUB</span>
                    </div>
                  </Link>
                </h2>
              </div>
              
              <div className="hidden md:flex space-x-6 items-center">
                <button 
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
                
                <Link href="/declutter/upload">
                  <div className="inline-flex items-center bg-orange-600 text-white px-4 py-2 text-sm rounded-full font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl">
                    Sell Item
                    <ShoppingCartIcon className="h-4 w-4 ml-2" />
                  </div>
                </Link>
              </div>

              <div className="flex md:hidden items-center space-x-4">
                <button 
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-3 pb-3 border-t border-white/10 pt-3 animate-fadeIn">
                <div className="flex flex-col space-y-3">
                  <Link href="/declutter/upload">
                    <div className="inline-flex items-center bg-orange-600 text-white px-4 py-2 text-sm rounded-full font-semibold hover:bg-orange-700 transition-colors shadow-md w-full justify-center">
                      Sell Item
                      <ShoppingCartIcon className="h-4 w-4 ml-2" />
                    </div>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Search Bar - Expanded on click */}
            {searchOpen && (
              <div className="mt-3 pb-3 border-t border-white/10 pt-3 animate-fadeIn">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for items..."
                    className="w-full py-2 pl-10 pr-10 text-base rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
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
          </div>
        </header>

        {/* Featured items slider - similar to the watch display in the image */}
        <div className="relative overflow-hidden bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md">
          <div 
            ref={featuredItemsRef}
            className="mx-auto px-4 py-6 md:py-12"
          >
            <div className="relative h-[400px] md:h-[450px] w-full overflow-hidden">
              {featuredItems.map((item, index) => (
                <div 
                  key={item._id} 
                  className={`absolute inset-0 transition-opacity duration-1000 flex flex-col md:flex-row items-center ${
                    index === currentFeaturedIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className="w-full md:w-1/2 p-4 md:p-6 text-white z-10">
                    <div className="mb-2">
                      <span className="text-xs uppercase tracking-wider text-orange-400 bg-orange-900/30 px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 uppercase">{item.title}</h1>
                    <p className="text-xl md:text-2xl font-light text-gray-300 mb-4 md:mb-6">₦{item.price.toLocaleString()}</p>
                    <div className="mb-4 md:mb-6 flex items-center">
                      <MapPinIcon className="h-4 w-4 text-orange-400 mr-2" />
                      <span className="text-gray-300">{item.location}</span>
                    </div>
                    <Link href={`/declutter/products/${item._id}`}>
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 md:px-6 md:py-3 rounded-full uppercase text-sm tracking-wider font-semibold transition-colors shadow-lg hover:shadow-orange-600/30">
                        View Details
                      </button>
                    </Link>
                  </div>
                  <div className="w-full md:w-1/2 relative h-[200px] md:h-[400px] overflow-hidden rounded-lg mt-4 md:mt-0">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <ShoppingCartIcon className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation dots */}
            <div className="flex justify-center mt-4 space-x-2">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentFeaturedIndex ? 'bg-orange-500' : 'bg-white/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={handlePrevFeatured}
              className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-sm border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextFeatured}
              className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition-colors backdrop-blur-sm border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Section */}
        <div className="mx-auto px-4 py-4 md:py-6 mt-4 md:mt-6">
          <div className="overflow-x-auto py-2 md:py-3 scrollbar-hidden">
            <div className="flex space-x-2 md:space-x-3 min-w-min">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-orange-600 text-white scale-105 shadow-lg shadow-orange-600/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="mx-auto px-4 py-4 md:py-6 mb-6">
          {filteredItems.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex justify-between items-center">
                <span>
                  {selectedCategory !== 'All' ? `${selectedCategory} Items` : 'All Listings'}
                  <span className="ml-2 text-sm text-gray-400">({filteredItems.length})</span>
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {filteredItems.map((item) => (
                  <Link key={item._id} href={`/declutter/products/${item._id}`}>
                    <ListingCard item={item} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const ListingCard = ({ item }: { item: Item }) => {
  const hasValidImage = item.images?.length > 0 && item.images[0];

  return (
    <div className="rounded-xl shadow-lg hover:shadow-orange-500/10 transition-all transform hover:-translate-y-1 overflow-hidden group h-full bg-white/5 border border-white/5 backdrop-blur-sm">
      <div className="relative h-36 md:h-48 overflow-hidden">
        {hasValidImage ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
            <ShoppingCartIcon className="h-10 w-10 text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full p-1">
          <span className="text-[10px] md:text-xs font-medium text-white px-1.5 md:px-2">
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-3 text-white">
        <h4 className="font-semibold mb-1 truncate text-xs md:text-sm">{item.title}</h4>
        <div className="flex justify-between items-center mt-1">
          <span className="text-orange-500 font-bold text-xs md:text-sm">
            ₦{item.price.toLocaleString()}
          </span>
          <div className="flex items-center text-gray-400">
            <MapPinIcon className="h-3 w-3 mr-1 text-orange-400" />
            <span className="text-[10px] md:text-xs">{item.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="animate-pulse text-center">
      <ShoppingCartIcon className="h-16 w-16 text-orange-500 mx-auto" />
      <p className="text-center text-gray-300 mt-4">Loading items...</p>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="text-center bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-xl border border-white/10 mx-4">
      <XMarkIcon className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto" />
      <h2 className="text-xl md:text-2xl font-bold text-red-400 mt-4">Oops! Something went wrong</h2>
      <p className="text-red-300 mt-2 text-sm md:text-base">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-red-900/50 text-red-300 px-4 md:px-6 py-2 rounded-full hover:bg-red-800/50 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <div className="text-center bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-xl border border-white/10">
    <ShoppingCartIcon className="h-12 w-12 md:h-16 md:w-16 text-orange-500 mx-auto mb-4" />
    <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No items found</h3>
    {searchTerm && (
      <p className="text-gray-300 mb-4 text-sm md:text-base">
        No results for "<span className="font-medium">{searchTerm}</span>"
      </p>
    )}
    <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
  </div>
);

