import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, CartItem, PaymentMethod, DeliveryAddress } from '@/types';

// Firestore interfaces
export interface FirestoreOrder {
  userId?: string; // null for guests
  guestEmail?: string; // for guest orders
  guestInfo?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: DeliveryAddress;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  estimatedTime: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreUser {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isGuest: boolean;
  paymentMethods?: PaymentMethod[];
  deliveryAddresses?: DeliveryAddress[];
  updatedAt?: Timestamp;
}

// Convert Firestore document to Order
const convertFirestoreToOrder = (doc: QueryDocumentSnapshot<DocumentData>): Order => {
  const data = doc.data() as FirestoreOrder;
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
};

// Create a new order
export const createOrder = async (order: Order, userId?: string): Promise<string> => {
  try {
    console.log('Creating order:', { order, userId });
    
    // Check if Firestore is initialized
    if (!db) {
      throw new Error('Firestore database not initialized');
    }
    
    // Create a simplified order object for testing
    const simpleOrder = {
      userId: userId || null,
      guestEmail: !userId ? order.guestEmail : null,
      guestInfo: !userId ? order.guestInfo : null,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      paymentMethod: {
        id: order.paymentMethod.id,
        type: order.paymentMethod.type,
        cardNumber: order.paymentMethod.cardNumber || null,
        cardHolder: order.paymentMethod.cardHolder || null,
        phoneNumber: order.paymentMethod.phoneNumber || null
      },
      deliveryAddress: {
        id: order.deliveryAddress.id,
        name: order.deliveryAddress.name,
        address: order.deliveryAddress.address,
        city: order.deliveryAddress.city,
        province: order.deliveryAddress.province,
        zipCode: order.deliveryAddress.zipCode,
        phone: order.deliveryAddress.phone,
        instructions: order.deliveryAddress.instructions || null
      },
      status: order.status,
      estimatedTime: order.estimatedTime,
      createdAt: Timestamp.fromDate(order.createdAt),
      updatedAt: Timestamp.fromDate(order.updatedAt),
    };
    
    console.log('Simplified order data:', simpleOrder);
    
    const docRef = await addDoc(collection(db, 'orders'), simpleOrder);
    console.log('Order created with ID:', docRef.id);
    
    // If it's a guest order, also create/update user record
    if (!userId && order.guestEmail && order.guestInfo) {
      await createOrUpdateGuestUser(order.guestEmail, order.guestInfo);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Order data that failed:', order);
    if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
    throw new Error('Failed to create order');
  }
};

// Create or update guest user
export const createOrUpdateGuestUser = async (email: string, guestInfo: { firstName: string; lastName: string; phone: string }) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const userData: FirestoreUser = {
      email,
      firstName: guestInfo.firstName,
      lastName: guestInfo.lastName,
      phone: guestInfo.phone,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isGuest: true,
    };
    
    if (querySnapshot.empty) {
      // Create new guest user
      await addDoc(usersRef, userData);
    } else {
      // Update existing guest user
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        phone: guestInfo.phone,
        lastLoginAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error creating/updating guest user:', error);
    // Don't throw error as this shouldn't block order creation
  }
};

// Get orders for a specific user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertFirestoreToOrder);
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw new Error('Failed to get user orders');
  }
};

// Get orders for a guest by email
export const getGuestOrders = async (email: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('guestEmail', '==', email),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertFirestoreToOrder);
  } catch (error) {
    console.error('Error getting guest orders:', error);
    throw new Error('Failed to get guest orders');
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
    
    if (orderDoc.empty) {
      return null;
    }
    
    return convertFirestoreToOrder(orderDoc.docs[0]);
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

// Get recent orders (for admin dashboard)
export const getRecentOrders = async (limitCount: number = 10): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertFirestoreToOrder);
  } catch (error) {
    console.error('Error getting recent orders:', error);
    throw new Error('Failed to get recent orders');
  }
};

// Get orders by status
export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertFirestoreToOrder);
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw new Error('Failed to get orders by status');
  }
};

// Store guest user preferences (payment methods and addresses)
export const storeGuestPreferences = async (
  email: string, 
  paymentMethods: PaymentMethod[], 
  deliveryAddresses: DeliveryAddress[]
): Promise<void> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    const userData = {
      email,
      paymentMethods,
      deliveryAddresses,
      updatedAt: Timestamp.now(),
    };
    
    if (querySnapshot.empty) {
      // Create new guest user with preferences
      await addDoc(usersRef, {
        ...userData,
        isGuest: true,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
      });
    } else {
      // Update existing guest user with new preferences
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), userData);
    }
  } catch (error) {
    console.error('Error storing guest preferences:', error);
    // Don't throw error as this shouldn't block order creation
  }
};

// Get guest user preferences
export const getGuestPreferences = async (email: string): Promise<{
  paymentMethods: PaymentMethod[];
  deliveryAddresses: DeliveryAddress[];
} | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userData = querySnapshot.docs[0].data();
    return {
      paymentMethods: userData.paymentMethods || [],
      deliveryAddresses: userData.deliveryAddresses || [],
    };
  } catch (error) {
    console.error('Error getting guest preferences:', error);
    return null;
  }
}; 