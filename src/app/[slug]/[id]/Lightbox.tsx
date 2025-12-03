'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [next, prev, onClose]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-10 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 xl:right-6 xl:top-6 xl:hover:scale-125"
        >
          <FaTimes size={24} />
        </button>

        {/* Prev */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
        >
          <FaChevronLeft
            size={30}
            className="absolute bottom-[8vh] left-[30vw] z-50 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition xl:left-6 xl:top-1/2 xl:hover:scale-125"
          />
        </button>

        {/* Next */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
        >
          <FaChevronRight
            size={30}
            className="absolute bottom-[8vh] right-[30vw] z-50 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition xl:right-6 xl:top-1/2 xl:hover:scale-125"
          />
        </button>

        <motion.div
          key={index}
          initial={{ opacity: 0, x: 150 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -150 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
          className="pointer-events-none relative z-0 h-screen w-screen" // <- thêm pointer-events-none
        >
          <Image src={images[index]} alt={`Hình ${index + 1}`} fill style={{ objectFit: 'contain' }} sizes="100vw" />
        </motion.div>

        {/* Counter + progress */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 space-y-3 text-center text-white">
          <div className="rounded-full bg-white/10 px-6 py-2 text-lg backdrop-blur-xl">
            {index + 1} / {images.length}
          </div>

          <div className="h-1 w-64 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full bg-white" animate={{ width: `${((index + 1) / images.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
