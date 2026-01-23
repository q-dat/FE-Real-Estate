'use client';
import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BasePropertyTypeModalProps } from './types';
import Link from 'next/link';
import clsx from 'clsx';
import CancelBtn from '../../ui/btn/CancelBtn';

export default function PropertyTypeModal({ onClose, onSelect }: BasePropertyTypeModalProps) {
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { title: 'Tất cả', link: '/' },
    { title: 'Căn hộ', link: '/can-ho' },
    { title: 'Nhà nguyên căn', link: '/nha-nguyen-can' },
    { title: 'Mặt bằng', link: '/mat-bang' },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  return (
    <div className="bg-overlay fixed inset-0 z-50 flex items-center justify-center px-3" onClick={handleClickOutside}>
      <div ref={modalRef} className="w-full max-w-lg scale-95 transform rounded-2xl bg-white p-5 shadow-xl transition-all duration-200 ease-out">
        <h3 className="mb-5 text-center text-lg font-semibold text-gray-800">Chọn loại bất động sản</h3>

        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link
                key={item.link}
                href={item.link}
                className={clsx(
                  'cursor-pointer rounded-md border px-3 py-2 text-center text-xs transition-all',
                  isActive ? 'border-blue-500 bg-blue-50 font-medium text-blue-600' : 'border-gray-200 hover:border-blue-400 hover:text-blue-600'
                )}
                onClick={() => onSelect?.(item.title)}
              >
                {item.title}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <CancelBtn value="Đóng" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
