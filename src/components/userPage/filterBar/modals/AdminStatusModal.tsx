'use client';
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import SubmitBtn from '../../ui/btn/SubmitBtn';
import { POST_TYPES } from '@/constants/filterOptions';

interface AdminFilterOutput {
  status?: string;
  postType?: string;
}

interface AdminStatusModalProps {
  initialStatus?: string;
  initialPostType?: string;
  onSelect: (data: AdminFilterOutput) => void;
  onClose: () => void;
}

export default function AdminStatusModal({ initialStatus, initialPostType, onSelect, onClose }: AdminStatusModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [postType, setPostType] = useState<string | undefined>(initialPostType);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const handleApply = () => {
    onSelect({ status, postType });
    onClose();
  };

  const handleClear = () => {
    setStatus(undefined);
    setPostType(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={handleClickOutside}>
      <div ref={modalRef} className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800 px-4 py-3">
          <h5 className="text-sm font-bold uppercase tracking-wider text-white">Trạng thái tin đăng</h5>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Status Select */}
          {/* <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-500">Trạng thái duyệt</label>
            <div className="grid grid-cols-2 gap-2">
              {POST_STATUS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatus(status === item.value ? undefined : item.value)}
                  className={`relative flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    status === item.value
                      ? `${item.color} border-transparent ring-1 ring-current ring-offset-1`
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status === item.value && <Check size={14} />}
                  {item.label}
                </button>
              ))}
            </div>
          </div> */}

          {/* Post Type Select */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-500">Loại gói tin</label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((item) => {
                const isActive = postType === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setPostType(isActive ? undefined : item.value)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? 'scale-105 transform border-purple-600 bg-purple-600 text-white shadow-md'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-gray-50 px-5 py-3">
          <button onClick={handleClear} className="text-xs font-semibold text-red-500 hover:text-red-700">
            Xoá chọn
          </button>
          <div className="w-32">
            <SubmitBtn value="Lọc ngay" onClick={handleApply} />
          </div>
        </div>
      </div>
    </div>
  );
}
