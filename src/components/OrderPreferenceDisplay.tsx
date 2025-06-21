"use client";

import { useOrderPreference } from "@/context/OrderPreferenceContext";
import Image from "next/image";
import { motion } from "framer-motion";

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
    <div className="fixed bottom-20 right-0 w-96 z-50 h-16">
      <div className="mt-4">
        <motion.div 
          className="px-4 py-2 w-full lg:w-1/2 lg:w-84 flex items-center gap-4 border border-black rounded-md bg-green-50"
          whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.p 
            className="shrink-0"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
          >
            <Image
              src="https://static.phdvasia.com/global/icons/icon_delivery.gif"
              alt="Delivery"
              width={36}
              height={36}
              className="w-9 h-9"
            />
          </motion.p>
          {getDisplayContent()}
        </motion.div>
      </div>
    </div>
  );
}
