"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const EditItem = () => {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useAuth();
  const [item, setItem] = useState<any>(null); // TODO: Define a specific Item type
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    quantity: "1", // Initialize with default value of 1
    description: "",
    location: "",
    category: "",
    images: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]); // New images to upload
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Previews for new images
  const [existingImages, setExistingImages] = useState<string[]>([]); // Existing Cloudinary URLs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push("/declutter/login");
    }
  }, [token, router]);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!id || !token) return;

      try {
        const response = await fetch(`https://spawnback.vercel.app/api/items/${id}`, {
          headers: {
            "x-auth-token": token || "", // Fallback to empty string if token is null/undefined
          },
        });
        if (!response.ok) throw new Error("Failed to fetch item");
        const data = await response.json();
        setItem(data);
        setFormData({
          title: data.title || "",
          price: data.price || "",
          quantity: data.quantity?.toString() || "1", // Populate quantity from backend
          description: data.description || "",
          location: data.location || "",
          category: data.category || "",
          images: data.images || [],
        });
        setExistingImages(data.images || []);
      } catch (error) {
        console.error("Failed to fetch item:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch item");
      }
    };

    fetchItem();
  }, [id, token]);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle new image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalImages = existingImages.length + images.length + newFiles.length;

    if (totalImages > 4) {
      setError("Maximum 4 images allowed");
      return;
    }

    // Validate file size (max 5MB) and type
    const validImages = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png"].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValidType) setError("Only JPEG/PNG images are allowed");
      if (!isValidSize) setError("Each image must be under 5MB");
      return isValidType && isValidSize;
    });

    if (validImages.length !== newFiles.length) return;

    const updatedImages = [...images, ...validImages];
    const newUrls = validImages.map((file) => URL.createObjectURL(file));
    setImages(updatedImages);
    setPreviewUrls([...previewUrls, ...newUrls]);
    setError("");
  };

  // Remove an existing image
  const removeExistingImage = (index: number) => {
    const updatedExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedExistingImages);
    setFormData({ ...formData, images: updatedExistingImages });
  };

  // Remove a new image
  const removeNewImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  // Upload new images to Cloudinary
  const handleImageUpload = async (files: File[]) => {
    try {
      const cloudinaryUrls = [];
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", "spanky");
        uploadData.append("cloud_name", "dfz5jgfxo");

        const response = await fetch("https://api.cloudinary.com/v1_1/dfz5jgfxo/image/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Image upload failed");
        }

        const data = await response.json();
        cloudinaryUrls.push(data.secure_url);
      }
      return cloudinaryUrls;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("Authentication required");
      setLoading(false);
      router.push("/declutter/login");
      return;
    }

    // Validate price
    const priceValue = parseInt(formData.price.toString().replace(/\D/g, ""));
    if (isNaN(priceValue) || priceValue < 1000) {
      setError("Price must be at least ₦1,000");
      setLoading(false);
      return;
    }

    // Validate quantity
    const quantityValue = parseInt(formData.quantity);
    if (isNaN(quantityValue) || quantityValue < 0) {
      setError("Quantity must be a non-negative number");
      setLoading(false);
      return;
    }

    try {
      let updatedImageUrls = [...existingImages];

      if (images.length > 0) {
        const newImageUrls = await handleImageUpload(images);
        updatedImageUrls = [...existingImages, ...newImageUrls];
      }

      const updatedFormData = {
        ...formData,
        price: priceValue,
        quantity: quantityValue, // Include quantity in the payload
        images: updatedImageUrls,
      };

      const response = await fetch(`https://spawnback.vercel.app/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to update item");
      }

      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      router.push("/declutter/manage-items");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update item");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null; // Redirect handled in useEffect
  if (!item) return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Item</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={100}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., iPhone 12 Pro 128GB - Pacific Blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="1000"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., 250000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., 1"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the number of items available for sale (default is 1).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
              placeholder="Describe the item, its condition, and any included accessories"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter the item location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select category
              </option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images (2-4 images required)</label>
            {/* Display existing images */}
            {existingImages.length > 0 && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
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
            {/* Upload new images */}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="mt-4 w-full"
            />
            {/* Display previews for new images */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`New Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
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
              {existingImages.length + images.length} of 4 images
              {existingImages.length + images.length < 2 && (
                <span className="text-red-500 ml-2">(Minimum 2 images required)</span>
              )}
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || existingImages.length + images.length < 2}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;