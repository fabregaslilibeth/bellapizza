"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { getCurrentUser, signOut, checkIfUserIsAdmin } from "@/lib/auth";
import { User } from "firebase/auth";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import OrderTracking from "@/components/OrderTracking";
import AddAddressModal from "@/components/AddAddressModal";
import AddPaymentMethodModal from "@/components/AddPaymentMethodModal";
import { getUserProfile, addDeliveryAddress, addPaymentMethod, updateUserProfile, updateUserPreferences } from "@/lib/userProfile";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: {
    day: string;
    month: string;
    year: string;
  };
  preferences: {
    emailUpdates: boolean;
    smsUpdates: boolean;
    htmlEmail: boolean;
    pizzaHutNews: boolean;
  };
  paymentMethods: PaymentMethod[];
  deliveryAddresses: DeliveryAddress[];
}

interface PaymentMethod {
  id: string;
  type: "card" | "paypal";
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { isLoggedIn, authLoading } = useCart();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: { day: "", month: "", year: "" },
    preferences: {
      emailUpdates: false,
      smsUpdates: false,
      htmlEmail: false,
      pizzaHutNews: false,
    },
    paymentMethods: [],
    deliveryAddresses: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);

  // Prevent hydration mismatch by ensuring we're on the client
  useEffect(() => {
    setIsClient(true);
    // Load active tab from localStorage on client side
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      console.log('Saving active tab:', activeTab);
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab, isClient]);

  useEffect(() => {
    if (isClient && isLoggedIn) {
      const user = getCurrentUser();
      if (user) {
        loadUserProfile(user);
      }
    }
  }, [isClient, isLoggedIn]);

  const loadUserProfile = async (user: User) => {
    try {
      // Check if user is admin
      const adminStatus = await checkIfUserIsAdmin(user);
      setIsAdmin(adminStatus);

      // Load user profile from Firebase
      const userProfileData = await getUserProfile(user.uid);
      
      setProfile({
        firstName: userProfileData.firstName || user?.displayName?.split(" ")[0] || "",
        lastName: userProfileData.lastName || user?.displayName?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        phone: userProfileData.phone || "",
        birthday: userProfileData.birthday || { day: "", month: "", year: "" },
        preferences: userProfileData.preferences || {
          emailUpdates: true,
          smsUpdates: false,
          htmlEmail: true,
          pizzaHutNews: true,
        },
        paymentMethods: userProfileData.paymentMethods || [
          {
            id: "1",
            type: "card",
            last4: "1234",
            brand: "Visa",
            isDefault: true,
          },
        ],
        deliveryAddresses: userProfileData.deliveryAddresses || [
          {
            id: "1",
            name: "Home",
            address: "123 Main St",
            city: "Manila",
            province: "Metro Manila",
            zipCode: "1000",
            phone: "+63 912 345 6789",
            isDefault: true,
          },
        ],
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Fallback to basic profile if Firebase fails
      setProfile({
        firstName: user?.displayName?.split(" ")[0] || "",
        lastName: user?.displayName?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        phone: "",
        birthday: { day: "", month: "", year: "" },
        preferences: {
          emailUpdates: true,
          smsUpdates: false,
          htmlEmail: true,
          pizzaHutNews: true,
        },
        paymentMethods: [],
        deliveryAddresses: [],
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save profile data to Firebase
      await updateUserProfile(user.uid, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        birthday: profile.birthday,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserProfile["preferences"]) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddAddress = async (addressData: Omit<DeliveryAddress, "id">) => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save to Firebase
      await addDeliveryAddress(user.uid, addressData);

      // Update local state
      const newAddress: DeliveryAddress = {
        ...addressData,
        id: Date.now().toString(),
      };

      // If this is set as default, unset other addresses as default
      if (addressData.isDefault) {
        setProfile((prev) => ({
          ...prev,
          deliveryAddresses: prev.deliveryAddresses.map((addr) => ({
            ...addr,
            isDefault: false,
          })),
        }));
      }

      // Add the new address
      setProfile((prev) => ({
        ...prev,
        deliveryAddresses: [...prev.deliveryAddresses, newAddress],
      }));

      setIsAddAddressModalOpen(false);
    } catch (error) {
      console.error("Error adding address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, "id">) => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save to Firebase
      await addPaymentMethod(user.uid, paymentMethodData);

      // Update local state
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethodData,
        id: Date.now().toString(),
      };

      // If this is set as default, unset other payment methods as default
      if (paymentMethodData.isDefault) {
        setProfile((prev) => ({
          ...prev,
          paymentMethods: prev.paymentMethods.map((pm) => ({
            ...pm,
            isDefault: false,
          })),
        }));
      }

      // Add the new payment method
      setProfile((prev) => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentMethod],
      }));

      setIsAddPaymentMethodModalOpen(false);
    } catch (error) {
      console.error("Error adding payment method:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state until client-side hydration is complete
  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access your profile.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", name: "Profile Info", icon: "👤" },
    { id: "preferences", name: "Preferences", icon: "⚙️" },
    { id: "payment", name: "Payment Methods", icon: "💳" },
    { id: "addresses", name: "Delivery Addresses", icon: "📍" },
    { id: "orders", name: "Order History", icon: "📋" },
    { id: "favorites", name: "Favorites", icon: "❤️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center h-full mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "My Admin Profile" : "My Profile"}
            </h1>
            <p className="text-gray-600">
                Manage your account settings and preferences
            </p>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8 text-center">
            <button
                onClick={handleSignOut}
                className="inline-flex items-center px-6 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
                  Sign Out
                <FiLogOut className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vertical Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg"
                >
                  <span className="flex items-center">
                    <span className="mr-2">{tabs.find(tab => tab.id === activeTab)?.icon}</span>
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <div className={`lg:block ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-red-50 text-red-600 border-r-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birthday
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <select
                          value={profile.birthday.day}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              birthday: { ...prev.birthday, day: e.target.value },
                            }))
                          }
                          disabled={!isEditing}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <option
                                key={day}
                                value={day.toString().padStart(2, "0")}
                              >
                                {day}
                              </option>
                            )
                          )}
                        </select>

                        <select
                          value={profile.birthday.month}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              birthday: { ...prev.birthday, month: e.target.value },
                            }))
                          }
                          disabled={!isEditing}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                        >
                          <option value="">Month</option>
                          {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((month, index) => (
                            <option
                              key={month}
                              value={(index + 1).toString().padStart(2, "0")}
                            >
                              {month}
                            </option>
                          ))}
                        </select>

                        <select
                          value={profile.birthday.year}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              birthday: { ...prev.birthday, year: e.target.value },
                            }))
                          }
                          disabled={!isEditing}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                        >
                          <option value="">Year</option>
                          {Array.from(
                            { length: 100 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((year) => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "preferences" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Communication Preferences
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="emailUpdates"
                        checked={profile.preferences.emailUpdates}
                        onChange={() => handlePreferenceChange("emailUpdates")}
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="emailUpdates"
                          className="text-sm font-medium text-gray-900"
                        >
                          Send me email & SMS updates about exclusive deals and
                          promos
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Receive special offers and promotions via email and SMS
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="htmlEmail"
                        checked={profile.preferences.htmlEmail}
                        onChange={() => handlePreferenceChange("htmlEmail")}
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="htmlEmail"
                          className="text-sm font-medium text-gray-900"
                        >
                          HTML mail
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Receive emails in HTML format with rich content
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="pizzaHutNews"
                        checked={profile.preferences.pizzaHutNews}
                        onChange={() => handlePreferenceChange("pizzaHutNews")}
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="pizzaHutNews"
                          className="text-sm font-medium text-gray-900"
                        >
                          Receive Bella Pizza news and coupons in HTML mail
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Get the latest news, updates, and exclusive coupons
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const user = getCurrentUser();
                          if (!user) {
                            throw new Error("User not authenticated");
                          }
                          await updateUserPreferences(user.uid, profile.preferences);
                        } catch (error) {
                          console.error("Error saving preferences:", error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "payment" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Payment Methods
                    </h2>
                    <button 
                      onClick={() => setIsAddPaymentMethodModalOpen(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Add Payment Method
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                            {method.type === "card" ? "💳" : "📧"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {method.type === "card"
                                ? `${method.brand} •••• ${method.last4}`
                                : method.email}
                            </p>
                            {method.isDefault && (
                              <span className="text-xs text-red-600 font-medium">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Delivery Addresses
                    </h2>
                    <button 
                      onClick={() => setIsAddAddressModalOpen(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Add Address
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.deliveryAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {address.name}
                              </h3>
                              {address.isDefault && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.address}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.province} {address.zipCode}
                            </p>
                            <p className="text-gray-600 text-sm">{address.phone}</p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Order History
                  </h2>
                  
                  <OrderTracking />
                </motion.div>
              )}

              {activeTab === "favorites" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Favorites
                  </h2>

                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Items you favorite will appear here for quick access.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Browse Menu
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        onSave={handleAddAddress}
        existingAddresses={profile.deliveryAddresses}
      />

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddPaymentMethodModalOpen}
        onClose={() => setIsAddPaymentMethodModalOpen(false)}
        onSave={handleAddPaymentMethod}
        existingPaymentMethods={profile.paymentMethods}
      />
    </div>
  );
}
