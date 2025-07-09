import { 
  doc, 
  getDoc, 
  updateDoc, 
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { DeliveryAddress } from '@/types';

// Payment method interface for profile page (compatible with existing code)
interface ProfilePaymentMethod {
  id: string;
  type: "card" | "paypal";
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

// Get user profile data including addresses
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    return {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      birthday: userData.birthday || { day: '', month: '', year: '' },
      deliveryAddresses: userData.deliveryAddresses || [],
      paymentMethods: userData.paymentMethods || [],
      preferences: userData.preferences || {},
      ...userData
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Add a new delivery address
export const addDeliveryAddress = async (
  userId: string, 
  address: Omit<DeliveryAddress, 'id'>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Generate a new ID for the address
    const newAddress: DeliveryAddress = {
      ...address,
      id: Date.now().toString(),
    };

    // If this is set as default, we need to unset other addresses as default
    if (address.isDefault) {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingAddresses = userData.deliveryAddresses || [];
        
        // Update all existing addresses to not be default
        const updatedAddresses = existingAddresses.map((addr: DeliveryAddress) => ({
          ...addr,
          isDefault: false,
        }));
        
        // Add the new address
        updatedAddresses.push(newAddress);
        
        await updateDoc(userRef, {
          deliveryAddresses: updatedAddresses,
          updatedAt: Timestamp.now(),
        });
      } else {
        // User document doesn't exist, create it with the new address
        await updateDoc(userRef, {
          deliveryAddresses: [newAddress],
          updatedAt: Timestamp.now(),
        });
      }
    } else {
      // Just add the new address without changing defaults
      await updateDoc(userRef, {
        deliveryAddresses: arrayUnion(newAddress),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error adding delivery address:', error);
    throw error;
  }
};

// Update an existing delivery address
export const updateDeliveryAddress = async (
  userId: string,
  addressId: string,
  updatedAddress: Partial<DeliveryAddress>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const existingAddresses = userData.deliveryAddresses || [];
    
    // Find and update the specific address
    const updatedAddresses = existingAddresses.map((addr: DeliveryAddress) => {
      if (addr.id === addressId) {
        return { ...addr, ...updatedAddress };
      }
      return addr;
    });
    
    // If this address is being set as default, unset others
    if (updatedAddress.isDefault) {
      const finalAddresses = updatedAddresses.map((addr: DeliveryAddress) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      
      await updateDoc(userRef, {
        deliveryAddresses: finalAddresses,
        updatedAt: Timestamp.now(),
      });
    } else {
      await updateDoc(userRef, {
        deliveryAddresses: updatedAddresses,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating delivery address:', error);
    throw error;
  }
};

// Delete a delivery address
export const deleteDeliveryAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const existingAddresses = userData.deliveryAddresses || [];
    
    // Remove the address
    const updatedAddresses = existingAddresses.filter(
      (addr: DeliveryAddress) => addr.id !== addressId
    );
    
    await updateDoc(userRef, {
      deliveryAddresses: updatedAddresses,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting delivery address:', error);
    throw error;
  }
};

// Set an address as default
export const setDefaultAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const existingAddresses = userData.deliveryAddresses || [];
    
    // Update all addresses to set only the specified one as default
    const updatedAddresses = existingAddresses.map((addr: DeliveryAddress) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    
    await updateDoc(userRef, {
      deliveryAddresses: updatedAddresses,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string,
  preferences: Record<string, unknown>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Update user profile information
export const updateUserProfile = async (
  userId: string,
  profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthday?: {
      day: string;
      month: string;
      year: string;
    };
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Add a new payment method
export const addPaymentMethod = async (
  userId: string, 
  paymentMethod: Omit<ProfilePaymentMethod, 'id'>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Generate a new ID for the payment method
    const newPaymentMethod: ProfilePaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString(),
    };

    // If this is set as default, we need to unset other payment methods as default
    if (paymentMethod.isDefault) {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingPaymentMethods = userData.paymentMethods || [];
        
        // Update all existing payment methods to not be default
        const updatedPaymentMethods = existingPaymentMethods.map((pm: ProfilePaymentMethod) => ({
          ...pm,
          isDefault: false,
        }));
        
        // Add the new payment method
        updatedPaymentMethods.push(newPaymentMethod);
        
        await updateDoc(userRef, {
          paymentMethods: updatedPaymentMethods,
          updatedAt: Timestamp.now(),
        });
      } else {
        // User document doesn't exist, create it with the new payment method
        await updateDoc(userRef, {
          paymentMethods: [newPaymentMethod],
          updatedAt: Timestamp.now(),
        });
      }
    } else {
      // Just add the new payment method without changing defaults
      await updateDoc(userRef, {
        paymentMethods: arrayUnion(newPaymentMethod),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

// Update an existing payment method
export const updatePaymentMethod = async (
  userId: string,
  paymentMethodId: string,
  updatedPaymentMethod: Partial<ProfilePaymentMethod>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const existingPaymentMethods = userData.paymentMethods || [];
    
    // Find and update the specific payment method
    const updatedPaymentMethods = existingPaymentMethods.map((pm: ProfilePaymentMethod) => {
      if (pm.id === paymentMethodId) {
        return { ...pm, ...updatedPaymentMethod };
      }
      return pm;
    });
    
    // If this payment method is being set as default, unset others
    if (updatedPaymentMethod.isDefault) {
      const finalPaymentMethods = updatedPaymentMethods.map((pm: ProfilePaymentMethod) => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      }));
      
      await updateDoc(userRef, {
        paymentMethods: finalPaymentMethods,
        updatedAt: Timestamp.now(),
      });
    } else {
      await updateDoc(userRef, {
        paymentMethods: updatedPaymentMethods,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Delete a payment method
export const deletePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const existingPaymentMethods = userData.paymentMethods || [];
    
    // Remove the payment method
    const updatedPaymentMethods = existingPaymentMethods.filter(
      (pm: ProfilePaymentMethod) => pm.id !== paymentMethodId
    );
    
    await updateDoc(userRef, {
      paymentMethods: updatedPaymentMethods,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const existingPaymentMethods = userData.paymentMethods || [];
    
    // Update all payment methods to set only the specified one as default
    const updatedPaymentMethods = existingPaymentMethods.map((pm: ProfilePaymentMethod) => ({
      ...pm,
      isDefault: pm.id === paymentMethodId,
    }));
    
    await updateDoc(userRef, {
      paymentMethods: updatedPaymentMethods,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
}; 