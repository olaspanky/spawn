'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { goodsApi } from '@/app/lib/api2';
import { Purchase } from '@/app/types/goods';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

const UserPurchases: React.FC = () => {
  const { token, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, [token]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('No authentication token found.');
      }
      const data = await goodsApi.getUserPurchases(token);
      setPurchases(data);
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to fetch your purchases');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 mt-9 lg:mt-20">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
          <ShoppingCart className="w-6 h-6 mr-2" />
          Your Purchases
        </h1>

        {loading ? (
          <p className="text-gray-600 text-center">Loading your purchases...</p>
        ) : purchases.length === 0 ? (
          <p className="text-gray-600 text-center">You have no purchases yet.</p>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium text-gray-900">
                    Order ID: {purchase._id}
                  </h2>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      purchase.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-800'
                        : purchase.status === 'confirmed'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600">
                  <strong>Payment Reference:</strong> {purchase.paymentReference}
                </p>
                <p className="text-gray-600">
                  <strong>Total Amount:</strong> ${purchase.totalAmount.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  <strong>Date:</strong>{' '}
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <strong>Items:</strong>
                  <ul className="list-disc pl-5">
                    {purchase.items.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {item.item.name} (Qty: {item.item.quantity}, Price: $
                        {item.item.price.toFixed(2)}, Total: $
                        {(item.item.price * item.item.quantity).toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPurchases;