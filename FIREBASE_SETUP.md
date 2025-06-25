# Firebase Setup Guide

To use the cart functionality with Firestore, you need to set up Firebase in your project.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database in your project

## 2. Get Firebase Configuration

1. In your Firebase project, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on the web app icon (</>) to add a web app
4. Register your app and copy the configuration

## 3. Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 4. Firestore Security Rules

Update your Firestore security rules to allow read/write access to the carts collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /carts/{cartId} {
      allow read, write: if true; // For development - make more restrictive for production
    }
  }
}
```

## 5. Features Implemented

- ✅ Add items to cart
- ✅ Remove items from cart
- ✅ Update item quantities
- ✅ Clear entire cart
- ✅ Real-time cart updates with Firestore
- ✅ Cart persistence across sessions
- ✅ Cart display with item count
- ✅ Animated cart interface

## 6. Usage

- Click "Add to Cart" on any deal card to add items
- Use the cart icon in the top-right to view your cart
- Modify quantities or remove items in the cart panel
- Cart data is automatically saved to Firestore 