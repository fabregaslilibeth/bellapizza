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
  isLoaded: boolean;
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
  // Initialize with default values to prevent hydration mismatch
  const [isLocatorOpen, setIsLocatorOpen] = useState<boolean>(true);
  const [orderPreference, setOrderPreference] = useState<OrderPreference>('delivery');
  const [address, setAddress] = useState<Address | null>(null);
  const [nearestStores, setNearestStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isNearestStoresVisible, setIsNearestStoresVisible] = useState<boolean>(false);
  const [isChangeAddressVisible, setIsChangeAddressVisible] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load values from localStorage after component mounts
  useEffect(() => {
    setIsLocatorOpen(loadFromLocalStorage('isLocatorOpen', true) as boolean);
    setOrderPreference(loadFromLocalStorage('orderPreference', 'delivery') as OrderPreference);
    setAddress(loadFromLocalStorage('address', null) as Address | null);
    setNearestStores(loadFromLocalStorage('nearestStores', []) as Store[]);
    setSelectedStore(loadFromLocalStorage('selectedStore', null) as Store | null);
    setIsNearestStoresVisible(loadFromLocalStorage('isNearestStoresVisible', false) as boolean);
    setIsChangeAddressVisible(loadFromLocalStorage('isChangeAddressVisible', false) as boolean);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('isLocatorOpen', isLocatorOpen);
    }
  }, [isLocatorOpen, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('orderPreference', orderPreference);
    }
  }, [orderPreference, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('address', address);
    }
  }, [address, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('nearestStores', nearestStores);
    }
  }, [nearestStores, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('selectedStore', selectedStore);
    }
  }, [selectedStore, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('isNearestStoresVisible', isNearestStoresVisible);
    }
  }, [isNearestStoresVisible, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage('isChangeAddressVisible', isChangeAddressVisible);
    }
  }, [isChangeAddressVisible, isLoaded]);

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
      setIsChangeAddressVisible,
      isLoaded
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