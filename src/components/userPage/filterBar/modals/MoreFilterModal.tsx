'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import CancelBtn from '../../ui/btn/CancelBtn';
import SubmitBtn from '../../ui/btn/SubmitBtn';
import { DIRECTIONS, FURNITURE_STATUS, LEGAL_STATUS, LOCATION_TYPE } from '@/constants/filterOptions.constants';

interface MoreFilterOutput {
  bedroomNumber?: number;
  toiletNumber?: number;
  floorNumber?: number;
  direction?: string;
  furnitureStatus?: string;
  legalStatus?: string;
  locationType?: string;
}

interface MoreFilterModalProps {
  initialValues?: MoreFilterOutput; // Dùng để fill lại dữ liệu cũ khi mở lại modal
  onSelect: (data: MoreFilterOutput) => void;
  onClose: () => void;
}

export default function MoreFilterModal({ initialValues, onSelect, onClose }: MoreFilterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // State
  const [bedroom, setBedroom] = useState<number>(initialValues?.bedroomNumber || 0);
  const [toilet, setToilet] = useState<number>(initialValues?.toiletNumber || 0);
  const [floor, setFloor] = useState<number>(initialValues?.floorNumber || 0);

  const [direction, setDirection] = useState<string | undefined>(initialValues?.direction);
  const [furniture, setFurniture] = useState<string | undefined>(initialValues?.furnitureStatus);
  const [legal, setLegal] = useState<string | undefined>(initialValues?.legalStatus);
  const [locType, setLocType] = useState<string | undefined>(initialValues?.locationType);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const updateCount = (setter: React.Dispatch<React.SetStateAction<number>>, val: number, delta: number) => {
    const newVal = val + delta;
    if (newVal >= 0) setter(newVal);
  };

  const handleReset = () => {
    setBedroom(0);
    setToilet(0);
    setFloor(0);
    setDirection(undefined);
    setFurniture(undefined);
    setLegal(undefined);
    setLocType(undefined);
  };

  const handleApply = () => {
    // Trả về đúng structure query API yêu cầu
    onSelect({
      bedroomNumber: bedroom > 0 ? bedroom : undefined,
      toiletNumber: toilet > 0 ? toilet : undefined,
      floorNumber: floor > 0 ? floor : undefined,
      direction,
      furnitureStatus: furniture,
      legalStatus: legal,
      locationType: locType,
    });
    onClose();
  };

  // UI Components
  const CounterRow = ({ label, value, setter }: { label: string; value: number; setter: React.Dispatch<React.SetStateAction<number>> }) => (
    <div className="flex items-center justify-between border-b border-dashed border-gray-100 py-3 last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateCount(setter, value, -1)}
          className={`btn btn-circle btn-xs border-gray-300 bg-white hover:bg-gray-100 ${value === 0 ? 'btn-disabled opacity-50' : ''}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-full whitespace-nowrap text-center text-sm font-semibold">{value > 0 ? value : 'Bất kỳ'}</span>
        <button onClick={() => updateCount(setter, value, 1)} className="btn btn-circle btn-xs border-gray-300 bg-white hover:bg-gray-100">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  const SelectGrid = ({
    options,
    current,
    setter,
  }: {
    options: string[] | { label: string; value: string }[];
    current?: string;
    setter: (v: string | undefined) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isActive = current === val;
        return (
          <button
            key={val}
            onClick={() => setter(isActive ? undefined : val)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999991] flex items-center justify-center bg-overlay px-2" onClick={handleClickOutside}>
      <div ref={modalRef} className="animate-in fade-in zoom-in flex max-h-[75vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h5 className="text-lg font-bold uppercase text-gray-800">Bộ lọc nâng cao</h5>
          <button onClick={onClose} className="btn btn-circle btn-ghost btn-sm text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 scrollbar-hide">
          {/* Cấu trúc */}
          <div>
            <h6 className="mb-2 text-sm font-bold uppercase text-gray-800">Cấu trúc</h6>
            <div className="rounded-xl border border-gray-100 bg-primary-lighter px-4">
              <CounterRow label="Số phòng ngủ" value={bedroom} setter={setBedroom} />
              <CounterRow label="Số phòng vệ sinh (WC)" value={toilet} setter={setToilet} />
              <CounterRow label="Số tầng" value={floor} setter={setFloor} />
            </div>
          </div>

          {/* Đặc điểm */}
          <div>
            <h6 className="mb-2 text-sm font-bold uppercase text-gray-800">Đặc điểm bất động sản</h6>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">Loại vị trí</p>
                <SelectGrid options={LOCATION_TYPE} current={locType} setter={setLocType} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">Hướng nhà</p>
                <SelectGrid options={DIRECTIONS} current={direction} setter={setDirection} />
              </div>
            </div>
          </div>

          {/* Khác */}
          <div>
            <h6 className="mb-2 text-sm font-bold uppercase text-gray-800">Thông tin khác</h6>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">Tình trạng nội thất</p>
                <SelectGrid options={FURNITURE_STATUS} current={furniture} setter={setFurniture} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">Giấy tờ pháp lý</p>
                <SelectGrid options={LEGAL_STATUS} current={legal} setter={setLegal} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-2xl border-t bg-primary p-4">
          <button onClick={handleReset} className="text-sm font-medium text-white decoration-dotted hover:text-gray-800">
            Đặt lại tất cả
          </button>
          <div className="flex gap-3">
            <CancelBtn value="Đóng" onClick={onClose} />
            <SubmitBtn value="Áp dụng" onClick={handleApply} />
          </div>
        </div>
      </div>
    </div>
  );
}
