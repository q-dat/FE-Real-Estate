import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';
import FilterBar from '@/components/userPage/filterBar/FilterBar';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';

// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng

const CATEGORY_CODE = 3;
const CATEGORY_NAME = 'Mặt Bằng';

export default async function Page() {
  const posts = await rentalPostAdminService.getAll({ categoryCode: CATEGORY_CODE });

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      {/* FilterBar */}
      <FilterBar />
      {/* Breadcrumbs */}
      <Breadcrumbs label={CATEGORY_NAME} />
      <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />
    </div>
  );
}
