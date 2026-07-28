export const revalidate = 300;

import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { HomeSection } from './ClientHomePage';
import { homeMetadata } from '@/metadata/home.metadata';
import HerroBanner from '@/components/userPage/HerroBanner';
import { Suspense } from 'react';
import Link from 'next/link';
import HomeSectionSkeleton from './HomeSectionSkeleton';

export const metadata = homeMetadata;

const HOME_PAGE_LIMIT = 8;

// Mỗi section là async Server Component, tự fetch và nằm trong Suspense riêng.
// Shell (Header, Banner, cấu trúc filter, footer) được trả trước khi bất kỳ query nào xong.
async function SaleSection() {
  const salePosts = await rentalPostAdminService.getAll({
    categoryCode: 0,
    page: 1,
    limit: HOME_PAGE_LIMIT,
  });
  return (
    <HomeSection
      title="Bất động sản bán"
      subtitle="Sales Portfolio"
      description="Danh sách nhà đất được trình bày rõ vị trí, diện tích, công năng và mức giá."
      link="/bat-dong-san-ban"
      data={salePosts}
    />
  );
}

async function ApartmentSection() {
  const apartmentPosts = await rentalPostAdminService.getAll({
    categoryCode: 1,
    page: 1,
    limit: HOME_PAGE_LIMIT,
  });
  return (
    <HomeSection
      title="Căn hộ dịch vụ"
      subtitle="Apartments"
      description="Các căn hộ dịch vụ được sắp xếp gọn, dễ đọc và dễ so sánh."
      link="/can-ho"
      data={apartmentPosts}
    />
  );
}

async function HouseSection() {
  const housePosts = await rentalPostAdminService.getAll({
    categoryCode: 2,
    page: 1,
    limit: HOME_PAGE_LIMIT,
  });
  return (
    <HomeSection
      title="Nhà nguyên căn"
      subtitle="Townhouses"
      description="Nhà nguyên căn với thông tin chính được ưu tiên hiển thị trực quan."
      link="/nha-nguyen-can"
      data={housePosts}
    />
  );
}

async function BusinessSection() {
  const businessSpacePosts = await rentalPostAdminService.getAll({
    categoryCode: 3,
    page: 1,
    limit: HOME_PAGE_LIMIT,
  });
  return (
    <HomeSection
      title="Mặt bằng kinh doanh"
      subtitle="Commercial Space"
      description="Mặt bằng được hiển thị theo tiêu chí vị trí, diện tích và giá rõ ràng."
      link="/mat-bang"
      data={businessSpacePosts}
    />
  );
}

export default async function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 pt-mobile-padding-top text-zinc-950 xl:pt-desktop-padding-top">
      <HerroBanner />

      <section className="relative z-10 mx-auto max-w-[1700px] px-2 pt-3 xl:-mt-6 xl:px-desktop-padding 2xl:px-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {[
              { title: 'Bất động sản bán', subtitle: 'Sales Portfolio', link: '/bat-dong-san-ban' },
              { title: 'Căn hộ dịch vụ', subtitle: 'Apartments', link: '/can-ho' },
              { title: 'Nhà nguyên căn', subtitle: 'Townhouses', link: '/nha-nguyen-can' },
              { title: 'Mặt bằng kinh doanh', subtitle: 'Commercial Space', link: '/mat-bang' },
            ].map((section) => (
              <Link
                key={section.title}
                href={section.link}
                className="group rounded-md border border-zinc-200 bg-white px-2 py-2 transition duration-300 hover:border-zinc-300 hover:bg-zinc-50"
              >
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400">{section.subtitle}</p>
                <p className="line-clamp-2 text-sm font-black leading-snug text-zinc-950 group-hover:text-zinc-700">{section.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1700px] px-2 py-8 xl:px-desktop-padding xl:py-12 2xl:px-8">
        <Suspense fallback={<HomeSectionSkeleton />}>
          <SaleSection />
        </Suspense>
        <Suspense fallback={<HomeSectionSkeleton />}>
          <ApartmentSection />
        </Suspense>
        <Suspense fallback={<HomeSectionSkeleton />}>
          <HouseSection />
        </Suspense>
        <Suspense fallback={<HomeSectionSkeleton />}>
          <BusinessSection />
        </Suspense>
      </div>

      <section className="px-2 pb-8 xl:px-desktop-padding xl:pb-12 2xl:px-8">
        <div className="mx-auto max-w-[1700px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-10 text-center text-white shadow-sm xl:px-4 xl:py-12">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">Nguồn Nhà Giá Rẻ</p>
            <h3 className="text-2xl font-black tracking-tight xl:text-4xl">Bạn cần ký gửi bất động sản?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-zinc-400">
              Gửi thông tin nhà đất để được hỗ trợ trình bày nội dung rõ ràng, hình ảnh chỉn chu và phù hợp nhu cầu tìm kiếm.
            </p>
            <Link
              href="/lien-he-ky-gui"
              className="mt-6 inline-flex items-center justify-center rounded-md border border-white/15 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-zinc-200"
            >
              Bắt đầu ký gửi ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
