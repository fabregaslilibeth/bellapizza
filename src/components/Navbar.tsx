"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import OrderPreferenceDisplay from "./OrderPreferenceDisplay";

const navItems = [
  { name: "Deals", href: "/deals" },
  { name: "Pizza", href: "/pizza" },
  { name: "Pasta", href: "/pasta" },
  { name: "Wings", href: "/wings" },
  { name: "Sides", href: "/sides" },
  { name: "Drinks", href: "/drinks" },
];

export default function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const activeItem = navItems.find((item) => item.href === path);
    if (activeItem) {
      setActiveIndex(navItems.indexOf(activeItem));
    }
  }, []);

  return (
    <nav className="bg-white">
      <OrderPreferenceDisplay />
      <div className="max-w-[1450px] mx-auto px-8 pb-6 overflow-x-hidden">
        <div className="flex items-center justify-between gap-4 h-full">
          <Link href="/" className="text-2xl font-bold shrink-0">
            Bella Pizza
          </Link>

          <div className="flex items-center space-x-8">
            {navItems.map((item, index) => (
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
                    className={`text-lg relative z-10 hover:text-white/80 transition-colors duration-300 ${
                      activeIndex === index
                        ? 'font-["Playfair_Display"] italic font-extrabold uppercase'
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
                      className="absolute top-0 left-0 h-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{
                        width: hoveredIndex === index ? "50%" : "0%",
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute top-0 right-0 h-full bg-white"
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
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
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
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
