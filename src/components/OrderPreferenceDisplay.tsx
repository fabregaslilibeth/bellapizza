"use client";

import { useOrderPreference } from "@/context/OrderPreferenceContext";
import Image from "next/image";

export default function OrderPreferenceDisplay() {
  const { setIsLocatorOpen, orderPreference, address, selectedStore, setIsChangeAddressVisible } =
    useOrderPreference();

  const getDisplayContent = () => {
    if (address) {
      return (
        <div className="flex w-full justify-between">
          <div>
            <p className="font-semibold">
              {address.municipality}, {address.province}
            </p>
            <p className="text-sm text-gray-500 capitalize">{orderPreference}</p>
          </div>
          <button
            className="text-green-600 cursor-pointer"
            onClick={() => setIsChangeAddressVisible(true)}
          >
            Change
          </button>
        </div>
      );
    }

    if (selectedStore) {
      return (
        <div className="flex w-full justify-between">
        <div>
          <p className="font-semibold">
            {selectedStore.name}
          </p>
          <p className="text-sm text-gray-500 capitalize">Pick up</p>
        </div>
        <button
          className="text-green-600 cursor-pointer"
          onClick={() => setIsChangeAddressVisible(true)}
        >
          Change
        </button>
      </div>
      );
    }

    return (
        <div className="flex w-full justify-between cursor-pointer" onClick={() => setIsLocatorOpen(true)}>
        <div>
          <p className="font-semibold">
            Let us get your location
          </p>
          <p className="text-sm text-gray-500">
            It will help us find your local pizza bella
          </p>
        </div>
      </div>
    )
  };

  return (
    <div className="h-16 w-full">
      <div className="max-w-7xl mx-4 xl:mx-auto mt-4">
        <div className="px-4 py-2 sm:w-1/2 lg:w-4/12 flex items-center gap-4 border border-gray-300 rounded-md">
          <p className="shrink-0">
            <Image
              src="https://static.phdvasia.com/global/icons/icon_delivery.gif"
              alt="Delivery"
              width={36}
              height={36}
              className="w-9 h-9"
            />
          </p>
          {getDisplayContent()}
        </div>
      </div>
    </div>
  );
}
