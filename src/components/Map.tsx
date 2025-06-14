'use client';

import { useEffect, useRef, useState } from 'react';

interface MapProps {
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    google: any;
    isGoogleMapsLoaded: boolean;
  }
}

export default function Map({ latitude, longitude }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    //const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const API_KEY = '9f43717f16518aa0a5872d0dcd0a77ccbd0c12ef';

    if (!API_KEY) {
      setMapError('Google Maps API key is missing. Please check your environment configuration.');
      return;
    }

    const initMap = () => {
      if (!mapRef.current) return;
      
      try {
        const location = { lat: latitude, lng: longitude };
        const map = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 15,
        });

        new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Your Location',
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map. Please try again later.');
      }
    };

    const loadGoogleMapsScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        if (window.isGoogleMapsLoaded) {
          // Wait for the script to load
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogleMaps);
              resolve();
            }
          }, 100);
          return;
        }

        window.isGoogleMapsLoaded = true;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          window.isGoogleMapsLoaded = false;
          setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
          reject(new Error('Failed to load Google Maps'));
        };

        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        initMap();
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      // Cleanup if needed
    };
  }, [latitude, longitude]);

  if (mapError) {
    return (
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
} 