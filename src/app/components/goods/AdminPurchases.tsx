// src/components/AdminDashboard.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Purchase } from '@/app/types/goods';
import toast from 'react-hot-toast';
import { ShoppingCart, Check, X, MapPin, DollarSign, Info, File, Users, UserCheck, UserX } from 'lucide-react';
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
    if (!user || !user.isAdmin) {
      toast.error('Admin access required');
      return;
    }
    if (!token) {
      toast.error('No authentication token found');
      logout();
      return;
    }
    fetchPurchases();
    fetchShoppingLists();
    fetchWaitlistEntries();
  }, [user, token, logout, fetchPurchases, fetchShoppingLists, fetchWaitlistEntries]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <p className="text-red-600 text-xl font-semibold">Access Denied</p>
          <p className="text-gray-600 mt-2">Admin privileges required to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-8">
          <ShoppingCart className="w-8 h-8 mr-3 text-indigo-600" />
          Admin Dashboard
        </h1>

        <div className="mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <button onClick={() => setActiveTab('purchases')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'purchases' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
              Purchases
            </button>
            <button onClick={() => setActiveTab('shoppingLists')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'shoppingLists' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
              Shopping Lists
            </button>
            <button onClick={() => setActiveTab('waitlist')} className={`px-4 py-2 font-medium text-sm ${activeTab === 'waitlist' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
              Waitlist
            </button>
          </div>
        </div>

        {activeTab === 'purchases' && (
          <>
            {loadingPurchases ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                <p className="ml-4 text-gray-600 text-lg">Loading purchases...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-70" />
                <p className="text-gray-600 text-lg">No purchases found.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {purchases.map((purchase) => {
                  const isGuest = !purchase.userId;
                  
                  return (
                    <div key={purchase._id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                          <h2 className="text-xl font-semibold text-gray-900">Purchase ID: {purchase._id.slice(-6)}...</h2>
                          {isGuest ? (
                            <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              <UserX className="w-4 h-4 mr-1" />Guest
                            </span>
                          ) : (
                            <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <UserCheck className="w-4 h-4 mr-1" />Registered
                            </span>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : purchase.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {typeof purchase.status === 'string' && purchase.status ? purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1) : 'Unknown'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          {isGuest ? (
                            <>
                              <p className="text-gray-700 flex items-center mb-2"><strong className="mr-2">Guest Name:</strong> {purchase.guestInfo?.name || 'N/A'}</p>
                              <p className="text-gray-700 flex items-center mb-2"><strong className="mr-2">Phone:</strong> <a href={`tel:${purchase.guestInfo?.phone}`} className="text-indigo-600 hover:underline">{purchase.guestInfo?.phone || 'N/A'}</a></p>
                              <p className="text-gray-700 flex items-center mb-2"><strong className="mr-2">Email:</strong> <a href={`mailto:${purchase.guestInfo?.email}`} className="text-indigo-600 hover:underline">{purchase.guestInfo?.email || 'N/A'}</a></p>
                            </>
                          ) : (
                            <p className="text-gray-700 flex items-center mb-2"><strong className="mr-2">User:</strong> {purchase.userId?.username ?? 'Unknown'} ({purchase.userId?.email ?? 'Unknown'})</p>
                          )}
                          <p className="text-gray-700 flex items-center mb-2"><strong className="mr-2">Payment Reference:</strong> {purchase.paymentReference ?? 'N/A'}</p>
                          <p className="text-gray-700 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-indigo-600" /><strong>Subtotal:</strong> ₦{(purchase.totalAmount - (purchase.serviceCharge ?? 0) - (purchase.deliveryFee ?? 0)).toFixed(2)}</p>
                          <p className="text-gray-700 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-indigo-600" /><strong>Service Charge:</strong> ₦{(purchase.serviceCharge ?? 0).toFixed(2)}</p>
                          <p className="text-gray-700 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-indigo-600" /><strong>Delivery Fee:</strong> ₦{(purchase.deliveryFee ?? 0).toFixed(2)}</p>
                          <p className="text-gray-700 flex items-center"><DollarSign className="w-4 h-4 mr-2 text-indigo-600" /><strong>Total Amount:</strong> ₦{(purchase.totalAmount ?? 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-700 flex items-center"><MapPin className="w-4 h-4 mr-2 text-indigo-600" /><strong>Drop-off Location:</strong> {purchase.dropOffLocation ?? 'N/A'}</p>
                          <p className="text-gray-700 flex items-center"><Info className="w-4 h-4 mr-2 text-indigo-600" /><strong>Address Details:</strong> {purchase.addressDetails ?? 'N/A'}</p>
                          <p className="text-gray-700"><strong>Date:</strong> {purchase.createdAt && !isNaN(new Date(purchase.createdAt).getTime()) ? new Date(purchase.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Items</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <ul className="space-y-2">
                            {purchase.items?.length ? purchase.items.map((item, index) => (
                              <li key={index} className="text-gray-700 flex justify-between">
                                <span>{item.item?.name ?? 'Unknown Item'} (Qty: {item.item?.quantity ?? 0})</span>
                                <span>₦{(item.item?.price ?? 0).toFixed(2)} × {item.item?.quantity ?? 0} = ₦{((item.item?.price ?? 0) * (item.item?.quantity ?? 0)).toFixed(2)}</span>
                              </li>
                            )) : <li className="text-gray-700">No items available</li>}
                          </ul>
                        </div>
                      </div>

                      {purchase.status === 'pending' && (
                        <div className="mt-6 flex space-x-4">
                          <button onClick={() => updatePurchaseStatus(purchase._id, 'confirmed')} disabled={updating === purchase._id} className={`flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ${updating === purchase._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {updating === purchase._id ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div> : <Check className="w-5 h-5 mr-2" />}
                            Confirm
                          </button>
                          <button onClick={() => updatePurchaseStatus(purchase._id, 'cancelled')} disabled={updating === purchase._id} className={`flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 ${updating === purchase._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {updating === purchase._id ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div> : <X className="w-5 h-5 mr-2" />}
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'shoppingLists' && (
          <>
            {loadingShoppingLists ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                <p className="ml-4 text-gray-600 text-lg">Loading shopping lists...</p>
              </div>
            ) : shoppingLists.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-70" />
                <p className="text-gray-600 text-lg">No shopping lists found.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {shoppingLists.map((list) => (
                  <div key={list._id} className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">List ID: {list._id.slice(-6)}...</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${list.status === 'Price Verification' ? 'bg-yellow-100 text-yellow-800' : list.status === 'Paid' ? 'bg-blue-100 text-blue-800' : list.status === 'Processing' ? 'bg-purple-100 text-purple-800' : list.status === 'En Route' ? 'bg-orange-100 text-orange-800' : list.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{list.status}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-700 flex items-center"><strong className="mr-2">Name:</strong> {list.name}</p>
                        <p className="text-gray-700 flex items-center"><strong className="mr-2">Contact:</strong> {list.contactMethod}: {list.contactValue}</p>
                        <p className="text-gray-700"><strong>Date:</strong> {list.createdAt && !isNaN(new Date(list.createdAt).getTime()) ? new Date(list.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Files</h3>
                        <ul className="space-y-2">
                          {list.files.map((file, index) => (
                            <li key={index} className="text-gray-700">
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{file.originalName} ({file.mimeType})</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-gray-700 font-medium">Update Status:</label>
                      <select value={list.status} onChange={(e) => updateShoppingListStatus(list._id, e.target.value)} disabled={updating === list._id} className="ml-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600">
                        {['Price Verification', 'Paid', 'Processing', 'En Route', 'Delivered', 'Failed'].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {updating === list._id && <div className="inline-block ml-4 animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-600"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'waitlist' && (
          <>
            {loadingWaitlist ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                <p className="ml-4 text-gray-600 text-lg">Loading waitlist entries...</p>
              </div>
            ) : waitlistEntries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-70" />
                <p className="text-gray-600 text-lg">No waitlist entries found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Email</th>
                      <th className="py-3 px-4 text-left font-medium">Phone</th>
                      <th className="py-3 px-4 text-left font-medium">Location</th>
                      <th className="py-3 px-4 text-left font-medium">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map((entry) => (
                      <tr key={entry._id} className="border-t border-gray-200 hover:bg-gray-50 transition-all duration-200">
                        <td className="py-3 px-4 text-gray-700">{entry.name}</td>
                        <td className="py-3 px-4 text-gray-700"><a href={`mailto:${entry.email}`} className="text-indigo-600 hover:underline">{entry.email}</a></td>
                        <td className="py-3 px-4 text-gray-700"><a href={`tel:${entry.phone}`} className="text-indigo-600 hover:underline">{entry.phone}</a></td>
                        <td className="py-3 px-4 text-gray-700">{entry.location}</td>
                        <td className="py-3 px-4 text-gray-700">{entry.createdAt && !isNaN(new Date(entry.createdAt).getTime()) ? new Date(entry.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;