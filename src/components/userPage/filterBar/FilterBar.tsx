'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import LocationModal from './modals/LocationModal';
import PriceModal from './modals/PriceModal';
import AreaModal from './modals/AreaModal';
import FilterResetModal from './modals/FilterResetModal';
import PropertyTypeModal from './modals/PropertyTypeModal';
import { getPriceParamsFromLabel, PriceRangeKey } from '@/constants/priceRanges';

interface FilterValues {
  type?: string;
  province?: string;
  district?: string;

  price?: number;
  priceFrom?: number;
  priceTo?: number;

  area?: number;
  areaFrom?: number;
  areaTo?: number;

  // Các field hiển thị UI (sẽ bị loại bỏ khỏi URL)
  displayPrice?: string;
  displayArea?: string;
  location?: string;
}

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterValues>({});

  // type riêng, không push lên URL query param vì nó nằm ở pathname
  const [typeLabel, setTypeLabel] = useState('Căn hộ');

  // Tự động cập nhật label type khi pathname thay đổi
  useEffect(() => {
    let type = 'Căn hộ';
    switch (pathname) {
      case '/can-ho':
        type = 'Căn hộ';
        break;
      case '/nha-nguyen-can':
        type = 'Nhà nguyên căn';
        break;
      case '/mat-bang':
        type = 'Mặt bằng';
        break;
    }
    setTypeLabel(type);
  }, [pathname]);

  const handleSelectType = (val: { title: string; link: string }) => {
    router.push(val.link);
    setActiveModal(null);
  };

  const handleSelectPrice = (label: string) => {
    const params = getPriceParamsFromLabel(label as PriceRangeKey);

    setFilters((prev) => ({
      ...prev,
      displayPrice: label === 'Tất cả' ? undefined : label,
      ...params,
    }));
    setActiveModal(null);
  };

  const handleSelectArea = (label: string) => {
    const map: Record<string, [number | undefined, number | undefined]> = {
      'Tất cả': [undefined, undefined],
      'Dưới 30m²': [undefined, 30],
      '30 - 50m²': [30, 50],
      '50 - 80m²': [50, 80],
      '80 - 100m²': [80, 100],
      'Trên 100m²': [100, 999],
    };

    const [af, at] = map[label] ?? [undefined, undefined];

    setFilters((prev) => ({
      ...prev,
      displayArea: label,
      area: af !== undefined && at === undefined ? af : undefined, // Logic cũ của bạn
      areaFrom: af !== undefined && at !== undefined ? af : undefined,
      areaTo: at !== undefined ? at : undefined,
    }));

    setActiveModal(null);
  };

  const handleSelectLocation = (v: { province: string; district?: string }) => {
    setFilters((prev) => ({
      ...prev,
      province: v.province || undefined,
      district: v.district || undefined,
      location: v.province ? `${v.province}${v.district ? ' - ' + v.district : ''}` : 'Toàn quốc',
    }));
    setActiveModal(null);
  };

  // --- PHẦN QUAN TRỌNG ĐÃ SỬA ---
  useEffect(() => {
    // 1. Tạo danh sách các key KHÔNG muốn đưa lên URL
    const excludedKeys: (keyof FilterValues)[] = ['displayPrice', 'displayArea', 'location'];

    const params = new URLSearchParams();

    // 2. Duyệt qua các key trong filters với Type Assertion an toàn
    (Object.keys(filters) as Array<keyof FilterValues>).forEach((key) => {
      const value = filters[key];

      // 3. Chỉ set param nếu:
      // - Key không nằm trong danh sách loại trừ
      // - Value có giá trị (khác undefined, null, rỗng)
      if (!excludedKeys.includes(key) && value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();

    // Chỉ push nếu có params hoặc muốn clear params (tùy logic business của bạn)
    // Ở đây dùng replace để tránh tạo quá nhiều lịch sử back, hoặc push tùy nhu cầu
    if (queryString) {
      router.push(`${pathname}?${queryString}`);
    } else {
      // Nếu không có params nào (đã reset hết), có thể muốn trả về pathname gốc
      router.push(pathname);
    }
  }, [filters, pathname, router]);
  // -----------------------------

  const resetFilters = () => {
    setFilters({
      displayPrice: undefined,
      displayArea: undefined,
      location: undefined,
      province: undefined,
      district: undefined,
      price: undefined,
      priceFrom: undefined,
      priceTo: undefined,
      area: undefined,
      areaFrom: undefined,
      areaTo: undefined,
    });
    setActiveModal(null);
  };

  return (
    <div className="w-full bg-primary-lighter p-2 shadow-md">
      <div className="flex w-full flex-row items-center justify-start gap-1.5 overflow-auto scrollbar-hide xl:justify-center">
        {/* Nút Type */}
        <button className="rounded-[10px] border border-gray-50 bg-white px-2 py-0.5 text-sm leading-4" onClick={() => setActiveModal('type')}>
          <p className="inline-flex w-[100px] items-center justify-start">
            <span className="text-xs font-normal text-gray-600">Loại nhà đất</span> <ChevronDown size="14px" />
          </p>
          <p className={`w-20 truncate text-start text-sm font-bold text-red-600 xl:w-auto`}>{typeLabel}</p>
        </button>

        {/* Các nút Filter động */}
        {[
          { key: 'location', label: 'Khu vực' },
          { key: 'price', label: 'Khoảng giá' },
          { key: 'area', label: 'Diện tích' },
        ].map(({ key, label }) => {
          let displayValue = '';
          // Lấy giá trị hiển thị từ state UI
          if (key === 'price') displayValue = filters.displayPrice ?? 'Tất cả';
          else if (key === 'area') displayValue = filters.displayArea ?? 'Tất cả';
          else if (key === 'location') displayValue = filters.location ?? 'Toàn quốc';

          const isAll = !displayValue || displayValue.toLowerCase() === 'tất cả' || displayValue === 'Toàn quốc';

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

        {/* Nút Reset */}
        <button className="rounded-[10px] border border-gray-50 bg-white px-2 py-0 text-sm font-medium" onClick={() => setActiveModal('reset')}>
          <p className="inline-flex h-10 w-[80px] items-center justify-center gap-1">
            <RefreshCcw size="18px" /> Đặt lại
          </p>
        </button>
      </div>

      {activeModal === 'type' && <PropertyTypeModal onSelect={() => handleSelectType} onClose={() => setActiveModal(null)} />}
      {activeModal === 'location' && <LocationModal onSelect={handleSelectLocation} onClose={() => setActiveModal(null)} />}
      {activeModal === 'price' && <PriceModal onSelect={handleSelectPrice} onClose={() => setActiveModal(null)} />}
      {activeModal === 'area' && <AreaModal onSelect={handleSelectArea} onClose={() => setActiveModal(null)} />}
      {activeModal === 'reset' && <FilterResetModal onConfirm={resetFilters} onClose={() => setActiveModal(null)} />}
    </div>
  );
}
