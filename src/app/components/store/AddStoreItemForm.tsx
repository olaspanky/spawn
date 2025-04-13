"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface AddStoreItemFormProps {
  storeId: string;
  onItemAdded: () => void;
}

const AddStoreItemForm: React.FC<AddStoreItemFormProps> = ({ storeId, onItemAdded }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    measurement: {
      unit: "bag",
      value: "",
      customUnit: "",
    },
    price: "",
  });
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
      setError("Please log in to add items");
      toast.error("Please log in to add items");
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

    const payload = {
      storeId,
      itemName: name,
      measurement: {
        unit: measurement.unit,
        value: valueNum,
        ...(measurement.unit === "custom" && { customUnit: measurement.customUnit }),
      },
      price: priceNum,
    };
    console.log("Submitting payload:", payload);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/store/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add item");
      }

      const data = await response.json();
      console.log("Add item response:", data);
      toast.success("Item added successfully!");
      onItemAdded();
      setFormData({
        name: "",
        measurement: { unit: "bag", value: "", customUnit: "" },
        price: "",
      });
    } catch (err: any) {
      console.error("Add item error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Item to Store</h3>
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !token}
          className={`w-full py-2 px-4 bg-orange-600 text-white rounded-md ${
            loading || !token ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-700"
          }`}
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default AddStoreItemForm;