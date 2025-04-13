import React from 'react';
import StoreCard from './StoreCard';

interface Store {
  id: string;
  _id: string;
  name: string;
  description: string;
  storeImage?: string;
  location: string;
  itemCount: number;
  owner: { name: string };
  items: any[];
  packageDeals: any[];
  createdAt: string;
}

interface StoreListProps {
  stores: Store[];
}

const StoreList: React.FC<StoreListProps> = ({ stores }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Stores</h2>
      {stores.length === 0 ? (
        <p className="text-gray-600 text-center">No stores found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreList;