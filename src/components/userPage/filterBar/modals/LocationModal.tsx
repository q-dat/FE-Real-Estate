'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button, Input } from 'react-daisyui';
import { BaseLocationModalProps } from './types';

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

export default function LocationModal({ onClose, onSelect }: BaseLocationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [filter, setFilter] = useState('');

  // Normalize text: remove accent + lowercase
  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Error fetching provinces:', err));
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const filteredProvinces = provinces.filter((p) => normalizeText(p.name).includes(normalizeText(filter)));
  const filteredDistricts = districts.filter((d) => normalizeText(d.name).includes(normalizeText(filter)));

  const handleSelectProvince = (province: Province) => {
    setSelectedProvince(province);
    setFilter('');
    fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts))
      .catch((err) => console.error('Error fetching districts:', err));
  };

  const handleSelectDistrict = (district: District) => {
    onSelect?.({
      province: selectedProvince!.name,
      district: district.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-lg scale-95 transform rounded-2xl bg-white shadow-xl transition-all duration-200 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h5 className="text-lg font-semibold text-gray-800">{selectedProvince ? 'Chọn Quận / Huyện' : 'Chọn Tỉnh / Thành phố'}</h5>
          <button onClick={onClose} className="btn btn-ghost btn-sm text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <Input
            placeholder={selectedProvince ? 'Tìm kiếm quận/huyện' : 'Tìm kiếm tỉnh/thành phố'}
            className="mb-4 w-full"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          {!selectedProvince ? (
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {filteredProvinces.map((item) => (
                <Button key={item.code} size="sm" className="justify-center text-xs" onClick={() => handleSelectProvince(item)}>
                  {item.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {filteredDistricts.map((item) => (
                <Button key={item.code} size="sm" className="justify-center text-xs" onClick={() => handleSelectDistrict(item)}>
                  {item.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          {selectedProvince && (
            <span
              className="cursor-pointer text-sm text-blue-600 hover:underline"
              onClick={() => {
                setSelectedProvince(null);
                setDistricts([]);
                setFilter('');
              }}
            >
              Quay lại
            </span>
          )}
          <Button size="sm" color="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
