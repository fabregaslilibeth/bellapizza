"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { checkAuthStatus, onAuthStateChange } from '../lib/auth';
import { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity' | 'addedAt'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isLoggedIn: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate a unique cart ID (you might want to use user ID in a real app)
const getCartId = (): string => {
  if (typeof window !== 'undefined') {
    const existingId = localStorage.getItem('cartId');
    if (existingId) return existingId;
    
    const newId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cartId', newId);
    return newId;
  }
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | Date | undefined): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

// Local storage cart operations
const getLocalStorageCart = (): Cart | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cartData = localStorage.getItem('localCart');
    if (!cartData) return null;
    
    const parsedCart = JSON.parse(cartData);
    return {
      ...parsedCart,
      createdAt: new Date(parsedCart.createdAt),
      updatedAt: new Date(parsedCart.updatedAt),
      items: parsedCart.items.map((item: CartItem) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }))
    };
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return null;
  }
};

const saveLocalStorageCart = (cart: Cart): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('localCart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartId = getCartId();

  // Check authentication status and listen to changes
  useEffect(() => {
    const authStatus = checkAuthStatus();
    setIsLoggedIn(authStatus);

    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Listen to cart changes in Firestore (only if logged in)
  useEffect(() => {
    if (!isLoggedIn) {
      // Load cart from localStorage for non-logged-in users
      const localCart = getLocalStorageCart();
      if (localCart) {
        setCart(localCart);
      } else {
        // Create new local cart if none exists
        const newCart: Cart = {
          id: cartId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCart(newCart);
        saveLocalStorageCart(newCart);
      }
      setLoading(false);
      return;
    }

    // Firebase cart logic for logged-in users
    const unsubscribe = onSnapshot(
      doc(db, 'carts', cartId),
      (docSnapshot: DocumentSnapshot) => {
        if (docSnapshot.exists()) {
          const cartData = docSnapshot.data() as Cart;
          setCart({
            ...cartData,
            createdAt: convertTimestamp(cartData.createdAt),
            updatedAt: convertTimestamp(cartData.updatedAt),
            items: cartData.items?.map((item: CartItem) => ({
              ...item,
              addedAt: convertTimestamp(item.addedAt)
            })) || []
          });
        } else {
          // Create new cart if it doesn't exist
          const newCart: Cart = {
            id: cartId,
            items: [],
            total: 0,
            itemCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setCart(newCart);
          setDoc(doc(db, 'carts', cartId), {
            ...newCart,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        setLoading(false);
      },
      (error: Error) => {
        console.error('Error listening to cart:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [cartId, isLoggedIn]);

  const addToCart = async (item: Omit<CartItem, 'quantity' | 'addedAt'>) => {
    if (!cart) return;

    const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id === item.id);
    const newItems = [...cart.items];

    if (existingItemIndex >= 0) {
      // Item already exists, increment quantity
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      };
    } else {
      // Add new item
      newItems.push({
        ...item,
        quantity: 1,
        addedAt: new Date()
      });
    }

    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

    const updatedCart: Cart = {
      ...cart,
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
      updatedAt: new Date()
    };

    setCart(updatedCart);

    if (isLoggedIn) {
      // Update Firestore for logged-in users
      await updateDoc(doc(db, 'carts', cartId), {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        updatedAt: serverTimestamp()
      });
    } else {
      // Save to localStorage for non-logged-in users
      saveLocalStorageCart(updatedCart);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cart) return;

    const newItems = cart.items.filter(item => item.id !== itemId);
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

    const updatedCart: Cart = {
      ...cart,
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
      updatedAt: new Date()
    };

    setCart(updatedCart);

    if (isLoggedIn) {
      // Update Firestore for logged-in users
      await updateDoc(doc(db, 'carts', cartId), {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        updatedAt: serverTimestamp()
      });
    } else {
      // Save to localStorage for non-logged-in users
      saveLocalStorageCart(updatedCart);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart || quantity <= 0) return;

    const newItems = cart.items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

    const updatedCart: Cart = {
      ...cart,
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
      updatedAt: new Date()
    };

    setCart(updatedCart);

    if (isLoggedIn) {
      // Update Firestore for logged-in users
      await updateDoc(doc(db, 'carts', cartId), {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        updatedAt: serverTimestamp()
      });
    } else {
      // Save to localStorage for non-logged-in users
      saveLocalStorageCart(updatedCart);
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    const emptyCart: Cart = {
      ...cart,
      items: [],
      total: 0,
      itemCount: 0,
      updatedAt: new Date()
    };

    setCart(emptyCart);

    if (isLoggedIn) {
      // Update Firestore for logged-in users
      await updateDoc(doc(db, 'carts', cartId), {
        items: [],
        total: 0,
        itemCount: 0,
        updatedAt: serverTimestamp()
      });
    } else {
      // Save to localStorage for non-logged-in users
      saveLocalStorageCart(emptyCart);
    }
  };

  const getCartItemCount = (): number => {
    return cart?.itemCount || 0;
  };

  const getCartTotal = (): number => {
    return cart?.total || 0;
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemCount,
      getCartTotal,
      isLoggedIn,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 