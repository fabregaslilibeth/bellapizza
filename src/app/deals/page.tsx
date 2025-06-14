'use client';

import { useState } from 'react';

interface Deal {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
}

const mockDeals: Deal[] = [
  {
    id: 1,
    title: "Premium Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 149.99,
    originalPrice: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: "Electronics"
  },
  {
    id: 2,
    title: "Smart Watch",
    description: "Feature-rich smartwatch with health tracking",
    price: 199.99,
    originalPrice: 349.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "Electronics"
  },
  {
    id: 3,
    title: "Running Shoes",
    description: "Comfortable running shoes for all terrains",
    price: 79.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    category: "Sports"
  },
];

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeals = mockDeals.filter(deal =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Exclusive Deals</h1>
          <p className="text-lg text-gray-600">Find the best deals and discounts on premium products</p>
        </div>

        <div className="relative mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search deals..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
                  {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% OFF
                </div>
              </div>
              <div className="p-4">
                <span className="text-sm text-blue-600 font-medium">{deal.category}</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">{deal.title}</h3>
                <p className="text-gray-600 mt-2">{deal.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${deal.price}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">${deal.originalPrice}</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300">
                    View Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
