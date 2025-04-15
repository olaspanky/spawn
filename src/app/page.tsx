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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen font-sans antialiased relative">
      {/* Background Layers */}
      <div className="fixed inset-0 dark:bg-white bg-gradient-to-br from-gray-950 via-gray-900 to-black z-0"></div>
      <div className="fixed inset-0 dark:bg-white bg-[url('/noise-texture.png')] opacity-5 z-0"></div>
      <div className="fixed inset-0 dark:bg-white bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.05)_0%,transparent_600px)] z-0"></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Featured Items Slider */}
        <div className="relative overflow-hidden dark:bg-white backdrop-blur-md bg-black/40 border-b border-white/5 shadow-md font-semibold">
          <div
            ref={featuredItemsRef}
            className="container mx-auto px-4 py-8 md:py-16"
            onMouseEnter={pauseSlider}
            onMouseLeave={pauseSlider}
          >
            <div className="relative h-[380px] sm:h-[420px] md:h-[520px] w-full overflow-hidden rounded-2xl border dark:border- border-white/10 shadow-xl shadow-black/50">
              {featuredItems.map((item, index) => (
                <div
                  key={item._id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center ${
                    index === currentFeaturedIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-95"
                  }`}
                >
                  <div className="w-full md:w-1/2 p-4 md:p-10 text-white z-10 order-2 md:order-1">
                    <div className="mb-2 md:mb-3">
                      <span className="text-[10px] sm:text-xs md:text-xs uppercase tracking-widest dark:text-black  bg-gray-900/20 px-2 py-1 md:px-3 md:py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-xl md:text-5xl font-extrabold leading-tight bg-clip-text text-transparent dark:text-black bg-gradient-to-r from-white to-gray-200 mb-2 md:mb-4 truncate w-full">
                      {item.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-2xl font-medium dark:text-black text-gray-200 mb-3 md:mb-6">
                      ₦{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center mb-4 md:mb-8">
                      <MapPinIcon className="h-4 w-4 md:h-5 md:w-5 text-black mr-1.5 md:mr-2" />
                      <span className="text-gray-300 text-xs sm:text-sm md:text-base dark:text-black truncate">
                        {item.location}
                      </span>
                    </div>
                    <Link href={`/declutter/products/${item._id}`}>
                      <button className="bg-[#36454F] text-white px-4 py-2 sm:px-6 sm:py-2.5 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm md:text-sm font-semibold tracking-wide transition-all duration-300 shadow-md md:shadow-lg hover:shadow-gray-600/40 hover:scale-105">
                        View Details
                      </button>
                    </Link>
                  </div>
                  <div className="w-full md:w-1/2 relative h-[220px] sm:h-[260px] md:h-[400px] overflow-hidden rounded-t-2xl md:rounded-lg mt-0 md:mt-0 md:mx-6 order-1 md:order-2">
                    {item.images && item.images.length > 0 ? (
                      <div className="relative w-full h-full group">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-115"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 50vw"
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <button
                          className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md rounded-full p-2 hover:bg-black/95 transition-all duration-200"
                          onClick={(e) => toggleFavorite(e, item._id)}
                          aria-label={favorites.includes(item._id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          {favorites.includes(item._id) ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900/50 backdrop-blur-md">
                        <ShoppingCartIcon className="h-12 w-12 md:h-16 md:w-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 md:mt-6 space-x-2 md:space-x-3">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  className={`transition-all duration-300 ease-in-out rounded-full ${
                    index === currentFeaturedIndex
                      ? "h-2 w-6 md:h-2 md:w-8  bg-black"
                      : "h-2 w-2 dark:bg-black bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Filter Section */}
        <div className=" z-30 dark:bg-white bg-black/90 backdrop-blur-md border-b border-white/10 shadow-md">
          <div className="mx-auto px-4 lg:px-5 py-2 md:py-6 max-w-7xl">
            {/* <div className="flex justify-between items-center mb-1 lg:mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-white">Filter Categories</h3>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="text-gray-300 dark:text-black dark:hover:text-gray-500 hover:text-white transition-colors"
                aria-label={filterOpen ? "Collapse filters" : "Expand filters"}
              >
                {filterOpen ? (
                  <ChevronUpIcon className="h-6 w-6" />
                ) : (
                  <ChevronDownIcon className="h-6 w-6" />
                )}
              </button>
            </div> */}

            {filterOpen && (
              <div className="overflow-x-auto py-2 md:py-3 scrollbar-hidden relative flex flex-col lg:flex-row justify-between gap-5 w-full animate-fadeIn">
                <div className="flex space-x-3 md:space-x-4 min-w-min">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-[#36454F] text-white  scale-105 shadow-lg shadow-gray-600/20"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 border dark:text-black border-white/10 hover:border-white/20"
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
        <div className="relative z-10 container mx-auto px-4 py-6 md:py-8 mb-8">
          {filteredItems.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              <h3 className="text-lg md:text-xl font-semibold text-black  mb-4 md:mb-6 flex justify-between items-center">
                <span>
                  {selectedCategory !== "All" ? `${selectedCategory} Items` : "All Listings"}
                  <span className="ml-2 text-sm text-black-400">({filteredItems.length})</span>
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
        <footer className="relative z-10 dark:border-t dark:border-black  border-t border-white/10 dark:bg-white bg-black/40 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-white dark:text-black">
                  TRADE<span className="text-orange-500">HUB</span>
                </h2>
                <p className="text-gray-400 dark:text-black text-sm mt-1">The marketplace for all your needs</p>
              </div>
              <div className="flex space-x-4 text-sm text-gray-400 dark:text-black">
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
          <span className="text-[10px] md:text-xs font-medium text-white">{item.category}</span>
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
      <div className="p-3 md:p-4 text-white">
        <h4 className="font-semibold mb-1 truncate text-sm dark:text-black md:text-base">{item.title}</h4>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[#36454F] font-bold text-sm md:text-base">
            ₦{item.price.toLocaleString()}
          </span>
          <div className="flex items-center text-gray-400">
            <MapPinIcon className="h-3 w-3 mr-1 text-black" />
            <span className="text-[10px] md:text-xs truncate max-w-[80px]">{item.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen dark:bg-gradient-to-br dark:from-white dark:via-white dark:to-white bg-gradient-to-br from-gray-950 via-gray-900 to-black">
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










