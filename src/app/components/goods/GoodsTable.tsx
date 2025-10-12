'use client';

import { Good, CATEGORIES, Category } from '../../types/goods';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GoodsTableProps {
  goods: Good[];
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Good>) => Promise<void>;
}

export default function GoodsTable({ goods, onDelete, onToggleAvailability, onUpdate }: GoodsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Good>>({});
  const [saving, setSaving] = useState(false);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (good: Good) => {
    setEditingId(good._id!);
    setEditForm({
      name: good.name,
      description: good.description,
      category: good.category,
      price: good.price,
      measurement: good.measurement,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await onUpdate(id, editForm);
      setEditingId(null);
      setEditForm({});
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const updateMeasurement = (field: 'value' | 'unit' | 'customUnit', value: any) => {
    setEditForm(prev => ({
      ...prev,
      measurement: {
        ...prev.measurement!,
        [field]: value
      }
    }));
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
          {goods.map((good) => {
            const isEditing = editingId === good._id;
            
            return (
              <tr key={good._id} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
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
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Name"
                      />
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Description"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-gray-900">{good.name}</div>
                      <div className="text-sm text-gray-500">{good.description}</div>
                    </>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <select
                      value={editForm.category || ''}
                      onChange={(e) => updateField('category', e.target.value as Category)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {Object.entries(CATEGORIES).map(([key, value]) => (
                        <option key={value} value={value}>
                          {key.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="capitalize">{good.category.replace('_', ' ')}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.price || ''}
                      onChange={(e) => updateField('price', parseFloat(e.target.value))}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    `₦${good.price.toLocaleString()}`
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editForm.measurement?.value || ''}
                        onChange={(e) => updateMeasurement('value', parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Value"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={editForm.measurement?.unit || 'kg'}
                        onChange={(e) => updateMeasurement('unit', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="piece">piece</option>
                        <option value="custom">custom</option>
                      </select>
                      {editForm.measurement?.unit === 'custom' && (
                        <input
                          type="text"
                          value={editForm.measurement?.customUnit || ''}
                          onChange={(e) => updateMeasurement('customUnit', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Unit"
                        />
                      )}
                    </div>
                  ) : (
                    `${good.measurement.value} ${good.measurement.unit === 'custom' ? good.measurement.customUnit : good.measurement.unit}`
                  )}
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
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(good._id!)}
                        disabled={saving}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(good)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Quick Edit
                      </button>
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
                        Full Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(good._id!)}
                        disabled={deletingId === good._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingId === good._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}