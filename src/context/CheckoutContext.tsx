"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CheckoutStep, PaymentMethod, DeliveryAddress, Order, CartItem } from '@/types';
import { createOrder, storeGuestPreferences, getGuestPreferences } from '@/lib/orders';
import { getCurrentUser } from '@/lib/auth';

interface GuestInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface CheckoutContextType {
  // Checkout state
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  
  // Guest checkout
  isGuestCheckout: boolean;
  setIsGuestCheckout: (guest: boolean) => void;
  guestInfo: GuestInfo;
  setGuestInfo: (info: Partial<GuestInfo>) => void;
  
  // Steps management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: CheckoutStep[];
  completeStep: (stepId: CheckoutStep['id']) => void;
  
  // Payment methods
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  
  // Delivery addresses
  deliveryAddresses: DeliveryAddress[];
  selectedDeliveryAddress: DeliveryAddress | null;
  setSelectedDeliveryAddress: (address: DeliveryAddress | null) => void;
  addDeliveryAddress: (address: DeliveryAddress) => void;
  
  // Order data
  orderData: Partial<Order> | null;
  setOrderData: (data: Partial<Order>) => void;
  
  // Checkout actions
  proceedToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedToNextStep: () => boolean;
  placeOrder: () => Promise<Order>;
  
