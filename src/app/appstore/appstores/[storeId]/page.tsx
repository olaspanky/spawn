"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StoreDetails from '../../../components/store/StoreDetails';
import { useAuth } from '@/app/context/AuthContext';
import toast from 'react-hot-toast';
import { Store } from '../../../types/store'; // Adjusted Store type

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params?.storeId as string;
  const { token } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    const fetchStore = async () => {
      try {
        const response = await fetch(`https://spawnback.vercel.app/api/store/${storeId}`, {
          headers: token ? { 'x-auth-token': token } : {},
        });
        if (!response.ok) throw new Error('Failed to fetch store');
        const data = await response.json();

        setStore({
          id: data._id,
          name: data.name,
          description: data.description,
          storeImage: data.storeImage,
          location: data.location,
          owner: {
            id: data.owner._id,
            name: data.owner.name,
            email: data.owner.email,
          },
          items: data.items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          packageDeals: data.packageDeals.map((deal: any) => ({
            id: deal._id,
            name: deal.name,
            price: deal.price,
            discountPercentage: deal.discountPercentage,
            active: deal.active,
            items: deal.items,
          })),
        });
      } catch (error: any) {
        toast.error(`Failed to load store: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!store) {
    return <div className="text-center py-10">Store not found</div>;
  }

  return <StoreDetails store={store} />;
}