import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import app from './firebase';
import { db } from './firebase';
import { FirestoreUser } from './orders';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Check if user is currently logged in
export const checkAuthStatus = (): boolean => {
  return !!auth.currentUser;
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Create or update user in Firestore
    await createOrUpdateUser(result.user, {
      firstName: result.user.displayName?.split(' ')[0] || '',
      lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
    });
    
    return result.user;
  } catch (error: unknown) {
    console.error('Error signing in with Google:', error);
    
    // If Google auth is not enabled, show a helpful message
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/operation-not-allowed') {
      alert('Google authentication is not enabled. Please enable it in Firebase Console or contact the administrator.');
    }
    
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Create or update user in Firestore
    await createOrUpdateUser(result.user);
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, userData?: { firstName: string; lastName: string; phone: string }): Promise<User | null> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create or update user in Firestore
    await createOrUpdateUser(result.user, userData);
    
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// Check if user is admin
export const checkIfUserIsAdmin = async (user: User): Promise<boolean> => {
  try {
    if (!user) {
      console.log('No user provided to checkIfUserIsAdmin');
      return false;
    }
    
    console.log('Checking admin status for user:', user.email, user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('User document does not exist in Firestore');
      return false;
    }
    
    const userData = userDoc.data() as FirestoreUser;
    console.log('User data from Firestore:', userData);
    console.log('isAdmin field value:', userData.isAdmin);
    
    const isAdmin = userData.isAdmin === true;
    console.log('Final admin status:', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Admin email whitelist (you can modify this list)
const ADMIN_EMAILS = [
  'admin@example.com', // Replace with actual admin emails
  'beth@example.com',  // Add your admin email here
  'fabregaslilibeth@gmail.com', // Your actual email
  // Add more admin emails as needed
];

// Check if email is in admin whitelist
export const isEmailInAdminWhitelist = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Sign out user
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Create or update user in Firestore
export const createOrUpdateUser = async (user: User, additionalData?: Partial<FirestoreUser>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData: FirestoreUser = {
      email: user.email || '',
      firstName: additionalData?.firstName || '',
      lastName: additionalData?.lastName || '',
      phone: additionalData?.phone || '',
      createdAt: userDoc.exists() ? userDoc.data().createdAt : Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isGuest: false,
      isAdmin: isEmailInAdminWhitelist(user.email || ''),
      ...additionalData
    };
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        lastLoginAt: Timestamp.now(),
        isAdmin: isEmailInAdminWhitelist(user.email || ''),
        ...additionalData
      });
    } else {
      // Create new user
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

export { auth }; 