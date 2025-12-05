import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';
import FilterBar from '@/components/userPage/filterBar/FilterBar';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';

// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng

const CATEGORY_CODE = 2;
const CATEGORY_NAME = 'Nhà Nguyên Căn';

export default async function Page({
  searchParams,
}: {
  // Type đúng cho Next.js 15
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await để resolve Promise thành object thực tế
  const resolvedSearchParams = await searchParams;

  const params: Record<string, string | number> = {
    categoryCode: CATEGORY_CODE,
  };

  // Merge query params từ URL vào params (hỗ trợ multi-value nếu cần)
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      params[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      // Nếu muốn hỗ trợ array (ví dụ ?district=1&district=2), lấy value đầu tiên hoặc xử lý tùy ý
      params[key] = value[0];
    }
  });

  const posts = await rentalPostAdminService.getAll({ categoryCode: CATEGORY_CODE });

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      {/* FilterBar */}
      <FilterBar />
      {/* Breadcrumbs */}
      <Breadcrumbs label={CATEGORY_NAME} />
      <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />;
    </div>
  );
}
