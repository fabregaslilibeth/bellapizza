export interface Address {
    province?: string;
    municipality?: string;
    address?: string;
  }
  
  export interface Store {
    name: string;
    hours: string;
    phone: string;
    services: string[];
    latitude: number;
    longitude: number;
    distance: number;
  }

  export interface Place {
    province: string;
    municipality: string;
  }
  
  export interface BarangayList {
    barangay_list: string[];
  }
  
  export interface MunicipalityList {
    [key: string]: BarangayList;
  }
  
  export interface Province {
    municipality_list: MunicipalityList;
  }
  
  export interface ProvinceList {
    [key: string]: Province;
  }
  
  export interface Region {
    region_name: string;
    province_list: ProvinceList;
  }
  
  export interface Places {
    [key: string]: Region;
  }

  // Cart related types
  export interface CartItem {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    image: string;
    category?: string;
    quantity: number;
    addedAt: Date;
  }

  export interface Cart {
    id: string;
    items: CartItem[];
    total: number;
    itemCount: number;
    createdAt: Date;
    updatedAt: Date;
  }

  // Checkout related types
  export interface PaymentMethod {
    id: string;
    type: 'card' | 'cash' | 'gcash' | 'paymaya';
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
    phoneNumber?: string; // For mobile payments
    isDefault?: boolean;
  }

  export interface DeliveryAddress {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    phone: string;
    instructions?: string;
    isDefault?: boolean;
  }

  export interface CheckoutStep {
    id: 'payment' | 'address' | 'confirm';
    title: string;
    description: string;
    isCompleted: boolean;
  }

  export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    paymentMethod: PaymentMethod;
    deliveryAddress: DeliveryAddress;
    orderType: 'delivery' | 'pickup';
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    estimatedTime: string;
    createdAt: Date;
    updatedAt: Date;
    // Guest order fields
    guestEmail?: string;
    guestInfo?: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  }