

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ShieldCheckIcon, MapPinIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { PencilIcon, CreditCard, Share2, Star } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Navbar";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomeIcon, HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import CheckoutModal from "@/app/components/CheckoutModal";

const ImageGallery = dynamic(() => import("../../../components/ImageGallery"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-400">Loading gallery...</p>
    </div>
  ),
});

interface Seller {
  username: string;
  _id: string;
  phone: string;
  verified: boolean;
  memberSince?: string;
  rating?: number;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  description: string;
  location: string;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
  year?: number;
  dimensions?: string;
  delivery?: string;
  reason?: string;
  contact?: string;
  images: string[];
  seller: Seller;
  status: string;
  createdAt: string;
  views?: number;
  favorites?: number;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { token, user } = useAuth();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showWhatsAppBanner, setShowWhatsAppBanner] = useState(true);

  // WhatsApp Configuration
  const WHATSAPP_NUMBER = "+2347049374912";
  const WHATSAPP_MESSAGE = "Hello! I'm interested in this item: [PRODUCT_TITLE]. Can we discuss the deal?";
  const whatsappLink = product
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        WHATSAPP_MESSAGE.replace("[PRODUCT_TITLE]", product.title || "this item")
      )}`
    : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE.replace("[PRODUCT_TITLE]", "this item"))}`;

  // Handle WhatsApp banner dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem(`whatsappBannerDismissed_${id}`);
    if (dismissed) {
      setShowWhatsAppBanner(false);
    }
  }, [id]);

  const handleDismissBanner = () => {
    setShowWhatsAppBanner(false);
    localStorage.setItem(`whatsappBannerDismissed_${id}`, "true");
  };

  const fetchProduct = useCallback(async () => {
    try {
      if (!id) throw new Error("Product ID is missing");
      setLoading(true);

      const response = await fetch(`https://spawnback.vercel.app/api/items/${id}`);
      if (!response.ok) throw new Error("Product not found");
      const data = await response.json();

      setProduct({
        ...data,
        price: data.price,
        quantity: data.quantity,
        images: data.images.filter((img: string | null) => img !== null),
        views: Math.floor(Math.random() * 100) + 50,
        favorites: Math.floor(Math.random() * 20) + 5,
      });

      setTimeout(() => {
        fetchRelatedProducts(data.category, data.seller._id);
      }, 500);

      if (user) {
        checkIfFavorite(id.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const fetchRelatedProducts = async (category: string, sellerId: string) => {
    const mockProducts = Array(4)
      .fill(null)
      .map((_, idx) => ({
        _id: `related-${idx}`,
        title: `${category} Item ${idx + 1}`,
        price: Math.floor(Math.random() * 20000) + 5000,
        image: `/api/placeholder/${300 + idx}/${200 + idx}`,
        condition: idx % 2 === 0 ? "New" : "Used",
      }));

    setRelatedProducts(mockProducts);
  };

  const checkIfFavorite = async (productId: string) => {
    setIsFavorite(Math.random() > 0.7);
  };

  useEffect(() => {
    fetchProduct();

    const recordView = async () => {
      if (id && user) {
        // await fetch(`/api/products/${id}/view`, { method: 'POST' });
      }
    };

    recordView();
  }, [id, user, fetchProduct]);

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

    if (product.quantity <= 0) {
      setError("This item is out of stock.");
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      setShowPopup(true);
      return;
    }

    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareVia = (platform: string) => {
    const shareText = `Check out this ${product?.title} on Declutter: `;
    const shareUrl = `${window.location.origin}/declutter/item/${id}`;

    let shareLink = '';

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        return;
    }

    if (shareLink) {
      window.open(shareLink, "_blank");
    }

    setShowShareMenu(false);
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

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="hidden top-0 lg:flex items-center">
          <Navbar searchTerm="" setSearchTerm={() => {}} />
        </div>

        <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 lg:pt-[88px]">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden lg:flex animate-pulse">
            <div className="lg:w-1/2 h-80 bg-gray-200"></div>
            <div className="lg:w-1/2 p-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-orange-100 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 p-4 rounded-full inline-flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/declutter"
            className="inline-block px-5 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            Return to Declutter
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-500">We couldn't find the product you're looking for.</p>
          <Link href="/declutter" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Discover Other Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900">
      <div className="hidden lg:flex items-center">
        <Navbar searchTerm="" setSearchTerm={() => {}} />
      </div>

      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Share2 className="h-5 w-5" />
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl p-2 z-50">
                  <button
                    onClick={() => shareVia("whatsapp")}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => shareVia("twitter")}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                  >
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareVia("facebook")}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                  >
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareVia("copy")}
                    className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                  >
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </button>
            <button
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <HeartSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartOutline className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto  lg:px-8 pt-4 lg:pt-[88px] pb-20">
        <div className="hidden md:block mb-6">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate max-w-xs">{product.title}</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden lg:flex">
          <div className="lg:w-1/2 p-0 lg:p-6">
            <div className="overflow-hidden rounded-lg">
              <ImageGallery images={product.images} title={product.title} />
            </div>

            <div className="hidden lg:flex items-center justify-between mt-4">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleFavoriteToggle}
                  className="flex items-center text-gray-700 hover:text-red-500 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolid className="h-5 w-5 text-red-500 mr-1" />
                  ) : (
                    <HeartOutline className="h-5 w-5 mr-1" />
                  )}
                  <span>{isFavorite ? "Saved" : "Save"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center text-gray-700 hover:text-orange-600 transition-colors relative"
                >
                  <Share2 className="h-5 w-5 mr-1" />
                  <span>Share</span>
                  {showShareMenu && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl p-2 z-50">
                      <button
                        onClick={() => shareVia("whatsapp")}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                      >
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => shareVia("twitter")}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                      >
                        <span>Twitter</span>
                      </button>
                      <button
                        onClick={() => shareVia("facebook")}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                      >
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => shareVia("copy")}
                        className="flex items-center w-full p-2 hover:bg-gray-100 rounded"
                      >
                        <span>Copy Link</span>
                      </button>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex items-center text-gray-500 text-sm">
                <span className="flex items-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {product.views} views
                </span>
                <span className="flex items-center">
                  <HeartOutline className="h-4 w-4 mr-1" />
                  {product.favorites} saved
                </span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-4 lg:p-6 flex flex-col">
            <div className="flex-1">
              {product.status !== "available" || product.quantity === 0 ? (
                <div className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2">
                  {product.quantity === 0 ? "Out of Stock" : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </div>
              ) : (
                <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mb-2">
                  Available
                </div>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-xl md:text-2xl font-semibold text-orange-600 mb-4">
                ₦{product.price.toLocaleString()}
              </p>

              {product.status === "available" && product.quantity > 0 && !isSeller && (
                <div className="mb-4 flex gap-2 justify-between items-center">
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div>
                  <select
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                    className="w-24 lg:px-3 lg:py-2 p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {[...Array(Math.min(product.quantity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.quantity} {product.quantity === 1 ? "item" : "items"} available
                  </p>
                </div>
                </div>
              )}

              <div className="flex items-center justify-between lg:hidden mb-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="flex items-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {product.views}
                  </span>
                  <span className="flex items-center">
                    <HeartOutline className="h-4 w-4 mr-1" />
                    {product.favorites}
                  </span>
                </div>
              </div>

              <div className="block lg:hidden mb-4 border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 py-2 font-medium text-sm ${
                      activeTab === "details" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`flex-1 py-2 font-medium text-sm ${
                      activeTab === "description" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab("seller")}
                    className={`flex-1 py-2 font-medium text-sm ${
                      activeTab === "seller" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"
                    }`}
                  >
                    Seller
                  </button>
                </div>
              </div>

              <div className="block lg:hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "details" && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <div className="space-y-2 text-gray-600">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-900">Category</span>
                            <span>{product.category}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-900">Condition</span>
                            <span>{product.condition}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-900">Quantity Available</span>
                            <span>{product.quantity}</span>
                          </div>
                          {product.brand && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-900">Brand</span>
                              <span>{product.brand}</span>
                            </div>
                          )}
                          {product.model && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-900">Model</span>
                              <span>{product.model}</span>
                            </div>
                          )}
                          {product.year && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-900">Year</span>
                              <span>{product.year}</span>
                            </div>
                          )}
                          {product.dimensions && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-900">Dimensions</span>
                              <span>{product.dimensions}</span>
                            </div>
                          )}
                          {product.delivery && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-900">Delivery</span>
                              <span>{product.delivery}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-900">Listed On</span>
                            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "description" && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {product.description && (
                        <div className="mb-6">
                          <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>
                      )}

                      {product.reason && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reason for Selling</h3>
                          <p className="text-gray-600 leading-relaxed">{product.reason}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "seller" && (
                    <motion.div
                      key="seller"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-6">
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{product.seller.username}</span>
                              {product.seller.verified && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                  <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-400" />
                              {product.seller.rating || "4.5"} · Member since {product.seller.memberSince || "2023"}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-gray-600">{product.location}</span>
                          </div>
                          <div className="mt-4">
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                              aria-label="Chat on WhatsApp to negotiate and deal"
                              title="Chat on WhatsApp to negotiate and deal"
                            >
                              <svg
                                className="h-5 w-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.148-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.099-.198-.198-.297-.347zM12 20.25c-4.556 0-8.25-3.694-8.25-8.25S7.444 3.75 12 3.75s8.25 3.694 8.25 8.25c0 2.09-.812 4.012-2.144 5.474l.03-.024-2.414 1.255a.75.75 0 01-.986-.093l-.008-.009a8.204 8.204 0 01-2.728 1.347z" />
                              </svg>
                              Deal on WhatsApp
                              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-green-100 bg-green-800 rounded-full">
                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden lg:block">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-600">
                    <div>
                      <span className="block text-sm text-gray-500">Category</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Condition</span>
                      <span className="font-medium">{product.condition}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Quantity Available</span>
                      <span className="font-medium">{product.quantity}</span>
                    </div>
                    {product.brand && (
                      <div>
                        <span className="block text-sm text-gray-500">Brand</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.model && (
                      <div>
                        <span className="block text-sm text-gray-500">Model</span>
                        <span className="font-medium">{product.model}</span>
                      </div>
                    )}
                    {product.year && (
                      <div>
                        <span className="block text-sm text-gray-500">Year</span>
                        <span className="font-medium">{product.year}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="block text-sm text-gray-500">Dimensions</span>
                        <span className="font-medium">{product.dimensions}</span>
                      </div>
                    )}
                    {product.delivery && (
                      <div>
                        <span className="block text-sm text-gray-500">Delivery</span>
                        <span className="font-medium">{product.delivery}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-sm text-gray-500">Listed On</span>
                      <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                  </div>
                )}

                {product.reason && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Reason for Selling</h3>
                    <p className="text-gray-600 leading-relaxed">{product.reason}</p>
                  </div>
                )}

                <div className="border-t border-gray-100 my-6"></div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h3>
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-4">
                      <UserIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 text-lg">{product.seller.username}</span>
                        {product.seller.verified && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Star className="h-3 w-3 mr-1 text-yellow-400" />
                        {product.seller.rating || "4.5"} · Member since {product.seller.memberSince || "2023"}
                      </div>
                    </div>

                    {!isSeller && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center relative group"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.148-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.099-.198-.198-.297-.347zM12 20.25c-4.556 0-8.25-3.694-8.25-8.25S7.444 3.75 12 3.75s8.25 3.694 8.25 8.25c0 2.09-.812 4.012-2.144 5.474l.03-.024-2.414 1.255a.75.75 0 01-.986-.093l-.008-.009a8.204 8.204 0 01-2.728 1.347z" />
                        </svg>
                        Buy on whatsapp
                        <span className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Negotiate and complete your deal via our verified WhatsApp Business account
                        </span>
                      </a>
                    )}
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-orange-600 mr-3" />
                      <span className="text-gray-600">{product.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-600 mr-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.148-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.099-.198-.198-.297-.347zM12 20.25c-4.556 0-8.25-3.694-8.25-8.25S7.444 3.75 12 3.75s8.25 3.694 8.25 8.25c0 2.09-.812 4.012-2.144 5.474l.03-.024-2.414 1.255a.75.75 0 01-.986-.093l-.008-.009a8.204 8.204 0 01-2.728 1.347z" />
                      </svg>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[12px] lg:text-xs italic">
              <span className="text-orange-600">PLEASE NOTE:</span> The ESCROW system ensures "Your Money, Your Control" until you are satisfied and release the funds, Please keep all transactions within SpawnHub for your safety and control
            </div>
            <div className="text-sm text-gray-600 mt-2 flex items-center">
              <svg
                className="h-5 w-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5l-5-5 1.41-1.41L11 14.67l6.59-6.59L19 9.5l-8 8z" />
              </svg>
              Trade safely with our verified WhatsApp Business account for off-app deals
            </div>

            <div className="hidden lg:block mt-6">
              {!isSeller ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={handlePayment}
                    className="flex-1 py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all duration-300 flex items-center justify-center"
                    disabled={product.status !== "available" || product.quantity === 0}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {product.status === "available" && product.quantity > 0 ? "Pay Now" : "Item Unavailable"}
                  </button>
                  <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center relative group"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.148-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.099-.198-.198-.297-.347zM12 20.25c-4.556 0-8.25-3.694-8.25-8.25S7.444 3.75 12 3.75s8.25 3.694 8.25 8.25c0 2.09-.812 4.012-2.144 5.474l.03-.024-2.414 1.255a.75.75 0 01-.986-.093l-.008-.009a8.204 8.204 0 01-2.728 1.347z" />
                        </svg>
                        Buy on whatsapp
                        <span className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Negotiate and complete your deal via our verified WhatsApp Business account
                        </span>
                      </a>
                </div>
              ) : (
                <Link href="/declutter/manage-items" className="block w-full">
                  <button className="w-full py-3 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center">
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Manage Item
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 mb-20">
          <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
            <h3 className="text-xl font-semibold text-gray-900">More from this Seller</h3>
            <Link
              href={`/declutter/seller/${product.seller._id}`}
              className="text-orange-600 text-sm hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 scrollbar-hide pb-4">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item, index) => (
                <div
                  key={item._id}
                  className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden snap-start md:w-auto hover:shadow-lg transition-shadow"
                >
                  <Link href={`/declutter/item/${item._id}`}>
                    <div className="h-40 bg-gray-200 relative">
                      <div className="absolute top-2 right-2">
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                          {item.condition}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-orange-600 font-semibold mt-1">₦{item.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden snap-start md:w-auto"
                >
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-100 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-orange-100 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* WhatsApp CTA Banner for Mobile */}
      {showWhatsAppBanner && !isSeller && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-green-100 z-40 py-2 px-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5l-5-5 1.41-1.41L11 14.67l6.59-6.59L19 9.5l-8 8z" />
              </svg>
              <p className="text-sm text-gray-800">
                Negotiate & deal on WhatsApp with our verified account!
              </p>
            </div>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded-full hover:bg-green-200"
              aria-label="Dismiss WhatsApp banner"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-40 py-2 rounded-t-2xl shadow-lg border-t border-gray-100">
  <div className="flex items-center px-4">
    {/* Home icon container - fixed width for consistent spacing */}
    

    {/* Buttons container - takes remaining space */}
    <div className="flex-1 flex gap-2">
      {!isSeller ? (
        <>
          <button
            onClick={handlePayment}
            className="flex-1 py-3 px-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-300 flex items-center justify-center text-sm min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.status !== "available" || product.quantity === 0}
          >
            <CreditCard className="mr-2 h-5 w-5 flex-shrink-0" />
            <span className="whitespace-nowrap">
              {product.status === "available" && product.quantity > 0 ? "Pay Now" : "Unavailable"}
            </span>
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center text-sm min-h-[48px]"
            aria-label="Buy on our verified WhatsApp to negotiate and complete your purchase"
            title="Buy on our verified WhatsApp to negotiate and complete your purchase"
          >
            <svg
              className="h-5 w-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.148-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.099-.198-.198-.297-.347zM12 20.25c-4.556 0-8.25-3.694-8.25-8.25S7.444 3.75 12 3.75s8.25 3.694 8.25 8.25c0 2.09-.812 4.012-2.144 5.474l.03-.024-2.414 1.255a.75.75 0 01-.986-.093l-.008-.009a8.204 8.204 0 01-2.728 1.347z" />
            </svg>
            <span className="whitespace-nowrap">Buy on WhatsApp</span>
          </a>
        </>
      ) : (
        <Link
          href="/declutter/manage-items"
          className="flex-1 py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center text-sm min-h-[48px]"
        >
          <PencilIcon className="mr-2 h-5 w-5 flex-shrink-0" />
          <span className="whitespace-nowrap">Manage Item</span>
        </Link>
      )}
    </div>

   
  </div>
</div>

      {showCheckoutModal && product && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          product={{
            id: id?.toString() || "",
            title: product.title,
            price: product.price,
            quantity: selectedQuantity,
          }}
          user={user}
          token={token}
          cart={[]}
          storeId="default-store-id"
          store={{ name: "Default Store", location: "Default Location" }}
          totalPrice={product.price * selectedQuantity}
          onSuccess={(orderId) => {
            router.push(`/declutter/purchase/${orderId}`);
          }}
        />
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
          >
            <div className="mb-2 flex justify-center">
              <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Login Required</h2>
            <p className="text-gray-600 mb-6 text-center">
              You need to be logged in to proceed with this action.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-900 px-5 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="bg-orange-600 text-white px-5 py-3 rounded-xl hover:bg-orange-700 transition-colors duration-300 font-medium"
              >
                Login Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}