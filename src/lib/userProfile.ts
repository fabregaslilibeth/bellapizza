import { 
  doc, 
  getDoc, 
  updateDoc, 
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { DeliveryAddress } from '@/types';

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