'use client';
import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Toastify } from '@/helper/Toastify';
import { IRentalPostAdmin } from '@/types/type/rentalAdmin/rentalAdmin';

interface RentalFavoriteContextType {
  favorites: IRentalPostAdmin[];
  favoriteCount: number;
  toggleFavorite: (item: IRentalPostAdmin) => void;
  handleRemove: (id: string) => void;
}

const RentalFavoriteContext = createContext<RentalFavoriteContextType | undefined>(undefined);

export function RentalFavoriteProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<IRentalPostAdmin[]>([]);
  const toastRef = useRef<string | null>(null);

  // Load từ localStorage khi client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('rentalFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Đếm số lượng yêu thích
  const favoriteCount = useMemo(() => favorites.length, [favorites]);

  // Thêm / xóa khỏi danh sách yêu thích
  const toggleFavorite = useCallback((item: IRentalPostAdmin) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav._id === item._id);
      let updated: IRentalPostAdmin[];
      if (exists) {
        updated = prev.filter((fav) => fav._id !== item._id);
        toastRef.current = 'Đã xóa khỏi danh sách yêu thích.';
      } else {
        updated = [...prev, item];
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

  const handleRemove = useCallback(
    (id: string) => {
      const found = favorites.find((f) => f._id === id);
      if (found) toggleFavorite(found);
    },
    [favorites, toggleFavorite]
  );

  return (
    <RentalFavoriteContext.Provider value={{ favorites, favoriteCount, toggleFavorite, handleRemove }}>{children}</RentalFavoriteContext.Provider>
  );
}

export function useRentalFavorite() {
  const ctx = useContext(RentalFavoriteContext);
  if (!ctx) throw new Error('useRentalFavorite must be used within a RentalFavoriteProvider');
  return ctx;
}
