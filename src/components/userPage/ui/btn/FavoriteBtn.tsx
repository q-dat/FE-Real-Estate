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
      onClick={(e) => {
        e.stopPropagation(); // 🔥 Ngăn lan ra Link cha
        e.preventDefault(); // 🔥 Ngăn hành vi chuyển trang
        toggleFavorite(post);
      }}
      aria-label="Thêm vào yêu thích"
      className={`group flex items-center justify-center rounded-full bg-white/30 p-1 transition group-hover:bg-red-100 ${className}`}
    >
      {isFavorite ? (
        <AiFillHeart size={size} className="text-red-500 drop-shadow-sm" />
      ) : (
        <AiOutlineHeart size={size} className="text-white group-hover:text-red-500" />
      )}
    </motion.button>
  );
}
