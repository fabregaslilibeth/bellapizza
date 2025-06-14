import { useState, useEffect } from 'react';
import places from '@/data/places.json';

interface Place {
  province: string;
  municipality: string;
}

interface AddressSearchProps {
  onPlaceSelect: (place: Place) => void;
}

export default function AddressSearch({ onPlaceSelect }: AddressSearchProps) {
  const [search, setSearch] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const filtered = []

    for (const regionKey in places) {
      const region = places[regionKey as keyof typeof places]
      const provinces = region.province_list

      for (const provinceName in provinces) {
        const municipalities = provinces[provinceName].municipality_list
        for (const municipalityName in municipalities) {
          if (municipalityName.toLowerCase().includes(search.toLowerCase())) {
            filtered.push({
              province: provinceName,
              municipality: municipalityName
            })
          }
        }
      }
    }
    setFilteredPlaces(filtered)
  }, [search])

  return (
    <div className="">
      <h3 className="text-xl font-semibold">Check local menu/deals</h3>
      <p className="text-gray-600">Enter your address to see local menu/deals</p>
      <div className="flex mt-4">
        <input 
          id="address-input"
          type="text" 
          placeholder="Enter your address" 
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-colors border border-gray-300">Go</button>
      </div>
      {filteredPlaces.length > 0 && search && (
        <div className="max-h-48 overflow-y-auto border border-gray-300 bg-white shadow-md rounded-b-md">
          {filteredPlaces.slice(0, 5).map((place, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setFilteredPlaces([]);
                onPlaceSelect(place);
              }}
            >
              <div className="font-medium">{place.municipality}</div>
              <div className="text-sm text-gray-600">{place.province}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 