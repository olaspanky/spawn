'use client';
import { ShoppingCart, Package, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Good } from '@/app/types/goods';
import { useCart } from '@/app/context/CartContext';

interface GoodCardProps {
  good: Good;
}

const GoodCard = ({ good }: GoodCardProps) => {
  const { addToCart } = useCart();
console.log('GoodCard rendered with good:', good); // Debugging line
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl overflow-hidden">
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

      <div className="lg:p-6 p-2">
        <h3 className="lg:text-xl font-bold text-gray-900 lg:mb-2">{good.name}</h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{good.description}</p>

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

        <div className="flex justify-between items-center">
          <div className="lg:flex items-center hidden">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-gray-600">
              {good.rating.average.toFixed(1)} ({good.rating.count} reviews)
            </span>
          </div>
          <button
            onClick={() => addToCart('default-store', good)}
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
  );
};

export default GoodCard;