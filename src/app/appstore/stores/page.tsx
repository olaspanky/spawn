"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StoreCard from '../../components/store/StoreCard';

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

interface Store {
  _id: string;
  name: string;
  description: string;
  location: string;
  storeImage?: string;
  owner: { name: string };
  items: StoreItem[];
  packageDeals: any[];
  createdAt: string;
}

const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/store/store'); // Corrected endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data = await response.json();
        setStores(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Discover Our Stores
        </h1>
        {stores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No stores found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store._id} onClick={() => router.push(`/appstore/store/${store._id}`)} className="cursor-pointer">
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;