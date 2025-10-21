// src/components/AdminDashboard.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Purchase } from '@/app/types/goods';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, 
  Check, 
  X, 
  MapPin, 
  DollarSign, 
  Info, 
  File, 
  Users, 
  Package,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  ShoppingBag,
  Clipboard
} from 'lucide-react';
import { goodsApi } from '@/app/lib/api2';
import { shoppingListsApi } from '@/app/lib/shoppingListsApi';
import { waitlistApi } from '@/app/lib/shoppingListsApi';

interface ShoppingList {
  _id: string;
  name: string;
  contactMethod: 'email' | 'phone';
  contactValue: string;
  files: { url: string; publicId: string; originalName: string; mimeType: string }[];
  status: string;
  createdAt: string;
}

interface WaitlistEntry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingShoppingLists, setLoadingShoppingLists] = useState(true);
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'purchases' | 'shoppingLists' | 'waitlist'>('purchases');
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(new Set());
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());

  const fetchPurchases = useCallback(async () => {
    setLoadingPurchases(true);
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
      setLoadingPurchases(false);
    }
  }, [token, logout]);

  const fetchShoppingLists = useCallback(async () => {
    setLoadingShoppingLists(true);
    try {
      const data = await shoppingListsApi.getAllShoppingLists(token || '');
      setShoppingLists(data);
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('No token') || error.message.includes('Token is not valid')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else if (error.message.includes('Admin access')) {
        toast.error('Admin access required');
      } else {
        toast.error(error.message || 'Failed to fetch shopping lists');
      }
    } finally {
      setLoadingShoppingLists(false);
    }
  }, [token, logout]);

  const fetchWaitlistEntries = useCallback(async () => {
    setLoadingWaitlist(true);
    try {
      const data = await waitlistApi.getAllWaitlistEntries(token || '');
      setWaitlistEntries(data);
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('No token') || error.message.includes('Token is not valid')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else if (error.message.includes('Admin access')) {
        toast.error('Admin access required');
      } else {
        toast.error(error.message || 'Failed to fetch waitlist entries');
      }
    } finally {
      setLoadingWaitlist(false);
    }
  }, [token, logout]);

  const updatePurchaseStatus = useCallback(
    async (purchaseId: string, status: 'confirmed' | 'cancelled') => {
      setUpdating(purchaseId);
      try {
        const updatedPurchase = await goodsApi.updatePurchaseStatus(purchaseId, status, token || '');
        setPurchases((prev) => prev.map((p) => (p._id === purchaseId ? updatedPurchase : p)));
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
    },
    [token, logout],
  );

  const updateShoppingListStatus = useCallback(
    async (id: string, status: string) => {
      setUpdating(id);
      try {
        const updatedList = await shoppingListsApi.updateShoppingListStatus(id, status, token || '');
        setShoppingLists((prev) => prev.map((list) => (list._id === id ? updatedList : list)));
        toast.success(`Status updated to ${status}`);
      } catch (error: any) {
        if (error.message.includes('Unauthorized') || error.message.includes('No token') || error.message.includes('Token is not valid')) {
          toast.error('Session expired. Please log in again.');
          logout();
        } else if (error.message.includes('Admin access')) {
          toast.error('Admin access required');
        } else {
          toast.error(error.message || 'Failed to update status');
        }
      } finally {
        setUpdating(null);
      }
    },
    [token, logout],
  );

  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchases();
    } else if (activeTab === 'shoppingLists') {
      fetchShoppingLists();
    } else if (activeTab === 'waitlist') {
      fetchWaitlistEntries();
    }
  }, [activeTab, fetchPurchases, fetchShoppingLists, fetchWaitlistEntries]);

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

  const toggleList = (listId: string) => {
    setExpandedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (statusLower === 'confirmed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (statusLower === 'cancelled' || statusLower === 'failed') return 'bg-red-100 text-red-700 border-red-200';
    if (statusLower === 'price verification') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (statusLower === 'paid') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (statusLower === 'processing') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (statusLower === 'en route') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (statusLower === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 mt-9 lg:mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage orders, lists, and waitlist</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'purchases'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Purchases
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {purchases.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shoppingLists')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'shoppingLists'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              Shopping Lists
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {shoppingLists.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'waitlist'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Waitlist
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {waitlistEntries.length}
              </span>
            </button>
          </div>
        </div>

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <>
            {loadingPurchases ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600">Loading purchases...</p>
                </div>
              </div>
            ) : purchases.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
                  <p className="text-gray-500">Purchase orders will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => {
                  const isExpanded = expandedPurchases.has(purchase._id);
                  
                  return (
                    <div
                      key={purchase._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* Purchase Header */}
                      <button
                        onClick={() => togglePurchase(purchase._id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
                            <Package className="w-5 h-5 text-indigo-600" />
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
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
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
                                {purchase.items?.length || 0} items
                              </div>
                              <div className="flex items-center gap-2 font-semibold text-gray-900">
                                <DollarSign className="w-4 h-4" />
                                ₦{(purchase.totalAmount ?? 0).toFixed(2)}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {purchase.dropOffLocation || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

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
                          isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          {/* Payment & Location Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
                                  <p className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                    {purchase.paymentReference}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div className="text-sm">
                                  <p className="text-gray-600">Service Charge: <span className="font-medium">₦{(purchase.serviceCharge ?? 0).toFixed(2)}</span></p>
                                  <p className="text-gray-600">Delivery Fee: <span className="font-medium">₦{(purchase.deliveryFee ?? 0).toFixed(2)}</span></p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Drop-off Location</p>
                                  <p className="text-sm text-gray-900">{purchase.dropOffLocation ?? 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Address Details</p>
                                  <p className="text-sm text-gray-900">{purchase.addressDetails ?? 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Package className="w-4 h-4 text-gray-500" />
                              <h4 className="text-sm font-semibold text-gray-700">Order Items</h4>
                            </div>
                            <div className="space-y-2">
                              {purchase.items?.length ? purchase.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                                >
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-1">
                                      {item.item?.name ?? 'Unknown Item'}
                                    </h5>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span>Qty: {item.item?.quantity ?? 0}</span>
                                      <span>•</span>
                                      <span>₦{(item.item?.price ?? 0).toFixed(2)} each</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                      ₦{((item.item?.price ?? 0) * (item.item?.quantity ?? 0)).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              )) : <p className="text-gray-500 text-sm">No items available</p>}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {purchase.status === 'pending' && (
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => updatePurchaseStatus(purchase._id, 'confirmed')}
                                disabled={updating === purchase._id}
                                className={`flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 font-medium ${
                                  updating === purchase._id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {updating === purchase._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                                Confirm Order
                              </button>
                              <button
                                onClick={() => updatePurchaseStatus(purchase._id, 'cancelled')}
                                disabled={updating === purchase._id}
                                className={`flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium ${
                                  updating === purchase._id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {updating === purchase._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                ) : (
                                  <X className="w-5 h-5" />
                                )}
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Shopping Lists Tab */}
        {activeTab === 'shoppingLists' && (
          <>
            {loadingShoppingLists ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600">Loading shopping lists...</p>
                </div>
              </div>
            ) : shoppingLists.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Clipboard className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No shopping lists</h3>
                  <p className="text-gray-500">Shopping lists will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {shoppingLists.map((list) => {
                  const isExpanded = expandedLists.has(list._id);
                  
                  return (
                    <div
                      key={list._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* List Header */}
                      <button
                        onClick={() => toggleList(list._id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-purple-50 p-3 rounded-xl flex-shrink-0">
                            <Clipboard className="w-5 h-5 text-purple-600" />
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {list.name}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  list.status
                                )}`}
                              >
                                {list.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                {list.contactMethod === 'email' ? (
                                  <Mail className="w-4 h-4" />
                                ) : (
                                  <Phone className="w-4 h-4" />
                                )}
                                {list.contactValue}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <File className="w-4 h-4" />
                                {list.files.length} files
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(list.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* List Details - Collapsible */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          {/* Files */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <File className="w-4 h-4 text-gray-500" />
                              <h4 className="text-sm font-semibold text-gray-700">Uploaded Files</h4>
                            </div>
                            <div className="space-y-2">
                              {list.files.map((file, index) => (
                                <a
                                  key={index}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                  <File className="w-4 h-4 text-indigo-600" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                                    <p className="text-xs text-gray-500">{file.mimeType}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Status Update */}
                          <div className="pt-4 border-t border-gray-200">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Update Status
                            </label>
                            <div className="flex items-center gap-3">
                              <select
                                value={list.status}
                                onChange={(e) => updateShoppingListStatus(list._id, e.target.value)}
                                disabled={updating === list._id}
                                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                              >
                                {['Price Verification', 'Paid', 'Processing', 'En Route', 'Delivered', 'Failed'].map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              {updating === list._id && (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <>
            {loadingWaitlist ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-600">Loading waitlist...</p>
                </div>
              </div>
            ) : waitlistEntries.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No waitlist entries</h3>
                  <p className="text-gray-500">Waitlist entries will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Date Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {waitlistEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">
                                  {entry.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`mailto:${entry.email}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {entry.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`tel:${entry.phone}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {entry.phone}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;