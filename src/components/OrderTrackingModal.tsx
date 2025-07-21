"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Order } from '@/types';

interface OrderTrackingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, isOpen, onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    name: 'John Smith',
    phone: '+63 912 345 6789',
    vehicle: 'Honda Wave 125',
    plateNumber: 'ABC-123',
    rating: 4.8,
    eta: '5-10 minutes'
  });

  // Update current time every 30 seconds for more frequent updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Simulate order status updates for demo purposes
  useEffect(() => {
    if (order.status === 'ready' || order.status === 'delivered') {
      const interval = setInterval(() => {
        // Simulate driver location updates
        setDriverInfo(prev => ({
          ...prev,
          eta: Math.random() > 0.5 ? '3-5 minutes' : '5-8 minutes'
        }));
      }, 45000);

      return () => clearInterval(interval);
    }
  }, [order.status]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'ready':
        return '🚚';
      case 'delivered':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusDescription = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being processed';
      case 'confirmed':
        return 'Your order has been confirmed and will be prepared soon';
      case 'preparing':
        return 'Your order is being prepared in our kitchen';
      case 'ready':
        return 'Your order is ready for pickup or delivery';
      case 'delivered':
        return 'Your order has been delivered successfully';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  const getEstimatedTimeRemaining = () => {
    const orderTime = new Date(order.createdAt);
    const timeDiff = currentTime.getTime() - orderTime.getTime();
    const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
    
    // Parse estimated time (e.g., "30-45 minutes")
    const estimatedMatch = order.estimatedTime.match(/(\d+)/);
    const estimatedMinutes = estimatedMatch ? parseInt(estimatedMatch[1]) : 30;
    
    const remainingMinutes = Math.max(0, estimatedMinutes - minutesElapsed);
    
    if (remainingMinutes <= 0) {
      return 'Should be ready soon!';
    }
    
    return `${remainingMinutes} minutes remaining`;
  };

  const getProgressPercentage = () => {
    const orderTime = new Date(order.createdAt);
    const timeDiff = currentTime.getTime() - orderTime.getTime();
    const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
    
    // Parse estimated time
    const estimatedMatch = order.estimatedTime.match(/(\d+)/);
    const estimatedMinutes = estimatedMatch ? parseInt(estimatedMatch[1]) : 30;
    
    const progress = Math.min(100, (minutesElapsed / estimatedMinutes) * 100);
    return Math.max(0, progress);
  };

  const getEstimatedArrivalTime = () => {
    const now = new Date();
    const [min, max] = driverInfo.eta.split('-').map(n => parseInt(n));
    const avgMinutes = Math.floor((min + max) / 2);
    const arrivalTime = new Date(now.getTime() + avgMinutes * 60 * 1000);
    return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const statusSteps = [
    { status: 'pending', label: 'Order Received', completed: true, icon: '📋' },
    { status: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status), icon: '✅' },
    { status: 'preparing', label: 'Preparing', completed: ['preparing', 'ready', 'delivered'].includes(order.status), icon: '👨‍🍳' },
    { status: 'ready', label: 'Ready', completed: ['ready', 'delivered'].includes(order.status), icon: '🚚' },
    { status: 'delivered', label: 'Delivered', completed: order.status === 'delivered', icon: '🎉' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Tracking</h2>
                <p className="text-gray-600">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  Last updated: {currentTime.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <svg 
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Order Status */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{getStatusIcon(order.status)}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </h3>
                    <p className="text-gray-600">{getStatusDescription(order.status)}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              {/* Progress Bar */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span className="font-medium">Order Progress</span>
                    <span className="font-semibold text-blue-600">{getEstimatedTimeRemaining()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Driver Information - Show only for ready/delivered orders */}
            {(order.status === 'ready' || order.status === 'delivered') && order.deliveryAddress && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">🚚 Driver Information</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{driverInfo.rating}</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Driver Name</p>
                    <p className="font-medium text-gray-900">{driverInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{driverInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-900">{driverInfo.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="font-medium text-gray-900">{driverInfo.plateNumber}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estimated Arrival</p>
                      <p className="font-bold text-green-600">{getEstimatedArrivalTime()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">ETA</p>
                      <p className="font-semibold text-gray-900">{driverInfo.eta}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    📞 Call Driver
                  </button>
                  <button className="flex-1 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                    📍 Track Location
                  </button>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Order Timeline</h4>
              <div className="space-y-4">
                {statusSteps.map((step, index) => (
                  <motion.div 
                    key={step.status} 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {step.completed ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{step.icon}</span>
                        <h5 className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.label}
                        </h5>
                      </div>
                      {step.status === order.status && (
                        <p className="text-sm text-gray-600 mt-1">
                          Updated at {new Date(order.updatedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Order Details</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="font-medium">{order.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-bold text-lg text-gray-900">P{order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">{order.paymentMethod.type}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">🍕 Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{item.name}</h5>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Unit Price: P{item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">P{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📍 Delivery Address</h4>
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📍</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{order.deliveryAddress.name}</p>
                    <p className="text-gray-700">{order.deliveryAddress.address}</p>
                    <p className="text-gray-700">
                      {order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.zipCode}
                    </p>
                    <p className="text-gray-700">📞 {order.deliveryAddress.phone}</p>
                    {order.deliveryAddress.instructions && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Delivery Instructions:</span>
                        </p>
                        <p className="text-gray-700">{order.deliveryAddress.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Orders
              </button>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button
                  onClick={handleRefresh}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🔄 Refresh Status
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderTrackingModal; 