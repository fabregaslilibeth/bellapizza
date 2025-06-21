import { motion } from "framer-motion";

interface SmallCardItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface SmallCardProps {
  item: SmallCardItem;
  index: number;
}

const SmallCard: React.FC<SmallCardProps> = ({ item, index }) => {
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
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
    >

      <div className="relative w-full h-48 overflow-hidden group">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 flex flex-col justify-between"
      >
        <h3 className="text-base font-bold text-gray-900 h-12 line-clamp-2">{item.name}</h3>

        <div className="mt-4 space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer" 
          >
            Add to Cart - ₱{item.price}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmallCard;
