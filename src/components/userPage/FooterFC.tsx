'use client';
import React from 'react';
import Link from 'next/link';

// Config footer sections
const footerSections = [
  {
    title: 'Marketplace',
    items: [
      { label: 'Bất động sản bán', link: '/bat-dong-san-ban' },
      { label: 'Bất động sản cho thuê', link: '/bat-dong-san-cho-thue' },
      { label: 'Dự án', link: '/du-an' },
      { label: 'Tin thị trường', link: '/tin-tuc' },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Tìm nhà', link: '/tim-nha' },
      { label: 'Ký gửi', link: '/ky-gui' },
      { label: 'Chuyển nhượng', link: '/chuyen-nhuong' },
      { label: 'Tư vấn', link: '/tu-van' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Về chúng tôi', link: '/gioi-thieu' },
      { label: 'Liên hệ', link: '/lien-he' },
      { label: 'Hỏi đáp', link: '/cau-hoi-thuong-gap' },
      { label: 'Hướng dẫn', link: '/huong-dan' },
    ],
  },
];

export default function FooterFC() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="px-2 py-14 xl:px-desktop-padding">
        {/* Top */}
        <div className="flex flex-col gap-12 border-b border-white/10 pb-12 xl:flex-row xl:items-start xl:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <h2 className="text-3xl font-bold tracking-tight">Nguonnhagiare.vn</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Nền tảng dữ liệu bất động sản hiện đại, cung cấp thông tin minh bạch và được cập nhật liên tục về thị trường bán – cho thuê tại TP.HCM.
              Hỗ trợ người dùng tìm kiếm nhanh, so sánh hiệu quả và đưa ra quyết định chính xác.
            </p>
          </div>

          {/* Sections */}
          <div className="grid w-full grid-cols-2 gap-10 sm:grid-cols-3 xl:max-w-2xl">
            {footerSections.filter(Boolean).map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">{section.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  {section.items.filter(Boolean).map((item) => (
                    <li key={item.link}>
                      <Link href={item.link} className="transition-colors hover:text-primary">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-gray-500 xl:flex-row">
          <p>© {new Date().getFullYear()} Nguonnhagiare.vn. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/chinh-sach-bao-mat" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/dieu-khoan" className="hover:text-primary">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
