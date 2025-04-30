"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const featuredItemsRef = useRef<HTMLDivElement>(null);
  // Add reference for the listings section
  const listingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/items`);
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    const savedFavorites = localStorage.getItem("tradehub-favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    fetchItems();
  }, []);

  useEffect(() => {
    localStorage.setItem("tradehub-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!items.length) return;

    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prevIndex) =>
        prevIndex === Math.min(items.length - 1, 3) ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [items]);

  const pauseSlider = () => {};

  const categories = useMemo(() => {
    const allCategories = items.map((item) => item.category);
    return ["All", ...Array.from(new Set(allCategories))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, items]);

  const featuredItems = useMemo(() => {
    return items.slice(0, Math.min(4, items.length));
  }, [items]);

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

  const toggleFavorite = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Handler for smooth scrolling to the listings section
  const handleShopMagicClick = () => {
    listingsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen font-sans antialiased relative lg:pt-[88px] pb-[80px] md:pb-0">
      {/* Main Content */}
      <div className="relative z-10">
        {/* Featured Items Slider */}
        <div className="relative overflow-hidden mt-[44px] lg:mt-0 backdrop-blur-md border-b border-white/5 shadow-md font-semibold py-5">
          <div className="container mx-auto lg:px-4 lg:py-4 p-2 md:py-3 flex flex-col md:flex-row items-start">
            {/* Left Section: Creative Slogan with White Background */}
            <div className="w-full md:w-1/2 lg:p-4 md:p-6 flex flex-col justify-center h-[190px] sm:h-[210px] md:h-[260px] relative overflow-hidden">
              {/* Subtle Background Pattern */}
              
              {/* Glowing Decorative Element */}
              
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent  bg-black mb-2 md:mb-4 animate-slideIn">
                Buy and Sell with confidence
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 font-light mb-4 md:mb-6 animate-slideInDelay drop-shadow-md">
                  At spawnhub, we prioritize your peace of mind, Our platform guarantees secure and transparent transactions, ensuring the financial safety of both buyers and sellers, Every step is designed to protect you, so you can focus on what matters-making great deals with ease.
                </p>
                <button
                  onClick={handleShopMagicClick}
                  className="relative bg-black text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-fit overflow-hidden group"
                >
                  <span className="relative z-10">Explore</span>
                </button>
              </div>
            </div>

            {/* Right Section: Featured Container with Drop Transition */}
            <div
              ref={featuredItemsRef}
              className="w-full md:w-1/2 flex flex-col items-end mt-4 md:mt-0"
              onMouseEnter={pauseSlider}
              onMouseLeave={pauseSlider}
            >
              <div className="relative h-[45vh] md:h-[260px] w-full overflow-hidden rounded-xl border shadow-md bg-white">
                {featuredItems.map((item, index) => (
                  <div
                    key={item._id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center ${
                      index === currentFeaturedIndex
                        ? "opacity-100 z-10 translate-y-0"
                        : "opacity-0 z-0 translate-y-[-100%]"
                    }`}
                  >
                    <div className="w-full md:w-1/2 p-2 md:p-5 z-10 order-2 md:order-1">
                      <div className="mb-1 md:mb-2">
                        <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-widest text-black bg-gray-200/30 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full backdrop-blur-sm">
                          {item.category}
                        </span>
                      </div>
                      <h1 className="text-sm sm:text-base md:text-3xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-cyan-600 mb-1 md:mb-2 truncate w-full drop-shadow">
                        {item.title}
                      </h1>
                      <p className="text-sm sm:text-base md:text-xl font-medium text-gray-700 mb-2 md:mb-4">
                        ₦{item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center mb-2 md:mb-4">
                        <MapPinIcon className="h-3 w-3 md:h-4 md:w-4 text-cyan-600 mr-1 md:mr-1.5" />
                        <span className="text-[10px] sm:text-xs md:text-sm text-gray-700 truncate">
                          {item.location}
                        </span>
                      </div>
                      <Link href={`/declutter/products/${item._id}`}>
                        <button className="relative bg-gradient-to-r from-gray-800 to-gray-700 text-white px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 overflow-hidden group">
                          <span className="relative z-10">View Details</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </button>
                      </Link>
                    </div>
                    <div className="w-full md:w-1/2 relative h-full sm:h-[130px] md:h-[200px] overflow-hidden rounded-t-2xl md:rounded-lg mt-0 md:mt-0 md:mx-3 order-1 md:order-2">
                      {item.images && item.images.length > 0 ? (
                        <div className="relative w-full h-full group">
                          {/* Blurred background image */}
                          <div
                            className="absolute inset-0 bg-cover bg-center filter blur-lg"
                            style={{ backgroundImage: `url(${item.images[0]})` }}
                          ></div>
                          {/* Main image */}
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            className="object-contain relative z-10 transition-transform duration-1000 ease-out group-hover:scale-110 drop-shadow-lg"
                            sizes="(max-width: 640px) 100vw, h-[40vh] (max-width: 768px) 80vw, 50vw"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>
                          <button
                            className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md rounded-full p-1.5 hover:bg-black/95 transition-all duration-200 z-20 shadow-md hover:shadow-cyan-500/50"
                            onClick={(e) => toggleFavorite(e, item._id)}
                            aria-label={favorites.includes(item._id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {favorites.includes(item._id) ? (
                              <HeartIconSolid className="h-4 w-4 text-rose-500" />
                            ) : (
                              <HeartIcon className="h-4 w-4 text-cyan-600" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200/50 backdrop-blur-md">
                          <ShoppingCartIcon className="h-8 w-8 md:h-12 md:w-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-2 md:mt-4 space-x-1.5 md:space-x-2">
                {featuredItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeaturedIndex(index)}
                    className={`transition-all duration-300 ease-in-out rounded-full ${
                      index === currentFeaturedIndex
                        ? "h-1.5 w-4 md:h-1.5 md:w-6 bg-cyan-600 shadow-md"
                        : "h-1.5 w-1.5 bg-gray-400 hover:bg-gray-600"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Filter Section */}
        <div className="z-30 backdrop-blur-md border-b border-white/10 shadow-md">
          <div className="mx-auto px-4 lg:px-5 py-2 md:py-6 max-w-7xl">
            {filterOpen && (
              <div className="overflow-x-auto py-2 md:py-3 scrollbar-hidden relative flex flex-col lg:flex-row justify-between gap-5 w-full animate-fadeIn">
                <div className="flex space-x-3 md:space-x-4 min-w-min">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-[#36454F] text-white scale-105 shadow-lg shadow-gray-600/20"
                          : "bg-white/5 hover:bg-white/10 border text-black border-white/10 hover:border-white/20"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="hidden md:flex space-x-6 items-center">
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="text-gray-300 hover:text-white transition-all duration-300 ease-in-out"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex md:hidden items-center space-x-4">
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="text-gray-300 hover:text-white transition-colors p-1 active:scale-90"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {searchOpen && filterOpen && (
              <div className="mt-3 pb-3 border-t border-white/10 pt-3 animate-fadeIn">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for items..."
                    className="w-full py-2 pl-10 pr-10 text-base rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-2.5 left-3" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Listings Section */}
        <div
          ref={listingsRef}
          className="relative z-10 container mx-auto p-2 lg:px-4 lg:py-6 md:py-8 mb-8"
        >
          {filteredItems.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              <h3 className="text-lg md:text-xl font-semibold text-black mb-4 md:mb-6 flex justify-between items-center">
                <span>
                  {selectedCategory !== "All" ? `${selectedCategory} Items` : "All Listings"}
                  <span className="ml-2 text-sm text-black-400">({filteredItems.length})</span>
                </span>
              </h3>
              <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-4 gap-2 md:gap-6">
                {filteredItems.map((item) => (
                  <Link key={item._id} href={`/declutter/products/${item._id}`}>
                    <ListingCard
                      item={item}
                      isFavorite={favorites.includes(item._id)}
                      toggleFavorite={toggleFavorite}
                    />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t bg-white backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-black">
                  TRADE<span className="text-orange-500">HUB</span>
                </h2>
                <p className="text-black text-sm mt-1">The marketplace for all your needs</p>
              </div>
              <div className="flex space-x-4 text-sm text-black">
                <Link href="/terms">
                  <span className="hover:text-white transition-colors">Terms</span>
                </Link>
                <Link href="/privacy">
                  <span className="hover:text-white transition-colors">Privacy</span>
                </Link>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors">Contact</span>
                </Link>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} TradeHub. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ... (ListingCard, LoadingState, ErrorState, EmptyState components remain unchanged)
const ListingCard = ({
  item,
  isFavorite,
  toggleFavorite,
}: {
  item: Item;
  isFavorite: boolean;
  toggleFavorite: (e: React.MouseEvent, id: string) => void;
}) => {
  const hasValidImage = item.images?.length > 0 && item.images[0];

  return (
    <div className="rounded-xl shadow-lg hover:shadow-gray-500/20 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group h-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 hover:border-white/15">
      <div className="relative h-40 md:h-52 overflow-hidden">
        {hasValidImage ? (
          <div className="relative w-full h-full">
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
            <ShoppingCartIcon className="h-10 w-10 text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-[8px] md:text-xs font-medium text-white">{item.category}</span>
        </div>
        <button
          className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/90"
          onClick={(e) => toggleFavorite(e, item._id)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <HeartIconSolid className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-white" />
          )}
        </button>
      </div>
      <div className="p-1 md:p-4 text-black">
        <h4 className="font-semibold mb-1 truncate text-[12px]  text-black md:text-base">{item.title}</h4>
        <div className="flex flex-col  mt-2">
          <span className="text-[#36454F] font-bold text-[12px]  md:text-base">
            ₦{item.price.toLocaleString()}
          </span>
          <div className="flex items-center text-gray-400">
            <MapPinIcon className="h-3 w-3 mr-1 text-black" />
            <span className="text-[10px] md:text-xs truncate max-w-[80px]">{item.location}</span>
          </div>
        </div>
      </div>
      <div className="  text-white  text-[12px] md:text-xs ">
        <button className="w-full lg:px-2 lg:py-3 px-2 py-1 bg-gray-900/95 text-left">Buy now</button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen  bg-white">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-t-2 border-black animate-spin"></div>
        <ShoppingCartIcon className="h-10 w-10 text-black absolute inset-0 m-auto" />
      </div>
      <p className="text-center text-gray-300 mt-4 animate-pulse">Loading the marketplace...</p>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
    <div className="text-center bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 mx-4 max-w-md">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
        <XMarkIcon className="h-12 w-12 text-red-500 absolute inset-0 m-auto" />
      </div>
      <h2 className="text-2xl font-bold text-red-400 mt-4">Oops! Something went wrong</h2>
      <p className="text-red-300 mt-2">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-2 rounded-full hover:from-red-800 hover:to-red-700 transition-all duration-300 shadow-lg"
      >
        Try Again
      </button>
    </div>
  </div>
);

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <div className="text-center bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 max-w-md mx-auto">
    <div className="relative w-16 h-16 mx-auto mb-4">
      <div className="absolute inset-0 rounded-full bg-gray-500/20"></div>
      <ShoppingCartIcon className="h-10 w-10 text-gray-500 absolute inset-0 m-auto" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
    {searchTerm && (
      <p className="text-gray-300 mb-4">
        No results for "<span className="font-medium">{searchTerm}</span>"
      </p>
    )}
    <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
  </div>
);










