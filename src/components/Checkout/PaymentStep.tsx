"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCheckout } from '@/context/CheckoutContext';
import { PaymentMethod } from '@/types';

const PaymentStep: React.FC = () => {
  const { 
    paymentMethods, 
    setSelectedPaymentMethod,
    setPaymentMethods,
    proceedToNextStep,
    canProceedToNextStep,
    isGuestCheckout,
    guestInfo,
    setGuestInfo
  } = useCheckout();

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [showPreferencesLoaded, setShowPreferencesLoaded] = useState(false);

  // Show notification when preferences are loaded
  useEffect(() => {
    if (isGuestCheckout && guestInfo.email && paymentMethods.length > 0) {
      setShowPreferencesLoaded(true);
      setTimeout(() => setShowPreferencesLoaded(false), 3000);
    }
  }, [isGuestCheckout, guestInfo.email, paymentMethods.length]);

  const handlePaymentMethodSelect = (paymentType: 'cash' | 'gcash' | 'paymaya' | 'card') => {
    // Create a new payment method object
    const newPaymentMethod: PaymentMethod = {
      id: paymentType,
      type: paymentType,
      default: true
    };

    // Set all existing payment methods to default: false and add/update the selected one
    const updatedPaymentMethods = paymentMethods.map(method => ({
      ...method,
      default: method.type === paymentType ? true : false
    }));

    // Check if this payment type already exists
    const existingMethodIndex = updatedPaymentMethods.findIndex(m => m.type === paymentType);
    
    if (existingMethodIndex >= 0) {
      // Update existing method to be default
      updatedPaymentMethods[existingMethodIndex] = {
        ...updatedPaymentMethods[existingMethodIndex],
        default: true
      };
    } else {
      // Add new payment method as default
      updatedPaymentMethods.push(newPaymentMethod);
    }

    // Update the payment methods array and set the selected method
    setPaymentMethods(updatedPaymentMethods);
    setSelectedPaymentMethod(newPaymentMethod);
  };

  const handleAddCard = () => {
    if (newCard.cardNumber && newCard.cardHolder && newCard.expiryDate && newCard.cvv) {
      const cardMethod: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: 'card',
        cardNumber: newCard.cardNumber,
        cardHolder: newCard.cardHolder,
        expiryDate: newCard.expiryDate,
        cvv: newCard.cvv,
        default: true
      };
      
      // Set all existing payment methods to default: false and add the new card
      const updatedPaymentMethods = paymentMethods.map(method => ({
        ...method,
        default: false
      }));
      
      updatedPaymentMethods.push(cardMethod);
      
      // Update the payment methods array and set the selected method
      setPaymentMethods(updatedPaymentMethods);
      setSelectedPaymentMethod(cardMethod);
      setShowAddCard(false);
      setNewCard({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
    }
  };

  const handleGuestInfoChange = (field: keyof typeof guestInfo, value: string) => {
    setGuestInfo({ [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Method</h3>
        <p className="text-gray-600">Choose how you want to pay for your order</p>
      </div>

      {/* Guest Information */}
      {isGuestCheckout && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name *"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={guestInfo.firstName}
              onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name *"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={guestInfo.lastName}
              onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={guestInfo.email}
              onChange={(e) => handleGuestInfoChange('email', e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={guestInfo.phone}
              onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Preferences Loaded Notification */}
      {showPreferencesLoaded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 text-sm">
              Welcome back! Your saved payment methods and addresses have been loaded.
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Payment Options */}
      <div className="space-y-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            paymentMethods.find(m => m.type === 'cash')?.default
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodSelect('cash')}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💰</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when you receive your order</p>
            </div>
            {paymentMethods.find(m => m.type === 'cash')?.default && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            paymentMethods.find(m => m.type === 'gcash')?.default
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodSelect('gcash')}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">GCash</p>
              <p className="text-sm text-gray-500">Pay using your GCash account</p>
            </div>
            {paymentMethods.find(m => m.type === 'gcash')?.default && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            paymentMethods.find(m => m.type === 'paymaya')?.default
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handlePaymentMethodSelect('paymaya')}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">PayMaya</p>
              <p className="text-sm text-gray-500">Pay using your PayMaya account</p>
            </div>
            {paymentMethods.find(m => m.type === 'paymaya')?.default && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </motion.div>

        {/* Saved Cards */}
        {paymentMethods.filter(m => m.type === 'card').map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              card.default
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              // Set all payment methods to default: false
              const updatedPaymentMethods = paymentMethods.map(method => ({
                ...method,
                default: false
              }));
              
              // Find and update the selected card to default: true
              const cardIndex = updatedPaymentMethods.findIndex(m => m.id === card.id);
              if (cardIndex >= 0) {
                updatedPaymentMethods[cardIndex] = {
                  ...updatedPaymentMethods[cardIndex],
                  default: true
                };
              }
              
              // Update payment methods and set selected method
              setPaymentMethods(updatedPaymentMethods);
              setSelectedPaymentMethod(card);
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💳</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Credit/Debit Card</p>
                {card.cardNumber && (
                  <p className="text-sm text-gray-500">•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                )}
                {card.default && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              {card.default && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add New Card Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors hover:border-gray-400"
          onClick={() => setShowAddCard(true)}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">➕</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Add New Card</p>
              <p className="text-sm text-gray-500">Add a new credit or debit card</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add New Card Form */}
      {showAddCard && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 border border-gray-200 rounded-lg mb-6"
        >
          <h4 className="font-medium text-gray-900 mb-3">Add New Card</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Card Number"
              className="col-span-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newCard.cardNumber}
              onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
            />
            <input
              type="text"
              placeholder="Card Holder"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newCard.cardHolder}
              onChange={(e) => setNewCard({ ...newCard, cardHolder: e.target.value })}
            />
            <input
              type="text"
              placeholder="MM/YY"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newCard.expiryDate}
              onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
            />
            <input
              type="text"
              placeholder="CVV"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={newCard.cvv}
              onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
            />
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleAddCard}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Add Card
            </button>
            <button
              onClick={() => setShowAddCard(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <button
          onClick={proceedToNextStep}
          disabled={!canProceedToNextStep()}
          className={`px-6 py-2 rounded-lg transition-colors ${
            canProceedToNextStep()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Address
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentStep; 