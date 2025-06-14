"use client";
import React, { useState } from "react";
import LocationButton from "./LocationButton";
import AddressSearch from "./AddressSearch";
import StoreFinder from "./StoreFinder";

const Locator = () => {
  const [activeTab, setActiveTab] = useState("delivery");
  const [address, setAddress] = useState<{
    province?: string;
    municipality?: string;
    address?: string;
  } | null>(null);

  const handlePlaceSelect = (place: {
    province: string;
    municipality: string;
  }) => {
    localStorage.setItem("address", JSON.stringify(place));
    setAddress(place);
  };

  const handleLocationSelect = (address: string) => {
    localStorage.setItem("address", address);
    setAddress({ address });
  };
  
  return (
    <div className="absolute top-3/4 transform -translate-y-1/4 w-full">
      <div className="w-full sm:w-3/4 md:w-1/2 2xl:w-1/4 h-full mx-auto bg-white shadow-lg rounded-lg">
        {/* Tabs */}
        <div className="flex w-full relative">
          <button
            className={`flex-1 py-3 text-lg font-medium flex items-center justify-center gap-2 rounded-t-lg ${
              activeTab === "delivery"
                ? "bg-white border-b-1 border-gray-50 -mt-4"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("delivery")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
            Delivery
          </button>
          <button
            className={`flex-1 py-3 text-lg font-medium flex items-center justify-center gap-2 rounded-t-lg ${
              activeTab === "pickup"
                ? "bg-white border-b-1 border-gray-50 -mt-4"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("pickup")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            Pickup
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-12">
          {activeTab === "delivery" ? (
            <>
              <AddressSearch onPlaceSelect={handlePlaceSelect} />
              <LocationButton onLocationSelect={handleLocationSelect} />
            </>
          ) : (
           <>
            <AddressSearch onPlaceSelect={handlePlaceSelect} />
            <StoreFinder onLocationSelect={handleLocationSelect} />
           </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Locator;
