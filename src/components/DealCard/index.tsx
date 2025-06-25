import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useCart } from '@/context/CartContext';

interface ProcessedDeal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category?: string;
}

interface DealProps {
  deal: ProcessedDeal;
}

const DealCard: React.FC<DealProps> = ({ deal }) => {
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

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

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        id: deal.id,
        name: deal.name,
        description: deal.description,
        price: deal.price,
        originalPrice: deal.originalPrice,
        image: deal.image,
        category: deal.category
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.6
      }
    },
    hover: {
      y: -6,
      rotateY: 1,
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const imageVariants: Variants = {
    hover: {
      scale: 1.03,
      rotateZ: 0.1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const discountVariants: Variants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.8
      }
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
        delay: 0.6
      }
    },
    hover: {
      scale: 1.03,
      x: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    },
    tap: {
      scale: 0.92,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      key={deal.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ perspective: 1000 }}
    >
      <div className="relative h-auto overflow-hidden">
        <motion.img 
          src={deal.image} 
          alt={deal.name} 
          className="w-auto h-auto"
          variants={imageVariants}
          whileHover="hover"
        />
       {isDiscounted && (
        <motion.div 
          className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-full font-bold shadow-lg"
          variants={discountVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          {discountPercentage}% OFF
        </motion.div>
        )}
      </div>
      
      <motion.div 
        className="p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {deal.category && <motion.span 
          className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full"
          variants={itemVariants}
        >
          {deal.category}
        </motion.span>}
        
        <motion.h3 
          className="text-xl font-semibold text-gray-900 mt-2"
          variants={itemVariants}
        >
          {deal.name}
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 mt-2 leading-relaxed"
          variants={itemVariants}
        >
          {deal.description}
        </motion.p>
        
        <div className="mt-4 flex items-center justify-between">
          <motion.div
            variants={itemVariants}
            className="flex flex-col"
          >
            <motion.span 
              className="text-2xl font-bold text-gray-900"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              P{deal.price}
            </motion.span>
            {isDiscounted && (
              <motion.span 
                className="text-sm text-gray-500 line-through"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              >
                P{deal.originalPrice}
              </motion.span>
            )}
          </motion.div>
          
          <motion.button 
            className={`px-3 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
              isAddingToCart 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={!isAddingToCart ? "hover" : undefined}
            whileTap={!isAddingToCart ? "tap" : undefined}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            <motion.span
              whileHover={!isAddingToCart ? { x: 1 } : undefined}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DealCard;