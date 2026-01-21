'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const MAX_SCALE_LEVEL = 10;

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const [scaleLevel, setScaleLevel] = useState<number>(1); // 1 -> 10
  const scale = scaleLevel;

  const [rotation, setRotation] = useState<number>(0); // deg
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const resetTransform = useCallback(() => {
    setScaleLevel(1);
    setRotation(0);
    setPos({ x: 0, y: 0 });
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const handleZoomClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const nextLevel = scaleLevel < MAX_SCALE_LEVEL ? scaleLevel + 1 : 1;

      if (nextLevel === 1) {
        resetTransform();
        return;
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const ratio = nextLevel / scaleLevel;

      setPos((prev) => ({
        x: prev.x - (cx - centerX) * (ratio - 1),
        y: prev.y - (cy - centerY) * (ratio - 1),
      }));

      setScaleLevel(nextLevel);
    },
    [scaleLevel, resetTransform]
  );

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
      if (e.key === 'r') setRotation((r) => (r + 90) % 360);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [next, prev, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/60 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-2 top-10 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 xl:right-6 xl:top-6 xl:hover:scale-125"
        >
          <FaTimes size={24} />
        </button>

        {/* Image */}
        <motion.div
          key={index}
          ref={containerRef}
          initial={{ opacity: 0, x: 120 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -120 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="relative h-screen w-screen overflow-hidden"
        >
          <motion.div
            onClick={handleZoomClick}
            drag={scale > 1}
            dragElastic={0.08}
            animate={{
              scale,
              rotate: rotation,
              x: pos.x,
              y: pos.y,
            }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            className="relative h-full w-full cursor-zoom-in"
          >
            <Image src={images[index]} alt={`Hình ${index + 1}`} fill sizes="100vw" className="object-contain" priority />
          </motion.div>
        </motion.div>

        {/* Prev */}
        <button onClick={prev}>
          <FaChevronLeft
            size={30}
            className="absolute bottom-2 left-2 z-50 h-12 w-12 rounded-full bg-white/10 p-2 text-white transition xl:left-6 xl:top-1/2 xl:-translate-y-1/2 xl:hover:scale-125"
          />
        </button>

        {/* Next */}
        {/* Mobile */}
        <button onClick={next} className="xl:pointer-events-none xl:hidden">
          <FaChevronRight size={30} className="absolute bottom-2 left-[70px] z-50 h-12 w-12 rounded-full bg-white/10 p-2 text-white transition" />
        </button>
        {/* Desktop */}
        <button onClick={next} className="hidden xl:block">
          <FaChevronRight
            size={30}
            className="absolute z-50 h-12 w-12 rounded-full bg-white/10 p-2 text-white transition xl:right-6 xl:top-1/2 xl:-translate-y-1/2 xl:hover:scale-125"
          />
        </button>
        {/* Control Panel - Bottom Right */}
        <div className="absolute bottom-2 right-2 z-50 flex items-center gap-2 rounded-xl bg-white/10 p-2 text-xs font-semibold text-white backdrop-blur-xl xl:right-6">
          <button
            onClick={() => setScaleLevel((v) => Math.min(v + 1, MAX_SCALE_LEVEL))}
            className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20"
          >
            +
          </button>

          <div className="min-w-[36px] text-center">{scaleLevel}x</div>

          <button onClick={() => setScaleLevel((v) => Math.max(v - 1, 1))} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">
            -
          </button>

          <button onClick={() => setRotation((r) => (r + 90) % 360)} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">
            ⟳ Xoay (R)
          </button>

          <button onClick={resetTransform} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">
            reset
          </button>
        </div>

        {/* Counter */}
        <div className="pointer-events-none fixed bottom-20 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white xl:bottom-2">
          {index + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
