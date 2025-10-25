'use client';

import React, { useEffect, useRef, useState } from 'react';
import CancelBtn from '../../ui/btn/CancelBtn';
import SubmitBtn from '../../ui/btn/SubmitBtn';

interface AreaModalProps {
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function AreaModal({ onSelect, onClose }: AreaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(200);
  const [selected, setSelected] = useState<string>('Tất cả');

  const [tempMin, setTempMin] = useState(min);
  const [tempMax, setTempMax] = useState(max);
  const [tempSelected, setTempSelected] = useState(selected);

  const quickSelect = [
    { label: 'Tất cả', value: [0, 200] },
    { label: 'Dưới 20m²', value: [0, 20] },
    { label: '20m² - 30m²', value: [20, 30] },
    { label: '30m² - 40m²', value: [30, 40] },
    { label: '40m² - 60m²', value: [40, 60] },
    { label: '60m² - 80m²', value: [60, 80] },
    { label: '80m² - 100m²', value: [80, 100] },
    { label: 'Trên 100m²', value: [100, 200] },
    { label: 'Không xác định', value: [0, 0] },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), tempMax - 1);
    setTempMin(val);
    setTempSelected('');
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), tempMin + 1);
    setTempMax(val);
    setTempSelected('');
  };

  const handleQuickSelect = (item: (typeof quickSelect)[0]) => {
    setTempSelected(item.label);
    setTempMin(item.value[0]);
    setTempMax(item.value[1]);
  };

  const handleReset = () => {
    setTempSelected('Tất cả');
    setTempMin(0);
    setTempMax(200);
  };

  const handleApply = () => {
    setMin(tempMin);
    setMax(tempMax);
    setSelected(tempSelected);
    if (tempSelected) onSelect(tempSelected);
    else onSelect(`Từ ${tempMin} - ${tempMax} m²`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-lg rounded-2xl bg-white shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h5 className="text-lg font-semibold text-gray-800">DIỆN TÍCH</h5>
          <button onClick={onClose} className="btn btn-ghost btn-sm text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="mb-3 text-sm text-gray-700">
            Từ <span className="font-semibold text-blue-600">{tempMin}</span> - <span className="font-semibold text-blue-600">{tempMax}</span> m²
          </div>

          {/* Slider */}
          <div className="relative mb-3 h-2 w-full rounded bg-gray-200">
            <input
              type="range"
              min={0}
              max={200}
              value={tempMin}
              onChange={handleMinChange}
              className="absolute z-20 h-2 w-full cursor-pointer appearance-none bg-transparent"
            />
            <input
              type="range"
              min={0}
              max={200}
              value={tempMax}
              onChange={handleMaxChange}
              className="absolute z-30 h-2 w-full cursor-pointer appearance-none bg-transparent"
            />
            <div
              className="absolute top-0 h-2 rounded bg-blue-500 transition-all"
              style={{ left: `${(tempMin / 200) * 100}%`, right: `${100 - (tempMax / 200) * 100}%` }}
            />
          </div>

          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>200 m²+</span>
          </div>

          {/* Quick select */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Chọn nhanh</p>
            <ul className="grid grid-cols-2 gap-2">
              {quickSelect.map((opt) => (
                <li
                  key={opt.label}
                  onClick={() => handleQuickSelect(opt)}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-center text-xs transition-all ${
                    tempSelected === opt.label
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
