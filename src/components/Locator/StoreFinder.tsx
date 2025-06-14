'use client';
import { useState } from 'react';
import stores from '@/data/stores.json';
import NearestStores from './NearestStores';

interface StoreFinderProps {
  onLocationSelect: (address: string) => void;
}

export default function StoreFinder({ onLocationSelect }: StoreFinderProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [nearestStores, setNearestStores] = useState<any>(null);
  const [myStore, setMyStore] = useState<any>(null);

  const storesList = stores
  const handleFindStore = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // setUserLocation({ latitude, longitude });
          
          const stores = storesList.filter((store: any) => store.latitude && store.longitude);
          const nearestStore = stores.sort((a, b) => {
            const aDistance = Math.sqrt((a.latitude - latitude) ** 2 + (a.longitude - longitude) ** 2);
            const bDistance = Math.sqrt((b.latitude - latitude) ** 2 + (b.longitude - longitude) ** 2);
            return aDistance - bDistance;
          })[0];
          console.log(nearestStore, 'nearestStore');
          setNearestStores(nearestStore);
          
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const handleStoreSelect = (store: any) => {
    setMyStore(store);
  };

  return (
    <div 
      className="flex items-center mt-4 gap-2 border-b border-dashed w-fit cursor-pointer"
      onClick={handleFindStore}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isLoadingLocation ? 'animate-spin' : ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
      {isLoadingLocation ? 'Finding the nearest store...' : 'Find the nearest store'}
      <NearestStores nearestStores={nearestStores} onStoreSelect={handleStoreSelect} />
    </div>
  );
} 