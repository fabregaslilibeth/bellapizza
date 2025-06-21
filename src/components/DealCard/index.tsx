import React, { useEffect, useState } from 'react';

interface Deal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
}

interface DealProps {
  deal: Deal;
}

const DealCard: React.FC<DealProps> = ({ deal }) => {
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  useEffect(() => {
    if (deal.originalPrice && deal.price) {
      const hasDiscount = deal.originalPrice > deal.price;
      const discount = Math.round(
        ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
      );
      setIsDiscounted(hasDiscount);
      setDiscountPercentage(discount);
    }
  }, [deal]);

  return (
    <div
      key={deal.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-auto">
        <img src={deal.image} alt={deal.name} className="w-auto h-auto" />
       {isDiscounted && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded">
          {discountPercentage}% OFF
        </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-sm text-blue-600 font-medium">
          {deal.category}
        </span>
        <h3 className="text-xl font-semibold text-gray-900 mt-1">
          {deal.name}
        </h3>
        <p className="text-gray-600 mt-2">{deal.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              P{deal.price}
            </span>
            {isDiscounted && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                P{deal.originalPrice}
              </span>
            )}
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300">
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealCard;