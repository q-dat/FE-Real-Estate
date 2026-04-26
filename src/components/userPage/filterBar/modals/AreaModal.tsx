'use client';
import React, { useEffect, useRef, useState } from 'react';
import CancelBtn from '../../ui/btn/CancelBtn';
import SubmitBtn from '../../ui/btn/SubmitBtn';
import { AREA_RANGES, AreaRange } from '@/constants/areaRanges.constants';
import { Input } from 'react-daisyui';
import { RefreshCcw } from 'lucide-react';

interface AreaOutput {
  label: string;
  from?: number;
  to?: number;
  frontageWidth?: number;
  lotDepth?: number;
  backSize?: number;
}

interface AreaModalProps {
  initialFrontage?: number;
  initialDepth?: number;
  initialBack?: number;
  onSelect: (data: AreaOutput) => void;
  onClose: () => void;
}

const MIN_LIMIT = 0;
const MAX_LIMIT = 1000;

export default function AreaModal({ initialFrontage, initialDepth, initialBack, onSelect, onClose }: AreaModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  /* State cho Area Range */
  const [tempMin, setTempMin] = useState<number>(MIN_LIMIT);
  const [tempMax, setTempMax] = useState<number>(MAX_LIMIT);
  const [activeLabel, setActiveLabel] = useState<string>('Tất cả');

  /* State cho Kích thước chính xác (Sử dụng number | '' để kiểm soát Input an toàn) */
  const [frontageWidth, setFrontageWidth] = useState<number | ''>(initialFrontage ?? '');
  const [lotDepth, setLotDepth] = useState<number | ''>(initialDepth ?? '');
  const [backSize, setBackSize] = useState<number | ''>(initialBack ?? '');

  // Đóng Modal khi nhấn ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Đóng Modal khi click ra ngoài vùng nội dung
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  // Logic Slider
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), tempMax - 10);
    setTempMin(val);
    setActiveLabel('');
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), tempMin + 10);
    setTempMax(val);
    setActiveLabel('');
  };

  // Logic Chọn Nhanh Khoảng Diện Tích
  const handleQuickSelect = (item: AreaRange) => {
    setActiveLabel(item.label);
    const newMin = item.min !== undefined ? item.min : MIN_LIMIT;
    const newMax = item.max !== undefined ? item.max : MAX_LIMIT;
    setTempMin(newMin);
    setTempMax(newMax);
  };

  // Đặt lại toàn bộ bộ lọc
  const handleReset = () => {
    setActiveLabel('Tất cả');
    setTempMin(MIN_LIMIT);
    setTempMax(MAX_LIMIT);
    setFrontageWidth('');
    setLotDepth('');
    setBackSize('');
  };

  // Áp dụng bộ lọc và đẩy dữ liệu lên FilterBar
  const handleApply = () => {
    let finalLabel = activeLabel;
    const isFullRange = tempMin === MIN_LIMIT && tempMax === MAX_LIMIT;

    if (!finalLabel) {
      if (isFullRange) {
        finalLabel = 'Tất cả';
      } else if (tempMin === MIN_LIMIT) {
        finalLabel = `Dưới ${tempMax}m²`;
      } else if (tempMax === MAX_LIMIT) {
        finalLabel = `Trên ${tempMin}m²`;
      } else {
        finalLabel = `${tempMin} - ${tempMax}m²`;
      }
    }

    const isAll = finalLabel === 'Tất cả';

    onSelect({
      label: finalLabel,
      from: isAll ? undefined : tempMin,
      to: isAll ? undefined : tempMax,
      frontageWidth: frontageWidth !== '' ? Number(frontageWidth) : undefined,
      lotDepth: lotDepth !== '' ? Number(lotDepth) : undefined,
      backSize: backSize !== '' ? Number(backSize) : undefined,
    });

    onClose();
  };

  // Tính toán phần trăm thanh màu Slider
  const getPercent = (value: number) => Math.round(((value - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100);

  return (
    <div className="fixed inset-0 z-[9999991] flex items-center justify-center bg-overlay px-2" onClick={handleClickOutside}>
      <div ref={modalRef} className="animate-in fade-in zoom-in w-full max-w-lg rounded-2xl bg-white shadow-xl transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-2">
          <h5 className="text-lg font-bold uppercase text-gray-800">Diện tích & Kích thước</h5>
          <button onClick={onClose} className="btn btn-ghost btn-sm h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100 focus:outline-none">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto p-2 pb-6 scrollbar-hide">
          {/* Label hiển thị khoảng diện tích đang chọn */}
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-700">
            <span>Khoảng diện tích:</span>
            <div className="flex items-center font-bold text-blue-600">
              {tempMin === MIN_LIMIT && tempMax === MAX_LIMIT ? (
                'Tất cả'
              ) : (
                <>
                  {tempMin} m² - {tempMax === MAX_LIMIT ? '1000+' : tempMax} m²
                </>
              )}
            </div>
          </div>

          {/* Slider Khoảng Diện Tích */}
          <div className="relative mb-8 h-2 w-full select-none rounded bg-gray-200">
            <div
              className="absolute top-0 h-2 rounded bg-blue-600"
              style={{
                left: `${getPercent(tempMin)}%`,
                right: `${100 - getPercent(tempMax)}%`,
              }}
            ></div>
            <Input
              size="xs"
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              value={tempMin}
              onChange={handleMinChange}
              className="pointer-events-none absolute z-20 h-2 w-full appearance-none border-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <Input
              size="xs"
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              value={tempMax}
              onChange={handleMaxChange}
              className="pointer-events-none absolute z-30 h-2 w-full appearance-none border-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="absolute top-4 flex w-full justify-between text-xs font-medium text-gray-400">
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000+</span>
            </div>
          </div>

          {/* Buttons Chọn Nhanh */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-gray-700">Chọn nhanh khoảng diện tích</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AREA_RANGES.map((opt) => (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => handleQuickSelect(opt)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all focus:outline-none ${
                    activeLabel === opt.label
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Kích Thước Chính Xác */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="mb-3 text-sm font-semibold text-gray-700">Kích thước chi tiết (m)</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full">
                <label className="mb-1 block text-xs text-gray-500">Ngang</label>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  step={0.1}
                  value={frontageWidth}
                  onChange={(e) => setFrontageWidth(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="VD: 5"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              {/* <div className="w-full">
                <label className="mb-1 block text-xs text-gray-500">Dài</label>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  step={0.1}
                  value={lotDepth}
                  onChange={(e) => setLotDepth(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="VD: 20"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-xs text-gray-500">Nở hậu</label>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  step={0.1}
                  value={backSize}
                  onChange={(e) => setBackSize(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="VD: 5.5"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-2xl border-t bg-primary px-5 py-4">
          <button
            className="flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-gray-200 focus:outline-none xl:hover:scale-105"
            onClick={handleReset}
          >
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
