'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '26%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[92vh] w-full overflow-hidden bg-neutral-950 xl:h-[98vh]">
      {/* Background */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
          alt="Luxury space"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-neutral-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity: contentOpacity }} className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <span className="mb-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">Curated Living Spaces</span>

        <h1 className="mb-10 max-w-4xl text-4xl font-light leading-tight text-white md:text-5xl xl:text-7xl">
          Định vị <span className="italic text-white/90">đẳng cấp</span>
          <br className="hidden md:block" />
          trong từng không gian sống
        </h1>

        <div className="w-full max-w-xl">
          <div className="flex items-center rounded-full bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur-xl transition-all focus-within:bg-white/20 focus-within:ring-white/40">
            <input
              placeholder="Tìm kiếm khu vực, dự án, phong cách sống"
              className="h-12 flex-1 bg-transparent px-5 text-sm font-light text-white placeholder:text-white/60 focus:outline-none"
            />
            <button className="h-12 rounded-full bg-white px-8 text-[11px] font-semibold uppercase tracking-widest text-neutral-900 transition hover:bg-neutral-100">
              Khám phá
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ambient vignette */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_65%)]" />
    </section>
  );
}
