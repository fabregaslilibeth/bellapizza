"use client";

import { useState } from "react";
import Image from "next/image";
import ItemCard from "@/components/ItemCard";
import { pasta } from "@/data/pasta";

interface RawPasta {
  id: number;
  name: string;
  marketing_description: string;
  price: number;
  price_master: number;
  menu_attributes: {
    name: string;
  }[];
  image: {
    desktop_thumbnail: string;
  };
  category: {
    name: {
      en: string;
    };
  };
  first_layers?: Array<{
    id: number;
    name: string;
    short_name: string;
    price: number;
    price_master: number;
  }> | null;
}

export default function PastaPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = pasta.info.map((category) => {
    return {
      name: category?.name,
      image: category?.image?.icon,
    };
  });

  const filteredItems = pasta.items.filter((deal: RawPasta) => {
    if (activeCategory === "All") {
      return true;
    }
    return deal.menu_attributes?.[0]?.name === activeCategory;
  }).map((deal: RawPasta) => {
    return {
      id: deal.id.toString(),
      category: deal.menu_attributes?.[0]?.name,
      name: deal.name,
      description: deal.marketing_description,
      price: deal.price,
      originalPrice: deal.price_master,
      image: deal.image.desktop_thumbnail,
      mobile_image: deal.image.desktop_thumbnail,
      variations: deal.first_layers ? deal.first_layers.map(layer => ({
        id: layer.id.toString(),
        short_name: layer.short_name,
        price: layer.price
      })).sort((a, b) => a.price - b.price) : [],
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
              {category.image && (
              <Image
                src={category.image}
                alt={category.name}
                width={20}
                height={16}
              />
            )}
            <h1>{category.name}</h1>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((deal, index) => (
          <ItemCard key={deal.id} item={deal} index={index} />
        ))}
      </div>
    </div>
  );
}
