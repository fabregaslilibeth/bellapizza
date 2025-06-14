import React from 'react';

export default function PastaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Pasta Selection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">Spaghetti Carbonara</h2>
          <p className="text-gray-600">Classic Roman pasta dish with eggs, cheese, pancetta, and black pepper.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">Fettuccine Alfredo</h2>
          <p className="text-gray-600">Rich and creamy pasta with butter and Parmesan cheese.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">Penne Arrabbiata</h2>
          <p className="text-gray-600">Spicy tomato sauce with garlic and red chili peppers.</p>
        </div>
      </div>
    </div>
  );
}
