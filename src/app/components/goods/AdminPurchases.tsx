'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Purchase } from '@/app/types/goods';
import toast from 'react-hot-toast';
import { ShoppingCart, Check, X } from 'lucide-react';
import { goodsApi } from '@/app/lib/api2';


const AdminPurchases: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      toast.error('Admin access required');
      return;
    }
    fetchPurchases();
  }, [user, token]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await goodsApi.getAllPurchases(token || '');
      setPurchases(data);
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('No token') || error.message.includes('Token is not valid')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else if (error.message.includes('Admin access')) {
        toast.error('Admin access required');
      } else {
        toast.error(error.message || 'Failed to fetch purchases');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (purchaseId: string, status: 'confirmed' | 'cancelled') => {
    setUpdating(purchaseId);
    try {
      const updatedPurchase = await goodsApi.updatePurchaseStatus(purchaseId, status, token || '');
      setPurchases((prev) =>
        prev.map((p) => (p._id === purchaseId ? updatedPurchase : p)),
      );
      toast.success(`Purchase ${status} successfully`);
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('No token') || error.message.includes('Token is not valid')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else if (error.message.includes('Admin access')) {
        toast.error('Admin access required');
      } else {
        toast.error(error.message || `Failed to ${status} purchase`);
      }
    } finally {
      setUpdating(null);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
          <ShoppingCart className="w-6 h-6 mr-2" />
          All Purchases
        </h1>

        {loading ? (
          <p className="text-gray-600 text-center">Loading purchases...</p>
        ) : purchases.length === 0 ? (
          <p className="text-gray-600 text-center">No purchases found.</p>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium text-gray-900">
                    Purchase ID: {purchase._id}
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
                  <strong>User:</strong> {purchase.userId.username} ({purchase.userId.email})
                </p>
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
                {purchase.status === 'pending' && (
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => updateStatus(purchase._id, 'confirmed')}
                      disabled={updating === purchase._id}
                      className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
                        updating === purchase._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(purchase._id, 'cancelled')}
                      disabled={updating === purchase._id}
                      className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ${
                        updating === purchase._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPurchases;