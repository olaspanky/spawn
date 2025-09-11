"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiList, FiFile, FiMail, FiPhone, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Adjust path to your AuthContext
import { useRouter } from "next/navigation";

interface ShoppingList {
  _id: string;
  name: string;
  contactMethod: "email" | "phone";
  contactValue: string;
  files: { url: string; publicId: string; originalName: string; mimeType: string }[];
  status: string;
  createdAt: string;
}

const AdminShoppingListManager: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { token, user, isAuthLoading } = useAuth();
  const router = useRouter();

  console.log("Auth State:", { token, user, isAuthLoading });

  useEffect(() => {
    // Delay execution until component is mounted and auth is initialized
    if (isAuthLoading) return;

    // Check authentication and admin status
    if (!token || !user?.isAdmin) {
      toast.error("Admin access required");
      return;
    }

    // Fetch shopping lists
    const fetchShoppingLists = async () => {
      try {
        const response = await axios.get("https://spawnback.vercel.app/api/shopping-lists", {
          headers: { "x-auth-token": token },
        });
        setShoppingLists(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to fetch shopping lists";
          toast.error(message);
          if (error.response?.status === 401 || error.response?.status === 403) {
            router.push("/declutter/login");
          }
        } else {
          toast.error("Failed to fetch shopping lists");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingLists();

    // Cleanup to prevent memory leaks
    return () => {
      // No cleanup needed for axios, but included for completeness
    };
  }, [token, user, isAuthLoading, router]); // Dependencies ensure effect runs after auth is ready

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!token || !user?.isAdmin) {
      toast.error("Admin access required");
      router.push("/declutter/login");
      return;
    }

    setUpdating(id);
    try {
      const response = await axios.put(
        `https://spawnback.vercel.app/api/shopping-lists/${id}`,
        { status },
        {
          headers: { "x-auth-token": token },
        }
      );

      setShoppingLists((prev) =>
        prev.map((list) =>
          list._id === id ? { ...list, status } : list
        )
      );

      toast.success(response.data.message || "Status updated successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Failed to update status";
        toast.error(message);
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push("/declutter/login");
        }
      } else {
        toast.error("Failed to update status");
      }
    } finally {
      setUpdating(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FiList className="mr-2" /> Manage Shopping Lists
        </h2>

        {loading ? (
          <div className="flex justify-center">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
          </div>
        ) : shoppingLists.length === 0 ? (
          <p className="text-gray-500 text-center">No shopping lists found.</p>
        ) : (
          <div className="space-y-6">
            {shoppingLists.map((list) => (
              <div
                key={list._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      {list.contactMethod === "email" ? <FiMail className="mr-1" /> : <FiPhone className="mr-1" />}
                      Contact: {list.contactValue}
                    </p>
                    <p className="text-sm text-gray-600">Status: {list.status}</p>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(list.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Files:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {list.files.map((file, index) => (
                          <li key={index}>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-indigo-600 hover:underline"
                            >
                              <FiFile className="mr-1" /> {file.originalName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <select
                      value={list.status}
                      onChange={(e) => handleStatusUpdate(list._id, e.target.value)}
                      disabled={updating === list._id}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      {["Price Verification", "Paid", "Processing", "En Route", "Delivered", "Failed"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminShoppingListManager;