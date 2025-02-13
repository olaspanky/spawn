


'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Item {
  _id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  seller: {
    username: string;
  };
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/items`);
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = items.map(item => item.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, items]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-white  pb-16 font-font2">
      <div className="sticky top-0 z-20 bg-white shadow-sm">

      <div className="max-w-6xl mx-auto p-3 lg:px-4 lg:py-5 text-center">
      <div className="max-w-2xl mx-auto flex justify-center items-center gap-5">
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-6">
      <span> <Link href="/declutter/upload">
    <div className="inline-flex items-center bg-orange-600 text-white p-2 rounded-full  font-semibold hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl">
      Trade
      <ShoppingCartIcon className="h-5 w-5 ml-2" />
    </div>
  </Link>
</span> with <span className="text-orange-600">Confidence</span>
    </h2>
  </div>

 
</div>

      </div>
        {/* Hero Section with Search */}
        <div className="max-w-6xl mx-auto p-3 lg:px-4 lg:py-6">
          <div className="flex items-center lg:space-x-4">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Search for items..."
                className="w-full lg:py-3 pl-12 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5  text-gray-400 absolute top-1 lg:left-4 lg:top-4" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-orange-100 text-orange-600 lg:p-3 p-1 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="lg:h-5 lg:w-5 h-3 w-3 " />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      {isFilterOpen && (
        <div className="max-w-6xl mx-auto px-4 mt-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-orange-600 text-white scale-105'
                      : 'bg-gray- text-gray-700 hover:bg-gray-'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 mt-6 bg-white">
        {filteredItems.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedCategory !== 'All' ? `${selectedCategory} Items` : 'All Listings'}
              <span className="ml-2 text-sm text-gray-500">({filteredItems.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Link key={item._id} href={`/declutter/products/${item._id}`}>
                  <ListingCard item={item} />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ListingCard = ({ item }: { item: Item }) => {
  const hasValidImage = item.images?.length > 0 && item.images[0];

  return (
    <div className="bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden group">
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {hasValidImage ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <ShoppingCartIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5">
          <span className="text-xs font-medium text-gray-700 px-2">
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1 truncate text-lg">{item.title}</h4>
        <div className="flex justify-between items-center mt-2">
          <span className="text-orange-600 font-bold text-xl">
            ₦{item.price.toLocaleString()}
          </span>
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-orange-500" />
            <span className="text-sm">{item.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-pulse">
      <ShoppingCartIcon className="h-16 w-16 text-orange-500 mx-auto" />
      <p className="text-center text-gray-600 mt-4">Loading items...</p>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-red-50">
    <div className="text-center">
      <XMarkIcon className="h-16 w-16 text-red-500 mx-auto" />
      <h2 className="text-2xl font-bold text-red-600 mt-4">Oops! Something went wrong</h2>
      <p className="text-red-500 mt-2">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 bg-red-100 text-red-600 px-6 py-2 rounded-full hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <div className="text-center bg-white rounded-xl shadow-md p-8">
    <ShoppingCartIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
    {searchTerm && (
      <p className="text-gray-600 mb-4">
        No results for "<span className="font-medium">{searchTerm}</span>"
      </p>
    )}
    <p className="text-gray-500">Try adjusting your search or filter</p>
  </div>
);

