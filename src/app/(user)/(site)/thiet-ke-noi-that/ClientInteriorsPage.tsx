'use client';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCouch, FaCheckCircle, FaLayerGroup } from 'react-icons/fa';
import { IInterior } from '@/types/interiors/interiors.types';
import Link from 'next/link';

interface Props {
  interiorSamples: IInterior[];
  interiorFinished: IInterior[];
}

// Tab Button Component
const TabButton = ({
  isActive,
  onClick,
  label,
  count,
  icon,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 sm:text-base ${
      isActive ? 'text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    {/* Active Background Animation */}
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 rounded-full bg-slate-900 shadow-lg"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}

    {/* Content */}
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
      <span
        className={`ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}
      >
        {count}
      </span>
    </span>
  </button>
);

// Interior Card Component
const InteriorCard = ({ item, idx }: { item: IInterior; idx: number }) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-md border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <Link href={`/nt/${item._id}`} target="_blank">
        {/* Main Image  */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <Image
            src={item.images}
            alt={item.name}
            width={400}
            height={400}
            className="h-auto w-full object-contain transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          {/* Overlay gradient text on image bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col p-2">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-primary xl:text-xl">{item.name}</h3>

          {item.description && <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-500">{item.description}</p>}

          {/* Thumbnails Gallery - Compact & Clean */}
          {item.thumbnails && item.thumbnails.length > 0 && (
            <div className="mt-auto border-t border-slate-50 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Chi tiết không gian</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {item.thumbnails.slice(0, 4).map((thumb, tIdx) => (
                  <div
                    key={tIdx}
                    className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-all"
                  >
                    <Image src={thumb} alt="thumbnail" fill className="object-cover" />
                  </div>
                ))}
                {item.thumbnails.length > 4 && (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                    +{item.thumbnails.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          <div
            dangerouslySetInnerHTML={{
              __html: item?.content || '',
            }}
            className="text-base font-light text-default"
          ></div>
        </div>
      </Link>
    </motion.article>
  );
};

export default function ClientInteriorsPage({ interiorSamples, interiorFinished }: Props) {
  const [activeTab, setActiveTab] = useState<'samples' | 'finished'>('samples');

  // Tính toán data hiển thị
  const displayData = useMemo(() => {
    return activeTab === 'samples' ? interiorSamples : interiorFinished;
  }, [activeTab, interiorSamples, interiorFinished]);

  return (
    <div className="px-2 pt-mobile-padding-top xl:px-desktop-padding xl:pt-desktop-padding-top">
      {/*  Header Section: Intro & Tabs */}
      <div className="text-center leading-relaxed xl:mt-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 xl:text-4xl">Không gian Nội thất</h1>
          <p className="w-full text-slate-500">Khám phá bộ sưu tập ý tưởng thiết kế độc đáo và các dự án thực tế chúng tôi đã hoàn thiện.</p>
        </motion.div>

        {/* The Cool Tab Switcher */}
        <div className="my-2 inline-flex rounded-full bg-white p-1 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
          <TabButton
            isActive={activeTab === 'samples'}
            onClick={() => setActiveTab('samples')}
            label="Concept Mẫu"
            count={interiorSamples.length}
            icon={<FaLayerGroup />}
          />
          <TabButton
            isActive={activeTab === 'finished'}
            onClick={() => setActiveTab('finished')}
            label="Dự án Thực tế"
            count={interiorFinished.length}
            icon={<FaCheckCircle />}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Key changes trigger animation
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Empty State */}
            {displayData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FaCouch size={48} className="mb-4 opacity-20" />
                <p>Chưa có dữ liệu cho mục này.</p>
              </div>
            ) : (
              // Grid Layout
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 2xl:grid-cols-5">
                {displayData.map((item, index) => (
                  <InteriorCard key={item._id} item={item} idx={index} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
