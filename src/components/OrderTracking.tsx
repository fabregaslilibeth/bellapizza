"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGuestOrders, getUserOrders } from '@/lib/orders';
import { getCurrentUser } from '@/lib/auth';
import { Order } from '@/types';

interface OrderTrackingProps {
  email?: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ email }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        
        let fetchedOrders: Order[];
        
        if (currentUser) {
          // Fetch orders for logged-in user
          fetchedOrders = await getUserOrders(currentUser.uid);
        } else if (email) {
          // Fetch orders for guest by email
          fetchedOrders = await getGuestOrders(email);
        } else {
          fetchedOrders = [];
        }
        
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [email]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
        <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Orders</h2>
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
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              <span className="mr-1">{getStatusIcon(order.status)}</span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <img 
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
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Total: <span className="font-medium text-gray-900">P{order.total.toFixed(2)}</span></p>
                <p>Estimated: <span className="font-medium">{order.estimatedTime}</span></p>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Track Order
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OrderTracking; 