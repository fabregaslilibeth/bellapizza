"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import EmailLoginButton from "./EmailLoginButton";
import ProfileIcon from "./ProfileIcon";
import { 
  GiPizzaSlice, 
  GiNoodles, 
  GiChicken, 
  GiSandwich, 
  GiFrenchFries, 
  GiSodaCan,
  GiPriceTag,
  GiShoppingCart
} from "react-icons/gi";

const navItems = [
  { name: "Deals", href: "/deals", icon: GiPriceTag },
  { name: "Pizza", href: "/pizza", icon: GiPizzaSlice },
  { name: "Pasta", href: "/pasta", icon: GiNoodles },
  { name: "Wings", href: "/wings", icon: GiChicken },
  { name: "Melts", href: "/melts", icon: GiSandwich },
  { name: "Sides", href: "/sides", icon: GiFrenchFries },
  { name: "Drinks", href: "/drinks", icon: GiSodaCan },
  { name: "Track Order", href: "/tracking", icon: GiShoppingCart },
];

export default function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { getCartItemCount, isCartOpen, setIsCartOpen, isLoggedIn, authLoading } = useCart();
  const itemCount = getCartItemCount();

  // Show login button if not logged in and auth is not loading
  const shouldShowLoginButton = !isLoggedIn && !authLoading;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const activeItem = navItems.find((item) => item.href === path);
    if (activeItem) {
      setActiveIndex(navItems.indexOf(activeItem));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white relative">
      <div className="h-24 max-w-[1450px] mx-auto px-8 pb-6 overflow-x-hidden">
        <div className="flex items-center justify-between gap-4 h-full">
          <Link href="/" className="text-2xl font-bold shrink-0">
            Bella Pizza
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-row items-center space-x-8">
            {navItems.map((item, index) => {
              return (
                <motion.div
                  key={item.name}
                  className="relative"
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                >
                  <motion.div
                    className="relative"
                    animate={{
                      y: hoveredIndex === index ? -2 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setActiveIndex(index)}
                      className={`text-lg relative z-10 hover:text-black/80 transition-colors duration-300 flex items-center gap-2 ${
                        activeIndex === index
                          ? 'font-["Playfair_Display"] italic font-extrabold uppercase text-red-600'
                          : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>

                  {/* Solid line that meets in the middle */}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-full h-full">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-black"
                        initial={{ width: "0%" }}
                        animate={{
                          width: hoveredIndex === index ? "50%" : "0%",
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute top-0 right-0 h-full bg-black"
                        initial={{ width: "0%" }}
                        animate={{
                          width: hoveredIndex === index ? "50%" : "0%",
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>

                  {/* Circle animation */}
                  {activeIndex === index && (
                    <motion.div
                      className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600"
                      initial={{
                        x: -20,
                        opacity: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        x: 0,
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 0.3,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Cart Icon */}
          <div className="hidden md:flex items-center gap-4">
            {isClient && (
              shouldShowLoginButton ? (
                <div className="flex gap-2">
                  <EmailLoginButton 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm"
                  >
                    Login
                  </EmailLoginButton>
                </div>
              ) : (
                <ProfileIcon size="md" />
              )
            )}
            <motion.div 
              className="relative cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <GiShoppingCart className="w-6 h-6 text-gray-700" />
              
              {itemCount > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Mobile Burger Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {isClient && (
              shouldShowLoginButton ? (
                <div className="flex gap-2">
                  <EmailLoginButton 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm"
                  >
                    Login
                  </EmailLoginButton>
                </div>
              ) : (
                <ProfileIcon size="sm" />
              )
            )}
            
            {/* Mobile Cart Icon */}
            <motion.div 
              className="relative cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <GiShoppingCart className="w-6 h-6 text-gray-700" />
              
              {itemCount > 0 && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.div>
              )}
            </motion.div>

            <button
              onClick={toggleMenu}
              className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
              aria-label="Toggle menu"
            >
              <motion.span
                className="w-6 h-0.5 bg-black block"
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 8 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-6 h-0.5 bg-black block"
                animate={{
                  opacity: isMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-6 h-0.5 bg-black block"
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? -8 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200 
              }}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <button
                    onClick={closeMenu}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 p-6">
                  <div className="space-y-2">
                    {navItems.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            duration: 0.3,
                            ease: "easeOut"
                          }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => {
                              setActiveIndex(index);
                              closeMenu();
                            }}
                            className={`block text-lg py-3 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                              activeIndex === index
                                ? 'font-["Playfair_Display"] italic font-extrabold uppercase text-red-600 bg-red-50'
                                : "hover:bg-gray-50 hover:text-black/80"
                            }`}
                          >
                            <IconComponent className="w-5 h-5 text-red-600" />
                            {item.name}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Menu Footer */}
                <div className="p-6 border-t">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="text-center text-gray-500 text-sm"
                  >
                    Pizza
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
