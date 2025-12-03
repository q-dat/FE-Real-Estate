'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Lightbox } from './Lightbox';

export function PropertyGallery({ images }: { images: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const visible = showAll ? images : images.slice(0, 5);

  const openBox = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      <section className="my-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {visible.map((src, index) => (
            <motion.div
              key={index}
              onClick={() => openBox(index)}
              whileHover={{ scale: 1 }}
              className={`relative cursor-pointer overflow-hidden rounded-lg ${
                index === 0 ? 'col-span-1 row-span-2 xl:col-span-3 xl:row-span-2' : ''
              }`}
            >
              <Image
                src={src}
                alt={`${index}`}
                width={800}
                height={600}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100" />

              <p className="absolute bottom-4 left-4 text-sm text-white opacity-0 group-hover:opacity-100">Nhấn để xem chi tiết</p>

              {/* Show More Button trên ảnh cuối */}
              {index === 4 && !showAll && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAll(true);
                    }}
                    className="rounded-xl bg-white/10 px-6 py-4 text-3xl font-bold text-white backdrop-blur-md"
                  >
                    +{images.length - 5}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {!showAll && images.length > 5 && (
          <div className="mt-6 text-center">
            <button onClick={() => setShowAll(true)} className="rounded-lg bg-black px-6 py-3 text-white transition hover:scale-105">
              Xem tất cả {images.length} ảnh
            </button>
          </div>
        )}
      </section>
      <AnimatePresence>{open && <Lightbox images={images} initialIndex={index} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
