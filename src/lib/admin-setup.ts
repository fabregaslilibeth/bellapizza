import { auth } from './firebase';
import { isEmailInAdminWhitelist } from './auth';

// Function to set up admin for the current user
export const setupAdminForCurrentUser = async (): Promise<void> => {
  try {
    console.log('Starting admin setup...');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('No user is currently signed in');
      throw new Error('No user is currently signed in');
    }

    console.log('Current user:', currentUser.email, currentUser.uid);
    
    if (!isEmailInAdminWhitelist(currentUser.email || '')) {
      console.error('Email not in whitelist:', currentUser.email);
      throw new Error('Your email is not in the admin whitelist. Please contact the system administrator.');
    }

    console.log('Email is in whitelist, proceeding to set admin...');
    
    // Create or update user document with admin privileges
    const { createOrUpdateUser } = await import('./auth');
    await createOrUpdateUser(currentUser, {
      firstName: currentUser.displayName?.split(' ')[0] || '',
      lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
    });
    
    console.log('Admin privileges granted successfully!');
  } catch (error) {
    console.error('Error setting up admin:', error);
    throw error;
  }
};

// Function to check if current user can become admin
export const canCurrentUserBecomeAdmin = (): boolean => {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) return false;
  
  return isEmailInAdminWhitelist(currentUser.email);
};

// Function to get current user's admin status
export const getCurrentUserAdminStatus = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    const { checkIfUserIsAdmin } = await import('./auth');
    return await checkIfUserIsAdmin(currentUser);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 