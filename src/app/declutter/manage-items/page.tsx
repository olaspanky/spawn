"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Define an interface for your item structure
interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
}

const ManageItems = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"delete" | "edit" | null>(null);
  const [itemToActOn, setItemToActOn] = useState<Item | null>(null);

  console.log("User is:", user);

  useEffect(() => {
    const fetchItems = async () => {
      if (!user || !token) {
        setLoading(false);
        router.push("/declutter/login"); // Redirect if no user or token
        return;
      }

      try {
        const response = await fetch(`https://spawnback.vercel.app/api/items/user/${user.id}`, {
          headers: token ? { "x-auth-token": token } : undefined,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data: Item[] = await response.json();
        console.log("Fetched items:", data);
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [token, user, router]);

  const handleDelete = async (id: string) => {
    if (!token) {
      router.push("/declutter/login");
      return;
    }

    try {
      const response = await fetch(`https://spawnback.vercel.app/api/items/${id}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token, // Token is guaranteed to be string here due to check
        },
      });
      if (!response.ok) throw new Error("Failed to delete item");
      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setShowModal(false);
      setItemToActOn(null);
      setAction(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/declutter/edit-item/${id}`);
    setShowModal(false);
    setItemToActOn(null);
    setAction(null);
  };

  const confirmAction = (item: Item, actionType: "delete" | "edit") => {
    setItemToActOn(item);
    setAction(actionType);
    setShowModal(true);
  };

  const cancelAction = () => {
    setShowModal(false);
    setItemToActOn(null);
    setAction(null);
  };

  const proceedWithAction = () => {
    if (action === "delete" && itemToActOn) {
      handleDelete(itemToActOn._id);
    } else if (action === "edit" && itemToActOn) {
      handleEdit(itemToActOn._id);
    }
  };

  if (loading) return <div className="text-center text-gray-500 text-lg">Loading...</div>;

  if (!user || !token) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Please log in to manage your items.</h1>
        <Link href="/declutter/login">
          <button className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 transition">
            Log In
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className=" mx-auto lg:p-6 p-2 bg-gray-50 mt-[88px]">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Manage Your Items</h1>
      <Link href="/declutter/upload">
        <button className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 transition mb-8">
          Add New Item
        </button>
      </Link>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl shadow-lg overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Section */}
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-xl">
                  No Image Available
                </div>
              )}
              {/* Content Section */}
              <div className="p-5">
                <h2 className="text-2xl font-bold text-gray-800 truncate">{item.title}</h2>
                <p className="text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                <p className="text-sm text-gray-500 mt-1">Category: {item.category}</p>
                <p className="text-lg font-semibold text-orange-600 mt-2">
                  ₦{item.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Location: {item.location}</p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => confirmAction(item, "edit")}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <PencilIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => confirmAction(item, "delete")}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">You have no items listed yet.</p>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {action === "delete" ? "Are You Sure?" : "Confirm Edit"}
            </h2>
            <p className="text-gray-600 mb-6">
              {action === "delete"
                ? `Do you really want to delete "${itemToActOn?.title}"? This action cannot be undone.`
                : `Are you sure you want to edit "${itemToActOn?.title}"?`}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelAction}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithAction}
                className={`${
                  action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 py-2 rounded-lg transition`}
              >
                {action === "delete" ? "Delete" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItems;