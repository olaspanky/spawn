"use client";

import React from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import AddStoreItemForm from './AddStoreItemForm';
import { Store } from '../../types/store'; // Import the Store type

interface StoreDetailsProps {
  store: Store;
}

const StoreDetails: React.FC<StoreDetailsProps> = ({ store }) => {
  const { user } = useAuth();

  // Check if the current user is the store owner
  const isOwner = user && store.owner && user.id === store.owner.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64">
          <Image
            src={store.storeImage || '/placeholder-store.jpg'}
            alt={store.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
          <p className="text-gray-600 mt-2">{store.description}</p>
          <p className="text-sm text-gray-500 mt-1">{store.location}</p>
          <p className="text-sm text-gray-500 mt-1">
            Owner: {store.owner.name} ({store.owner.email})
          </p>
        </div>

        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {store.items.map((item, index) => (
              <div
                key={index} // Use index since items are embedded and may not have unique IDs
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show AddStoreItemForm only if the user is the store owner */}
        {isOwner && (
          <div className="p-6 border-t">
            <AddStoreItemForm storeId={store.id} onItemAdded={() => window.location.reload()} />
          </div>
        )}

        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Package Deals</h2>
          {store.packageDeals.length === 0 ? (
            <p className="text-gray-600">No package deals available.</p>
          ) : (
            <div className="space-y-4">
              {store.packageDeals.map((deal) => (
                <div
                  key={deal.id}
                  className={`p-4 rounded-lg ${
                    deal.active ? 'bg-green-50' : 'bg-gray-100 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{deal.name}</h3>
                      <p className="text-gray-600">
                        ${deal.price.toFixed(2)}
                        {deal.discountPercentage && (
                          <span className="ml-2 text-green-600">
                            ({deal.discountPercentage}% off)
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        deal.active ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {deal.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;