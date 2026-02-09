'use client';
import { crawlerService } from '@/services/crawler/crawler.service';
import { postService } from '@/services/post/post.service';
import { useEffect, useState } from 'react';

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
      setMessage(error.message || 'Không thể khởi động crawler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-2 xl:p-6">
      <h1 className="text-xl font-semibold">Crawler bản tin</h1>

      {/* Trạng thái */}
      <div className="space-y-2 rounded-xl border bg-base-100 p-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Trạng thái</span>
          <span className={`text-sm font-semibold ${running ? 'text-warning' : 'text-success'}`}>{running ? 'Đang chạy' : 'Sẵn sàng'}</span>
        </div>

        <div className="text-sm text-neutral-content">
          Tổng số blog hiện có: <span className="font-semibold">{loadingCount ? 'Đang tải...' : countBlog}</span>
        </div>
      </div>

      {/* Hành động */}
      <div className="space-y-3 rounded-xl border bg-base-100 p-2">
        <button className="btn btn-primary w-full xl:w-auto" disabled={running || loading} onClick={handleStart}>
          {running ? 'Crawler đang chạy' : 'Chạy crawler ngay'}
        </button>

        {message && <div className="text-sm text-neutral-content">{message}</div>}
      </div>

      {/* Gợi ý UX */}
      <div className="text-sm text-neutral-content">Crawler sẽ tự động bỏ qua bài đã tồn tại và tạo danh mục nếu chưa có.</div>
    </div>
  );
}
