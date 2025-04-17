// app/declutter/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, ShieldCheckIcon, MapPinIcon, TagIcon, UserIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { usePaystackPayment } from "react-paystack";
import { MessageSquare, PencilIcon, CreditCard, CheckCircle } from "lucide-react";
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");

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

  // Paystack configuration
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
    setPaymentStatus("processing");
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
        setPaymentStatus("success");
        setPaymentSuccessful(true);
        setTimeout(() => {
          router.push(`/declutter/purchase/${verificationData.order._id}`);
        }, 2000);
      } else {
        throw new Error(verificationData.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentStatus("failed");
      setTimeout(() => {
        setShowPaymentModal(false);
      }, 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  const onClose = () => {
    console.log("Payment closed");
    setShowPaymentModal(false);
    setPaymentStatus("idle");
  };

  const handlePayment = () => {
    if (!user) {
      setShowPopup(true);
      return;
    }

    if (!product) {
      setError("Product information is missing.");
      return;
    }

    if (config.amount <= 0) {
      setError("Invalid product price.");
      return;
    }

    if (!config.publicKey || config.publicKey === "pk_test_your_key_here") {
      setError("Payment configuration error. Please contact support.");
      return;
    }

    setShowPaymentModal(true);
    setPaymentStatus("idle");
    initializePayment({ onSuccess, onClose });
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

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setPaymentStatus("idle");
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
    <div className="min-h-screen font-sans bg-white text-black relative pb-20">
      <main className="max-w-7xl mx-auto lg:my-8 lg:px-8">
        <div className="bg-white overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 lg:p-8 ">
              <div className=" overflow-hidden h-[60vh]">
                <ImageGallery images={product.images} title={product.title} />
              </div>
            </div>

            <div className="lg:w-1/2 p-2 lg:p-8  lg:space-y-6">
              <div className="lg:space-y-3 p-2">
                <h1 className="text-xl lg:text-2xl font-semibold text-black">{product.title}</h1>
                <div className="flex items-center">
                  <span className="text-sm lg:text-md  text-black">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className=" p-2 lg:p-6 ">
                <h3 className="font-bold lg:mb-3 text-md lg:text-lg text-black flex items-center">
                  Description
                </h3>
                <p className="text-black whitespace-pre-line text-xs lg:text-md leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className=" text-md lg:text-lg p-2 lg:p-6 ">
                <h3 className="font-semibold flex items-center text-black text-lg lg:mb-3">
                  Seller Information
                </h3>
                <div className="flex flex-col lg:space-y-3 text-xs lg:text-md">
                  <div className="flex items-center">
                    <span className="text-black flex items-center font-medium">
                      <UserIcon className="lg:h-5 lg:w-5 h-3 w-3 mr-2 text-orange-700" />
                      {product.seller.username}
                    </span>
                    {product.seller.verified && (
                      <div className="ml-2  text-black text-sm px-3 py-1 rounded-full flex items-center">
                        <ShieldCheckIcon className="lg:h-5 lg:w-5 h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs lg:text-md text-black">
                    <MapPinIcon className="lg:h-5 lg:w-5 h-3 w-3 mr-2 text-xs text-orange-700" />
                    <span>{product.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Back Button */}
          <Link href="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeftIcon className="h-6 w-6 text-black" aria-label="Go back" />
          </Link>

          {/* Pay with Paystack Button */}
          {!paymentSuccessful && !isSeller ? (
            <button
              onClick={handlePayment}
              className="flex-1 mx-2 py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 flex items-center justify-center text-sm"
              disabled={isVerifying}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay Now
            </button>
          ) : isSeller ? (
            <Link href="/declutter/manage-items" className="flex-1 mx-2 py-2 px-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center text-sm">
              <PencilIcon className="mr-2 h-5 w-5" />
              Manage Item
            </Link>
          ) : null}

          {/* Chat Now Button */}
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
      </nav>

      {/* Custom Paystack Modal Container */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          onClick={handleModalClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={handleModalClose}
                className="p-2 bg-white/80 hover:bg-white rounded-full text-black transition-colors"
                aria-label="Close payment modal"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </div>

            {paymentStatus === "idle" && (
              <div id="paystackEmbedContainer" className="w-full h-[500px] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-4 border-green-500 rounded-full border-t-transparent"></div>
                </div>
              </div>
            )}

            {paymentStatus === "processing" && (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-xl font-bold text-gray-800">Processing Payment</h3>
                  <p className="text-gray-600">Please wait while we verify your payment...</p>
                </div>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Payment Successful!</h3>
                  <p className="text-gray-600">Redirecting you to your order details...</p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Payment Failed</h3>
                  <p className="text-gray-600">There was an issue processing your payment.</p>
                  <button
                    onClick={handleModalClose}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-700/50 transform transition-all duration-300 animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-slate-300 mb-6">
              You need to be logged in to proceed with payment or chat with the seller. Would you like to login now?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancel}
                className="bg-slate-700 text-slate-300 px-5 py-3 rounded-xl hover:bg-slate-600 transition-colors duration-300"
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