'use client';

import React from 'react';

/**
 * High-End Admin Booting UI
 * Style: Cyber-Enterprise / Modern Glassmorphism
 * Optimized for Big Data Systems & Large Scale Projects
 */
const AdminBootLoading: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#020617] antialiased">
      {/* 1. Kỹ thuật Grid Background - Tạo cảm giác dữ liệu lớn */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
      </div>

      {/* 2. Hiệu ứng Aura mờ ảo */}
      <div className="absolute h-[500px] w-[500px] animate-pulse rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative z-10 flex w-full flex-col items-center px-6">
        {/* Brand Header với hiệu ứng Tracking */}
        <div className="mb-12 text-center">
          <h1 className="animate-tracking-in-expand text-2xl font-black tracking-[0.3em] text-white xl:text-6xl">
            NGUONNHA<span className="italic text-primary">GIARE</span>
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary/60">System Protocol v1.0</span>
            <span className="h-px w-8 bg-slate-800" />
          </div>
        </div>

        {/* Central Core - Khối nạp dữ liệu chính */}
        <div className="relative mb-16 h-48 w-48 xl:h-64 xl:w-64">
          {/* Vòng xoay Outer */}
          <div className="absolute inset-0 animate-[spin_10s_linear_infinite] rounded-full border-2 border-dashed border-primary/20" />
          {/* Vòng xoay Inner */}
          <div className="absolute inset-4 animate-[spin_4s_linear_infinite_reverse] rounded-full border border-primary/40" />

          {/* Tâm điểm - Hiệu ứng Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 animate-pulse rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/50 bg-slate-900/80 shadow-[0_0_30px_rgba(var(--p),0.3)] backdrop-blur-md">
              <div className="h-8 w-8 animate-bounce rounded-lg bg-primary" />
            </div>
          </div>
        </div>

        {/* Status Bar & Info */}
        <div className="w-full max-w-sm space-y-8 xl:max-w-md">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="animate-pulse">Đang tải cấu trúc dữ liệu...</span>
              <span className="text-primary">99%</span>
            </div>
            {/* Thanh Progress cực ngầu với hiệu ứng Scanline */}
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="absolute inset-0 h-full w-full animate-[progress-scan_2s_infinite] bg-primary shadow-[0_0_15px_rgba(var(--p),1)]" />
            </div>
          </div>

          {/* Support Card - Quốc Đạt - Thiết kế Glassmorphism tối thượng */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md transition-all hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 font-black text-white shadow-lg">
                  QĐ
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#020617] bg-green-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-slate-200">Hỗ trợ kĩ thuật: Quốc Đạt</h3>
                  <p className="text-xs text-slate-500">Hệ thống đang được tối ưu hóa</p>
                </div>
              </div>
              <a
                href="https://zalo.me/0333133050"
                target="_blank"
                className="rounded-lg bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-all hover:bg-primary hover:text-white"
              >
                Liên hệ Zalo
              </a>
            </div>
            {/* Đường line chạy dọc khi hover */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="absolute bottom-10 flex w-full flex-col items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 xl:flex-row xl:gap-5">
        <span>Cloud Computing</span>
        <span>Secure Auth</span>
        <span>Node Cluster</span>
      </div>

      <style jsx global>{`
        @keyframes progress-scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes tracking-in-expand {
          0% {
            letter-spacing: -0.5em;
            opacity: 0;
          }
          40% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-tracking-in-expand {
          animation: tracking-in-expand 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) both;
        }
      `}</style>
    </div>
  );
};

export default AdminBootLoading;
