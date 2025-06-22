import React from 'react';
import { useCart } from '../context/CartContext';

export const CartStatus: React.FC = () => {
  const { cart, loading, getCartItemCount, getCartTotal, isLoggedIn } = useCart();

  if (loading) {
    return <div className="text-gray-500">Loading cart...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Cart Status</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Authentication:</span>
          <span className={`font-medium ${isLoggedIn ? 'text-green-600' : 'text-orange-600'}`}>
            {isLoggedIn ? 'Logged In' : 'Guest User'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Storage:</span>
          <span className="font-medium">
            {isLoggedIn ? 'Firebase Firestore' : 'Local Storage'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Items in Cart:</span>
          <span className="font-medium">{getCartItemCount()}</span>
        </div>
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-medium">${getCartTotal().toFixed(2)}</span>
        </div>
        {cart && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-gray-500">
              Cart ID: {cart.id}
            </div>
            <div className="text-xs text-gray-500">
              Last Updated: {cart.updatedAt.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 