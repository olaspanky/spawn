"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, ShieldCheckIcon, PhoneIcon, MapPinIcon, TagIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { usePaystackPayment } from "react-paystack";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const { token, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
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
    email: "user@example.com", // Replace with actual buyer's email
    amount: product ? product.price * 100 : 0, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "your_paystack_public_key",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (response: { reference: string }) => {
    setIsVerifying(true);
    try {
      const verificationResponse = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: response.reference,
          productId: id,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error("Payment verification failed");
      }

      const verificationData = await verificationResponse.json();

      if (verificationData.success) {
        setPaymentSuccessful(true);
        alert("Payment successful! Your order is being processed.");

        const updatedProductResponse = await fetch(`https://spawnback.onrender.com/api/items/${id}`);
        if (updatedProductResponse.ok) {
          const updatedProduct = await updatedProductResponse.json();
          setProduct(updatedProduct);
        }
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
    alert("Payment was not completed. Please try again.");
  };

  const handlePayment = () => {
    if (!product) {
      alert("Product information is missing.");
      return;
    }

    initializePayment({
      onSuccess,
      onClose,
    });
  };

  const handleClick = () => {
    if (!user) {
      router.push("/login");
    }
  };

  const sellerId = product?.seller._id;

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
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-lg border-t border-white/10 font-sans">
      <nav className=" shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-gray-600 hover:text-orange-600 transition">
            <ArrowLeftIcon className="h-5 w-5 lg:h-6 lg:w-6" />
          </Link>
          <h1 className="text-lg lg:text-2xl font-semibold ml-4 truncate text-white">
            {product.title}
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto my-6 shadow-sm rounded-lg overflow-hidden ">
        <div className="flex gap-6 lg:flex-row flex-row">
          {/* Left: Image Gallery */}
          <div className="md:w-1/2 p-2 lg:p-6">
            <ImageGallery images={product.images} title={product.title} />
          </div>

          {/* Right: Product Info */}
          <div className="md:w-1/2 p-2 lg:p-8 space-y-2 lg:space-y-6">
            <div>
              <h2 className="text-[12px] lg:text-3xl font-bold text-white">{product.title}</h2>
              <div className="mt-4 flex items-center">
                <TagIcon className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600 mr-2" />
                <span className="text-[12px] lg:text-3xl font-semibold text-orange-600">
                  ₦{product.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-orange-50 p-1 lg:p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-800 text-[8px] lg:text-lg">
                Product Details
              </h3>
              <p className="text-gray-700 whitespace-pre-line text-[6px] lg:text-base">
                {product.description}
              </p>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-1 w-1 lg:h-6 lg:w-6 mr-2 text-gray-500" />
              <span className="text-[8px] lg:text-base">{product.location}</span>
            </div>

            <div className="bg-green-50 p-1 lg:p-6 rounded-lg lg:space-y-4">
              <h3 className="font-semibold flex items-center text-gray-800 text-[8px] lg:text-lg">
                <ShieldCheckIcon className="h-1 w-1 lg:h-6 lg:w-6 mr-2 text-green-600" />
                Seller Information
              </h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium text-[8px] lg:text-base">
                    {product.seller.username}
                  </span>
                  {product.seller.verified && (
                    <div className="ml-2 bg-green-100 text-green-700 text-[6px] lg:text-sm px-2 py-1 rounded-full flex items-center">
                      <ShieldCheckIcon className="h-1 w-1 lg:h-4 lg:w-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <a
                  href={`tel:${product.seller.phone}`}
                  className="inline-flex items-center text-green-600 hover:text-green-700 text-[8px] lg:text-base"
                >
                  <PhoneIcon className="h-2 w-2 lg:h-6 lg:w-6 mr-2" />
                  {product.seller.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="border-t border-gray-200 px-6 py-8 lg:px-8 space-y-6">
          {!paymentSuccessful && (
            <div className="max-w-lg mx-auto">
              <button
                onClick={handlePayment}
                className="w-full p-2 lg:py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition flex items-center justify-center text-[12px] lg:text-lg"
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
              <p className="text-[8px] lg:text-sm text-gray-500 mt-3 text-center">
                Payments made outside this platform are not covered by our Terms of Service, and we
                cannot guarantee buyer protection or dispute resolution.
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <Link href={user ? `/pages/chat?sellerId=${sellerId}` : "#"} passHref>
              <div
                className="flex justify-center items-center p-2 gap-3 lg:py-3 lg:px-6 rounded-lg bg-orange-100 hover:bg-orange-200 transition cursor-pointer"
                onClick={handleClick}
              >
                <div className="w-6 h-6 lg:w-12 lg:h-12 p-2 rounded-lg bg-orange-600 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="text-orange-800 p-2 text-xs lg:text-lg font-medium">
                  {user ? "Chat with Seller" : "Login to Chat"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}