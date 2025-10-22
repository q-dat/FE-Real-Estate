'use client';
import React, { useState } from 'react';
import { ChevronDown, RefreshCcw } from 'lucide-react';
import PropertyTypeModal from './modals/PropertyTypeModal';
import LocationModal from './modals/LocationModal';
import PriceModal from './modals/PriceModal';
import AreaModal from './modals/AreaModal';
import FilterResetModal from './modals/FilterResetModal';

export default function FilterBar() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'Tất cả',
    location: 'Chọn khu vực',
    price: 'Tất cả',
    area: 'Tất cả',
  });

  const handleSelect = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActiveModal(null);
  };

  const resetFilters = () =>
    setFilters({
      type: 'Tất cả',
      location: 'Chọn khu vực',
      price: 'Tất cả',
      area: 'Tất cả',
    });

  return (
    <div className="w-full bg-blue-50 p-2 shadow-md">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { key: 'type', label: 'Loại nhà đất' },
          { key: 'location', label: 'Khu vực' },
          { key: 'price', label: 'Khoảng giá' },
          { key: 'area', label: 'Diện tích' },
        ].map(({ key, label }) => (
          <button
            className="rounded-[10px] border border-gray-50 bg-white px-2 py-0.5 text-sm leading-4"
            key={key}
            onClick={() => setActiveModal(key)}
          >
            <p className="inline-flex w-[100px] items-center justify-start">
              <span className="text-xs font-normal text-gray-600"> {label}</span> <ChevronDown size="14px" />
            </p>
            <p
              className={`text-start text-sm ${
                filters[key as keyof typeof filters].localeCompare('tat ca', undefined, { sensitivity: 'base' }) === 0
                  ? 'font-medium text-black'
                  : 'font-bold text-red-600'
              }`}
            >
              {filters[key as keyof typeof filters]}
            </p>
          </button>
        ))}

        {/* Nút đặt lại */}
        <button className="rounded-[10px] border border-gray-50 bg-blue-100 px-2 py-0 text-sm font-medium" onClick={() => setActiveModal('reset')}>
          <p className="inline-flex h-10 w-[80px] items-center justify-center gap-1">
            <RefreshCcw size="18px" /> Đặt lại
          </p>
        </button>
      </div>

      {/* Các modal */}
      {activeModal === 'type' && <PropertyTypeModal onSelect={(val) => handleSelect('type', val)} onClose={() => setActiveModal(null)} />}
      {activeModal === 'location' && <LocationModal onSelect={(val) => handleSelect('location', val)} onClose={() => setActiveModal(null)} />}
      {activeModal === 'price' && <PriceModal onSelect={(val) => handleSelect('price', val)} onClose={() => setActiveModal(null)} />}
      {activeModal === 'area' && <AreaModal onSelect={(val) => handleSelect('area', val)} onClose={() => setActiveModal(null)} />}
      {activeModal === 'reset' && (
        <FilterResetModal
          onConfirm={() => {
            resetFilters();
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
