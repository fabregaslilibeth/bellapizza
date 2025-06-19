"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Address, Store } from '../types';

type OrderPreference = 'delivery' | 'pickup';

interface OrderPreferenceContextType {
  isLocatorOpen: boolean;
  setIsLocatorOpen: (open: boolean) => void;
  orderPreference: OrderPreference;
  setOrderPreference: (preference: OrderPreference) => void;
  address: Address | null;
  setAddress: (address: Address | null) => void;
  nearestStores: Store[];
  setNearestStores: (stores: Store[]) => void;
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  isNearestStoresVisible: boolean;
  setIsNearestStoresVisible: (visible: boolean) => void;
  isChangeAddressVisible: boolean;
  setIsChangeAddressVisible: (visible: boolean) => void;
}

const OrderPreferenceContext = createContext<OrderPreferenceContextType | undefined>(undefined);

// Helper functions for localStorage
const saveToLocalStorage = (key: string, value: unknown): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const loadFromLocalStorage = (key: string, defaultValue: unknown): unknown => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.warn(`Failed to parse localStorage item "${key}":`, error);
        // Remove corrupted data
        localStorage.removeItem(key);
        return defaultValue;
      }
    }
    return defaultValue;
  }
  return defaultValue;
};

export function OrderPreferenceProvider({ children }: { children: ReactNode }) {
  const [isLocatorOpen, setIsLocatorOpen] = useState<boolean>(() => 
    loadFromLocalStorage('isLocatorOpen', true) as boolean
  );
  const [orderPreference, setOrderPreference] = useState<OrderPreference>(() => 
    loadFromLocalStorage('orderPreference', 'delivery') as OrderPreference
  );
  const [address, setAddress] = useState<Address | null>(() => 
    loadFromLocalStorage('address', null) as Address | null
  );
  const [nearestStores, setNearestStores] = useState<Store[]>(() => 
    loadFromLocalStorage('nearestStores', []) as Store[]
  );
  const [selectedStore, setSelectedStore] = useState<Store | null>(() => 
    loadFromLocalStorage('selectedStore', null) as Store | null
  );
  const [isNearestStoresVisible, setIsNearestStoresVisible] = useState<boolean>(() => 
    loadFromLocalStorage('isNearestStoresVisible', false) as boolean
  );
  const [isChangeAddressVisible, setIsChangeAddressVisible] = useState<boolean>(() => 
    loadFromLocalStorage('isChangeAddressVisible', false) as boolean
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage('isLocatorOpen', isLocatorOpen);
  }, [isLocatorOpen]);

  useEffect(() => {
    saveToLocalStorage('orderPreference', orderPreference);
  }, [orderPreference]);

  useEffect(() => {
    saveToLocalStorage('address', address);
  }, [address]);

  useEffect(() => {
    saveToLocalStorage('nearestStores', nearestStores);
  }, [nearestStores]);

  useEffect(() => {
    saveToLocalStorage('selectedStore', selectedStore);
  }, [selectedStore]);

  useEffect(() => {
    saveToLocalStorage('isNearestStoresVisible', isNearestStoresVisible);
  }, [isNearestStoresVisible]);

  useEffect(() => {
    saveToLocalStorage('isChangeAddressVisible', isChangeAddressVisible);
  }, [isChangeAddressVisible]);

  return (
    <OrderPreferenceContext.Provider value={{ 
      isLocatorOpen,
      setIsLocatorOpen,
      orderPreference, 
      setOrderPreference,
      address,
      setAddress,
      nearestStores,
      setNearestStores,
      selectedStore,
      setSelectedStore,
      isNearestStoresVisible,
      setIsNearestStoresVisible,
      isChangeAddressVisible,
      setIsChangeAddressVisible
    }}>
      {children}
    </OrderPreferenceContext.Provider>
  );
}

export function useOrderPreference() {
  const context = useContext(OrderPreferenceContext);
  if (context === undefined) {
    throw new Error('useOrderPreference must be used within an OrderPreferenceProvider');
  }
  return context;
} 