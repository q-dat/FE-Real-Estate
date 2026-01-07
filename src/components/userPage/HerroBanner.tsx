import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HerroBanner() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-neutral-900">
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
        alt="Hero"
        fill
        className="object-cover opacity-60"
        priority
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center text-white">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm font-light uppercase tracking-[0.5em]">
          Định nghĩa không gian sống
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-4xl font-extralight tracking-tighter xl:text-7xl"
        >
          Tìm thấy<span className="font-sans font-semibold italic">Tổ ấm</span> lý tưởng
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex w-full max-w-xl items-center bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur-md"
        >
          <input
            type="text"
            placeholder="Nhập khu vực, dự án hoặc từ khóa..."
            className="w-full bg-transparent px-6 py-4 text-sm outline-none placeholder:text-white/50"
          />
          <button className="bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-neutral-900 transition-colors hover:bg-primary hover:text-white">
            Tìm kiếm
          </button>
        </motion.div>
      </div>
    </section>
  );
}
