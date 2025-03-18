"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getUserSales } from '@/app/lib/api';
import OrderCard from '@/app/components/OrderCard';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Order } from '@/app/types/chat';


export default function Sales() {
  const [sales, setSales] = useState<Order[]>([]);
  const [filteredSales, setFilteredSales] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed' | 'refunded'>('ongoing');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      getUserSales(token)
        .then((data) => {
          setSales(data);
          filterSales('ongoing', data);
        })
        .catch(console.error);
    }
  }, [token]);

  const filterSales = (tab: 'ongoing' | 'completed' | 'refunded', data = sales) => {
    setActiveTab(tab);
    if (tab === 'ongoing') {
      setFilteredSales(data.filter((o) => o.trackingStatus === 'paid' || o.trackingStatus === 'meeting_scheduled'));
    } else if (tab === 'completed') {
      setFilteredSales(data.filter((o) => o.trackingStatus === 'completed'));
    } else {
      setFilteredSales(data.filter((o) => o.trackingStatus === 'refund_requested' || o.trackingStatus === 'refunded'));
    }
  };

  if (!token) return <div>Please log in to view your sales.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black/95 to-gray-900/95 font-sans text-white">
      <nav className="shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/" className="text-gray-300 hover:text-orange-600 transition">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold ml-4">My Sales</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => filterSales('ongoing')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'ongoing' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-orange-700 transition`}
          >
            Ongoing
          </button>
          <button
            onClick={() => filterSales('completed')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'completed' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-orange-700 transition`}
          >
            Completed
          </button>
          <button
            onClick={() => filterSales('refunded')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'refunded' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'} hover:bg-orange-700 transition`}
          >
            Refunded
          </button>
        </div>
        <div className="grid gap-6">
          {filteredSales.length ? (
            filteredSales.map((order) => <OrderCard key={order._id} order={order} />)
          ) : (
            <p className="text-gray-400">No {activeTab} sales found.</p>
          )}
        </div>
      </main>
    </div>
  );
}