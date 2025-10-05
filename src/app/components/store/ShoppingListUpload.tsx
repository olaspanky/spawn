"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiUpload, FiUser, FiMail, FiPhone, FiImage, FiFile, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../Nav1";
import Link from "next/link";

interface FormData {
  name: string;
  contactMethod: "email" | "phone";
  contactValue: string;
  files: File[];
}

const ShoppingListUpload: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contactMethod: "email",
    contactValue: "",
    files: [],
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = "dfz5jgfxo";
  const CLOUDINARY_UPLOAD_PRESET = "spanky"; // Using the same preset as provided

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = formData.files.length + newFiles.length;

      if (totalFiles > 4) {
        setError("Maximum 4 files allowed");
        return;
      }

      // Validate file size (max 5MB) and type
      const validFiles = newFiles.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) setError("Only JPEG, PNG, or PDF files are allowed");
        if (!isValidSize) setError("Each file must be under 5MB");
        return isValidType && isValidSize;
      });

      if (validFiles.length !== newFiles.length) return;

      const updatedFiles = [...formData.files, ...validFiles];
      const newUrls = validFiles
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => URL.createObjectURL(file));
      const updatedPreviews = [...previewUrls, ...newUrls];

      setFormData((prev) => ({ ...prev, files: updatedFiles }));
      setPreviewUrls(updatedPreviews);
      setError("");
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = formData.files.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setFormData((prev) => ({ ...prev, files: updatedFiles }));
    setPreviewUrls(updatedPreviews);
    setError("");
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      const uploadedFiles: { url: string; publicId: string; originalName: string; mimeType: string }[] = [];
      for (const file of files) {
        const fileType = file.type;
        const isImage = fileType.startsWith("image/");
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        uploadData.append("cloud_name", CLOUDINARY_CLOUD_NAME);
        uploadData.append("folder", "shopping_lists");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${isImage ? "image" : "raw"}/upload`,
          uploadData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!response.data || !response.data.secure_url) {
          throw new Error("File upload failed");
        }

        uploadedFiles.push({
          url: response.data.secure_url,
          publicId: response.data.public_id,
          originalName: file.name,
          mimeType: file.type,
        });
      }
      return uploadedFiles;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "File upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingImages(true);
    setError("");

    try {
      // Validate inputs
      if (!formData.name || !formData.contactMethod || !formData.contactValue) {
        throw new Error("Please provide name, contact method, and contact value");
      }
      if (formData.files.length === 0) {
        throw new Error("At least one file is required");
      }

      // Upload files to Cloudinary
      const uploadedFiles = await handleImageUpload(formData.files);
      setUploadingImages(false);

      // Create shopping list with file metadata (no auth token)
      const response = await axios.post(
        "https://spawnback.vercel.app/api/shopping-lists",
        {
          name: formData.name,
          contactMethod: formData.contactMethod,
          contactValue: formData.contactValue,
          files: uploadedFiles,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        response.data.message ||
          "Shopping list submitted! We'll contact you within 3-5 minutes with prices.",
        {
          duration: 4000,
          position: "bottom-center",
          style: {
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.95)",
            color: "white",
            backdropFilter: "blur(10px)",
            fontSize: "14px",
            padding: "12px 20px",
          },
        }
      );

      // Clean up previews and reset form
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setFormData({
        name: "",
        contactMethod: "email",
        contactValue: "",
        files: [],
      });
      setPreviewUrls([]);
    } catch (error) {
      let errorMessage = "Failed to submit shopping list. Please try again.";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response?.data?.message === "string"
      ) {
        errorMessage = (error as any).response.data.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
      ) {
        errorMessage = (error as any).message;
      }
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: "bottom-center",
        style: {
          borderRadius: "10px",
          background: "rgba(239, 68, 68, 0.95)",
          color: "white",
          backdropFilter: "blur(10px)",
          fontSize: "14px",
          padding: "12px 20px",
        },
      });
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 mt-9 lg:mt-20">

      <Link href="/" className="absolute top-4 left-4 text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
        <FiX className="transform rotate-45" />
        <span className="text-sm font-medium">Back to Store</span>
      </Link>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FiUpload className="mr-2" /> Upload Shopping List
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FiUser className="mr-2" /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Contact Method Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FiMail className="mr-2" /> Preferred Contact Method
            </label>
            <select
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>

          {/* Contact Value Input */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FiPhone className="mr-2" />{" "}
              {formData.contactMethod === "email" ? "Email Address" : "Phone Number"}
            </label>
            <input
              type={formData.contactMethod === "email" ? "email" : "tel"}
              name="contactValue"
              value={formData.contactValue}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder={
                formData.contactMethod === "email"
                  ? "Enter your email"
                  : "Enter your phone number"
              }
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FiImage className="mr-2" /> Upload Shopping List (Images or PDFs)
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <FiFile className="text-gray-400 text-2xl mb-2" />
                <p className="text-gray-600">
                  Drag and drop files here or click to upload
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Supports JPEG, PNG, and PDFs (max 4 files, 5MB each)
                </p>
              </div>
            </div>

            {/* File Previews */}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    {file.type.startsWith("image/") && previewUrls[index] ? (
                      <div className="relative w-16 h-16 mr-2">
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${file.name}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <FiFile className="mr-2 text-gray-400 text-2xl" />
                    )}
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-500 hover:text-red-600"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {formData.files.length} of 4 files selected
              {formData.files.length === 0 && (
                <span className="text-red-500 ml-2">(Minimum 1 file required)</span>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || formData.files.length === 0}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 ${
              isSubmitting || formData.files.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } transition-all`}
          >
            <FiUpload size={18} />
            <span>
              {uploadingImages
                ? "Uploading Files..."
                : isSubmitting
                ? "Submitting..."
                : "Submit Shopping List"}
            </span>
          </motion.button>
        </form>

        <p className="text-gray-500 text-sm mt-6 text-center">
          We'll review your shopping list and contact you within 3-5 minutes with price confirmation.
        </p>
      </motion.div>
    </div>
  );
};

export default ShoppingListUpload;