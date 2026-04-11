'use client';
import { useEffect, useState } from 'react';
import { crawlerService } from '@/services/crawler/crawler.service';
import { postService } from '@/services/post/post.service';
import { FiActivity, FiDatabase, FiInfo, FiPlay, FiLoader } from 'react-icons/fi';

export default function AdminCrawlerPage() {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [countBlog, setCountBlog] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  const fetchBlogCount = async () => {
    setLoadingCount(true);
    try {
      const posts = await postService.getAll();
      setCountBlog(posts.length);
    } catch (error) {
      setCountBlog(0);
    } finally {
      setLoadingCount(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const status = await crawlerService.getStatus();
      setRunning(status.running);
    } catch (error: any) {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchBlogCount();
    const timer = setInterval(fetchStatus, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await crawlerService.start();
      setMessage(res.message);
      setRunning(true);
    } catch (error: any) {
      console.error('[CRAWLER] Lỗi khi khởi động crawler', error);
      setMessage(error.message || 'Hệ thống từ chối khởi động crawler.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FCFCFC]">
      {/* HEADER: Minimalist Editorial */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-neutral-200/60 bg-[#FCFCFC]/80 px-4 pb-5 pt-6 backdrop-blur-xl sm:px-6 xl:px-8">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">System Operations</span>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 xl:text-3xl">Crawler & Đồng bộ dữ liệu</h1>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="mx-auto mt-4 max-w-5xl p-4 sm:p-6 xl:p-8">
        {/* GRID WIDGETS */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Status Widget */}
          <div className="relative flex flex-col rounded-sm border border-neutral-200/60 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">System Status</span>
              <FiActivity size={16} className="text-neutral-400" />
            </div>

            <div className="mt-auto flex items-end gap-3">
              <div className="relative flex h-4 w-4 items-center justify-center">
                {running ? (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  </>
                ) : (
                  <>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </>
                )}
              </div>
              <div>
                <p className="text-2xl font-light leading-none tracking-tight text-neutral-900">{running ? 'Đang hoạt động' : 'Sẵn sàng'}</p>
                <p className="mt-1 text-[11px] font-medium text-neutral-500">
                  {running ? 'Hệ thống đang thu thập dữ liệu' : 'Máy chủ rảnh, có thể bắt đầu phiên mới'}
                </p>
              </div>
            </div>
          </div>

          {/* Database Widget */}
          <div className="relative flex flex-col rounded-sm border border-neutral-200/60 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Indexed Articles</span>
              <FiDatabase size={16} className="text-neutral-400" />
            </div>

            <div className="mt-auto">
              {loadingCount ? (
                <div className="flex items-center gap-2 text-neutral-400">
                  <FiLoader className="animate-spin" />
                  <span className="text-sm font-medium">Đang đếm dữ liệu...</span>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-light leading-none tracking-tighter text-neutral-900">{countBlog}</span>
                  <span className="pb-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">Bản tin</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTION CONTROL */}
        <div className="rounded-sm border border-neutral-200/60 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="mb-2 text-lg font-medium text-neutral-900">Trình điều khiển Crawler</h2>
              <p className="max-w-lg text-[13px] leading-relaxed text-neutral-500">
                Khởi động tiến trình cào dữ liệu từ các nguồn định trước. Hệ thống sẽ tự động quét, bỏ qua các bài đã tồn tại và tự tạo danh mục mới
                nếu cần thiết.
              </p>
            </div>

            <div className="w-full shrink-0 md:w-auto">
              <button
                disabled={running || loading}
                onClick={handleStart}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-none bg-neutral-900 px-6 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 md:w-56"
              >
                {loading || running ? (
                  <FiLoader size={16} className="animate-spin" />
                ) : (
                  <FiPlay size={16} className="transition-transform group-hover:scale-110" />
                )}
                <span>{running ? 'Đang thực thi...' : 'Khởi chạy Scanner'}</span>
              </button>
            </div>
          </div>

          {/* MESSAGE LOG */}
          {message && (
            <div className="mt-6 border-t border-neutral-100 pt-6">
              <div className="flex items-start gap-3 rounded-sm border border-neutral-200/60 bg-neutral-50 p-4">
                <FiInfo size={16} className="mt-0.5 shrink-0 text-neutral-500" />
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Response</span>
                  <p className="font-mono text-[13px] leading-relaxed text-neutral-700">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
