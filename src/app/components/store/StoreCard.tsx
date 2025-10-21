'use client';
import { ShoppingCart, Package, Star, Plus, Minus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Good } from '@/app/types/goods';
import { useCart } from '@/app/context/CartContext';
import { useState } from 'react';

interface GoodCardProps {
  good: Good;
  showFullDescription?: boolean;
}

const GoodCard = ({ good, showFullDescription = false }: GoodCardProps) => {
  const { addToCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPackageExpanded, setIsPackageExpanded] = useState(false);

  console.log('GoodCard rendered with good:', good); // Debugging line

  // Check if description contains comma-separated items (like meal prep)
  const descriptionItems = good.description?.includes(',') 
    ? good.description.split(',').map(item => item.trim())
    : null;

  const handleAddToCartClick = () => {
    setShowPopup(true);
    setQuantity(1);
  };

  const handleConfirmAdd = () => {
    // Add item multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart('default-store', good);
    }
    toast.success(`Added ${quantity} ${good.name} to cart`);
    setShowPopup(false);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
        <div className="relative h-40 sm:h-48 lg:h-52 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl overflow-hidden flex-shrink-0">
          {good.image ? (
            <img
              src={good.image}
              alt={good.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold opacity-20">
                {good.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          {good.isPackageDeal && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium text-gray-700">
              Package Deal
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 lg:p-6 flex flex-col flex-grow">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{good.name}</h3>
          
          {/* Description or Meal Prep Items */}
          {descriptionItems ? (
            <div className="mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm text-blue-800 font-medium block mb-1.5 sm:mb-2">
                      Includes:
                    </span>
                    {isDescriptionExpanded ? (
                      <div className="text-xs sm:text-sm text-blue-700 space-y-1">
                        {descriptionItems.map((item, index) => (
                          <div key={index} className="block leading-relaxed">
                            • {item}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-blue-700 line-clamp-2">
                        {good.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-800 text-xs font-medium hover:underline mt-2 block active:scale-95 transition-transform"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show all'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <p className={`text-gray-600 text-xs sm:text-sm leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                {good.description}
              </p>
              {good.description && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-[#8d4817] text-xs font-medium hover:underline mt-1 block active:scale-95 transition-transform"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          <div className="mb-2 sm:mb-3">
            <p className="text-gray-800 font-bold text-sm sm:text-base">NGN {good.price}</p>
            <p className="text-xs sm:text-sm text-gray-600">{good.measurementDisplay}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {good.available ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>

          {good.isPackageDeal && good.packageItems.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs sm:text-sm text-green-800 font-medium block mb-1.5 sm:mb-2">
                      Package Includes:
                    </span>
                    {isPackageExpanded ? (
                      <div className="text-xs sm:text-sm text-green-700 space-y-1">
                        {good.packageItems.map((item, index) => (
                          <div key={index} className="block leading-relaxed">
                            • {item.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-green-700 line-clamp-2">
                        {good.packageItems.map(item => item.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPackageExpanded(!isPackageExpanded)}
                className="text-green-800 text-xs font-medium hover:underline mt-2 block ml-5 sm:ml-6 active:scale-95 transition-transform"
              >
                {isPackageExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-auto pt-3 gap-2 sm:gap-0">
            <div className="flex items-center justify-center sm:justify-start">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
              <span className="text-xs sm:text-sm text-gray-600">
                {good.rating.average.toFixed(1)} ({good.rating.count} reviews)
              </span>
            </div>
            <button
              onClick={handleAddToCartClick}
              disabled={!good.available}
              className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                good.available
                  ? 'bg-[#8d4817] text-white hover:bg-[#96735a] active:bg-[#7a3d13]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Popup - Mobile Optimized */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full p-5 sm:p-6 relative animate-slide-up sm:animate-none">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors active:scale-90 p-2"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="mb-6 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Select Quantity</h3>
              <p className="text-sm sm:text-base text-gray-600">{good.name}</p>
            </div>

            <div className="flex items-center justify-center mb-6 sm:mb-6">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  quantity <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 active:bg-gray-400'
                }`}
              >
                <Minus className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>

              <div className="mx-6 sm:mx-8 text-center min-w-[80px]">
                <div className="text-5xl sm:text-4xl font-bold text-gray-900">{quantity}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{good.measurementDisplay}</div>
              </div>

              <button
                onClick={incrementQuantity}
                className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-[#8d4817] hover:bg-[#96735a] active:bg-[#7a3d13] text-white flex items-center justify-center transition-all active:scale-90"
              >
                <Plus className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm sm:text-base text-gray-600">Price per unit:</span>
                <span className="text-sm sm:text-base font-medium">NGN {good.price}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-[#8d4817]">NGN {(good.price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 px-6 py-3.5 sm:py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 px-6 py-3.5 sm:py-3 rounded-lg bg-[#8d4817] text-white font-medium hover:bg-[#96735a] active:bg-[#7a3d13] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default GoodCard;