"use client";

import Pizza from "@/components/Pizza";
import { sides } from "@/data/sides";
import Image from "next/image";
import { useState } from "react";

interface Pasta {
  id: number;
  name: string;
  name_en: string;
  marketing_description: string;
  display_price: number;
  originalPrice: number;
  menu_attributes: {
    name: string;
  }[];
  image: {
    desktop_detail: string;
    mobile_detail: string;
    desktop_thumbnail: string;
    mobile_thumbnail: string;
  };
  price_without_tax: number;
}

export default function PastaPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = sides.info.map((category) => {
    return {
      name: category?.name,
      image: category?.image?.icon,
    };
  });

  const filteredDeals = sides.items.filter((deal: Pasta) => {
    if (activeCategory === "All") {
      return true;
    }
    return deal.menu_attributes?.[0]?.name === activeCategory;
  }).map((deal: Pasta) => {
    return {
      id: deal.id,
      category: deal.menu_attributes?.[0]?.name,
      name: deal.name,
      name_en: deal.name_en,
      description: deal.marketing_description,
      price: deal.display_price,
      originalPrice: deal.price_without_tax,
      image: deal.image.mobile_detail,
      variations: deal.first_layers?.sort((a: any, b: any) => a.price_master - b.price_master),
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
          <Pizza key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
