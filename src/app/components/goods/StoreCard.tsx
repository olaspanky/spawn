import React from 'react';

interface StoreItem {
  _id: string;
  name: string;
  measurement: {
    unit: string;
    value: number;
    customUnit?: string;
  };
  price: number;
  available: boolean;
}

interface Store {
  _id: string;
  name: string;
  description: string;
  location: string;
  storeImage?: string;
  owner: { name: string };
  items: StoreItem[];
  packageDeals: any[];
  createdAt: string;
}

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 duration-300">
      <div className="h-48 bg-gray-100">
        {store.storeImage ? (
          <img src={store.storeImage} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-2xl font-bold text-gray-500">{store.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{store.name}</h2>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{store.description}</p>
        <div className="space-y-2">
          <p className="text-gray-500 text-sm">
            <span className="font-semibold">Location:</span> {store.location}
          </p>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold">Owner:</span> {store.name}
          </p>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold">Items:</span> {store.items.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;