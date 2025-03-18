import { useState } from 'react';
import { scheduleMeeting } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';

interface MeetupFormProps {
  orderId: string;
  onSuccess: () => void;
}

export default function MeetupForm({ orderId, onSuccess }: MeetupFormProps) {
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !time) {
      alert('Please select a location and time.');
      return;
    }
    try {
      await scheduleMeeting(orderId, location, time, token!);
      onSuccess();
    } catch (error) {
      console.error('Error scheduling meetup:', error);
      alert('Failed to schedule meeting.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white text-gray-700"
      >
        <option value="">Select a meeting point</option>
        <option value="Ikeja City Mall">Ikeja City Mall</option>
        <option value="Shoprite Surulere">Shoprite Surulere</option>
        <option value="Lekki Phase 1">Lekki Phase 1</option>
      </select>
      <input
        type="datetime-local"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full p-2 border rounded-lg bg-white text-gray-700"
      />
      <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
        Propose Meeting
      </button>
    </form>
  );
}