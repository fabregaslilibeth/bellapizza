"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getOrderById, getGuestOrders } from '@/lib/orders';
import { Order } from '@/types';
import OrderTrackingModal from '@/components/OrderTrackingModal';

export default function TrackingPage() {
  const [trackingMethod, setTrackingMethod] = useState<'orderId' | 'email'>('orderId');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderId.trim() && trackingMethod === 'orderId') {
      setError('Please enter an order ID');
      return;
    }

    if (!email.trim() && trackingMethod === 'email') {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (trackingMethod === 'orderId') {
        const order = await getOrderById(orderId.trim());
        if (order) {
          setOrders([order]);
        } else {
          setError('Order not found. Please check your order ID.');
          setOrders([]);
        }
      } else {
        const guestOrders = await getGuestOrders(email.trim());
        setOrders(guestOrders);
        if (guestOrders.length === 0) {
          setError('No orders found for this email address.');
        }
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Failed to track order. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID or email to track your order status</p>
        </motion.div>

        {/* Tracking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          {/* Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTrackingMethod('orderId')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                trackingMethod === 'orderId'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Track by Order ID
            </button>
            <button
              onClick={() => setTrackingMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                trackingMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Track by Email
            </button>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            {trackingMethod === 'orderId' ? (
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID (e.g., ORDER-1234567890)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Track Button */}
            <button
              onClick={handleTrackOrder}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Tracking...</span>
                </div>
              ) : (
                'Track Order'
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {trackingMethod === 'orderId' ? 'Order Details' : 'Your Orders'}
            </h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="mr-1">
                        {order.status === 'pending' ? '⏳' :
                         order.status === 'confirmed' ? '✅' :
                         order.status === 'preparing' ? '👨‍🍳' :
                         order.status === 'ready' ? '🚚' :
                         order.status === 'delivered' ? '🎉' :
                         order.status === 'cancelled' ? '❌' : '📋'}
                      </span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <Image
                            src={item.image} 
                            alt={item.name} 
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">P{item.price * item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Total: <span className="font-medium text-gray-900">P{order.total.toFixed(2)}</span></p>
                        <p>Estimated: <span className="font-medium">{order.estimatedTime}</span></p>
                      </div>
                      <button 
                        onClick={() => handleTrackOrderClick(order)}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Order Tracking Modal */}
        {selectedOrder && (
          <OrderTrackingModal
            order={selectedOrder}
            isOpen={isTrackingModalOpen}
            onClose={() => {
              setIsTrackingModalOpen(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
} 