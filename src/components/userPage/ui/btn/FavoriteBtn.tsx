'use client';
import { AiOutlineHeart } from 'react-icons/ai';
import { useRentalFavorite } from '@/context/RentalFavoriteContext';
import { motion } from 'framer-motion';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { BsBookmarkHeartFill } from 'react-icons/bs';

interface FavoriteButtonProps {
  post: IRentalPostAdmin;
  className?: string;
  size?: number;
  color?: string;
  border?: boolean;
  scaleOnHover?: boolean;
}

export default function FavoriteBtn({
  post,
  className = '',
  size = 24,
  color = 'text-white',
  border = false,
  scaleOnHover = false,
}: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useRentalFavorite();
  const isFavorite = favorites.some((fav) => fav._id === post._id);

  return (
    <div className="tooltip tooltip-top tooltip-primary w-fit" data-tip="Thêm vào yêu thích">
      <div
        className={`rounded-full ${isFavorite ? 'border-none' : border ? 'border border-primary ' + (scaleOnHover ? 'xl:hover:scale-125' : '') : ''}`}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn lan ra Link cha
            e.preventDefault(); // Ngăn hành vi chuyển trang
            toggleFavorite(post);
          }}
          aria-label="Thêm vào yêu thích"
          className={`group flex items-center justify-center rounded-full bg-white/30 p-1 transition ${isFavorite ? '' : 'xl:group-hover:bg-red-100'} ${className}`}
        >
          {isFavorite ? (
            <BsBookmarkHeartFill size={size === 0 ? 25.8 : size} className="text-orange-500 drop-shadow-sm" />
          ) : (
            <AiOutlineHeart size={size === 0 ? 24 : size} className={`group-hover:text-primary ${color}`} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
