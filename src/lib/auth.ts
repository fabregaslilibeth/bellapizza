import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import app from './firebase';

const auth = getAuth(app);

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

// Sign out user
export const signOut = async (): Promise<void> => {
  await auth.signOut();
};

export { auth }; 