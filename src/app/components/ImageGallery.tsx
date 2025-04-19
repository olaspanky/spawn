"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const mainImageRef = useRef<HTMLDivElement>(null);

  // Handle image navigation
  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Open/close lightbox
  const toggleLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent parent click from interfering
    setIsZooming(false); // Reset zoom state before opening lightbox
    setIsLightboxOpen(!isLightboxOpen);
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Zoom effect on hover (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    mainImageRef.current.style.transformOrigin = `${x}% ${y}%`;
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "Escape") setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Ensure valid images
  const validImages = images.filter((img) => img && typeof img === "string");
  if (validImages.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-md">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-80"
          style={{
            backgroundImage: `url(${validImages[selectedImageIndex]})`,
            filter: "blur(10px)",
          }}
        />
        <motion.div
          ref={mainImageRef}
          className={`relative w-full h-full transition-transform duration-300 ${
            isZooming ? "scale-150 cursor-zoom-in" : "scale-100 cursor-pointer"
          }`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={toggleLightbox}
          role="button"
          tabIndex={0}
          aria-label={`View ${title} image ${selectedImageIndex + 1} of ${validImages.length}`}
        >
          <motion.img
            key={validImages[selectedImageIndex]}
            src={validImages[selectedImageIndex]}
            alt={`${title} - Image ${selectedImageIndex + 1}`}
            className="w-full h-full object-contain relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              e.currentTarget.src = "/fallback-image.jpg"; // Replace with your fallback image
            }}
          />
        </motion.div>
        {/* Navigation Arrows (Visible on Desktop) */}
        {validImages.length > 1 && (
          <div className="hidden lg:flex absolute inset-y-0 left-0 items-center">
            <button
              onClick={handlePrev}
              className="p-2 bg-gray-900/50 text-white rounded-full hover:bg-gray-900 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        {validImages.length > 1 && (
          <div className="hidden lg:flex absolute inset-y-0 right-0 items-center">
            <button
              onClick={handleNext}
              className="p-2 bg-gray-900/50 text-white rounded-full hover:bg-gray-900 transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {validImages.length > 1 && (
        <div className="flex  justify-center mt-4 lg:mt-0 lg:ml-4 gap-2 overflow-x-auto lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {validImages.map((img, index) => (
            <motion.button
              key={img}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                selectedImageIndex === index ? "border-orange-500" : "border-transparent"
              } hover:border-orange-400 transition-colors`}
              onClick={() => handleThumbnailClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select image ${index + 1}`}
            >
              <img
                src={img}
                alt={`${title} - Thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/fallback-image.jpg"; // Replace with your fallback image
                }}
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleLightbox}
          >
            <motion.div
              className="relative max-w-4xl w-full h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-80"
                style={{
                  backgroundImage: `url(${validImages[selectedImageIndex]})`,
                  filter: "blur(20px)",
                }}
              />
              <button
                onClick={(e) => toggleLightbox(e)}
                className="absolute top-4 right-4 p-2 bg-gray-900/50 text-white rounded-full hover:bg-gray-900 transition-colors z-20"
                aria-label="Close lightbox"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <motion.img
                key={validImages[selectedImageIndex]}
                src={validImages[selectedImageIndex]}
                alt={`${title} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.currentTarget.src = "/fallback-image.jpg"; // Replace with your fallback image
                }}
              />
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute top-1/2 left-4 p-2 bg-gray-900/50 text-white rounded-full hover:bg-gray-900 transition-colors z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="h-8 w-8" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute top-1/2 right-4 p-2 bg-gray-900/50 text-white rounded-full hover:bg-gray-900 transition-colors z-20"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="h-8 w-8" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}