'use client';

import { useOrderPreference } from '@/context/OrderPreferenceContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Store {
  name: string;
  hours: string;
  phone: string;
  services: string[];
  latitude: number;
  longitude: number;
  distance: number;
}

export default function NearestStores() {
  const { nearestStores, setSelectedStore, isNearestStoresVisible, setIsNearestStoresVisible } = useOrderPreference();
  const [myStore, setMyStore] = useState<Store | null>(null);

  if (!nearestStores || nearestStores.length === 0) {
    return null;
  }

  const handleMyStoreClick = (store: Store) => {
    setMyStore(store);
  };

  const handleStoreClick = () => {
    setSelectedStore(myStore);
    setIsNearestStoresVisible(false);
  };

  if (!isNearestStoresVisible || nearestStores.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isNearestStoresVisible && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
          />
          <motion.div 
            key="stores-panel"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 bottom-0 left-0 z-50 mt-4 p-4 bg-white shadow-md"
          >
            <h3 className="text-lg font-semibold mb-2 text-green-600">Nearest Stores</h3>
            <div className="space-y-2 overflow-y-auto">
              {nearestStores.map((store, index) => (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 cursor-pointer border-b border-green-600 ${
                    myStore?.name === store.name ? 'bg-green-100' : ''
                  }`}
                  onClick={() => handleMyStoreClick(store)}
                >
                  <div className="font-medium">{store.name}</div>
                  <div className="text-sm text-gray-600">{store.hours}</div>
                  <div className="text-sm text-gray-600">{store.phone}</div>
                  <div className="text-sm text-gray-600">
                    {store.services.join(', ')}
                  </div>
                  {store.distance && (
                    <div className="text-sm text-gray-600">
                      {store.distance.toFixed(1)} km away
                    </div>
                  )}
                </div>
              ))}
            </div>
           <div className='mt-4'>
           {myStore && (
              <button className="bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer" onClick={handleStoreClick}>This is my store</button>
            )}
           </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
