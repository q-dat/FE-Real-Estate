'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import PropertyTypeModal from './modals/PropertyTypeModal';
import LocationModal from './modals/LocationModal';
import PriceModal from './modals/PriceModal';
import AreaModal from './modals/AreaModal';
import FilterResetModal from './modals/FilterResetModal';

export type LocationValue = { province: string; district?: string } | string;

export interface FilterValues {
  type: string;
  location: LocationValue;
  price: string;
  area: string;
}

interface FilterBarProps {
  onFilterChange?: (filters: FilterValues) => void; // callback khi bộ lọc thay đổi
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    type: 'Tất cả',
    location: 'Toàn quốc',
    price: 'Tất cả',
    area: 'Tất cả',
  });

  // tự động cập nhật "type" khi pathname thay đổi
  useEffect(() => {
    let typeLabel = 'Tất cả';
    switch (pathname) {
      case '/cho-thue-phong-tro':
        typeLabel = 'Cho thuê phòng trọ';
        break;
      case '/cho-thue-nha-nguyen-can':
        typeLabel = 'Nhà nguyên căn';
        break;
      case '/cho-thue-can-ho':
        typeLabel = 'Căn hộ cho thuê';
        break;
      case '/cho-thue-mat-bang':
        typeLabel = 'Cho thuê mặt bằng';
        break;
      case '/nha-dat':
        typeLabel = 'Mua bán nhà đất';
        break;
    }
    setFilters((prev) => ({ ...prev, type: typeLabel }));
  }, [pathname]);

  // 🧠 emit filters ra ngoài (chuẩn bị cho gọi API)
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
      // 🚀 sau này chỉ cần gọi API tại đây
      // fetch(`/api/rentals?type=${filters.type}&price=${filters.price}`)
      //   .then(res => res.json())
      //   .then(data => console.log(data))
    }
  }, [filters, onFilterChange]);

  // 📦 chọn giá trị từ các modal
  const handleSelect = (key: keyof FilterValues, value: string | { province: string; district?: string } | { title: string; link: string }) => {
    if (key === 'type' && typeof value === 'object' && 'link' in value) {
      setFilters((prev) => ({ ...prev, type: value.title }));
      router.push(value.link);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setActiveModal(null);
  };

  // 🔁 reset toàn bộ bộ lọc
  const resetFilters = () => {
    const reset = {
      type: 'Tất cả',
      location: 'Toàn quốc',
      price: 'Tất cả',
      area: 'Tất cả',
    };
    setFilters(reset);
    router.push('/');
  };

  return (
    <div className="w-full bg-blue-50 p-2 shadow-md">
      <div className="flex w-full flex-row items-center justify-start gap-1.5 overflow-auto scrollbar-hide xl:justify-center">
        {[
          { key: 'type', label: 'Loại nhà đất' },
          { key: 'location', label: 'Khu vực' },
          { key: 'price', label: 'Khoảng giá' },
          { key: 'area', label: 'Diện tích' },
        ].map(({ key, label }) => {
          const value = filters[key as keyof FilterValues];
          const displayValue = typeof value === 'string' ? value : `${value.province}${value.district ? ' - ' + value.district : ''}`;

          const isAll = typeof value === 'string' && value.localeCompare('tất cả', undefined, { sensitivity: 'base' }) === 0;

          return (
            <button
              key={key}
              className="rounded-[10px] border border-gray-50 bg-white px-2 py-0.5 text-sm leading-4"
              onClick={() => setActiveModal(key)}
            >
              <p className="inline-flex w-[100px] items-center justify-start">
                <span className="text-xs font-normal text-gray-600">{label}</span> <ChevronDown size="14px" />
              </p>
              <p className={`w-20 truncate text-start text-sm xl:w-auto ${isAll ? 'font-medium text-black' : 'font-bold text-red-600'}`}>
                {displayValue}
              </p>
            </button>
          );
        })}

        <button className="rounded-[10px] border border-gray-50 bg-white px-2 py-0 text-sm font-medium" onClick={() => setActiveModal('reset')}>
          <p className="inline-flex h-10 w-[80px] items-center justify-center gap-1">
            <RefreshCcw size="18px" /> Đặt lại
          </p>
        </button>
      </div>

      {/* Modal */}
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
