'use client';

interface Store {
  name: string;
  hours: string;
  phone: string;
  services: string[];
  latitude: number | null;
  longitude: number | null;
}

interface NearestStoresProps {
  nearestStores: Store | null;
  onStoreSelect: (store: Store) => void;
}

export default function NearestStores({ nearestStores, onStoreSelect }: NearestStoresProps) {
  if (!nearestStores) {
    return null;
  }

  return (
    <div className="absolute top-0 right-0 mt-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Nearest Store</h3>
      <div 
        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => onStoreSelect(nearestStores)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{nearestStores.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{nearestStores.hours}</p>
            <p className="text-sm text-gray-600">{nearestStores.phone}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {nearestStores.services.map((service, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
