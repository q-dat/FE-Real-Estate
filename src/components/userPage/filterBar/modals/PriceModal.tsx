'use client';
import React, { useEffect, useRef, useState } from 'react';
import CancelBtn from '../../ui/btn/CancelBtn';
import SubmitBtn from '../../ui/btn/SubmitBtn';
import { PRICE_RANGES, PriceRange } from '@/constants/priceRanges';

interface PriceModalProps {
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function PriceModal({ onSelect, onClose }: PriceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(20);
  const [selected, setSelected] = useState<string | null>('Tất cả');

  // Đóng khi nhấn ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Đóng khi click ngoài modal
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), max - 0.5);
    setMin(val);
    setSelected(null);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), min + 0.5);
    setMax(val);
    setSelected(null);
  };

  const quickOptions = PRICE_RANGES;

  const handleQuickSelect = (item: PriceRange) => {
    setSelected(item.label);
    const [minVal, maxVal] = item.sliderValue;
    setMin(minVal);
    setMax(maxVal === 100 ? 20 : maxVal); // nếu >20 thì hiển thị 20+
  };

  const handleReset = () => {
    setSelected('Tất cả');
    setMin(0);
    setMax(20);
  };

  const handleApply = () => {
    if (selected) onSelect(selected);
    else onSelect(`Từ ${min} - ${max} triệu+`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-lg rounded-2xl bg-white shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h5 className="text-lg font-semibold text-gray-800">KHOẢNG GIÁ</h5>
          <button onClick={onClose} className="btn btn-ghost btn-sm text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="mb-3 text-sm text-gray-700">
            Từ <span className="font-semibold text-blue-600">{min}</span> - <span className="font-semibold text-blue-600">{max}</span> triệu+
          </div>

          {/* Slider */}
          <div className="relative mb-3 h-2 w-full rounded bg-gray-200">
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={min}
              onChange={handleMinChange}
              className="absolute z-20 h-2 w-full cursor-pointer appearance-none bg-transparent"
            />
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={max}
              onChange={handleMaxChange}
              className="absolute z-30 h-2 w-full cursor-pointer appearance-none bg-transparent"
            />
            <div
              className="absolute top-0 h-2 rounded bg-blue-500 transition-all"
              style={{
                left: `${(min / 20) * 100}%`,
                right: `${100 - (max / 20) * 100}%`,
              }}
            />
          </div>

          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>20 triệu+</span>
          </div>

          {/* Quick select */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Chọn nhanh</p>
            <ul className="grid grid-cols-2 gap-2">
              {quickOptions.map((opt) => (
                <li
                  key={opt.label}
                  onClick={() => handleQuickSelect(opt)}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-center text-xs transition-all ${
                    selected === opt.label
                      ? 'border-blue-500 bg-blue-50 font-medium text-blue-600'
                      : 'border-gray-200 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <button className="text-sm text-blue-600 hover:underline" onClick={handleReset}>
            Đặt lại
          </button>
          <div className="flex gap-2">
            <CancelBtn value="Huỷ" onClick={onClose} />
            <SubmitBtn value="Áp dụng" onClick={handleApply} />
          </div>
        </div>
      </div>
    </div>
  );
}
