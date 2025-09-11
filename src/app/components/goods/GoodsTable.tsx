'use client';

import { Good } from '../../types/goods';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GoodsTableProps {
  goods: Good[];
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string) => void;
}

export default function GoodsTable({ goods, onDelete, onToggleAvailability }: GoodsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Measurement
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {goods.map((good) => (
            <tr key={good._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                {good.image ? (
                  <Image
                    src={good.image}
                    alt={good.name}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{good.name}</div>
                <div className="text-sm text-gray-500">{good.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {good.category.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₦{good.price.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {good.measurement.value} {good.measurement.unit === 'custom' ? good.measurement.customUnit : good.measurement.unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    good.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {good.available ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onToggleAvailability(good._id!)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {good.available ? 'Disable' : 'Enable'}
                </button>
                <Link
                  href={`/goods/edit/${good._id}`}
                  className="text-yellow-600 hover:text-yellow-900"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(good._id!)}
                  disabled={deletingId === good._id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deletingId === good._id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}