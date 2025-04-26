"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    category: 'Electronics',
    condition: '',
    brand: '',
    model: '',
    year: '',
    dimensions: '',
    delivery: '',
    reason: '',
    contact: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auto-fill location using geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            if (data.display_name) {
              setFormData((prev) => ({
                ...prev,
                location: data.display_name,
              }));
            }
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!token) {
      setShowModal(true);
    }
  }, [token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalImages = images.length + newFiles.length;

    if (totalImages > 4) {
      setError('Maximum 4 images allowed');
      return;
    }

    // Validate file size (max 5MB) and type
    const validImages = newFiles.filter((file) => {
      const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) setError('Only JPEG/PNG images are allowed');
      if (!isValidSize) setError('Each image must be under 5MB');
      return isValidType && isValidSize;
    });

    if (validImages.length !== newFiles.length) return;

    const updatedImages = [...images, ...validImages];
    const newUrls = validImages.map((file) => URL.createObjectURL(file));
    const updatedPreviews = [...previewUrls, ...newUrls];

    setPreviewUrls(updatedPreviews);
    setImages(updatedImages);
    setError('');
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const cloudinaryUrls: string[] = [];
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', 'spanky');
        uploadData.append('cloud_name', 'dfz5jgfxo');

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dfz5jgfxo/image/upload',
          {
            method: 'POST',
            body: uploadData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Image upload failed');
        }

        const data = await response.json();
        cloudinaryUrls.push(data.secure_url);
      }
      return cloudinaryUrls;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Image upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return router.push('/declutter/login');
    if (images.length < 2) {
      setError('Please upload at least 2 images');
      return;
    }

    // Validate price
    const priceValue = parseInt(formData.price.replace(/\D/g, ''));
    if (isNaN(priceValue) || priceValue < 1000) {
      setError('Price must be at least ₦1,000');
      return;
    }

    setLoading(true);
    setUploadingImages(true);
    setError('');

    try {
      const imageUrls = await handleImageUpload(images);
      setUploadingImages(false);

      const response = await fetch('https://spawnback.vercel.app/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          ...formData,
          price: priceValue,
          images: imageUrls,
        }),
      });

      if (!response.ok) {
        throw new Error('Item upload failed');
      }

      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleSellNow = () => {
    setShowModal(false);
    router.push('/declutter/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Please Sign Up & Verify Your Identity
            </h2>
            <p className="text-gray-600 mb-4">
              You need to have an account to sell items.
            </p>
            <button
              onClick={handleSellNow}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Sell Now
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sell Your Item</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              minLength={10}
              maxLength={100}
              className="w-full px-4 py-2 text-black border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., iPhone 12 Pro 128GB - Pacific Blue"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₦)
            </label>
            <input
              type="number"
              required
              min="1000"
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 250000"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
              maxLength={1000}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item, its condition, and any included accessories"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Auto-filled if you allow location access"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              className="w-full px-4 bg-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Furniture">Furniture</option>
              <option value="Home & Appliances">Home & Appliances</option>
              <option value="Books & Media">Books & Media</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              required
              className="w-full px-4 bg-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="" disabled>Select condition</option>
              <option value="Brand New">Brand New</option>
              <option value="Used - Like New">Used - Like New</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
              <option value="For Parts">For Parts</option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand (Optional)
            </label>
            <input
              type="text"
              maxLength={50}
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Apple, Nike"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model (Optional)
            </label>
            <input
              type="text"
              maxLength={50}
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g., iPhone 12 Pro"
            />
          </div>

          {/* Year of Manufacture/Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year of Manufacture/Purchase (Optional)
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="e.g., 2021"
            />
          </div>

          {/* Dimensions (Conditional for Furniture) */}
          {formData.category === 'Furniture' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., L: 120cm, W: 80cm, H: 75cm"
              />
            </div>
          )}

          {/* Delivery Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Options (Optional)
            </label>
            <select
              className="w-full px-4 bg-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.delivery}
              onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
            >
              <option value="">Select delivery option</option>
              <option value="Local Pickup">Local Pickup Only</option>
              <option value="Delivery">Delivery Available</option>
              <option value="Shipping">Shipping Available</option>
            </select>
          </div>

          {/* Reason for Selling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Selling (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Upgrading to a newer model"
            />
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Preference (Optional)
            </label>
            <select
              className="w-full px-4 bg-white py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            >
              <option value="">Select contact method</option>
              <option value="App Chat">Chat via App</option>
              <option value="Phone">Phone Call</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (2-4 images required)
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="w-full"
            />
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {images.length} of 4 images selected
              {images.length < 2 && (
                <span className="text-red-500 ml-2">(Minimum 2 images required)</span>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || images.length < 2}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages
              ? 'Uploading Images...'
              : loading
              ? 'Creating Listing...'
              : 'List Item for Sale'}
          </button>
        </form>
      </div>
    </div>
  );
}