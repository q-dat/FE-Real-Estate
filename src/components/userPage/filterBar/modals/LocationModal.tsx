'use client';
import React, { useRef, useEffect } from 'react';
import { Button, Input } from 'react-daisyui';
import { BaseModalProps } from './types';

export default function LocationModal({ onClose, onSelect }: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const locations = ['Hồ Chí Minh'];

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
        <h3 className="mb-3 text-center text-base font-semibold text-gray-800">Khu vực</h3>
        <Input placeholder="Nhập tên tỉnh / thành phố" className="mb-4" />
        <div className="grid grid-cols-2 gap-2">
          {locations.map((item) => (
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
