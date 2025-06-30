"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckout } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import PaymentStep from './PaymentStep';
import AddressStep from './AddressStep';
import ConfirmStep from './ConfirmStep';
import CheckoutHeader from './CheckoutHeader';

const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    currentStep, 
    setOrderData,
    calculateSubtotal,
    calculateDeliveryFee,
    calculateTax,
    calculateTotal
  } = useCheckout();
  
  const { cart } = useCart();

  // Initialize order data when checkout opens
  useEffect(() => {
    if (isCheckoutOpen && cart) {
      const subtotal = calculateSubtotal(cart.items);
      const deliveryFee = calculateDeliveryFee();
      const tax = calculateTax(subtotal);
      const total = calculateTotal(subtotal, deliveryFee);

      setOrderData({
        items: cart.items,
        subtotal,
        deliveryFee,
        tax,
        total,
      });
    }
  }, [isCheckoutOpen, cart, calculateSubtotal, calculateDeliveryFee, calculateTax, calculateTotal, setOrderData]);

  const handleClose = () => {
    setIsCheckoutOpen(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PaymentStep />;
      case 1:
        return <AddressStep />;
      case 2:
        return <ConfirmStep />;
    }
  };

  if (!isCheckoutOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <CheckoutHeader onClose={handleClose} />

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="min-h-full">
                {renderStep()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default CheckoutModal; 