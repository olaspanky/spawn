"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

interface StoreItem {
  _id: string;
  name: string;
  measurement: {
    unit: string;
    value: number;
    customUnit?: string;
  };
  price: number;
  available: boolean;
}

interface CartItem {
  itemId: string;
  name: string;
  measurement: {
    unit: string;
    value: number;
    customUnit?: string;
  };
  price: number;
  quantity: number;
}

interface Store {
  _id: string;
  name: string;
  description: string;
  location: string;
  storeImage?: string;
  owner: { name: string };
  items: StoreItem[];
}

const StoreDetail: React.FC = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/store/${storeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch store');
        }
        const data = await response.json();
        setStore(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  const addToCart = (item: StoreItem) => {
    if (!item.available) {
      toast.error(`${item.name} is not available`);
      return;
    }
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.itemId === item._id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.itemId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          itemId: item._id,
          name: item.name,
          measurement: item.measurement,
          price: item.price,
          quantity: 1,
        },
      ];
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.itemId !== itemId));
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    if (!token) {
      toast.error('Please log in to checkout');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          storeId,
          items: cart.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
          total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to checkout');
      }

      toast.success('Purchase successful!');
      setCart([]);
      router.push('/purchases'); // Redirect to a purchases history page (create this if needed)
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error || 'Store not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{store.name}</h1>
        <p className="text-gray-600 mb-4">{store.description}</p>
        <p className="text-gray-500 mb-6">Location: {store.location}</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Items Available</h2>
        <div className="grid grid-cols-1 gap-4">
          {store.items.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                <p className="text-gray-600">
                  {item.measurement.value} {item.measurement.unit === 'custom' ? item.measurement.customUnit : item.measurement.unit} - ₦{item.price}
                </p>
                <p className="text-sm text-gray-500">{item.available ? 'In Stock' : 'Out of Stock'}</p>
              </div>
              <button
                onClick={() => addToCart(item)}
                disabled={!item.available}
                className={`py-2 px-4 rounded-md text-white ${
                  item.available ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Cart</h2>
            {cart.map((item) => (
              <div key={item.itemId} className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-800">{item.name}</p>
                  <p className="text-gray-600">
                    {item.quantity} x {item.measurement.value} {item.measurement.unit === 'custom' ? item.measurement.customUnit : item.measurement.unit} - ₦{item.price * item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.itemId)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center mt-6">
              <p className="text-lg font-semibold text-gray-800">
                Total: ₦{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
              </p>
              <button
                onClick={handleCheckout}
                className="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;