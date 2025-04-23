"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { 
  FiShoppingCart, 
  FiPlus, 
  FiMinus, 
  FiTrash2, 
  FiArrowLeft, 
  FiClock, 
  FiMapPin, 
  FiStar,
  FiHeart,
  FiInfo
} from "react-icons/fi";
import CheckoutModal from "../../../components/CheckoutModal";
import Navbar from "../../../components/Nav"; // Import Navbar component

interface StoreItem {
  _id: string;
  name: string;
  measurement: { unit: string; value: number; customUnit?: string };
  price: number;
  available: boolean;
  image?: string;
  description?: string;
  category?: string;
}

interface CartItem {
  itemId: string;
  name: string;
  measurement: { unit: string; value: number; customUnit?: string };
  price: number;
  quantity: number;
}

interface Store {
  _id: string;
  name: string;
  description: string;
  location: string;
  storeImage?: string;
  owner: { name: string };
  items: StoreItem[];
  rating?: number;
  deliveryTime?: string;
}

const StoreDetail: React.FC = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [liked, setLiked] = useState(false);
  const { token, user } = useAuth();
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  
  // For parallax scrolling effect
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 150], [1, 0.2]);
  const headerScale = useTransform(scrollY, [0, 150], [1, 0.95]);
  
  const placeholderImages: { [key: string]: string } = {
    "Rice": "/images/food/rice.jpg",
    "Beans": "/images/food/beans.jpg",
    "Chicken": "/images/food/chicken.jpg",
    "Soup": "/images/food/soup.jpg",
    // Default categories for organization
    "Popular": "/images/categories/popular.jpg",
    "Main": "/images/categories/main.jpg",
    "Sides": "/images/categories/sides.jpg",
    "Drinks": "/images/categories/drinks.jpg",
    "Desserts": "/images/categories/desserts.jpg",
  };

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://spawnback.vercel.app/api/store/${storeId}`);
        if (!response.ok) throw new Error("Failed to fetch store");
        const data = await response.json();
        
        // Enhance data with additional fields for visual appeal
        const enhancedData = {
          ...data,
          rating: data.rating || 4.7,
          deliveryTime: data.deliveryTime || "20-30 min",
          items: data.items.map((item: StoreItem) => ({
            ...item,
            image: item.image || placeholderImages[item.name] || "/images/food/default.jpg",
            description: item.description || "Delicious freshly prepared food made with quality ingredients",
            category: item.category || ["Main", "Sides", "Drinks", "Desserts"][Math.floor(Math.random() * 4)]
          }))
        };
        
        setStore(enhancedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };
    fetchStore();
  }, [storeId]);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem(`cart-${storeId}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart");
      }
    }
  }, [storeId]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (cart.length > 0) {
      localStorage.setItem(`cart-${storeId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`cart-${storeId}`);
    }
  }, [cart, storeId]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find((item) => item.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getCategories = () => {
    if (!store) return ["All"];
    const categories = Array.from(new Set(store.items.map(item => item.category || "Other")));
    return ["All", ...categories];
  };

  const filteredItems = () => {
    if (!store) return [];
    if (activeCategory === "All") return store.items;
    return store.items.filter(item => item.category === activeCategory);
  };

  const handleQuantityChange = (item: StoreItem, change: number) => {
    if (!item.available) return;

    const currentQuantity = getItemQuantity(item._id);
    const newQuantity = currentQuantity + change;

    if (newQuantity < 0) return;

    setCart((prev) => {
      if (newQuantity === 0) {
        return prev.filter((cartItem) => cartItem.itemId !== item._id);
      }
      const existingItem = prev.find((cartItem) => cartItem.itemId === item._id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.itemId === item._id ? { ...cartItem, quantity: newQuantity } : cartItem
        );
      }
      return [
        ...prev,
        {
          itemId: item._id,
          name: item.name,
          measurement: item.measurement,
          price: item.price,
          quantity: 1,
        },
      ];
    });

    if (change > 0) {
      toast.success(`${item.name} added to cart`, );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.itemId !== itemId));
    toast.success("Item removed from cart", );
  };


  const handleCheckout = () => {
    if (!token) {
      toast.error("Please log in to checkout", {
        duration: 3000,
        position: "bottom-center",
        style: { 
          borderRadius: "10px",
          background: "rgba(239, 68, 68, 0.95)",
          color: "white",
          backdropFilter: "blur(10px)",
          fontSize: "14px",
          padding: "12px 20px"
        },
      });
      router.push("/login");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        duration: 3000,
        position: "bottom-center",
        style: { 
          borderRadius: "10px",
          background: "rgba(239, 68, 68, 0.95)",
          color: "white", 
          backdropFilter: "blur(10px)",
          fontSize: "14px",
          padding: "12px 20px"
        },
      });
      return;
    }
    setShowCart(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    toast.success("Purchase successful!", {
      duration: 3000,
      icon: "🎉",
      position: "bottom-center",
      style: { 
        borderRadius: "10px",
        background: "rgba(16, 185, 129, 0.95)",
        color: "white",
        backdropFilter: "blur(10px)",
        fontSize: "14px",
        padding: "12px 20px"
      },
    });
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 1.5, ease: "linear", repeat: Infinity },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="h-16 w-16 border-t-4 border-b-4 border-indigo-600 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-indigo-800 font-medium text-lg"
          >
            Loading store...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <FiInfo size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error || "Store not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-indigo-200 focus:outline-none"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Header with Parallax */}
       <div className="hidden lg:flex items-center"> 
            <Navbar searchTerm="" setSearchTerm={() => {}} />
      
            </div>
      <motion.div 
        ref={headerRef}
        style={{
          opacity: headerOpacity,
          scale: headerScale
        }}
        className="relative h-[40vh] overflow-hidden "
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10" />
        <Image
          src={store.storeImage || "/fs.svg"}
          alt={store.name}
          layout="fill"
          objectFit="cover"
          className="z-0"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">{store.name}</h1>
            <div className="flex items-center space-x-4 text-white mb-3">
              <span className="flex items-center">
                <FiStar className="text-yellow-400 mr-1" />
                <span>{store.rating}</span>
              </span>
              <span className="flex items-center">
                <FiClock className="mr-1" />
                <span>{store.deliveryTime}</span>
              </span>
              <span className="flex items-center">
                <FiMapPin className="mr-1" />
                <span>{store.location}</span>
              </span>
            </div>
            <p className="text-white/90 max-w-xl">{store.description}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 transition p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <FiArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-medium text-gray-900 hidden md:block">{store.name}</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'} hover:bg-gray-200 transition-colors`}
            >
              <FiHeart size={20} className={liked ? "fill-red-500" : ""} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
              aria-label="View cart"
            >
              <FiShoppingCart size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Category Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-1 overflow-x-auto flex items-center space-x-2 no-scrollbar">
          {getCategories().map(category => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems().map((item) => {
            const quantity = getItemQuantity(item._id);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-56 relative">
                  <Image
                    src={item.image || "/images/food/default.jpg"}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 hover:scale-110"
                  />
                  {item.category && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  )}
                  {!item.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg transform rotate-12">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="font-bold text-indigo-700 text-lg">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-3">
                    {item?.measurement?.value}{" "}
                    {item?.measurement?.unit === "custom"
                      ? item?.measurement?.customUnit
                      : item?.measurement?.unit}
                  </p>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {item?.description}
                  </p>
                  
                  <div className="mt-4">
                    {quantity > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={!item.available}
                            className="p-2 rounded-full bg-white text-gray-700 shadow-sm"
                          >
                            <FiMinus size={14} />
                          </motion.button>
                          <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item, 1)}
                            disabled={!item.available}
                            className="p-2 rounded-full bg-white text-gray-700 shadow-sm"
                          >
                            <FiPlus size={14} />
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item._id)}
                          className="p-2.5 rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleQuantityChange(item, 1)}
                        disabled={!item.available}  
                        className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 ${
                          item.available
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-indigo-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        } transition-all duration-300`}
                      >
                        <FiShoppingCart size={18} />
                        <span>Add to Cart</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cart Header */}
              <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FiShoppingCart className="mr-2" size={22} />
                    Your Cart
                  </h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="h-full flex flex-col">
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <FiShoppingCart className="text-gray-400" size={36} />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
                      <p className="text-gray-500 mb-6">Add items from the menu to start your order</p>
                      <button
                        onClick={() => setShowCart(false)}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                      >
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-5">
                      {cart.map((item) => (
                        <motion.div
                          key={item.itemId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <div className="flex items-center text-gray-500 text-sm mt-1">
                                <span>₦{item.price.toLocaleString()}</span>
                                <span className="mx-2">•</span>
                                <span>
                                  {item?.measurement?.value}{" "}
                                  {item?.measurement?.unit === "custom"
                                    ? item?.measurement?.customUnit
                                    : item?.measurement?.unit}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-semibold text-indigo-700">
                                ₦{(item?.price * item?.quantity).toLocaleString()}
                              </span>
                              
                              <div className="flex items-center mt-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    removeFromCart(item?.itemId)
                                  }
                                  className="p-1.5 rounded-full text-red-500 hover:bg-red-50"
                                >
                                  <FiTrash2 size={16} />
                                </motion.button>
                                
                                <div className="flex items-center space-x-1 bg-gray-100 rounded-full ml-2 p-1">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleQuantityChange(
                                        store.items.find((i) => i._id === item?.itemId)!,
                                        -1
                                      )
                                    }
                                    className="p-1 rounded-full bg-white text-gray-700 shadow-sm"
                                  >
                                    <FiMinus size={12} />
                                  </motion.button>
                                  <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleQuantityChange(
                                        store.items.find((i) => i._id === item?.itemId)!,
                                        1
                                      )
                                    }
                                    className="p-1 rounded-full bg-white text-gray-700 shadow-sm"
                                  >
                                    <FiPlus size={12} />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Fee</span>
                        <span>₦500</span>
                      </div>
                      <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span className="text-indigo-700">₦{(totalPrice + 500).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      <span>Proceed to Checkout</span>
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        store={store}
        storeId={typeof storeId === "string" ? storeId : ""}
        totalPrice={totalPrice + 500}
        product={{
          id: filteredItems()[0]?._id || "",
          title: filteredItems()[0]?.name || "Default Product",
          price: filteredItems()[0]?.price || 0,
        }}
        user={user}
        token={token}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

export default StoreDetail;