'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartModal from '../components/store/CartModal';
import { goodsApi } from '../lib/api2';
import { Good, Category } from '../types/goods';
import { ShoppingCart, Package, Coffee, Apple, MapPin, Utensils, Snowflake } from 'lucide-react';
import toast from 'react-hot-toast';
import GoodCard from '../components/store/StoreCard';
import Navbar from '../components/Nav1';

interface CategorySectionProps {
  title: string;
  icon: any;
  goods: Good[];
  color: string;
  showFullDescription?: boolean;
}

const CategorySection = ({ title, icon: Icon, goods, color, showFullDescription = false }: CategorySectionProps) => {
  if (goods.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className={`p-2 sm:p-3 rounded-xl ${color} mr-3 sm:mr-4 flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{title}</h2>
          <p className="text-sm sm:text-base text-gray-600">{goods.length} item{goods.length > 1 ? 's' : ''} available</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {goods.map((good) => (
          <GoodCard 
            key={good._id} 
            good={good} 
            showFullDescription={showFullDescription}
          />
        ))}
      </div>
    </div>
  );
};

const StoreWebapp: React.FC = () => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, getItemCount } = useCart();
  const { token, isAuthLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const data = await goodsApi.getGoods(
          activeTab !== 'all' ? (activeTab as Category) : undefined,
          true,
          undefined
        );
        setGoods(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchGoods();
  }, [activeTab]);

  const categorizeGoods = (goods: Good[]) => {
    const categories = {
      market_area: [] as Good[],
      package_deals: [] as Good[],
      drinks: [] as Good[],
      provisions_groceries: [] as Good[],
      meal_prep: [] as Good[],
      frozen_foods: [] as Good[],
    };

    goods.forEach((good) => {
      categories[good.category].push(good);
    });

    return categories;
  };

  if (loading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 borde-[#8d4817] mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading goods...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-[#8d4817] p-4 sm:p-6 rounded-xl text-red-700 max-w-md w-full">
          <h3 className="font-bold text-base sm:text-lg mb-2">Error Loading Goods</h3>
          <p className="text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const categorizedGoods = categorizeGoods(goods);
  const tabs = [
    { id: 'all', label: 'All', shortLabel: 'All', count: goods.length },
    { id: 'market_area', label: 'Market Area', shortLabel: 'Market', count: categorizedGoods.market_area.length },
    { id: 'package_deals', label: 'Package Deals', shortLabel: 'Packages', count: categorizedGoods.package_deals.length },
    { id: 'meal_prep', label: 'Meal Prep', shortLabel: 'Meal Prep', count: categorizedGoods.meal_prep.length },
    { id: 'frozen_foods', label: 'Frozen Foods', shortLabel: 'Frozen', count: categorizedGoods.frozen_foods.length },
    { id: 'drinks', label: 'Drinks', shortLabel: 'Drinks', count: categorizedGoods.drinks.length },
    { id: 'provisions_groceries', label: 'Provisions & Groceries', shortLabel: 'Groceries', count: categorizedGoods.provisions_groceries.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar Component */}
      <Navbar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsCartOpen={setIsCartOpen}
        goodsCount={goods.length}
      />

      {/* Items count for mobile - shown below navbar */}
      <div className="sm:hidden bg-blue-50 border-b px-4 py-2">
        <p className="text-blue-800 text-sm font-medium text-center">
          {goods.length} Total Items Available
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {goods.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg sm:text-xl">No goods found</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Check back later for new items!</p>
          </div>
        ) : (
          <>
            {(activeTab === 'all' || activeTab === 'market_area') && (
              <CategorySection
                title="Market Area"
                icon={MapPin}
                goods={categorizedGoods.market_area}
                color="bg-[#8d4817]"
              />
            )}
            {(activeTab === 'all' || activeTab === 'package_deals') && (
              <CategorySection
                title="Package Deals"
                icon={Package}
                goods={categorizedGoods.package_deals}
                color="bg-green-600"
              />
            )}
            {(activeTab === 'all' || activeTab === 'meal_prep') && (
              <CategorySection
                title="Meal Prep"
                icon={Utensils}
                goods={categorizedGoods.meal_prep}
                color="bg-blue-600"
                showFullDescription={true}
              />
            )}
            {(activeTab === 'all' || activeTab === 'frozen_foods') && (
              <CategorySection
                title="Frozen Foods"
                icon={Snowflake}
                goods={categorizedGoods.frozen_foods}
                color="bg-teal-600"
              />
            )}
            {(activeTab === 'all' || activeTab === 'drinks') && (
              <CategorySection
                title="Drinks"
                icon={Coffee}
                goods={categorizedGoods.drinks}
                color="bg-orange-600"
              />
            )}
            {(activeTab === 'all' || activeTab === 'provisions_groceries') && (
              <CategorySection
                title="Provisions & Groceries"
                icon={Apple}
                goods={categorizedGoods.provisions_groceries}
                color="bg-purple-600"
              />
            )}
          </>
        )}
      </div>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default StoreWebapp;