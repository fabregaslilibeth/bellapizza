"use client";

import { wings } from "@/data/wings";
import DealCard from "@/components/DealCard";

interface RawChicken {
  id: number;
  name: string;
  marketing_description: string;
  price: number;
  min_price: number;
  image: {
    mobile_detail: string;
  };
}

export default function WingsPage() {
  const filteredItems = wings.items.map((chicken: RawChicken) => {
    return {
      id: chicken.id.toString(),
      name: chicken.name,
      description: chicken.marketing_description,
      price: chicken.price || chicken.min_price,
      originalPrice: chicken.price || chicken.min_price,
      image: chicken.image.mobile_detail,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((chicken) => (
          <DealCard key={chicken.id} deal={chicken} />
        ))}
      </div>
    </div>
  );
}
