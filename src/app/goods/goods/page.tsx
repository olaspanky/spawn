'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Good, Category, CATEGORIES } from '../../types/goods';
import { goodsApi } from '../../lib/api2';
import GoodsTable from '@/app/components/goods/GoodsTable';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';

export default function GoodsPage() {
  const { token, logout } = useAuth();
  const [goods, setGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGoods();
  }, [selectedCategory, showAvailableOnly, searchTerm]);

  const loadGoods = async () => {
    try {
      setLoading(true);
      const data = await goodsApi.getGoods(
        selectedCategory || undefined,
        showAvailableOnly,
        searchTerm || undefined
      );
      setGoods(data);
    } catch (error) {
      console.error('Error loading goods:', error);
      toast.error('Failed to load goods');
    } finally {
      setLoading(false);
    }
  };

  console.log('Goods loaded:', goods);

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.error('Please log in to delete a good');
      return;
    }

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await goodsApi.deleteGood(id, token);
      setGoods(goods.filter(good => good._id !== id));
      toast.success('Good deleted successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to delete good');
      }
    }
  };

  const handleToggleAvailability = async (id: string) => {
    if (!token) {
      toast.error('Please log in to toggle availability');
      return;
    }

    try {
      const updatedGood = await goodsApi.toggleAvailability(id, token);
      setGoods(goods.map(good => 
        good._id === id ? updatedGood : good
      ));
      toast.success('Availability updated successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to toggle availability');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mtt-12 lg:mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Goods Management</h1>
        <Link
          href="/goods/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Good
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <select
              value={showAvailableOnly.toString()}
              onChange={(e) => setShowAvailableOnly(e.target.value === 'true')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="true">Available Only</option>
              <option value="false">Show All</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search goods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Goods Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8d4817] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goods...</p>
        </div>
      ) : goods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No goods found.</p>
        </div>
      ) : (
        <GoodsTable
          goods={goods}
          onDelete={handleDelete}
          onToggleAvailability={handleToggleAvailability}
        />
      )}
    </div>
  );
}