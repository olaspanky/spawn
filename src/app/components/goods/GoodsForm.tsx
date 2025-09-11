'use client';

import { Good, PackageItem, CATEGORIES, MEASUREMENT_UNITS } from '../../types/goods';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GoodFormProps {
  initialData?: Good;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function GoodForm({ initialData, onSubmit }: GoodFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPackageDeal, setIsPackageDeal] = useState(initialData?.isPackageDeal || false);
  const [packageItems, setPackageItems] = useState<PackageItem[]>(
    initialData?.packageItems || []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Handle measurement
    const measurement = {
      unit: data.unit as string,
      value: parseFloat(data.value as string),
      ...(data.unit === 'custom' && { customUnit: data.customUnit as string }),
    };

    // Handle package items
    if (isPackageDeal) {
      formData.append('packageItems', JSON.stringify(packageItems));
    }

    formData.append('measurement', JSON.stringify(measurement));
    formData.append('isPackageDeal', isPackageDeal.toString());

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPackageItem = () => {
    setPackageItems([...packageItems, { name: '', quantity: 1, description: '' }]);
  };

  const removePackageItem = (index: number) => {
    setPackageItems(packageItems.filter((_, i) => i !== index));
  };

  const updatePackageItem = (index: number, field: keyof PackageItem, value: string | number) => {
    setPackageItems(
      packageItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            defaultValue={initialData?.name}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            name="category"
            defaultValue={initialData?.category}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <option key={value} value={value}>
                {key.replace('_', ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price (₦) *</label>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            defaultValue={initialData?.price}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Measurement Unit *</label>
          <select
            name="unit"
            defaultValue={initialData?.measurement.unit}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {MEASUREMENT_UNITS.map(unit => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Measurement Value *</label>
          <input
            type="number"
            name="value"
            step="0.01"
            min="0"
            defaultValue={initialData?.measurement.value}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Custom Unit (if custom)</label>
          <input
            type="text"
            name="customUnit"
            defaultValue={initialData?.measurement.customUnit}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          defaultValue={initialData?.description}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          className="mt-1 block w-full"
        />
        {initialData?.image && (
          <div className="mt-2">
            <img
              src={initialData.image}
              alt="Current image"
              className="h-20 w-20 object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* Package Deal Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPackageDeal"
          checked={isPackageDeal}
          onChange={(e) => setIsPackageDeal(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isPackageDeal" className="ml-2 block text-sm text-gray-900">
          This is a package deal
        </label>
      </div>

      {/* Package Items */}
      {isPackageDeal && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Package Items</h3>
          {packageItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updatePackageItem(index, 'name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updatePackageItem(index, 'quantity', parseInt(e.target.value))}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => updatePackageItem(index, 'description', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={() => removePackageItem(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Item
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPackageItem}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Item
          </button>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Good' : 'Create Good'}
        </button>
      </div>
    </form>
  );
}