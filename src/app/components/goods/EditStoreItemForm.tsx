"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface EditStoreItemFormProps {
  storeId: string;
  item: {
    _id: string;
    name: string;
    measurement: {
      unit: string;
      value: number;
      customUnit?: string;
    };
    price: number;
    image?: string;
  };
  onItemUpdated: () => void;
  onCancel: () => void;
}

const EditStoreItemForm: React.FC<EditStoreItemFormProps> = ({ storeId, item, onItemUpdated, onCancel }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: item?.name,
    measurement: {
      unit: item?.measurement?.unit,
      value: item?.measurement?.value?.toString(),
      customUnit: item?.measurement?.customUnit || "",
    },
    price: item.price.toString(),
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const measurementOptions = [
    "congo",
    "bag",
    "1/2 bag",
    "1/4 bag",
    "litre",
    "keg",
    "50kg",
    "custom",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof typeof formData | keyof typeof formData.measurement
  ) => {
    const { value } = e.target;
    if (field === "name" || field === "price") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (field === "unit") {
      setFormData((prev) => ({
        ...prev,
        measurement: {
          ...prev.measurement,
          unit: value,
          customUnit: value === "custom" ? prev.measurement.customUnit : "",
        },
      }));
    } else if (field === "value") {
      setFormData((prev) => ({
        ...prev,
        measurement: { ...prev.measurement, value },
      }));
    } else if (field === "customUnit") {
      setFormData((prev) => ({
        ...prev,
        measurement: { ...prev.measurement, customUnit: value },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please log in to edit items");
      toast.error("Please log in to edit items");
      return;
    }

    const { name, measurement, price } = formData;
    if (!name || !measurement.value || !price) {
      setError("Please fill out all fields");
      toast.error("Please fill out all fields");
      return;
    }
    if (measurement.unit === "custom" && !measurement.customUnit) {
      setError("Please specify a custom measurement unit");
      toast.error("Please specify a custom measurement unit");
      return;
    }
    const valueNum = Number(measurement.value);
    const priceNum = Number(price);
    if (isNaN(valueNum) || valueNum <= 0) {
      setError("Measurement value must be a positive number");
      toast.error("Measurement value must be a positive number");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number");
      toast.error("Price must be a positive number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("storeId", storeId);
      payload.append("itemId", item._id);
      payload.append("itemName", name);
      payload.append("measurement", JSON.stringify({
        unit: measurement.unit,
        value: valueNum,
        ...(measurement.unit === "custom" && { customUnit: measurement.customUnit }),
      }));
      payload.append("price", priceNum.toString());
      if (image) {
        payload.append("image", image);
      }

      const response = await fetch(`https://spawnback.vercel.app/api/store/item/${item._id}`, {
        method: "PUT",
        headers: {
          "x-auth-token": token,
        },
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update item");
      }

      const data = await response.json();
      console.log("Update item response:", data);
      toast.success("Item updated successfully!");
      onItemUpdated();
    } catch (err: any) {
      console.error("Edit item error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Item</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange(e, "name")}
            required
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="measurementUnit" className="block text-sm font-medium text-gray-700">
            Measurement Unit
          </label>
          <select
            id="measurementUnit"
            value={formData.measurement.unit}
            onChange={(e) => handleChange(e, "unit")}
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {measurementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {formData.measurement.unit === "custom" && (
          <div>
            <label htmlFor="customUnit" className="block text-sm font-medium text-gray-700">
              Custom Unit
            </label>
            <input
              type="text"
              id="customUnit"
              value={formData.measurement.customUnit}
              onChange={(e) => handleChange(e, "customUnit")}
              required
              className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        )}
        <div>
          <label htmlFor="measurementValue" className="block text-sm font-medium text-gray-700">
            Measurement Value
          </label>
          <input
            type="number"
            id="measurementValue"
            value={formData.measurement.value}
            onChange={(e) => handleChange(e, "value")}
            min="0.01"
            step="0.01"
            required
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (₦)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={(e) => handleChange(e, "price")}
            min="0.01"
            step="0.01"
            required
            className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Item Image
          </label>
          {item.image && (
            <img src={item?.image} alt={item?.name} className="w-32 h-32 object-cover mb-2 rounded" />
          )}
          <input
            type="file"
            id="image"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 w-full p-2 border rounded-md"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !token}
            className={`py-2 px-4 bg-orange-600 text-white rounded-md ${
              loading || !token ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-700"
            }`}
          >
            {loading ? "Updating..." : "Update Item"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStoreItemForm;