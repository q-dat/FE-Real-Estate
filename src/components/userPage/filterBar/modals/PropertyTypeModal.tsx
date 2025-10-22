'use client';
import React, { useRef, useEffect } from 'react';
import { Button } from 'react-daisyui';
import { BaseModalProps } from './types';

export default function PropertyTypeModal({ onClose, onSelect }: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const types = ['Tất cả', 'Cho thuê phòng trọ', 'Căn hộ cho thuê', 'Nhà nguyên căn', 'Thuê mặt bằng', 'Mua bán nhà đất'];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-center text-base font-semibold text-gray-800">Chọn loại bất động sản</h3>
        <div className="grid grid-cols-2 gap-2">
          {types.map((item) => (
            <Button key={item} size="sm" className="justify-center text-xs" onClick={() => onSelect?.(item)}>
              {item}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