  // Calculations
  calculateSubtotal: (items: CartItem[]) => number;
  calculateDeliveryFee: () => number;
  calculateTax: (subtotal: number) => number;
  calculateTotal: (subtotal: number, deliveryFee: number) => number;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const initialSteps: CheckoutStep[] = [
  {
    id: 'payment',
    title: 'Payment Method',
    description: 'Choose how you want to pay',
    isCompleted: false,
  },
  {
    id: 'address',
    title: 'Delivery Address',
    description: 'Where should we deliver your order?',
    isCompleted: false,
  },
  {
    id: 'confirm',
    title: 'Confirm Order',
    description: 'Review and confirm your order',
    isCompleted: false,
  },
];

// localStorage helpers
const loadFromLocalStorage = (key: string, defaultValue: unknown) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`checkout_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToLocalStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`checkout_${key}`, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors
  }
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<CheckoutStep[]>(initialSteps);
  
  // Guest checkout
  const [isGuestCheckout, setIsGuestCheckout] = useState(true);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(() => 
    loadFromLocalStorage('guestInfo', {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    })
  );
  
  // Payment methods - start empty for guests
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // Delivery addresses - start empty for guests
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<DeliveryAddress | null>(null);
  
  // Order data
  const [orderData, setOrderData] = useState<Partial<Order> | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedPaymentMethods = loadFromLocalStorage('paymentMethods', []);
    const savedDeliveryAddresses = loadFromLocalStorage('deliveryAddresses', []);
    
    setPaymentMethods(savedPaymentMethods);
    setDeliveryAddresses(savedDeliveryAddresses);
  }, []);

  // Load guest preferences from Firestore when email changes
  useEffect(() => {
    const loadGuestPreferences = async () => {
      if (isGuestCheckout && guestInfo.email) {
        try {
          const preferences = await getGuestPreferences(guestInfo.email);
          if (preferences) {
            // Merge with localStorage data, prioritizing Firestore data
            setPaymentMethods(prev => {
              const merged = [...prev];
              preferences.paymentMethods.forEach(newMethod => {
                const existingIndex = merged.findIndex(m => m.id === newMethod.id);
                if (existingIndex >= 0) {
                  merged[existingIndex] = newMethod;
                } else {
                  merged.push(newMethod);
                }
              });
              return merged;
            });
            
            setDeliveryAddresses(prev => {
              const merged = [...prev];
              preferences.deliveryAddresses.forEach(newAddress => {
                const existingIndex = merged.findIndex(a => a.id === newAddress.id);
                if (existingIndex >= 0) {
                  merged[existingIndex] = newAddress;
                } else {
                  merged.push(newAddress);
                }
              });
              return merged;
            });
          }
        } catch (error) {
          console.error('Error loading guest preferences:', error);
        }
      }
    };

    loadGuestPreferences();
  }, [isGuestCheckout, guestInfo.email]);

  // Save guest info to localStorage
  useEffect(() => {
    saveToLocalStorage('guestInfo', guestInfo);
  }, [guestInfo]);

  // Save payment methods to localStorage
  useEffect(() => {
    saveToLocalStorage('paymentMethods', paymentMethods);
  }, [paymentMethods]);

  // Save delivery addresses to localStorage
  useEffect(() => {
    saveToLocalStorage('deliveryAddresses', deliveryAddresses);
  }, [deliveryAddresses]);

  const completeStep = (stepId: CheckoutStep['id']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, isCompleted: true } : step
    ));
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
  };

  const addDeliveryAddress = (address: DeliveryAddress) => {
    setDeliveryAddresses(prev => [...prev, address]);
  };

  const updateGuestInfo = (info: Partial<GuestInfo>) => {
    setGuestInfo(prev => ({ ...prev, ...info }));
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // Payment step
        return selectedPaymentMethod !== null && 
               (isGuestCheckout ? 
                 Boolean(guestInfo.email && guestInfo.firstName && guestInfo.lastName && guestInfo.phone) : 
                 true);
      case 1: // Address step
        return selectedDeliveryAddress !== null;
      case 2: // Confirm step
        return true;
      default:
        return false;
    }
  };

  const proceedToNextStep = () => {
    if (canProceedToNextStep() && currentStep < steps.length - 1) {
      completeStep(steps[currentStep].id);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateSubtotal = (items: CartItem[]): number => {
    // Calculate the VAT-inclusive total from items
    const vatInclusiveTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Convert to base price (without VAT)
    return vatInclusiveTotal / 1.12;
  };

  const calculateDeliveryFee = (): number => {
    // Simple delivery fee calculation
    return 50; // Fixed delivery fee
  };

  const calculateTax = (subtotal: number): number => {
    // Calculate 12% VAT on the base price
    return subtotal * 0.12;
  };

  const calculateTotal = (subtotal: number, deliveryFee: number): number => {
    // Total is base price + VAT + delivery fee
    const tax = calculateTax(subtotal);
    return subtotal + tax + deliveryFee;
  };

  const placeOrder = async (): Promise<Order> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const order: Order = {
      id: `ORDER-${Date.now()}`,
      items: orderData?.items || [],
      total: orderData?.total || 0,
      subtotal: orderData?.subtotal || 0,
      deliveryFee: orderData?.deliveryFee || 0,
      tax: orderData?.tax || 0,
      paymentMethod: selectedPaymentMethod!,
      deliveryAddress: selectedDeliveryAddress!,
      orderType: 'delivery',
      status: 'pending',
      estimatedTime: '30-45 minutes',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add guest information if guest checkout
      ...(isGuestCheckout && {
        guestEmail: guestInfo.email,
        guestInfo: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone,
        },
      }),
    };

    try {
      // Get current user if logged in
      const currentUser = getCurrentUser();
      const userId = currentUser?.uid;
      
      // Save to Firestore
      const orderId = await createOrder(order, userId);
      
      // Update order with Firestore ID
      order.id = orderId;
      
      // Store guest preferences if guest checkout
      if (isGuestCheckout && guestInfo.email) {
        await storeGuestPreferences(guestInfo.email, paymentMethods, deliveryAddresses);
      }
      
      // Complete the final step
      completeStep('confirm');
      
      // Advance to success step
      setCurrentStep(2);
      
      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error('Failed to place order. Please try again.');
    }
  };

  return (
    <CheckoutContext.Provider value={{
      isCheckoutOpen,
      setIsCheckoutOpen,
      isGuestCheckout,
      setIsGuestCheckout,
      guestInfo,
      setGuestInfo: updateGuestInfo,
      currentStep,
      setCurrentStep,
      steps,
      completeStep,
      paymentMethods,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      addPaymentMethod,
      deliveryAddresses,
      selectedDeliveryAddress,
      setSelectedDeliveryAddress,
      addDeliveryAddress,
      orderData,
      setOrderData,
      proceedToNextStep,
      goToPreviousStep,
      canProceedToNextStep,
      placeOrder,
      calculateSubtotal,
      calculateDeliveryFee,
      calculateTax,
      calculateTotal,
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
} 