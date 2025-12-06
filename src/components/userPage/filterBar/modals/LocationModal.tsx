'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Input } from 'react-daisyui';
import { BaseLocationModalProps } from './types';
import CancelBtn from '../../ui/btn/CancelBtn';

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

export default function LocationModal({ onClose, onSelect }: BaseLocationModalProps) {
  // Full Vietnam version
  // const modalRef = useRef<HTMLDivElement>(null);
  // const [provinces, setProvinces] = useState<Province[]>([]);
  // const [districts, setDistricts] = useState<District[]>([]);
  // const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  // const [filter, setFilter] = useState('');

  // // Normalize text: remove accent + lowercase
  // const normalizeText = (text: string) =>
  //   text
  //     .normalize('NFD')
  //     .replace(/[\u0300-\u036f]/g, '')
  //     .toLowerCase();

  // useEffect(() => {
  //   fetch('https://provinces.open-api.vn/api/?depth=1')
  //     .then((res) => res.json())
  //     .then((data) => setProvinces(data))
  //     .catch((err) => console.error('Error fetching provinces:', err));
  // }, []);

  // useEffect(() => {
  //   const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
  //   window.addEventListener('keydown', handleEsc);
  //   return () => window.removeEventListener('keydown', handleEsc);
  // }, [onClose]);

  // const handleClickOutside = (e: React.MouseEvent) => {
  //   if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  // };

  // const filteredProvinces = provinces.filter((p) => normalizeText(p.name).includes(normalizeText(filter)));
  // const filteredDistricts = districts.filter((d) => normalizeText(d.name).includes(normalizeText(filter)));

  // const handleSelectProvince = (province: Province) => {
  //   setSelectedProvince(province);
  //   setFilter('');
  //   fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
  //     .then((res) => res.json())
  //     .then((data) => setDistricts(data.districts))
  //     .catch((err) => console.error('Error fetching districts:', err));
  // };

  // const handleSelectDistrict = (district: District) => {
  //   onSelect?.({
  //     province: selectedProvince!.name,
  //     district: district.name,
  //   });
  //   onClose();
  // };

  // Ho Chi Minh City only version
  const modalRef = useRef<HTMLDivElement>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [filter, setFilter] = useState('');

  // Normalize text: remove accent + lowercase
  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  useEffect(() => {
    // Chỉ lấy dữ liệu TPHCM (Mã 79)
    fetch('https://provinces.open-api.vn/api/p/79?depth=2')
      .then((res) => res.json())
      .then((data) => {
        setSelectedProvince({ code: 79, name: 'Thành phố Hồ Chí Minh' });
        setDistricts(data.districts);
      })
      .catch((err) => console.error('Error fetching districts:', err));
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const filteredDistricts = districts.filter((d) => normalizeText(d.name).includes(normalizeText(filter)));

  const handleSelectDistrict = (district: District) => {
    onSelect?.({
      province: 'Thành phố Hồ Chí Minh',
      district: district.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2" onClick={handleClickOutside}>
      <div ref={modalRef} className="animate-in fade-in zoom-in w-full rounded-2xl bg-white shadow-xl transition-all duration-200 xl:w-1/2">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-2">
          <h5 className="text-lg font-bold uppercase text-gray-800">CHỌN QUẬN / HUYỆN</h5>
          <button onClick={onClose} className="btn btn-ghost btn-sm h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-2">
          <Input
            autoFocus
            type="text"
            placeholder="Tìm kiếm quận/huyện"
            className="mb-4 w-full rounded-lg focus:outline-none focus:ring-opacity-50"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedDistrict(null); // Reset chọn khi tìm kiếm
            }}
          />

          {/* Danh sách Quận/Huyện */}
          <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto scrollbar-hide xl:grid-cols-5">
            {filteredDistricts.map((item) => (
              <button
                type="button"
                key={item.code}
                onClick={() => handleSelectDistrict(item)}
                className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-all duration-150 ${
                  selectedDistrict?.code === item.code
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            {filteredDistricts.length === 0 && <p className="col-span-2 mt-4 text-center text-sm text-gray-500">Không tìm thấy kết quả.</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-2xl border-t bg-primary px-5 py-3">
          {selectedProvince && (
            <span
              className="cursor-pointer text-sm text-white hover:underline"
              onClick={() => {
                setSelectedProvince(null);
                setDistricts([]);
                setFilter('');
              }}
            >
              Quay lại
            </span>
          )}
          <CancelBtn value="Đóng" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
