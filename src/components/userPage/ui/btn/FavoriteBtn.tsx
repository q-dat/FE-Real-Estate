'use client';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { motion } from 'framer-motion';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

interface FavoriteButtonProps {
  post: IRentalPostAdmin;
  className?: string;
  size?: number;
  color?: string;
}

export default function FavoriteBtn({ post, className = '', size = 22, color = 'text-white' }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useRentalFavorite();
  const isFavorite = favorites.some((fav) => fav._id === post._id);

  return (
    <div className="w-full rounded-full border border-primary xl:hover:scale-125">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation(); // Ngăn lan ra Link cha
          e.preventDefault(); // Ngăn hành vi chuyển trang
          toggleFavorite(post);
        }}
        aria-label="Thêm vào yêu thích"
        className={`group flex items-center justify-center rounded-full bg-white/30 p-1 transition group-hover:bg-red-100 ${className}`}
      >
        {isFavorite ? (
          <AiFillHeart size={size} className="text-red-500 drop-shadow-sm" />
        ) : (
          <AiOutlineHeart size={size} className={`group-hover:text-red-500 ${color}`} />
        )}
      </motion.button>
    </div>
  );
}
