"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/context/AuthContext";

// Define TypeScript interfaces for the order and related data
interface Item {
  _id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  status: string;
}

interface Seller {
  _id: string;
  username: string;
  verified: boolean;
}

interface Order {
  _id: string;
  buyer: string;
  seller: Seller;
  item: Item;
  price: number;
  paymentReference: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

const PurchaseDetailPage = () => {
  const { orderId } = useParams(); // Get the dynamic orderId from the URL
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  console.log("orderId is", orderId);
  console.log("token is", token);

  // Fetch order details when the page loads, but only when token is available
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId || !token) {
          throw new Error("Missing order ID or authentication token");
        }

        setLoading(true);
        const response = await fetch(`https://spawnback.onrender.com/api/purchases/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const data: Order = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrder();
    }
  }, [orderId, token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-orange-200"></div>
          <p className="text-gray-600">Loading your purchase...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops!</h2>
          <p className="text-gray-500">{error}</p>
          <Link href="/declutter/purchases" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Back to Purchases
          </Link>
        </div>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-500">We couldn’t find this purchase.</p>
          <Link href="/declutter/purchases" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Back to Purchases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/declutter/purchases" className="text-gray-600 hover:text-orange-600 transition">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold ml-4 text-gray-800">Purchase Details</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Payment Success Banner */}
          {order.status === "pending" && (
            <div className="bg-green-50 border-b border-green-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h2 className="text-lg font-semibold text-green-700">Payment Successful!</h2>
                  <p className="text-sm text-green-600">
                    Your purchase of "{order.item.title}" was completed successfully.
                  </p>
                </div>
              </div>
              <div className="text-green-500 text-sm">✓ Confirmed</div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{order.item.title}</h2>
                <p className="text-sm text-gray-500">Order ID: {order._id}</p>
              </div>
              <div className="flex items-center">
                {order.status === "completed" ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                ) : order.status === "pending" ? (
                  <ClockIcon className="h-6 w-6 text-yellow-500 mr-2" />
                ) : (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-2" />
                )}
                <span
                  className={`text-sm font-medium capitalize ${
                    order.status === "completed"
                      ? "text-green-600"
                      : order.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={order.item.images[0] || "/placeholder-image.jpg"}
                  alt={order.item.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Item Details</h3>
                  <p className="text-gray-600">{order.item.description}</p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">Price:</span> ₦{order.price.toLocaleString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Payment Reference:</span> {order.paymentReference}
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-700">Seller Information</h3>
              <div className="mt-2 flex items-center">
                <p className="text-gray-600">{order.seller.username}</p>
                {order.seller.verified && (
                  <span className="ml-2 bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-700">Order Timeline</h3>
              <div className="mt-2 space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Order Placed:</span>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6 flex justify-end space-x-4">
            <Link
              href="/declutter/purchases"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Back to Purchases
            </Link>
            {order.status === "pending" && (
              <Link
                href={`/pages/chat?sellerId=${order.seller._id}`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Contact Seller
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseDetailPage;