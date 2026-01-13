'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Lightbox } from './Lightbox';

export function PropertyGallery({ images }: { images: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const isSingle = images.length === 1;

  const visible = showAll ? images : images.slice(0, 5);

  const openBox = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      <section className="">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={isSingle ? 'h-[70vh]' : 'grid h-[70vh] grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}
        >
          {visible.map((src, index) => (
            <motion.div
              key={index}
              onClick={() => openBox(index)}
              className={
                isSingle
                  ? 'relative h-full w-full cursor-pointer overflow-hidden rounded-md'
                  : `group relative cursor-pointer overflow-hidden rounded-md ${index === 0 ? 'col-span-1 row-span-2 xl:col-span-3 xl:row-span-2' : ''}`
              }
            >
              <Image
                src={src}
                alt={`image-${index}`}
                fill
                sizes="100vw"
                priority={index === 0}
                className="rounded-md border border-primary-lighter object-cover transition-transform duration-500 hover:scale-105"
              />

              {!isSingle && (
                <>
                  <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />
                  <p className="absolute bottom-4 left-4 text-sm text-white opacity-0 group-hover:opacity-100">Nhấn để xem chi tiết</p>
                </>
              )}

              {/* Show more */}
              {index === 4 && !showAll && images.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAll(true);
                    }}
                    className="rounded-xl bg-white/10 px-4 py-2 text-3xl font-bold text-white backdrop-blur-md"
                  >
                    +{images.length - 5}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* {!showAll && images.length > 5 && (
          <div className="mt-2 text-end">
            <button
              onClick={() => setShowAll(true)}
              className="w-full rounded-lg border border-dashed border-primary bg-white p-1 font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Xem tất cả {images.length} ảnh
            </button>
          </div>
        )} */}
      </section>
      <AnimatePresence>{open && <Lightbox images={images} initialIndex={index} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
