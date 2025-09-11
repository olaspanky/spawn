'use client';
import { goodsApi } from '../../lib/api2';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';
import GoodForm from '@/app/components/goods/GoodsForm';


export default function CreateGoodPage() {
  const { token, logout } = useAuth();

  const handleSubmit = async (formData: FormData) => {
    if (!token) {
      toast.error('Please log in to create a good');
      return;
    }

    try {
      await goodsApi.createGood(formData, token);
      toast.success('Good created successfully');
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to create good');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Good</h1>
        <GoodForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}