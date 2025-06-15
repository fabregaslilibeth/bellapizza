"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type OrderPreference = 'delivery' | 'pickup';

interface Address {
  province?: string;
  municipality?: string;
  address?: string;
}

interface Store {
  name: string;
  hours: string;
  phone: string;
  services: string[];
  latitude: number;
  longitude: number;
  distance: number;
}

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

export function OrderPreferenceProvider({ children }: { children: ReactNode }) {
  const [isLocatorOpen, setIsLocatorOpen] = useState<boolean>(true);
  const [orderPreference, setOrderPreference] = useState<OrderPreference>('delivery');
  const [address, setAddress] = useState<Address | null>(null);
  const [nearestStores, setNearestStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isNearestStoresVisible, setIsNearestStoresVisible] = useState<boolean>(false);
  const [isChangeAddressVisible, setIsChangeAddressVisible] = useState<boolean>(false);

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