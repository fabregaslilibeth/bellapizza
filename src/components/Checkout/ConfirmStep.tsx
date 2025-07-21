"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCheckout } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import { Order } from '@/types';
import EmailLoginButton from '../EmailLoginButton';

const ConfirmStep: React.FC = () => {
  const { 
    selectedPaymentMethod, 
    selectedDeliveryAddress, 
    orderData,
    goToPreviousStep,
    placeOrder,
    isGuestCheckout,
    guestInfo
  } = useCheckout();
  
  const { clearCart, setIsCartOpen } = useCart();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError(null);
    
    try {
      const order = await placeOrder();
      setPlacedOrder(order);
      setOrderPlaced(true);
      clearCart();
      setIsCartOpen(false);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return '💳';
      case 'cash':
        return '💰';
      case 'gcash':
        return '📱';
      case 'paymaya':
        return '📱';
      default:
        return '💳';
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'card':
        return 'Credit/Debit Card';
      case 'cash':
        return 'Cash on Delivery';
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      default:
        return 'Payment Method';
    }
  };

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-4">Your order has been confirmed and is being prepared.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{placedOrder?.id}</span></p>
            <p className="text-sm text-gray-600">Estimated delivery: <span className="font-medium">{placedOrder?.estimatedTime}</span></p>
            {isGuestCheckout && (
              <p className="text-sm text-gray-600">Confirmation sent to: <span className="font-medium">{guestInfo.email}</span></p>
            )}
          </div>
          {isGuestCheckout && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Create an Account</h4>
              <p className="text-sm text-blue-700 mb-3">
                Create an account to track your order, save addresses, and get exclusive offers!
              </p>
              <div className="flex gap-2 justify-center">
                  <EmailLoginButton 
                    variant="default" 
                    size="sm" 
                    className="text-sm"
                  >
                    Create Account
                  </EmailLoginButton>
                </div>
            </div>
          )}
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue Shopping
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Your Order</h3>
        <p className="text-gray-600">Please review your order details before placing it</p>
      </div>

      {/* Guest Information */}
      {isGuestCheckout && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{guestInfo.firstName} {guestInfo.lastName}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium">{guestInfo.phone}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{guestInfo.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2">
          {orderData?.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">P{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3 mt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">P{orderData?.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (12%):</span>
            <span className="text-gray-900">P{orderData?.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="text-gray-900">P{orderData?.deliveryFee?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t pt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">P{orderData?.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getPaymentIcon(selectedPaymentMethod?.type || '')}</div>
          <div>
            <p className="font-medium text-gray-900">{getPaymentLabel(selectedPaymentMethod?.type || '')}</p>
            {selectedPaymentMethod?.type === 'card' && selectedPaymentMethod?.cardNumber && (
              <p className="text-sm text-gray-500">{selectedPaymentMethod.cardNumber}</p>
            )}
            {selectedPaymentMethod?.type === 'gcash' && (
              <p className="text-sm text-gray-500">You&apos;ll receive payment instructions via SMS</p>
            )}
            {selectedPaymentMethod?.type === 'paymaya' && (
              <p className="text-sm text-gray-500">You&apos;ll receive payment instructions via SMS</p>
            )}
            {selectedPaymentMethod?.type === 'cash' && (
              <p className="text-sm text-gray-500">Pay when you receive your order</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📍</div>
          <div>
            <p className="font-medium text-gray-900">{selectedDeliveryAddress?.name}</p>
            <p className="text-sm text-gray-600">{selectedDeliveryAddress?.address}</p>
            <p className="text-sm text-gray-600">
              {selectedDeliveryAddress?.city}, {selectedDeliveryAddress?.province} {selectedDeliveryAddress?.zipCode}
            </p>
            <p className="text-sm text-gray-600">{selectedDeliveryAddress?.phone}</p>
            {selectedDeliveryAddress?.instructions && (
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Instructions:</span> {selectedDeliveryAddress.instructions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">Order Error</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{orderError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousStep}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Address
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isPlacingOrder
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isPlacingOrder ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Placing Order...</span>
            </div>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ConfirmStep; 