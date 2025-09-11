'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { goodsApi } from '../../../lib/api2';
import { Good } from '../../../types/goods';
import toast from 'react-hot-toast';
import GoodForm from '@/app/components/goods/GoodsForm';
import { useAuth } from '@/app/context/AuthContext';

export default function EditGoodPage() {
  const { token, logout } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const [good, setGood] = useState<Good | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGood();
  }, [id]);

  const loadGood = async () => {
    try {
      const data = await goodsApi.getGood(id);
      setGood(data);
    } catch (error) {
      console.error('Error loading good:', error);
      toast.error('Failed to load good');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!token) {
      toast.error('Please log in to update a good');
      return;
    }

    try {
      await goodsApi.updateGood(id, formData, token);
      toast.success('Good updated successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to update good');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!good) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Good not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Good</h1>
        <GoodForm initialData={good} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}