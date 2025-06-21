"use client";

import SmallCard from "@/components/SmallCard";
import { drinks } from "@/data/drinks";

interface Drink {
  id: number;
  name: string;
  price: number;
  image: {
    mobile_detail: string;
  };
}

export default function DrinksPage() {
  const filteredDeals = drinks.items.map((drink: Drink) => {
    return {
      id: drink.id.toString(),
      name: drink.name,
      price: drink.price,
      image: drink.image.mobile_detail,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredDeals.map((drink, index) => (
          <SmallCard key={drink.id} item={drink} index={index} />
        ))}
      </div>
    </div>
  );
}
