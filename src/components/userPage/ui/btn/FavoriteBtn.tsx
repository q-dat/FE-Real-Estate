'use client';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { motion } from 'framer-motion';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

interface FavoriteButtonProps {
  post: IRentalPostAdmin;
  className?: string;
  size?: number;
}

export default function FavoriteBtn({ post, className = '', size = 22 }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useRentalFavorite();

  const isFavorite = favorites.some((fav) => fav._id === post._id);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => toggleFavorite(post)}
      aria-label="Thêm vào yêu thích"
      className={`flex items-center justify-center rounded-full p-1 transition z-[99999] hover:bg-red-100 ${className}`}
    >
      {isFavorite ? (
        <AiFillHeart size={size} className="text-red-500 drop-shadow-sm" />
      ) : (
        <AiOutlineHeart size={size} className="text-gray-500 hover:text-red-500" />
      )}
    </motion.button>
  );
}
