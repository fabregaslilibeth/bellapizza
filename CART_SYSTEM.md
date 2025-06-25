# Cart System with Authentication-Based Storage

This cart system automatically switches between Firebase and local storage based on authentication status.

## Features

- **Automatic Storage Switching**: Uses Firebase Firestore when user is logged in, local storage when not
- **Real-time Updates**: Firebase cart updates in real-time across devices for logged-in users
- **Persistent Local Storage**: Guest users' carts persist across browser sessions
- **Authentication State Listening**: Automatically detects login/logout state changes
- **Type Safety**: Full TypeScript support with proper typing

## How It Works

### For Logged-in Users
- Cart data is stored in Firebase Firestore
- Real-time updates across all devices
- Cart persists across different browsers and devices
- Automatic synchronization

### For Guest Users (Not Logged In)
- Cart data is stored in browser's localStorage
- Data persists across browser sessions
- No network dependency
- Faster performance

## Usage

### Basic Usage

```tsx
import { useCart } from '../context/CartContext';

function MyComponent() {
  const { 
    cart, 
    loading, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getCartItemCount,
    getCartTotal,
    isLoggedIn 
  } = useCart();

  const handleAddItem = async () => {
    await addToCart({
      id: 'item-1',
      name: 'Pizza Margherita',
      description: 'Classic tomato and mozzarella',
      price: 12.99,
      originalPrice: 15.99,
      image: '/pizza.jpg',
      category: 'pizza'
    });
  };

  return (
    <div>
      <p>Logged in: {isLoggedIn ? 'Yes' : 'No'}</p>
      <p>Items in cart: {getCartItemCount()}</p>
      <p>Total: ${getCartTotal().toFixed(2)}</p>
      <button onClick={handleAddItem}>Add Item</button>
    </div>
  );
}
```

### Authentication Integration

The system automatically detects authentication status using Firebase Auth. To integrate with your authentication system:

1. **Update the auth helper** (`src/lib/auth.ts`):
```tsx
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const auth = getAuth(app);

export const checkAuthStatus = (): boolean => {
  return !!auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
```

2. **The CartContext automatically listens** to authentication state changes and switches storage accordingly.

### Cart Status Component

Use the provided `CartStatus` component to display cart information:

```tsx
import { CartStatus } from '../components/CartStatus';

function App() {
  return (
    <div>
      <CartStatus />
      {/* Your other components */}
    </div>
  );
}
```

## API Reference

### CartContext Methods

- `addToCart(item)`: Add item to cart
- `removeFromCart(itemId)`: Remove item from cart
- `updateQuantity(itemId, quantity)`: Update item quantity
- `clearCart()`: Clear all items from cart
- `getCartItemCount()`: Get total number of items
- `getCartTotal()`: Get cart total price
- `isLoggedIn`: Boolean indicating authentication status

### Cart Item Structure

```tsx
interface CartItem {
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
```

## Migration from Local to Firebase

When a user logs in, their local cart data can be migrated to Firebase. The current implementation creates a new Firebase cart, but you can extend it to migrate existing local data:

```tsx
// In CartContext, when user logs in
useEffect(() => {
  if (isLoggedIn && !loading) {
    // Check if there's local cart data to migrate
    const localCart = getLocalStorageCart();
    if (localCart && localCart.items.length > 0) {
      // Migrate local cart to Firebase
      // Implementation depends on your requirements
    }
  }
}, [isLoggedIn, loading]);
```

## Error Handling

The system includes error handling for:
- Firebase connection issues
- Local storage quota exceeded
- Invalid cart data
- Authentication errors

## Performance Considerations

- **Local Storage**: Limited to ~5-10MB, suitable for small carts
- **Firebase**: No practical limits, but consider costs for large carts
- **Real-time Updates**: Only active for logged-in users to reduce Firebase usage

## Security

- Local storage data is not encrypted (consider for sensitive data)
- Firebase data follows your Firebase security rules
- Cart IDs are generated client-side for guest users
- Consider implementing cart expiration for guest users 