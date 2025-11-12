'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Toastify } from '@/helper/Toastify';
import { IRentalFavoriteLite, IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

interface RentalFavoriteContextType {
  favorites: IRentalFavoriteLite[];
  favoriteCount: number;
  toggleFavorite: (item: IRentalPostAdmin) => void;
  handleRemove: (id: string) => void;
}

const RentalFavoriteContext = createContext<RentalFavoriteContextType | undefined>(undefined);

export function RentalFavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<IRentalFavoriteLite[]>([]);
  const toastRef = useRef<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rentalFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        localStorage.removeItem('rentalFavorites');
      }
    }
  }, []);

  const favoriteCount = useMemo(() => favorites.length, [favorites]);

  const toggleFavorite = useCallback((post: IRentalPostAdmin) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f._id === post._id);
      let updated: IRentalFavoriteLite[];

      if (exists) {
        updated = prev.filter((f) => f._id !== post._id);
        toastRef.current = 'Đã xóa khỏi danh sách yêu thích.';
      } else {
        const compact: IRentalFavoriteLite = {
          _id: post._id,
          title: post.title,
          price: post.price,
          priceUnit: post.priceUnit,
          area: post.area,
          district: post.district,
          province: post.province,
          image: Array.isArray(post.images) ? post.images[0] : undefined,
        };
        updated = [...prev, compact];
        toastRef.current = 'Đã thêm vào danh sách yêu thích.';
      }

      localStorage.setItem('rentalFavorites', JSON.stringify(updated));
      return updated;
    });

    if (toastRef.current) {
      Toastify(toastRef.current, 200);
      toastRef.current = null;
    }
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f._id !== id);
      localStorage.setItem('rentalFavorites', JSON.stringify(updated));
      Toastify('Đã xóa khỏi danh sách yêu thích.', 200);
      return updated;
    });
  }, []);

  return (
    <RentalFavoriteContext.Provider value={{ favorites, favoriteCount, toggleFavorite, handleRemove }}>{children}</RentalFavoriteContext.Provider>
  );
}

export function useRentalFavorite() {
  const ctx = useContext(RentalFavoriteContext);
  if (!ctx) throw new Error('useRentalFavorite must be used within a RentalFavoriteProvider');
  return ctx;
}
