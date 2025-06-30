"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getCurrentUser } from '@/lib/auth';

interface ProfileIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const [isClient, setIsClient] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { isLoggedIn } = useCart();
  const currentUser = getCurrentUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  const shouldShowImage = currentUser?.photoURL && !imageError;

  return (
    <Link href="/profile">
      <motion.div
        className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold flex items-center justify-center cursor-pointer hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md overflow-hidden`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {shouldShowImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {getInitials(getUserDisplayName())}
                </span>
              </div>
            )}
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className={`${sizeClasses[size]} rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <span className="text-sm font-bold">
            {getInitials(getUserDisplayName())}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export default ProfileIcon; 