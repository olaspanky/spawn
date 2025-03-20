"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ShieldCheckIcon, PhoneIcon, MapPinIcon, TagIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { usePaystackPayment } from "react-paystack";
import { MessageSquare, PencilIcon } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

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
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { token, user } = useAuth();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("Product ID is missing");
        const response = await fetch(`https://spawnback.onrender.com/api/items/${id}`);
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

  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || "user@example.com",
    amount: product && product.price > 0 ? product.price * 100 : 0,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here",
    metadata: {
      custom_fields: [
        { display_name: "User ID", variable_name: "user_id", value: user?.id || "" },
        { display_name: "Product ID", variable_name: "product_id", value: id?.toString() || "" },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  interface PaystackResponse {
    reference: string;
  }

  interface VerificationResponse {
    success: boolean;
    order: { _id: string };
    message?: string;
  }

  const onSuccess = async (response: PaystackResponse) => {
    setIsVerifying(true);
    try {
      const verificationResponse = await fetch("https://spawnback.onrender.com/api/purchases/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({
          reference: response.reference,
          itemID: id,
        }),
      });

      if (!verificationResponse.ok) {
        const errorData = await verificationResponse.json();
        throw new Error(errorData.message || "Payment verification failed");
      }

      const verificationData: VerificationResponse = await verificationResponse.json();

      if (verificationData.success) {
        setPaymentSuccessful(true);
        router.push(`/declutter/purchase/${verificationData.order._id}`);
      } else {
        throw new Error(verificationData.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      alert("Payment verification failed. Please contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  const onClose = () => {
    console.log("Payment closed");
    alert("Payment was not completed. Please try again.");
  };

  const handlePayment = () => {
    if (!user) {
      alert("Please log in to make a payment.");
      router.push("/declutter/login");
      return;
    }

    if (!product) {
      alert("Product information is missing.");
      return;
    }

    if (config.amount <= 0) {
      alert("Invalid product price.");
      return;
    }

    if (!config.publicKey || config.publicKey === "pk_test_your_key_here") {
      alert("Payment configuration error. Please contact support.");
      return;
    }

    initializePayment({ onSuccess, onClose });
  };

  const handleClick = (e: React.MouseEvent) => {
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
          <div className="text-red-500 mb-4">❌</div>
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
          <div className="text-yellow-500 mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-500">We couldn't find the product you're looking for.</p>
          <Link href="/" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Discover Other Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 dark:bg-gradient-to-br dark:from-gray-50 dark:to-white dark:text-gray-800">
      <nav className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/80 dark:bg-white/80 border-b border-slate-700/50 dark:border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="transition-colors duration-300 text-slate-400 hover:text-orange-500">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl lg:text-2xl font-semibold ml-4 truncate text-white dark:text-gray-800">
            {product.title}
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/50 dark:bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-700/50 dark:border-slate-200/30">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-4 lg:p-8">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <ImageGallery images={product.images} title={product.title} />
              </div>
            </div>

            <div className="lg:w-1/2 p-6 lg:p-8 space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl lg:text-3xl font-bold">{product.title}</h2>
                <div className="flex items-center">
                  <TagIcon className="h-6 w-6 text-orange-500 mr-2" />
                  <span className="text-2xl lg:text-3xl font-semibold text-orange-500">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-700/50 dark:bg-orange-50 p-6 rounded-xl shadow-inner">
                <h3 className="font-semibold mb-3 text-lg text-white dark:text-gray-800 flex items-center">
                  <span className="bg-orange-500 w-2 h-6 rounded-full mr-3"></span>
                  Product Details
                </h3>
                <p className="text-slate-300 dark:text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center text-slate-300 dark:text-slate-600">
                <MapPinIcon className="h-5 w-5 mr-2 text-slate-400 dark:text-slate-500" />
                <span>{product.location}</span>
              </div>

              <div className="bg-slate-700/50 dark:bg-green-50 p-6 rounded-xl shadow-inner">
                <h3 className="font-semibold flex items-center text-white dark:text-gray-800 text-lg mb-4">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500" />
                  Seller Information
                </h3>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <span className="text-slate-200 dark:text-gray-700 font-medium">
                      {product.seller.username}
                    </span>
                    {product.seller.verified && (
                      <div className="ml-2 bg-green-900/30 dark:bg-green-100 text-green-400 dark:text-green-700 text-sm px-3 py-1 rounded-full flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <a
                    href={`tel:${product.seller.phone}`}
                    className="inline-flex items-center text-green-400 dark:text-green-600 hover:text-green-300 dark:hover:text-green-700 transition-colors duration-300"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    {product.seller.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 dark:border-slate-200/50 px-6 py-8 space-y-6 bg-slate-900/30 dark:bg-slate-50/50">
            {!paymentSuccessful && !isSeller && (
              <div className="max-w-lg mx-auto">
                <button
                  onClick={handlePayment}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-lg"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying Payment...
                    </>
                  ) : (
                    "Pay Now with Paystack"
                  )}
                </button>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-3 text-center">
                  Payments made outside this platform are not covered by our Terms of Service, and we
                  cannot guarantee buyer protection or dispute resolution.
                </p>
              </div>
            )}

            <div className="flex justify-center mt-6">
              {isSeller ? (
                <Link href="/declutter/manage-items" passHref>
                  <div className="flex items-center p-3 gap-3 rounded-xl bg-gradient-to-r from-orange-600/20 to-orange-500/20 hover:from-orange-600/30 hover:to-orange-500/30 dark:bg-orange-100 dark:hover:bg-orange-200 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                    <div className="w-12 h-12 p-3 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 shadow-lg flex items-center justify-center">
                      <PencilIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-orange-300 dark:text-orange-800 text-lg font-medium">
                      Manage Item
                    </span>
                  </div>
                </Link>
              ) : (
                <Link href={user ? `/pages/chat?sellerId=${sellerId}` : "#"} passHref>
                  <div
                    className="flex items-center p-3 gap-3 rounded-xl bg-gradient-to-r from-orange-600/20 to-orange-500/20 hover:from-orange-600/30 hover:to-orange-500/30 dark:bg-orange-100 dark:hover:bg-orange-200 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                    onClick={handleClick}
                  >
                    <div className="w-12 h-12 p-3 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 shadow-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-orange-300 dark:text-orange-800 text-lg font-medium">
                      {user ? "Chat with Seller" : "Login to Chat"}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="bg-slate-800 dark:bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-700/50 dark:border-slate-200/50 transform transition-all duration-300 animate-scaleIn">
            <h2 className="text-2xl font-bold text-white dark:text-slate-800 mb-4">Login Required</h2>
            <p className="text-slate-300 dark:text-slate-600 mb-6">
              You need to be logged in to chat with the seller. Would you like to login now?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancel}
                className="bg-slate-700 dark:bg-slate-200 text-slate-300 dark:text-slate-700 px-5 py-3 rounded-xl hover:bg-slate-600 dark:hover:bg-slate-300 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-3 rounded-xl hover:from-orange-700 hover:to-orange-600 transition-colors duration-300 shadow-lg"
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