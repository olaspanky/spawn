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
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "./components/Nav1";
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

  const categories = useMemo(() => {
    const allCategories = items.map((item) => item.category);
    return ["All", ...Array.from(new Set(allCategories))];
  }, [items]);

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

  const handleShopMagicClick = () => {
    listingsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen font-sans antialiased relative bg-white  md:pb-0 flex flex-col gap-5">
       <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />
      {/* Main Content */}
      <div className="relative z-10 lg:pt-[88px] pt-[32px] pb-20">
        {/* Featured Items Slider */}
        <div className="relative overflow-hidden   backdrop-blur-md border-b border-white/5 shadow-md font-semibold py-5">
          <div className="container mx-auto lg:px-4 lg:py-4 p-2 md:py-3 flex flex-col md:flex-row items-start">
            {/* Left Section: Creative Slogan with White Background */}
           

            {/* Right Section: Featured Container with Drop Transition */}
            <div
              ref={featuredItemsRef}
              className="w-full md:w-1/2 flex flex-col  mt-4 md:mt-0"
              onMouseEnter={pauseSlider}
              onMouseLeave={pauseSlider}
            >

              <div className="relative h-[20vh] md:h-[260px] w-full overflow-hidden rounded-xl border shadow-md bg-white">
                {featuredItems.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex absolute inset-0 transition-all duration-700 ease-in-out  items-center ${
                      index === currentFeaturedIndex
                        ? "opacity-100 z-10 translate-y-0"
                        : "opacity-0 z-0 translate-y-[-100%]"
                    }`}
                  >
                    <div className=" w-1/2 p-2 md:p-5 z-10 order-2 md:order-1">
                    <h1 className="text-left text-xs">Hottest Deals</h1>

                      <div className="mb-1 md:mb-2">
                        <span className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-widest text-black bg-gray-200/30 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full backdrop-blur-sm">
                          {item.category}
                        </span>
                      </div>
                      <h1 className="text-sm sm:text-base md:text-3xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-1 md:mb-2 truncate w-full drop-shadow">
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
                        
                        <div className="flex items-center justify-between mt-3">
          
          <button className="px-4 py-1.5 bg-gray-100 text-gray-800 text-[10px] font-medium rounded-full hover:bg-gray-200 transition-all duration-300 shadow-sm">
          View Details
          </button>
        </div>
                      </Link>
                    </div>
                    <div className="w-1/2 relative h-full sm:h-[130px] md:h-[200px] overflow-hidden rounded-t-2xl  mt-0 md:mt-0 md:mx-3 order-1 md:order-2">
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
                            className="absolute bottom-2 right-2  backdrop-blur-md rounded-full p-1.5  transition-all duration-200 z-20 shadow-md hover:shadow-cyan-500/50"
                            onClick={(e) => toggleFavorite(e, item._id)}
                            aria-label={favorites.includes(item._id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {favorites.includes(item._id) ? (
                              <HeartIconSolid className="h-4 w-4 text-rose-500" />
                            ) : (
                              <HeartIcon className="h-4 w-4 " />
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
                        ? "h-1.5 w-4 md:h-1.5 md:w-6  shadow-md"
                        : "h-1.5 w-1.5 bg-gray-400 hover:bg-gray-600"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
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
                  {selectedCategory !== "All" ? `${selectedCategory} Items` : ""}
                  {/* <span className="ml-2 text-sm text-black-400">({filteredItems.length})</span> */}
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
          {/* <div className="container mx-auto px-4 py-6">
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
          </div> */}
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
    <div className="relative rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden h-full bg-white border border-gray-100">
      {/* Full-box Image */}
      <div className="relative w-full h-48 md:h-64">
        {hasValidImage ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ShoppingCartIcon className="h-10 w-10 text-gray-400" />
          </div>
        )}

        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Category Tag */}
       
        {/* Favorite Button */}
        <button
          className="absolute top-3 left-3 bg-white/80 rounded-full p-1.5 hover:bg-white transition-all duration-300 hover:scale-105"
          onClick={(e) => toggleFavorite(e, item._id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <HeartIconSolid className="lg:h-4 lg:w-4 h-2 w-2 text-red-500" />
          ) : (
            <HeartIconSolid className="lg:h-4 lg:w-4 h-2 w-2 text-gray-800" />
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="lg:p-4 p-1">
        <h4
          className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-600 to-gray-400 
          filter blur-[0.5px] truncate mb-1 tracking-tight text-[10px] lg:text-[16px]"
        >
          {item.title}
        </h4>
        <div className="flex flex-col gap-1">
          <span
            className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-600 to-gray-400 
            filter blur-[0.5px] text-[10px] lg:text-[16px]"
          >
            ₦{item.price.toLocaleString()}
          </span>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1 text-gray-600" />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-600 to-gray-400 
              filter blur-[0.5px] truncate max-w-[120px] md:max-w-[200px] text-[10px] lg:text-[16px]"
            >
              {item.location}
            </span>
          </div>
        </div>

        {/* Buy Now Button and Stats */}
        <div className="flex items-center justify-between mt-3">
          
          <button className="px-4 py-1.5 bg-gray-100 text-gray-800 text-[10px] font-medium rounded-full hover:bg-gray-200 transition-all duration-300 shadow-sm">
            Buy Now +
          </button>
        </div>
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










