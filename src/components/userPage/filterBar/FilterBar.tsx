'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import PropertyTypeModal from './modals/PropertyTypeModal';
import LocationModal from './modals/LocationModal';
import PriceModal from './modals/PriceModal';
import AreaModal from './modals/AreaModal';
import FilterResetModal from './modals/FilterResetModal';

type LocationValue = { province: string; district: string } | string;

export default function FilterBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    type: string;
    location: LocationValue;
    price: string;
    area: string;
  }>({
    type: 'Tất cả',
    location: 'Chọn khu vực',
    price: 'Tất cả',
    area: 'Tất cả',
  });

  // tự động cập nhật "type" khi pathname thay đổi
  useEffect(() => {
    switch (pathname) {
      case '/phong-tro':
        setFilters((prev) => ({ ...prev, type: 'Cho thuê phòng trọ' }));
        break;
      case '/nha-o':
        setFilters((prev) => ({ ...prev, type: 'Cho thuê nhà ở' }));
        break;
      case '/can-ho':
        setFilters((prev) => ({ ...prev, type: 'Cho thuê căn hộ' }));
        break;
      case '/mat-bang':
        setFilters((prev) => ({ ...prev, type: 'Cho thuê mặt bằng' }));
        break;
      case '/nha-dat':
        setFilters((prev) => ({ ...prev, type: 'Mua bán nhà đất' }));
        break;
      default:
        setFilters((prev) => ({ ...prev, type: 'Tất cả' }));
    }
  }, [pathname]);

  // handle chọn modal
  const handleSelect = (key: string, value: string | { province: string; district: string } | { title: string; link: string }) => {
    if (key === 'type' && typeof value === 'object' && 'link' in value) {
      setFilters((prev) => ({ ...prev, type: value.title }));
      router.push(value.link);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setActiveModal(null);
  };

  const resetFilters = () =>
    setFilters((prev) => ({
      ...prev,
      location: 'Chọn khu vực',
      price: 'Tất cả',
      area: 'Tất cả',
    }));

  return (
    <div className="w-full bg-blue-50 p-2 shadow-md">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { key: 'type', label: 'Loại nhà đất' },
          { key: 'location', label: 'Khu vực' },
          { key: 'price', label: 'Khoảng giá' },
          { key: 'area', label: 'Diện tích' },
        ].map(({ key, label }) => {
          const value = filters[key as keyof typeof filters];
          const displayValue = typeof value === 'string' ? value : `${value.province ?? ''}${value.district ? ' - ' + value.district : ''}`;

          const isTatCa = typeof value === 'string' && value.localeCompare('tất cả', undefined, { sensitivity: 'base' }) === 0;

          return (
            <button
              key={key}
              className="rounded-[10px] border border-gray-50 bg-white px-2 py-0.5 text-sm leading-4"
              onClick={() => setActiveModal(key)}
            >
              <p className="inline-flex w-[100px] items-center justify-start">
                <span className="text-xs font-normal text-gray-600">{label}</span> <ChevronDown size="14px" />
              </p>
              <p className={`text-start text-sm ${isTatCa ? 'font-medium text-black' : 'font-bold text-red-600'}`}>{displayValue}</p>
            </button>
          );
        })}

        <button className="rounded-[10px] border border-gray-50 bg-blue-100 px-2 py-0 text-sm font-medium" onClick={() => setActiveModal('reset')}>
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
