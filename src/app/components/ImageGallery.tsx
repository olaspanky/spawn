"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, EffectFade, Autoplay } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <div className="lg:space-y-3 lg:max-w-4xl mx-auto p-1 lg:p-4 ">
      {/* Main Slider */}
      <div className="relative h-[20vh] lg:w-96 w-full lg:h-[450px]  rounded-3xl overflow-hidden group">
        <Swiper
          modules={[Navigation, Thumbs, EffectFade, Autoplay]}
          effect="fade"
          fadeEffect={{ crossFade: true }} // Ensures full fade-out before fade-in
          speed={800}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          spaceBetween={0}
          slidesPerView={1}
          loop={images.length > 1}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          thumbs={{ swiper: thumbsSwiper }}
          onSlideChange={handleSlideChange}
          className="h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative h-[20vh] lg:h-[450px] lg:w-96 w-full cursor-zoom-in"
                onClick={() => setSelectedImage(images[activeIndex])}
              >
                <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <Image
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-contain transform transition-transform duration-500 group-hover:scale-105"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-20 group-hover:opacity-100 opacity-0">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button className="swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-20 group-hover:opacity-100 opacity-0">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="mt-3">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={12}
          slidesPerView={5}
          className="!h-20"
          watchSlidesProgress
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="relative lg:h-20 h-12 rounded-md lg:rounded-xl overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className={`object-cover bg-gray-700 transition-opacity duration-300 ${
                    activeIndex === index ? "opacity-100" : "opacity-60"
                  }`}
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
                <div className="absolute inset-0  hover:bg-black/0 transition-colors" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-sm transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>
            <motion.div
              className="relative max-w-5xl max-h-[85vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Image
                src={selectedImage}
                alt="Enlarged view"
                width={1200}
                height={800}
                className="rounded-2xl object-contain w-full h-full "
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}