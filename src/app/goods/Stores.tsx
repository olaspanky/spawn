'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartModal from '../components/store/CartModal';
import { goodsApi } from '../lib/api2';
import { Good, Category } from '../types/goods';
import { ShoppingCart, Package, Coffee, Apple, MapPin, Utensils, Snowflake, Search, X } from 'lucide-react';
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
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg ${color} mr-3 flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-500">{goods.length} available</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, getItemCount } = useCart();
  const { token, isAuthLoading, logout } = useAuth();
  const router = useRouter();

  const tabs = [
    { id: 'all', label: 'All Items', shortLabel: 'All' },
    { id: 'market_area', label: 'Market Area', shortLabel: 'Market' },
    { id: 'package_deals', label: 'Packages', shortLabel: 'Packages' },
    { id: 'meal_prep', label: 'Meal Prep', shortLabel: 'Meal prep' },
    { id: 'frozen_foods', label: 'Frozen', shortLabel: 'Frozen' },
    { id: 'drinks', label: 'Drinks', shortLabel: 'Drinks' },
    { id: 'provisions_groceries', label: 'Groceries', shortLabel: 'Groceries' },
  ];

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

  // Filter goods by search query
  const filteredGoods = useMemo(() => {
    if (!searchQuery.trim()) return goods;
    
    const query = searchQuery.toLowerCase().trim();
    return goods.filter(good => 
      good.name.toLowerCase().includes(query) ||
      good.description.toLowerCase().includes(query)
    );
  }, [goods, searchQuery]);

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

  if (!goods) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">

       
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
       
        <div className="bg-red-50 p-4 sm:p-6 rounded-xl text-red-700 max-w-md w-full">
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
          <h3 className="font-bold text-base sm:text-lg mb-2">Error Loading Goods</h3>
          <p className="text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
    );
  }

  const categorizedGoods = categorizeGoods(filteredGoods);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Component */}
      <Navbar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsCartOpen={setIsCartOpen}
        goodsCount={goods.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Search Results Info */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{filteredGoods.length}</span> result{filteredGoods.length !== 1 ? 's' : ''} for <span className="font-medium">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {filteredGoods.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
           
          
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
                color="bg-emerald-600"
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
                color="bg-cyan-600"
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