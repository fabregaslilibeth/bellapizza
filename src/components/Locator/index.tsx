"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LocationButton from "./LocationButton";
import AddressSearch from "./AddressSearch";
import StoreFinder from "./StoreFinder";
import { useOrderPreference } from "@/context/OrderPreferenceContext";

const Locator = () => {
  const { orderPreference, setOrderPreference, address, selectedStore, isLocatorOpen, setIsLocatorOpen } = useOrderPreference();

  // Don't render if either address or selectedStore is set
  if (address || selectedStore) {
    return null;
  }

  if (!isLocatorOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setIsLocatorOpen(false)} >
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          className="w-11/12 sm:w-3/4 md:w-1/2 2xl:w-1/4 bg-white shadow-lg rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tabs */}
          <div className="flex w-full relative">
            <motion.button
              whileTap={{ scale: 0.98 }}
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
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
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
            </motion.button>
          </div>

          {/* Tab Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 lg:p-12"
          >
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
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Locator;
