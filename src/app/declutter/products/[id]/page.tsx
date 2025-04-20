"use client"
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ShieldCheckIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { MessageSquare, PencilIcon, CreditCard, CheckCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Nav";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellIcon,
  ShoppingCartIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import CheckoutModal from "@/app/components/CheckoutModal";

const ImageGallery = dynamic(() => import("../../../components/ImageGallery"), { ssr: false });

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  location: string;
  images: string[];
  seller: {
    username: string;
    _id: string;
    phone: string;
    verified: boolean;
  };
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, user } = useAuth();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("Product ID is missing");
        const response = await fetch(`https://spawnback.vercel.app/api/items/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();

        setProduct({
          ...data,
          price: data.price,
          images: data.images.filter((img: string | null) => img !== null),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePayment = () => {
    if (!user) {
      setShowPopup(true);
      return;
    }

    if (!product) {
      setError("Product information is missing.");
      return;
    }

    if (product.price <= 0) {
      setError("Invalid product price.");
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowPopup(true);
    }
  };

  const handleLogin = () => {
    setShowPopup(false);
    router.push("/declutter/login");
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  const sellerId = product?.seller._id;
  const isSeller = user && sellerId === user.id;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-orange-200"></div>
          <div className="h-4 w-32 mx-auto bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops!</h2>
          <p className="text-gray-500">{error}</p>
          <Link href="/" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Return to Homepage
          </Link>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-yellow-500 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-500">We couldn't find the product you're looking for.</p>
          <Link href="/" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Discover Other Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen font-sans bg-gray-100 text-gray-900">
      <Navbar searchTerm="" setSearchTerm={() => {}} />

      <main className="max-w-7xl mx-auto lg:px-8 lg:pt-[88px]">
        {/* Breadcrumb Navigation - Hidden on Mobile */}
        <div className="hidden md:block mb-6">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/declutter" className="hover:text-orange-600">Declutter</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden lg:flex ">
          {/* Image Gallery */}
          <div className="lg:w-1/2 lg:p-6">
            <div className="overflow-hidden">
              <ImageGallery images={product.images} title={product.title} />
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-4 lg:p-6 flex flex-col">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-xl md:text-2xl font-semibold text-orange-600 mb-4">
                ₦{product.price.toLocaleString()}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-gray-900">{product.seller.username}</span>
                    {product.seller.verified && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-gray-600">{product.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Sticky on Desktop */}
            <div className="hidden lg:flex sticky lg:bottom-4 mt-6 lg:mt-0">
              {!isSeller ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handlePayment}
                    className="flex-1 py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all duration-300 flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay Now
                  </button>
                  {!isSeller && (
                    <Link href={user ? `/pages/chat?sellerId=${sellerId}` : "#"} passHref>
                      <button
                        onClick={handleChatClick}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label={user ? "Chat with seller" : "Login to chat"}
                      >
                        <MessageSquare className="h-6 w-6 text-black" />
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <Link href="/declutter/manage-items" className="block">
                  <button className="w-full py-3 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center">
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Manage Item
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="block mt-8 mb-20">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 px-4">More from this Seller</h3>
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 scrollbar-hide">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md p-4 snap-start md:w-auto"
              >
                <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                <h4 className="text-lg font-semibold text-gray-900">Product Title</h4>
                <p className="text-orange-600 font-semibold">₦10,000</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 z-50 py-2 rounded-t-2xl shadow-lg">
        <div className="flex justify-evenly items-center py-2 px-4">
          {/* Home */}
          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
            <Link href="/" aria-label="Home">
              <HomeIcon className="h-6 w-6 text-white hover:text-orange-400 transition-colors duration-300" />
            </Link>
          </motion.div>

          {/* Main Button (Pay Now or Manage Item) */}
          {!isSeller ? (
            <button
              onClick={handlePayment}
              className="w-36 py-2 px-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-300 flex items-center justify-center text-sm"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay Now
            </button>
          ) : (
            <Link
              href="/declutter/manage-items"
              className="w-auto py-2 px-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300 flex items-center justify-center text-sm"
            >
              <PencilIcon className="mr-2 h-5 w-5" />
              Manage Item
            </Link>
          )}

          {/* Chat */}
          {!isSeller && (
            <Link href={user ? `/pages/chat?sellerId=${sellerId}` : "#"} passHref>
              <button
                onClick={handleChatClick}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label={user ? "Chat with seller" : "Login to chat"}
              >
                <MessageSquare className="h-6 w-6 text-white hover:text-orange-400 transition-colors duration-300" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && product && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          product={{
            id: id?.toString() || "",
            title: product.title,
            price: product.price,
          }}
          user={user}
          token={token}
          onSuccess={(orderId) => {
            router.push(`/declutter/purchase/${orderId}`);
          }}
        />
      )}

      {/* Login Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to proceed with payment or chat with the seller. 
              Would you like to login now?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-900 px-5 py-3 rounded-xl hover:bg-gray-300 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="bg-orange-600 text-white px-5 py-3 rounded-xl hover:bg-orange-700 transition-colors duration-300"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}