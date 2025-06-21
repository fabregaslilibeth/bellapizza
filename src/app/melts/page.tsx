"use client";

import SmallCard from "@/components/SmallCard";
import { melts } from "@/data/melts";

interface RawMelts {
  id: number;
  name: string;
  price: number;
  image: {
    mobile_detail: string;
  };
}

export default function MeltsPage() {
  const filteredItems = melts.items.map((deal: RawMelts) => {
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
        {filteredItems.map((deal, index) => (
          <SmallCard key={deal.id} item={deal} index={index} />
        ))}
      </div>
    </div>
  );
}
