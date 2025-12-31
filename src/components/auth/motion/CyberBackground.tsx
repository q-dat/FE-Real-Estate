'use client';
import { motion } from 'framer-motion';

export const CyberBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030014]">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Orbs / Aurora */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[128px]"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/20 blur-[128px]"
      />
    </div>
  );
};
