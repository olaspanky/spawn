"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import AddStoreItemForm from "../../../components/store/AddStoreItemForm";
import EditStoreItemForm from "../../../components/store/EditStoreItemForm";
import toast from "react-hot-toast";

interface StoreItem {
  _id: string;
  name: string;
  measurement: {
    unit: string;
    value: number;
    customUnit?: string;
  };
  price: number;
  image?: string;
}

interface Store {
  _id: string;
  name: string;
  owner: { _id: string; name: string };
}

const ManageStorePage: React.FC = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

  useEffect(() => {
    if (!storeId || !token) {
      setError("Please log in to manage a store");
      setLoading(false);
      return;
    }

    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const storeResponse = await fetch(`https://spawnback.vercel.app/api/store/${storeId}`, {
          headers: {
            "x-auth-token": token,
          },
        });
        if (!storeResponse.ok) {
          throw new Error(`Failed to fetch store: ${storeResponse.status}`);
        }
        const storeData = await storeResponse.json();
        setStore(storeData);
        setItems(storeData.items || []);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId, token]);

  useEffect(() => {
    if (!user || !store) return;

    const ownerId = store.owner?._id;
    if (!ownerId || ownerId !== user.id) {
      toast.error("You do not have access to manage this store");
      router.push("/");
    }
  }, [user, store, router]);

  const handleItemAdded = async () => {
    try {
      const response = await fetch(`https://spawnback.vercel.app/api/store/${storeId}`, {
        headers: {
          "x-auth-token": token!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to refresh store data");
      }
      const storeData = await response.json();
      setItems(storeData.items || []);
      toast.success("Item added successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleItemUpdated = async () => {
    try {
      const response = await fetch(`https://spawnback.vercel.app/api/store/${storeId}`, {
        headers: {
          "x-auth-token": token!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to refresh store data");
      }
      const storeData = await response.json();
      setItems(storeData.items || []);
      setEditingItem(null);
      toast.success("Item updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`https://spawnback.vercel.app/api/store/item/${itemId}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeId }), // Include storeId in body for authorization
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }
      setItems(items.filter((item) => item._id !== itemId));
      toast.success("Item deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Please log in to manage a store</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">{error || "Store not found"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Store: {store.name}</h1>

      {/* Add or Edit Item Form */}
      <div className="mb-8">
        {editingItem ? (
          <EditStoreItemForm
            storeId={store._id}
            item={editingItem}
            onItemUpdated={handleItemUpdated}
            onCancel={() => setEditingItem(null)}
          />
        ) : (
          <AddStoreItemForm storeId={store._id} onItemAdded={handleItemAdded} />
        )}
      </div>

      {/* Store Items List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Store Items</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">No items in this store yet.</p>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-white rounded-lg shadow-md flex items-center space-x-4"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">
                    Measurement: {item?.measurement?.value}{" "}
                    {item?.measurement?.unit === "custom" ? item?.measurement?.customUnit : item?.measurement?.unit}
                  </p>
                  <p className="text-gray-600">Price: ₦{item.price.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="py-1 px-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStorePage;