import { useState, useEffect } from "react";
import { useOrderPreference } from "@/context/OrderPreferenceContext";
import places from "@/data/places.json";

interface Place {
  province: string;
  municipality: string;
}

interface BarangayList {
  barangay_list: string[];
}

interface MunicipalityList {
  [key: string]: BarangayList;
}

interface Province {
  municipality_list: MunicipalityList;
}

interface ProvinceList {
  [key: string]: Province;
}

interface Region {
  region_name: string;
  province_list: ProvinceList;
}

interface Places {
  [key: string]: Region;
}

const typedPlaces = places as Places;

export default function AddressSearch() {
  const [search, setSearch] = useState("");
  const [tempAddress, setTempAddress] = useState<Place | null>(null);
  const { setAddress } = useOrderPreference();
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const filtered = [];

    for (const regionKey in typedPlaces) {
      const region = typedPlaces[regionKey];
      const provinces = region.province_list;

      for (const provinceName in provinces) {
        const municipalities = provinces[provinceName].municipality_list;
        for (const municipalityName in municipalities) {
          if (municipalityName.toLowerCase().includes(search.toLowerCase())) {
            filtered.push({
              province: provinceName,
              municipality: municipalityName,
            });
          }
        }
      }
    }
    setFilteredPlaces(filtered);
  }, [search]);

  const handlePlaceSelect = () => {
    setAddress(tempAddress);
  };

  const handleSearch = (place: Place) => {
    setTempAddress(place);
    setFilteredPlaces([]);
  };

  return (
    <div className="">
      <h3 className="text-xl font-semibold">Check local menu/deals</h3>
      <p className="text-gray-600">
        Enter your address to see local menu/deals
      </p>
      <div className="flex mt-4">
        <input
          id="address-input"
          type="text"
          placeholder="Enter your address"
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-600 transition-colors border border-gray-300 cursor-pointer"
          onClick={handlePlaceSelect}
        >
          Go
        </button>
      </div>
      {filteredPlaces.length > 0 && search && (
        <div className="max-h-48 overflow-y-auto border border-gray-300 bg-white shadow-md rounded-b-md">
          {filteredPlaces.slice(0, 5).map((place, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleSearch(place);
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
