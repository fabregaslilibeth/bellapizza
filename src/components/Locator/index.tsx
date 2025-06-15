"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import LocationButton from "./LocationButton";
import AddressSearch from "./AddressSearch";
import StoreFinder from "./StoreFinder";
import { useOrderPreference } from "@/context/OrderPreferenceContext";

const Locator = () => {
  const { orderPreference, setOrderPreference, address, selectedStore, isLocatorOpen, setIsLocatorOpen } = useOrderPreference();

  useEffect(() => {
    // Prevent scrolling when component mounts
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Don't render if either address or selectedStore is set
  if (address || selectedStore) {
    return null;
  }

  if (!isLocatorOpen) {
    return null;
  }

  return (
    <>
    <div className="fixed inset-0 bg-black opacity-60" onClick={() => setIsLocatorOpen(false)} />
      <div className="absolute top-1/4 transform -translate-y-1/2 w-full">
        <div className="w-11/12 sm:w-3/4 md:w-1/2 2xl:w-1/4 h-full mx-auto bg-white shadow-lg rounded-lg">
          {/* Tabs */}
          <div className="flex w-full relative">
            <button
              className={`flex-1 py-3 text-lg font-medium flex items-center justify-center gap-2  cursor-pointer ${
                orderPreference === "delivery"
                  ? "bg-white -mt-1 rounded-t-lg"
                  : "bg-gray-200 border-t-1 border-l-1 border-gray-300"
              }`}
              onClick={() => setOrderPreference("delivery")}
            >
              <Image
                src="https://static.phdvasia.com/global/icons/icon_delivery.gif"
                alt="Delivery"
                className="w-6 h-6"
                width={24}
                height={24}
              />
              Delivery
            </button>
            <button
              className={`flex-1 py-3 text-lg font-medium flex items-center justify-center gap-2 cursor-pointer ${
                orderPreference === "pickup"
                  ? "bg-white -mt-1 rounded-t-lg"
                  : "bg-gray-200 border-t-1 border-l-1 border-gray-300"
              }`}
              onClick={() => setOrderPreference("pickup")}
            >
              <Image
                src="https://static.phdvasia.com/global/icons/icon_pick_up.gif"
                alt="Pickup"
                className="w-6 h-6"
                width={24}
                height={24}
              />
              Pickup
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-12">
            {orderPreference === "delivery" ? (
              <>
                <AddressSearch />
                <LocationButton />
              </>
            ) : (
              <>
                <AddressSearch />
                <StoreFinder />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Locator;
