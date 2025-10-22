'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-daisyui';

interface AreaModalProps {
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function AreaModal({ onSelect, onClose }: AreaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);

  const quickSelect = [
    'Tất cả',
    'Dưới 20m²',
    '20m² - 30m²',
    '30m² - 40m²',
    '40m² - 60m²',
    '60m² - 80m²',
    '80m² - 100m²',
    'Trên 100m²',
    'Không xác định',
  ];

  // ESC để đóng modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Click ra ngoài để đóng
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const handleConfirm = () => {
    if (min === 0 && max === 100) onSelect('Tất cả');
    else onSelect(`Từ ${min} - ${max}m²`);
  };

  // Xử lý range mượt
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), max - 1);
    setMin(val);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), min + 1);
    setMax(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl transition-all">
        <h3 className="mb-3 text-center text-base font-semibold text-gray-800">Diện tích</h3>

        <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
          <span>Từ {min} m²</span>
          <span>Đến {max} m²</span>
        </div>

        <div className="relative mb-4 h-2 w-full rounded bg-gray-200">
          <input
            type="range"
            min={0}
            max={100}
            value={min}
            onChange={handleMinChange}
            className="absolute z-20 h-2 w-full cursor-pointer appearance-none bg-transparent"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={max}
            onChange={handleMaxChange}
            className="absolute z-30 h-2 w-full cursor-pointer appearance-none bg-transparent"
          />
          <div
            className="absolute top-0 h-2 rounded bg-blue-500 transition-all"
            style={{
              left: `${(min / 100) * 100}%`,
              right: `${100 - (max / 100) * 100}%`,
            }}
          />
        </div>

        <p className="mb-1 text-xs font-medium text-gray-500">Chọn nhanh</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {quickSelect.map((item) => (
            <Button key={item} size="sm" className="justify-center text-xs" onClick={() => onSelect(item)}>
              {item}
            </Button>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <Button size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button size="sm" color="primary" onClick={handleConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
