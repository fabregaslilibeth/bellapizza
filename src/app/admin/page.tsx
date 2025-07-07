'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';
import type { Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirestoreUser } from '@/lib/orders';
import { Order, CartItem } from '@/types';
import { checkIfUserIsAdmin } from '@/lib/auth';

interface AdminUser extends FirestoreUser {
  id: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'orders'>('orders');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  
  const router = useRouter();

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication and admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      // Redirect if not authenticated
      if (!user) {
        router.push('/');
        return;
      }
      
      // Check if user is admin
      setAdminLoading(true);
      try {
        console.log('Checking admin status for user:', user.email, user.uid);
        const adminStatus = await checkIfUserIsAdmin(user);
        console.log('Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
        
        // If not admin, redirect to home
        if (!adminStatus) {
          console.log('User is not admin, redirecting to home');
          router.push('/');
          return;
        }
        console.log('User is admin, proceeding to admin dashboard');
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
        return;
      } finally {
        setAdminLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData: AdminUser[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as FirestoreUser
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData: Order[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          items: data.items,
          total: data.total,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          tax: data.tax,
          paymentMethod: data.paymentMethod,
          deliveryAddress: data.deliveryAddress,
          orderType: 'delivery',
          status: data.status,
          estimatedTime: data.estimatedTime,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          guestEmail: data.guestEmail,
          guestInfo: data.guestInfo,
        };
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load initial data when user is authenticated
  useEffect(() => {
    if (user && isAdmin && !adminLoading) {
      fetchOrders();
    }
  }, [user, isAdmin, adminLoading]);

  // Load data when tab changes and user is authenticated
  useEffect(() => {
    if (user && isAdmin && !adminLoading) {
      if (activeTab === 'users') {
        fetchUsers();
      } else {
        fetchOrders();
      }
    }
  }, [activeTab, user, isAdmin, adminLoading]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Format date with consistent locale
  const formatDate = (date: Date) => {
    // Use a completely deterministic format
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Format Firestore timestamp safely
  const formatTimestamp = (timestamp: FirestoreTimestamp | Date | null | undefined) => {
    if (!timestamp) return 'N/A';
    
    try {
      if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
        return formatDate(timestamp.toDate());
      } else if (timestamp instanceof Date) {
        return formatDate(timestamp);
      } else {
        return 'Invalid date';
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    return order.status === orderStatusFilter;
  });

  // Filter users based on type
  const filteredUsers = users.filter(user => {
    if (userTypeFilter === 'all') return true;
    if (userTypeFilter === 'guest') return user.isGuest;
    if (userTypeFilter === 'registered') return !user.isGuest;
    return true;
  });

  // Show loading state during SSR or while not mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.email || 'Admin'}
              </p>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users ({users.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'orders' ? (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="orderStatusFilter" className="text-sm font-medium text-gray-700">
                      Status:
                    </label>
                    <select
                      id="orderStatusFilter"
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {ordersLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {orders.length === 0 ? 'No orders found' : 'No orders match the selected filter'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.guestInfo ? (
                            <div>
                              <div>{order.guestInfo.firstName} {order.guestInfo.lastName}</div>
                              <div className="text-gray-500">{order.guestEmail}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Registered User</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                                                     <div className="max-w-xs">
                             {order.items.map((item: CartItem, index: number) => (
                               <div key={index} className="flex justify-between">
                                 <span>{item.name} x{item.quantity}</span>
                                 <span>{formatCurrency(item.price * item.quantity)}</span>
                               </div>
                             ))}
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Registered Users</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="userTypeFilter" className="text-sm font-medium text-gray-700">
                      User Type:
                    </label>
                    <select
                      id="userTypeFilter"
                      value={userTypeFilter}
                      onChange={(e) => setUserTypeFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Users</option>
                      <option value="registered">Registered</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {usersLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {users.length === 0 ? 'No users found' : 'No users match the selected filter'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isGuest ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.isGuest ? 'Guest' : 'Registered'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(user.lastLoginAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
