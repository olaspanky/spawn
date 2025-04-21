"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CheckoutModal from "../../../components/CheckoutModal"; // Adjust path as needed

interface StoreItem {
  _id: string;
  name: string;
  measurement: { unit: string; value: number; customUnit?: string };
  price: number;
  available: boolean;
  image?: string; // Image URL for food item
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
}

const StoreDetail: React.FC = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { token, user } = useAuth();
  const router = useRouter();

  // Placeholder images for food items (replace with actual URLs from your API or storage)
  const placeholderImages: { [key: string]: string } = {
    "Rice": "/images/food/rice.jpg",
    "Beans": "/images/food/beans.jpg",
    "Chicken": "/images/food/chicken.jpg",
    "Soup": "/images/food/soup.jpg",
    // Add more mappings as needed
  };

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`https://spawnback.vercel.app/api/store/${storeId}`);
        if (!response.ok) throw new Error("Failed to fetch store");
        const data = await response.json();
        // Assign placeholder images if none provided
        const updatedItems = data.items.map((item: StoreItem) => ({
          ...item,
          image: item.image || placeholderImages[item.name] || "/images/food/default.jpg",
        }));
        setStore({ ...data, items: updatedItems });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };
    fetchStore();
  }, [storeId]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find((item) => item.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
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
      toast.success(`${item.name} added to cart`, {
        duration: 3000,
        position: "bottom-center",
        style: { backgroundColor: "#10B981", color: "white", borderRadius: "8px" },
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.itemId !== itemId));
    toast.success("Item removed from cart", {
      duration: 3000,
      position: "bottom-center",
      style: { backgroundColor: "#EF4444", color: "white", borderRadius: "8px" },
    });
  };

  const handleCheckout = () => {
    if (!token) {
      toast.error("Please log in to checkout", {
        duration: 3000,
        position: "bottom-center",
        style: { backgroundColor: "#EF4444", color: "white", borderRadius: "8px" },
      });
      router.push("/login");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        duration: 3000,
        position: "bottom-center",
        style: { backgroundColor: "#EF4444", color: "white", borderRadius: "8px" },
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
      style: { backgroundColor: "#10B981", color: "white", borderRadius: "8px" },
    });
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-12 w-12 border-t-4 border-blue-500 rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Store not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-md sticky top-0 z-20 mt-[88px]"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition"
            aria-label="Go back"
          >
            <FiArrowLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative text-gray-600 hover:text-gray-800 transition"
            aria-label="View cart"
          >
            <FiShoppingCart size={28} />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Store Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-xl shadow-md p-6"
        >
          {store.storeImage && (
            <div className="mb-6 h-64 rounded-lg overflow-hidden relative">
              <Image
                src={store.storeImage}
                alt={store.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{store.name}</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">{store.description}</p>
          <div className="flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{store.location}</span>
          </div>
        </motion.div>

        {/* Menu Items */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {store.items.map((item) => {
            const quantity = getItemQuantity(item._id);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 relative">
                  <Image
                    src=""
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                    placeholder="blur"
                    blurDataURL="/images/food/placeholder.jpg"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {item.measurement.value}{" "}
                    {item.measurement.unit === "custom"
                      ? item.measurement.customUnit
                      : item.measurement.unit}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xl font-semibold text-gray-900">
                      ₦{item.price.toLocaleString()}
                    </span>
                    {!item.available && (
                      <span className="ml-3 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    {quantity > 0 ? (
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={!item.available}
                          className={`p-2 rounded-full ${
                            item.available
                              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FiMinus size={16} />
                        </motion.button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item, 1)}
                          disabled={!item.available}
                          className={`p-2 rounded-full ${
                            item.available
                              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FiPlus size={16} />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuantityChange(item, 1)}
                        disabled={!item.available}
                        className={`py-2 px-4 rounded-lg font-medium ${
                          item.available
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Add to Cart
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
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-20 lg:bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <svg
                      className="w-6 h-6 text-gray-600"
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

                {cart.length === 0 ? (
                  <div className="py-12 text-center">
                    <FiShoppingCart className="mx-auto text-gray-300" size={64} />
                    <p className="mt-4 text-gray-600 text-lg">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-y-auto max-h-[50vh] space-y-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item.itemId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center py-4 border-b border-gray-100"
                        >
                          <div className="flex-1">
                            <h3 className="text-gray-900 font-medium">{item.name}</h3>
                            <p className="text-gray-600 text-sm">
                              ₦{item.price.toLocaleString()} · {item.measurement.value}{" "}
                              {item.measurement.unit === "custom"
                                ? item.measurement.customUnit
                                : item.measurement.unit}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleQuantityChange(
                                  store.items.find((i) => i._id === item.itemId)!,
                                  -1
                                )
                              }
                              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                            >
                              <FiMinus size={18} />
                            </motion.button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleQuantityChange(
                                  store.items.find((i) => i._id === item.itemId)!,
                                  1
                                )
                              }
                              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                            >
                              <FiPlus size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item.itemId)}
                              className="p-2 rounded-full text-red-500 hover:bg-red-100"
                            >
                              <FiTrash2 size={18} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between mb-4 text-lg">
                        <span className="text-gray-600 font-medium">Subtotal</span>
                        <span className="font-semibold text-gray-900">
                          ₦{totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCheckout}
                        className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                      >
                        Checkout · ₦{totalPrice.toLocaleString()}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && !showCart && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-2xl flex items-center z-10"
        >
          <FiShoppingCart size={24} />
          <span className="ml-2 font-medium">{totalItems}</span>
        </motion.button>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={{
          id: storeId as string,
          title: `${store?.name} Order`,
          price: totalPrice,
        }}
        user={user ? { id: user.id, email: user.email } : null}
        token={token}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

export default StoreDetail;