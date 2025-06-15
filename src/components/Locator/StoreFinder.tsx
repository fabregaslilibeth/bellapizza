'use client';

import stores from '@/data/stores.json';
import { useOrderPreference } from '@/context/OrderPreferenceContext';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function StoreFinder({ }) {
  const { setNearestStores, setIsNearestStoresVisible } = useOrderPreference();

  const handleFindStore = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Filter stores with valid coordinates and calculate distances
            const storesWithDistance = stores
              .filter(store => store.latitude && store.longitude)
              .map(store => ({
                name: store.name || store.store || 'Unknown Store',
                hours: store.hours,
                phone: store.phone || (store.numbers ? store.numbers[0] : 'N/A'),
                services: store.services,
                latitude: store.latitude!,
                longitude: store.longitude!,
                distance: calculateDistance(
                  latitude,
                  longitude,
                  store.latitude!,
                  store.longitude!
                )
              }))
              .sort((a, b) => a.distance - b.distance)
              .slice(0, 5);

            setNearestStores(storesWithDistance);
          } catch (error) {
            console.error("Error processing stores:", error);
          } finally {
            setIsNearestStoresVisible(true);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="flex items-center mt-4 gap-2 cursor-pointer text-green-600"
        onClick={handleFindStore}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        Find the nearest stores
      </div>
    </div>
  );
} 