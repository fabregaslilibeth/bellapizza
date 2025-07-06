'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { setupAdminForCurrentUser, canCurrentUserBecomeAdmin, getCurrentUserAdminStatus } from '@/lib/admin-setup';

export default function AdminSetupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [canBecomeAdmin, setCanBecomeAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        router.push('/');
        return;
      }

      // Check if user can become admin
      const canBecome = canCurrentUserBecomeAdmin();
      setCanBecomeAdmin(canBecome);

      // Check if user is already admin
      const adminStatus = await getCurrentUserAdminStatus();
      setIsAdmin(adminStatus);

      if (adminStatus) {
        setMessage('You already have admin privileges!');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSetupAdmin = async () => {
    setSettingUp(true);
    setError('');
    setMessage('');

    try {
      await setupAdminForCurrentUser();
      setIsAdmin(true);
      setMessage('Admin privileges granted successfully! You can now access the admin dashboard.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set up admin privileges');
    } finally {
      setSettingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Setup</h1>
            <p className="text-gray-600">
              Welcome, {user.email}
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-center">
                  ✅ You have admin privileges
                </p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Admin Dashboard
              </button>
            </div>
          ) : canBecomeAdmin ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-center">
                  Your email is in the admin whitelist. You can set up admin privileges.
                </p>
              </div>
              <button
                onClick={handleSetupAdmin}
                disabled={settingUp}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {settingUp ? 'Setting up...' : 'Set Up Admin Privileges'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-center">
                  Your email is not in the admin whitelist. Please contact the system administrator.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 