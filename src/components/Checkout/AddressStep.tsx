"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCheckout } from '@/context/CheckoutContext';
import { DeliveryAddress } from '@/types';

const AddressStep: React.FC = () => {
  const { 
    deliveryAddresses, 
    selectedDeliveryAddress, 
    setSelectedDeliveryAddress,
    proceedToNextStep,
    goToPreviousStep,
    canProceedToNextStep,
    addDeliveryAddress
  } = useCheckout();

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    phone: '',
    instructions: '',
  });

  const handleAddressSelect = (address: DeliveryAddress) => {
    setSelectedDeliveryAddress(address);
  };

  const handleAddAddress = () => {
    if (newAddress.name && newAddress.address && newAddress.city && newAddress.phone) {
      const address: DeliveryAddress = {
        id: `address-${Date.now()}`,
        name: newAddress.name,
        address: newAddress.address,
        city: newAddress.city,
        province: newAddress.province,
        zipCode: newAddress.zipCode,
        phone: newAddress.phone,
        instructions: newAddress.instructions,
      };
      
      addDeliveryAddress(address);
      setSelectedDeliveryAddress(address);
      setShowAddAddress(false);
      setNewAddress({
        name: '',
        address: '',
        city: '',
        province: '',
        zipCode: '',
        phone: '',
        instructions: '',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Address</h3>
        <p className="text-gray-600">Where should we deliver your order?</p>
      </div>

      {/* Delivery Addresses */}
      <div className="space-y-3 mb-6">
        {deliveryAddresses.length > 0 ? (
          deliveryAddresses.map((address) => (
            <motion.div
              key={address.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedDeliveryAddress?.id === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📍</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900">{address.name}</p>
                    {address.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.province} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                  {address.instructions && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Instructions:</span> {address.instructions}
                    </p>
                  )}
                </div>
                {selectedDeliveryAddress?.id === address.id && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No saved addresses</p>
            <p className="text-sm">Add a delivery address to continue</p>
          </div>
        )}
      </div>

      {/* Add New Address */}
      {showAddAddress ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 border border-gray-200 rounded-lg mb-6"
        >
          <h4 className="font-medium text-gray-900 mb-3">Add New Address</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Address Name (e.g., Home, Office) *"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newAddress.name}
              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Street Address *"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City *"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="Province"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newAddress.province}
                onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="ZIP Code"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Delivery Instructions (optional)"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={newAddress.instructions}
              onChange={(e) => setNewAddress({ ...newAddress, instructions: e.target.value })}
            />
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleAddAddress}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Address
            </button>
            <button
              onClick={() => setShowAddAddress(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setShowAddAddress(true)}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors mb-6"
        >
          + Add New Address
        </button>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousStep}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Payment
        </button>
        <button
          onClick={proceedToNextStep}
          disabled={!canProceedToNextStep()}
          className={`px-6 py-2 rounded-lg transition-colors ${
            canProceedToNextStep()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Confirm
        </button>
      </div>
    </motion.div>
  );
};

export default AddressStep; 