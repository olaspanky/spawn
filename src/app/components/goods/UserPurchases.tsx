'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { goodsApi } from '@/app/lib/api2';
import { Purchase } from '@/app/types/goods';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Calendar, 
  CreditCard, 
  DollarSign,
  ShoppingBag
} from 'lucide-react';

const UserPurchases: React.FC = () => {
  const { token, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(new Set());

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

  const togglePurchase = (purchaseId: string) => {
    setExpandedPurchases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 mt-9 lg:mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Purchases</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {purchases.length} {purchases.length === 1 ? 'order' : 'orders'} found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your purchases...</p>
            </div>
          </div>
        ) : purchases.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
              <p className="text-gray-500">Your purchase history will appear here once you make an order.</p>
            </div>
          </div>
        ) : (
          // Purchases List
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const isExpanded = expandedPurchases.has(purchase._id);
              
              return (
                <div
                  key={purchase._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Purchase Header - Always Visible */}
                  <button
                    onClick={() => togglePurchase(purchase._id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{purchase._id.slice(-8)}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              purchase.status
                            )}`}
                          >
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ShoppingBag className="w-4 h-4" />
                            {purchase.items.length} {purchase.items.length === 1 ? 'item' : 'items'}
                          </div>
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <DollarSign className="w-4 h-4" />
                            ${purchase.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Purchase Details - Collapsible */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      {/* Payment Reference */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <h4 className="text-sm font-semibold text-gray-700">Payment Reference</h4>
                        </div>
                        <p className="text-gray-600 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                          {purchase.paymentReference}
                        </p>
                      </div>

                      {/* Items List */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="w-4 h-4 text-gray-500" />
                          <h4 className="text-sm font-semibold text-gray-700">Order Items</h4>
                        </div>
                        <div className="space-y-3">
                          {purchase.items.map((item, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">
                                  {item.item.name}
                                </h5>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Qty: {item.item.quantity}</span>
                                  <span>•</span>
                                  <span>${item.item.price.toFixed(2)} each</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                  ${(item.item.price * item.item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-700">Total Amount</span>
                          <span className="text-xl font-bold text-blue-600">
                            ${purchase.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPurchases;