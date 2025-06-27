"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types';
import LoginButton from './LoginButton';
import EmailLoginButton from './EmailLoginButton';
import ProfileIcon from './ProfileIcon';

const CartDisplay: React.FC = () => {
  const { cart, loading, removeFromCart, updateQuantity, clearCart, getCartTotal, isCartOpen, setIsCartOpen, isLoggedIn, authLoading } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return null;
  }

  // Show login buttons if not logged in and auth is not loading
  const shouldShowLoginButtons = !isLoggedIn && !authLoading;

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(item.id);
    } else {
      await updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <>
      {/* Cart Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {cart ? `${cart.itemCount} items` : '0 items'}
              </p>
              {isClient && (
                shouldShowLoginButtons ? (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 mb-2">
                      Sign in to save your cart across devices
                    </p>
                    <div className="space-y-2">
                      <LoginButton 
                        variant="default" 
                        size="sm" 
                        className="w-full text-xs"
                      >
                        Sign In with Google
                      </LoginButton>
                      <EmailLoginButton 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                      >
                        Sign In with Email
                      </EmailLoginButton>
                    </div>
                  </div>
                ) : isLoggedIn && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-green-700">
                        Cart saved to your account
                      </p>
                      <ProfileIcon size="sm" />
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg 
                    className="w-16 h-16 text-gray-300 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-4">Add some delicious items to get started!</p>
                  {isClient && shouldShowLoginButtons && (
                    <div className="w-full space-y-2">
                      <LoginButton 
                        variant="outline" 
                        size="md" 
                        className="w-full"
                      >
                        Sign In with Google
                      </LoginButton>
                      <EmailLoginButton 
                        variant="outline" 
                        size="md" 
                        className="w-full"
                      >
                        Sign In with Email
                      </EmailLoginButton>
                    </div>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="bg-white border rounded-lg p-3 mb-3 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start space-x-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            P{item.price}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            P{item.price * item.quantity}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">P{getCartTotal()}</span>
              </div>
              
              <div className="space-y-2">
                {cart && cart.items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
                <button
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    cart && cart.items.length > 0 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!cart || cart.items.length === 0}
                >
                  Checkout
                </button>
                {isClient && shouldShowLoginButtons && cart && cart.items.length > 0 && (
                  <div className="pt-2 border-t space-y-2">
                    <LoginButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      Sign In with Google
                    </LoginButton>
                    <EmailLoginButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      Sign In with Email
                    </EmailLoginButton>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDisplay; 