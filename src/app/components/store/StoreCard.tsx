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

  console.log('GoodCard rendered with good:', good); // Debugging line

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
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl overflow-hidden flex-shrink-0">
          {good.image ? (
            <img
              src={good.image}
              alt={good.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-6xl font-bold opacity-20">
                {good.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          {good.isPackageDeal && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
              Package Deal
            </div>
          )}
        </div>

        <div className="lg:p-6 p-2 flex flex-col flex-grow">
          <h3 className="lg:text-xl font-bold text-gray-900 lg:mb-2">{good.name}</h3>
          <p className={`text-gray-600 text-sm mb-3 ${showFullDescription ? '' : 'line-clamp-2'}`}>
            {good.description}
          </p>

          <div className="mb-2">
            <p className="text-gray-800 font-medium text-xs">NGN {good.price}</p>
            <p className="text-sm text-gray-600">{good.measurementDisplay}</p>
            <p className="text-sm text-gray-500">
              {good.available ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>

          {good.isPackageDeal && good.packageItems.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <Package className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-green-800 font-medium">
                  Includes: {good.packageItems.map(item => item.name).join(', ')}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-auto pt-3">
            <div className="lg:flex items-center hidden">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-600">
                {good.rating.average.toFixed(1)} ({good.rating.count} reviews)
              </span>
            </div>
            <button
              onClick={handleAddToCartClick}
              disabled={!good.available}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                good.available
                  ? 'bg-[#8d4817] text-white hover:bg-[#96735a]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Quantity</h3>
              <p className="text-gray-600">{good.name}</p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  quantity <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="mx-8 text-center">
                <div className="text-4xl font-bold text-gray-900">{quantity}</div>
                <div className="text-sm text-gray-500 mt-1">{good.measurementDisplay}</div>
              </div>

              <button
                onClick={incrementQuantity}
                className="w-12 h-12 rounded-full bg-[#8d4817] hover:bg-[#96735a] text-white flex items-center justify-center transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Price per unit:</span>
                <span className="font-medium">NGN {good.price}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-[#8d4817]">NGN {(good.price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 px-6 py-3 rounded-lg bg-[#8d4817] text-white font-medium hover:bg-[#96735a] transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoodCard;