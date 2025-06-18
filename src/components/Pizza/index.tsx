import { motion } from "framer-motion";
import { useState } from "react";

interface Variation {
  id: string;
  short_name: string;
  price: number;
}

interface Deal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  variations: Variation[];
}

interface PizzaProps {
  deal: Deal;
  index: number;
}

const Pizza: React.FC<PizzaProps> = ({ deal, index }) => {
  const [selectedVariation, setSelectedVariation] = useState<Variation>(
    deal.variations?.[0]
  );

  const handleVariationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const variation = deal.variations?.find((v) => {
      return +v.id === +selectedId;
    });

    if (variation) {
      setSelectedVariation(variation);
    }
  };
console.log(deal, 'selectedVariation');
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex h-72 border border-gray-100"
    >
      {/* Left side - Image with overlay */}
      <div className="relative w-6/12 overflow-hidden group">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          src={deal.image}
          alt={deal.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Overlaying polygon */}
        <div
          className="absolute -right-1 top-0 bottom-0 h-full w-full bg-gradient-to-l from-white/100 to-white/100"
          style={{ clipPath: "polygon(88% 0, 100% 0, 100% 100%, 59% 100%)" }}
        ></div>
        {/* <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md cursor-pointer"
        >
          Customise
        </motion.div> */}
      </div>

      {/* Right side - Content */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 py-6 px-4 flex flex-col justify-between w-6/12"
      >
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{deal.name}</h3>
          <p className="text-gray-600 mt-2 line-clamp-2 text-sm leading-relaxed">
            {deal.description}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {deal.variations && deal.variations.length > 0 && (
          <select
            className="form-select block w-full pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200"
            aria-label="Select size"
            onChange={handleVariationChange}
            defaultValue={selectedVariation?.id}
          >
            {deal.variations?.map((variation) => (
              <option key={variation?.id} value={variation?.id}>
                {variation?.short_name}
              </option>
            ))}
          </select>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer" 
          >
            Add to Cart - ₱{selectedVariation?.price || deal.originalPrice}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Pizza;
