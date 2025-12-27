'use client';
import React from 'react';

/**
 * Login Boot UI
 * Concept: Secure Authentication Gateway / Neural Auth Core
 * Style: Dark AI - Cyber Security - Enterprise Grade
 */
const LoginBootLoading: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020617] text-slate-200">
      {/* Background Noise + Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      </div>

      {/* Floating Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-full w-px animate-pulse bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="absolute left-2/4 top-0 h-full w-px animate-pulse bg-gradient-to-b from-transparent via-sky-500/20 to-transparent delay-200" />
        <div className="absolute left-3/4 top-0 h-full w-px animate-pulse bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-primary/70">
            Secure Authentication
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white">
            CMS <span className="text-primary">LOGIN</span>
          </h1>
        </div>

        {/* Auth Core */}
        <div className="relative mb-10 flex h-40 w-40 items-center justify-center">
          {/* Pulse Ring */}
          <div className="absolute inset-0 animate-ping rounded-full border border-primary/30" />
          <div className="absolute inset-4 animate-[spin_6s_linear_infinite] rounded-full border border-dashed border-primary/40" />

          {/* Core */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-md shadow-[0_0_40px_rgba(var(--p),0.35)]">
            <div className="h-8 w-8 animate-pulse rounded-md bg-primary" />
          </div>
        </div>

        {/* Terminal Status */}
        <div className="w-full space-y-4 rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">AUTH_GATE</span>
            <span className="text-primary">RUNNING</span>
          </div>

          <div className="space-y-1 text-slate-400">
            <p className="animate-pulse">› Initializing secure channel...</p>
            <p className="animate-pulse delay-200">› Verifying database cluster...</p>
            <p className="animate-pulse delay-500">› Preparing login service...</p>
          </div>

          {/* Progress */}
          <div className="relative mt-3 h-1 w-full overflow-hidden rounded bg-slate-800">
            <div className="absolute inset-0 animate-[auth-progress_1.6s_linear_infinite] bg-primary" />
          </div>
        </div>

        {/* Hint */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          Hệ thống đang khởi động · Vui lòng chờ trong giây lát
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 flex gap-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
        <span>Encrypted</span>
        <span>Zero Trust</span>
        <span>High Availability</span>
      </div>

      <style jsx global>{`
        @keyframes auth-progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginBootLoading;
