'use client';
import React, { useEffect, useRef } from 'react';
import CancelBtn from '../../ui/btn/CancelBtn';
import SubmitBtn from '../../ui/btn/SubmitBtn';

interface FilterResetModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function FilterResetModal({ onClose, onConfirm }: FilterResetModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Đóng modal khi click ra ngoài
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all">
        <h3 className="mb-3 text-center text-base font-semibold text-gray-800">Đặt lại bộ lọc</h3>

        <p className="mb-5 text-center text-sm leading-relaxed text-gray-600">
          Bạn có chắc muốn <span className="font-semibold text-red-500">xóa toàn bộ lựa chọn hiện tại</span> không?
        </p>

        <div className="flex justify-center gap-2">
          <CancelBtn value="Đóng" onClick={onClose} />
          <SubmitBtn
            value="Đồng ý"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
