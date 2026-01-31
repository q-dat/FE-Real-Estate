import stripHtml from '@/lib/stripHtml';
import { IRealEstateProject } from '@/types/realEstateProject/realEstateProject.types';
import Link from 'next/link';

interface Props {
  projects: IRealEstateProject[];
}

export default function ClientRealEstateProjectPage({ projects }: Props) {
  return (
    <div className="px-2 pt-mobile-padding-top xl:px-desktop-padding xl:pt-desktop-padding-top">
      <section className="xl:mt-10">
        {/* Header */}
        <div className="mb-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Real Estate Collection</p>
          <h1 className="text-3xl font-light tracking-tight text-black xl:text-4xl">Dự án bất động sản cao cấp</h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Tuyển chọn những dự án có vị trí đắc địa, pháp lý minh bạch và tiềm năng gia tăng giá trị bền vững.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
          {projects.map((p) => (
            <Link
              key={p._id}
              href={`/du-an/${p.slug}`}
              target="_blank"
              className="group relative overflow-hidden rounded-md bg-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={p.thumbnails?.[0] || p.images}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Status */}
                {p.status && (
                  <span className="bg-overlay absolute left-5 top-5 rounded-full border border-white/30 px-4 py-1 text-xs font-light tracking-wide text-white backdrop-blur">
                    {p.status}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 p-6">
                <h3 className="mb-1 line-clamp-2 text-lg font-medium tracking-wide text-slate-900">{p.name}</h3>

                {(p.district || p.province) && (
                  <p className="mb-4 text-xs tracking-wide text-slate-500">
                    {p.district && `${p.district}, `}
                    {p.province}
                  </p>
                )}

                <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {stripHtml(p.description || p.introduction || '') || 'Thông tin dự án đang được cập nhật'}
                </p>

                <div className="space-y-2 text-xs text-slate-600">
                  {p.investor && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ đầu tư</span>
                      <span className="font-medium text-slate-800">{p.investor}</span>
                    </div>
                  )}

                  {p.projectType && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Loại hình</span>
                      <span className="font-medium text-slate-800">{p.projectType}</span>
                    </div>
                  )}

                  {p.area && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quy mô</span>
                      <span className="font-medium text-slate-800">{p.area}</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-6 flex items-center justify-end">
                  <span className="text-xs font-medium tracking-wide text-primary transition group-hover:underline">Xem chi tiết</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
