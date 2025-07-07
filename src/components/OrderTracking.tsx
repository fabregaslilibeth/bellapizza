"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGuestOrders, getUserOrders } from '@/lib/orders';
import { getCurrentUser } from '@/lib/auth';
import { Order } from '@/types';
import OrderTrackingModal from './OrderTrackingModal';

interface OrderTrackingProps {
  email?: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ email }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
        setFilteredOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [email]);

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          const statusOrder = { pending: 1, confirmed: 2, preparing: 3, ready: 4, delivered: 5, cancelled: 6 };
          comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

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

  const getStatusPriority = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-orange-500';
      case 'ready':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatOrderDate = (date: string | Date) => {
    const orderDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return orderDate.toLocaleDateString();
    }
  };

  const getOrderSummary = (order: Order) => {
    const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
    const uniqueItems = order.items.length;
    return `${itemCount} item${itemCount !== 1 ? 's' : ''} (${uniqueItems} unique)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Orders</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="text-6xl mb-6">📋</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Orders Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven&apos;t placed any orders yet. Start by exploring our menu and placing your first order!
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
            <p className="text-gray-600">Track and manage your order history</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </div>
        
                 {/* Quick Stats */}
         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
           {(['pending', 'preparing', 'confirmed', 'ready', 'delivered', 'cancelled'] as const).map(status => {
             const count = orders.filter(order => order.status === status).length;
             return (
               <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                 <div className={`text-lg font-semibold ${getStatusPriority(status)} text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2`}>
                   {getStatusIcon(status)}
                 </div>
                 <div className="text-xl font-bold text-gray-900">{count}</div>
                 <div className="text-xs text-gray-600 capitalize">{status}</div>
               </div>
             );
           })}
         </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders by ID or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="total-desc">Highest Total</option>
            <option value="total-asc">Lowest Total</option>
            <option value="status-asc">Status A-Z</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      {filteredOrders.length !== orders.length && (
        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      <span className="mr-1">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {formatOrderDate(order.createdAt)}</span>
                    <span>🕒 {new Date(order.createdAt).toLocaleTimeString()}</span>
                    <span>📦 {getOrderSummary(order)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">P{order.total.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-6 h-6 object-cover rounded-full"
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                      <span className="text-sm text-gray-600">+{order.items.length - 3} more</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>⏱️ Est: {order.estimatedTime}</span>
                  <span>💳 {order.paymentMethod.type}</span>
                  {order.deliveryAddress && <span>🚚 Delivery</span>}
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsTrackingModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>📍</span>
                    <span>Track Order</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Copy order ID to clipboard
                      navigator.clipboard.writeText(order.id);
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Copy Order ID"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredOrders.length === 0 && orders.length > 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Match Your Search</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
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
  );
};

export default OrderTracking; 