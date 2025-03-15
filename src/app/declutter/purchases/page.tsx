"use client";

import { useEffect, useState } from "react";
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

const PurchasesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Fetch user's purchases when the page loads
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        if (!token) {
          throw new Error("Authentication token is missing. Please log in.");
        }

        setLoading(true);
        const response = await fetch("http://localhost:5000/api/purchases/purchases", {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch purchases");
        }

        const data: Order[] = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPurchases();
    } else if (!loading && !orders.length && !error) {
      setError("Please log in to view your purchases");
      setLoading(false);
    }
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-orange-200"></div>
          <p className="text-gray-600">Loading your purchases...</p>
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
          <Link href="/" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // No purchases found
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Purchases Yet</h2>
          <p className="text-gray-500">You haven’t made any purchases. Start shopping now!</p>
          <Link href="/products" className="inline-block mt-6 text-orange-600 hover:text-orange-700">
            Browse Products
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
          <Link href="/" className="text-gray-600 hover:text-orange-600 transition">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold ml-4 text-gray-800">My Purchases</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Purchases</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={order.item.images[0] || "/placeholder-image.jpg"}
                      alt={order.item.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <Link
                        href={`/purchases/${order._id}`}
                        className="text-lg font-medium text-gray-800 hover:text-orange-600 transition"
                      >
                        {order.item.title}
                      </Link>
                      <p className="text-sm text-gray-500">Price: ₦{order.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Seller: {order.seller.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.status === "completed" ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : order.status === "pending" ? (
                      <ClockIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
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
                    <Link
                      href={`/declutter/purchase/${order._id}`}
                      className="text-orange-600 hover:text-orange-700 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchasesPage;