import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';
import FilterBar from '@/components/userPage/filterBar/FilterBar';
import Link from 'next/link';

// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng

const CATEGORY_CODE = 2;
const CATEGORY_NAME = 'Cho thuê nhà ở';

export default async function Page() {
  const posts = await rentalPostAdminService.getAll({ categoryCode: CATEGORY_CODE });

  return (
    <div className="xl:pt-desktop-padding-top pt-mobile-padding-top">
      {/* FilterBar */}
      <FilterBar />
      {/* Breadcrumbs */}
      <div className="breadcrumbs px-2 py-2 text-sm text-primary xl:px-desktop-padding">
        <ul className="font-medium">
          <li>
            <Link href="/">Trang Chủ</Link>
          </li>
          <li>
            <Link href="#">{CATEGORY_NAME}</Link>
          </li>
        </ul>
      </div>
      <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />;
    </div>
  );
}
