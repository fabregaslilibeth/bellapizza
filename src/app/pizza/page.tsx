"use client";

import { pizza } from "@/data/pizza";
import Image from "next/image";
import { useState } from "react";

interface Deal {
  id: number;
  name: string;
  name_en: string;
  marketing_description: string;
  price: number;
  originalPrice: number;
  menu_attributes: {
    name: string;
  }[];
  image: {
    desktop_thumbnail: string;
  };
  price_without_tax: number;
}

export default function DealsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = pizza.info.map((category) => {
    return {
      name: category?.name,
      image: category?.image?.icon,
    };
  });

  const filteredDeals = pizza.items.filter((deal: Deal) => {
    if (activeCategory === "All") {
      return true;
    }
    return deal.menu_attributes?.[0]?.name === activeCategory;
  }).map((deal: Deal) => {
    return {
      id: deal.id,
      category: deal.menu_attributes?.[0]?.name,
      name: deal.name,
      name_en: deal.name_en,
      description: deal.marketing_description,
      price: deal.price,
      originalPrice: deal.price_without_tax,
      image: deal.image.desktop_thumbnail,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-4 mb-12 overflow-x-auto">
        <div
          className={`rounded-lg border px-4 py-1 hover:shadow-lg transition-shadow duration-300  cursor-pointer bg-white text-black ${
            activeCategory === "All" ? "border-2 border-red-500" : "border-gray-300"
          }`}
          onClick={() => setActiveCategory("All")}
        >
          <h1>All</h1>
        </div>
        {categories.map((category, index) => (
          <div
            key={index}
            className={`flex shrink-0 gap-2 rounded-lg border pl-2 pr-4 py-1 hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white text-black ${
              activeCategory === category.name ? "border-2 border-red-500" : "border-gray-300"
            }`}
            onClick={() => setActiveCategory(category.name)}
          >
            <Image
              src={category.image}
              alt={category.name}
              width={25}
              height={16}
            />
            <h1>{category.name}</h1>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-auto max-h-62">
              <img src={deal.image} alt={deal.name} className="w-auto h-auto" />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
                {Math.round(
                  ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
                )}
                % OFF
              </div>
            </div>
            <div className="p-4">
              <span className="text-sm text-blue-600 font-medium">
                {deal.category}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mt-1">
                {deal.name}
              </h3>
              <p className="text-gray-600 mt-2">{deal.description} asdas</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    P{deal.price}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    P{deal.originalPrice}
                  </span>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300">
                  View Deal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
