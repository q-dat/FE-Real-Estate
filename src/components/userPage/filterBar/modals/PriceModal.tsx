'use client';
import React, { useEffect, useRef, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import CancelBtn from '../../ui/btn/CancelBtn';
import SubmitBtn from '../../ui/btn/SubmitBtn';
import { PRICE_RANGES, PriceRange } from '@/constants/priceRanges.constants';

interface PriceOutput {
  label: string;
  priceFrom?: number;
  priceTo?: number;
}

interface PriceModalProps {
  onSelect: (data: PriceOutput) => void;
  onClose: () => void;
}

// Cấu hình giới hạn thanh trượt
const MIN_LIMIT = 0;
const MAX_LIMIT = 1000;

export default function PriceModal({ onSelect, onClose }: PriceModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [min, setMin] = useState(MIN_LIMIT);
  const [max, setMax] = useState(MAX_LIMIT);
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

  // LOGIC SLIDER
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), max - 10); // Giữ khoảng cách tối thiểu 10 đơn vị
    setMin(val);
    setSelected(null); // Bỏ highlight preset khi user tự kéo
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), min + 10);
    setMax(val);
    setSelected(null); // Bỏ highlight preset khi user tự kéo
  };

  const quickOptions = PRICE_RANGES;

  // LOGIC CHỌN NHANH (PRESET)
  const handleQuickSelect = (item: PriceRange) => {
    setSelected(item.label);

    // Nếu chọn "Tất cả" hoặc item không có min/max -> reset về full range
    const [minVal, maxVal] = item.sliderValue;
    const newMin = minVal !== undefined ? minVal : MIN_LIMIT;
    const newMax = maxVal !== undefined ? maxVal : MAX_LIMIT;

    setMin(newMin);
    setMax(newMax);
  };

  const handleReset = () => {
    setSelected('Tất cả');
    setMin(MIN_LIMIT);
    setMax(MAX_LIMIT);
  };

  // Tính toán phần trăm
  const getPercent = (value: number) => Math.round(((value - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100);

  // LOGIC ÁP DỤNG
  const handleApply = () => {
    let finalLabel = selected;
    const isFullRange = min === MIN_LIMIT && max === MAX_LIMIT;

    // Nếu không chọn preset (activeLabel rỗng), tự sinh label từ slider
    if (!finalLabel) {
      if (isFullRange) {
        finalLabel = 'Tất cả';
      } else if (min === MIN_LIMIT) {
        finalLabel = `Dưới ${max} triệu`;
      } else if (max === MAX_LIMIT) {
        finalLabel = `Trên ${min} triệu`;
      } else {
        finalLabel = `${min} - ${max} triệu`;
      }
    }

    // Xác định giá trị gửi đi
    // Nếu là "Tất cả" -> gửi undefined để BE không filter
    const isAll = finalLabel === 'Tất cả';

    onSelect({
      label: finalLabel,
      // Logic: nếu KHÔNG phải "Tất cả", GỬI min và max (kể cả khi min=0 hoặc max=1000).
      priceFrom: isAll ? undefined : min, // Sẽ là 0 nếu min=0 và KHÔNG phải "Tất cả"
      priceTo: isAll ? undefined : max, // Sẽ là 1000 nếu max=1000 và KHÔNG phải "Tất cả"
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999991] flex items-center justify-center bg-overlay px-2" onClick={handleClickOutside}>
      <div ref={modalRef} className="animate-in fade-in zoom-in w-full max-w-lg rounded-2xl bg-white shadow-xl transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-2">
          <h5 className="text-lg font-bold uppercase text-gray-800">KHOẢNG GIÁ</h5>
          <button onClick={onClose} className="btn btn-ghost btn-sm h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-2">
          {/* Hiển thị số liệu hiện tại */}
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-700">
            <span>Khoảng giá:</span>
            <div className="flex items-center font-bold text-blue-600">
              {min === MIN_LIMIT && max === MAX_LIMIT ? (
                'Tất cả'
              ) : (
                <>
                  {min} - {max === MAX_LIMIT ? '1000+' : max}
                </>
              )}
            </div>
          </div>

          {/* SLIDER PRICE (Tới 1000) */}
          <div className="relative mb-8 h-2 w-full select-none rounded bg-gray-200">
            {/* Thanh màu xanh ở giữa */}
            <div
              className="absolute top-0 h-2 rounded bg-blue-600"
              style={{
                left: `${getPercent(min)}%`,
                right: `${100 - getPercent(max)}%`,
              }}
            ></div>

            {/* Input Slider Min */}
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step={10}
              value={min}
              onChange={handleMinChange}
              className="pointer-events-none absolute z-20 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] [&::-webkit-slider-thumb]:hover:scale-110"
            />

            {/* Input Slider Max */}
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step={10}
              value={max}
              onChange={handleMaxChange}
              className="pointer-events-none absolute z-30 h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] [&::-webkit-slider-thumb]:hover:scale-110"
            />

            {/* Chỉ số dưới slider */}
            <div className="absolute top-4 flex w-full justify-between text-xs font-medium text-gray-400">
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000+</span>
            </div>
          </div>

          {/* QUICK SELECT GRID */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-gray-700">Chọn nhanh</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {quickOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => handleQuickSelect(opt)}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-all ${
                    selected === opt.label
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-2xl border-t bg-primary px-5 py-4">
          <button className="flex items-center gap-1 text-sm font-medium text-white transition-colors xl:hover:scale-105" onClick={handleReset}>
            <RefreshCcw size={14} className="mb-[1px]" /> Đặt lại
          </button>
          <div className="flex gap-3">
            <CancelBtn value="Huỷ" onClick={onClose} />
            <SubmitBtn value="Áp dụng" onClick={handleApply} />
          </div>
        </div>
      </div>
    </div>
  );
}
