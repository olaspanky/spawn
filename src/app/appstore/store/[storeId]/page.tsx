"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowLeft } from 'react-icons/fi';

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
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`https://spawnback.onrender.com/api/store/${storeId}`);
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

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuantityChange = (item: StoreItem, change: number) => {
    if (!item.available) return;

    const currentQuantity = getItemQuantity(item._id);
    const newQuantity = currentQuantity + change;

    if (newQuantity < 0) return;

    setCart(prev => {
      if (newQuantity === 0) {
        return prev.filter(cartItem => cartItem.itemId !== item._id);
      }

      const existingItem = prev.find(cartItem => cartItem.itemId === item._id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.itemId === item._id
            ? { ...cartItem, quantity: newQuantity }
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

    if (change > 0) {
      toast.success(`${item.name} added to cart`, {
        position: 'bottom-center',
        style: {
          backgroundColor: '#4CAF50',
          color: 'white',
        },
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.itemId !== itemId));
    toast.success('Item removed from cart', {
      position: 'bottom-center',
      style: {
        backgroundColor: '#F44336',
        color: 'white',
      },
    });
  };

  const handleCheckout = async () => {
    if (!token) {
      toast.error('Please log in to checkout');
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const response = await fetch('https://spawnback.onrender.com/api/purchases', {
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

      toast.success('Purchase successful!', {
        icon: '🎉',
        style: {
          backgroundColor: '#4CAF50',
          color: 'white',
        },
      });
      setCart([]);
      router.push('/purchases');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700 max-w-md text-center">
          <p>{error || 'Store not found'}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          <button 
            onClick={() => setShowCart(!showCart)}
            className="relative text-gray-600 hover:text-gray-800"
          >
            <FiShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Store Info */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          {store.storeImage && (
            <div className="mb-4 h-48 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={store.storeImage} 
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{store.name}</h2>
          <p className="text-gray-600 mb-3">{store.description}</p>
          <div className="flex items-center text-gray-500">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{store.location}</span>
          </div>
        </div>

        {/* Menu Items with Quantity Controls */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu</h2>
        <div className="grid grid-cols-1 gap-4">
          {store.items.map((item) => {
            const quantity = getItemQuantity(item._id);
            return (
              <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">
                      {item.measurement.value} {item.measurement.unit === 'custom' ? item.measurement.customUnit : item.measurement.unit}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-semibold text-gray-900">₦{item.price.toLocaleString()}</span>
                      {!item.available && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Out of stock</span>
                      )}
                    </div>
                  </div>
                  
                  {quantity > 0 ? (
                    <div className="flex items-center ml-4">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={!item.available}
                        className={`p-2 rounded-lg ${
                          item.available
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="mx-2 w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        disabled={!item.available}
                        className={`p-2 rounded-lg ${
                          item.available
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={!item.available}
                      className={`ml-4 flex-shrink-0 py-2 px-4 rounded-lg ${
                        item.available 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${showCart ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl transform transition-transform duration-300 ${showCart ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ maxHeight: '80vh' }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center">
                <FiShoppingCart className="mx-auto text-gray-300" size={48} />
                <p className="mt-4 text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                  {cart.map((item) => (
                    <div key={item.itemId} className="flex items-center py-3 border-b border-gray-100">
                      <div className="flex-1">
                        <h3 className="text-gray-800 font-medium">{item.name}</h3>
                        <p className="text-gray-500 text-sm">
                          ₦{item.price.toLocaleString()} · {item.measurement.value} {item.measurement.unit === 'custom' ? item.measurement.customUnit : item.measurement.unit}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleQuantityChange(store.items.find(i => i._id === item.itemId)!, -1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <FiMinus size={18} />
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(store.items.find(i => i._id === item.itemId)!, 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <FiPlus size={18} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.itemId)}
                          className="ml-3 p-1 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₦{totalPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Checkout · ₦{totalPrice.toLocaleString()}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-10 flex items-center"
        >
          <FiShoppingCart size={24} />
          <span className="ml-2 font-medium">{totalItems}</span>
        </button>
      )}
    </div>
  );
};

export default StoreDetail;