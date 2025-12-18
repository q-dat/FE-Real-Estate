import stripHtml from '@/lib/stripHtml';
import { IRealEstateProject } from '@/types/type/realEstateProject/realEstateProject';
import Link from 'next/link';
import React from 'react';

interface Props {
  projects: IRealEstateProject[];
}
export default function ClientRealEstateProjectPage({ projects }: Props) {
  return (
    <div className="bg-gray-50 pt-mobile-padding-top xl:pt-desktop-padding-top">
      <section className="mx-auto max-w-6xl px-4 xl:px-desktop-padding">
        <h1 className="mb-8 text-2xl font-bold text-slate-800 xl:text-3xl">Dự án bất động sản</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p._id}
              target="_blank"
              href={`/du-an/${p.slug}`}
              className="group rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="mb-2 line-clamp-2 font-semibold text-slate-800 group-hover:text-primary">{p.name}</h3>

              <p className="line-clamp-3 text-sm text-slate-500">{stripHtml(p.introduction || p.description || '') || 'Đang cập nhật thông tin'}</p>

              {p.status && <div className="mt-4 text-xs font-medium text-primary">{p.status}</div>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
