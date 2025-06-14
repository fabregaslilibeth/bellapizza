'use client';
import { useState } from 'react';

interface LocationButtonProps {
  onLocationSelect: (address: string) => void;
}

export default function LocationButton({ onLocationSelect }: LocationButtonProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            if (data.display_name) {
              onLocationSelect(data.display_name);
            }
          } catch (error) {
            console.error("Error getting address:", error);
            onLocationSelect(`${latitude}, ${longitude}`);
          }
          
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

  return (
    <div 
      className="flex items-center mt-4 gap-2 border-b border-dashed w-fit cursor-pointer"
      onClick={handleGetLocation}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isLoadingLocation ? 'animate-spin' : ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
      {isLoadingLocation ? 'Getting location...' : 'Or use my current location'}
    </div>
  );
} 