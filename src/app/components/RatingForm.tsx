import { useState } from 'react';
import { rateSeller } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { StarIcon } from '@heroicons/react/24/outline';

interface RatingFormProps {
  orderId: string;
  onSuccess: () => void;
}

export default function RatingForm({ orderId, onSuccess }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5.');
      return;
    }
    try {
      await rateSeller(orderId, rating, token!);
      onSuccess();
    } catch (error) {
      console.error('Error rating seller:', error);
      alert('Failed to submit rating.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-6 w-6 cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
        Submit Rating
      </button>
    </form>
  );
}