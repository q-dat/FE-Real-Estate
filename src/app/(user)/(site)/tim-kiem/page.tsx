export const revalidate = 60;

import { searchRentalPosts } from '@/server/queries';
import RentalGrid from '@/components/userPage/rental/RentalGrid';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const title = q ? `Kết quả tìm kiếm: ${q}` : 'Tìm kiếm bất động sản';
  return {
    title,
    description: `Danh sách bất động sản phù hợp với từ khóa ${q ?? ''} tại Nguồn Nhà Giá Rẻ.`,
    robots: 'noindex',
  };
}

export default async function SearchResultPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const keyword = (q ?? '').trim();
  const results = keyword ? await searchRentalPosts(keyword, 24) : [];

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      <Breadcrumbs label={keyword ? `Tìm: ${keyword}` : 'Tìm kiếm'} />
      <div className="mx-auto max-w-[1700px] px-2 py-6 xl:px-desktop-padding xl:py-10">
        <h1 className="mb-2 text-2xl font-black tracking-tight text-zinc-950 xl:text-3xl">
          {keyword ? `Kết quả cho "${keyword}"` : 'Tìm kiếm bất động sản'}
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          {keyword ? `${results.length} kết quả được tìm thấy` : 'Nhập từ khóa để tìm kiếm.'}
        </p>

        {results.length > 0 ? (
          <RentalGrid posts={results} />
        ) : keyword ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-16 text-center">
            <p className="text-base font-semibold text-gray-900">Không có kết quả phù hợp</p>
            <p className="mt-2 text-sm text-gray-500">Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
