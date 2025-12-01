'use client';
import React from 'react';
import Link from 'next/link';

interface BreadcrumbsProps {
  label: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ label }) => {
  return (
    <div className="breadcrumbs px-2 py-4 text-sm text-primary xl:px-desktop-padding xl:py-5">
      <ul className="font-medium">
        <li>
          <Link href="/">Trang Chủ</Link>
        </li>
        <li>
          <Link href="#">{label}</Link>
        </li>
      </ul>
    </div>
  );
};

export default Breadcrumbs;
