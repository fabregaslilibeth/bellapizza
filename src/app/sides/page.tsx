"use client";

import { sides } from "@/data/sides";
import SmallCard from "@/components/SmallCard";

interface Side {
  id: number;
  name: string;
  price: number;
  image: {
    mobile_detail: string;
  };
}

export default function SidesPage() {
  const items = sides.items.map((deal: Side) => {
    return {
      id: deal.id.toString(),
      name: deal.name,
      price: deal.price,
      image: deal.image.mobile_detail,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((side, index) => (
          <SmallCard key={side.id} item={side} index={index} />
        ))}
      </div>
    </div>
  );
}
