'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const EXPERIENCES = [
  {
    title: 'Sống giữa thiên nhiên',
    description: 'Không gian xanh, ánh sáng tự nhiên và sự yên tĩnh tuyệt đối.',
  },
  {
    title: 'Kết nối trung tâm',
    description: 'Vị trí chiến lược, di chuyển linh hoạt, nhịp sống hiện đại.',
  },
  {
    title: 'Riêng tư & tinh tế',
    description: 'Thiết kế tối giản, cộng đồng chọn lọc, an ninh cao.',
  },
];

export function LivingExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-neutral-950 py-28 xl:py-40">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900/40" />

      <motion.div style={{ x, opacity }} className="relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <span className="mb-4 block text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50">Phong cách sống</span>
          <h2 className="text-3xl font-light leading-tight text-white md:text-4xl xl:text-5xl">
            Không gian sống
            <br />
            phản chiếu con người bạn
          </h2>
        </div>

        {/* Experience cards */}
        <div className="grid gap-10 md:grid-cols-3">
          {EXPERIENCES.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.1,
              }}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:bg-white/10"
            >
              {/* Subtle highlight */}
              <div className="absolute inset-0 rounded-2xl opacity-0 ring-1 ring-white/20 transition-opacity duration-500 group-hover:opacity-100" />

              <h3 className="mb-4 text-xl font-light text-white">{item.title}</h3>

              <p className="text-sm leading-relaxed text-white/65">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
