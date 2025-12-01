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

export default async function Page() {
  const posts = await rentalPostAdminService.getAll({ categoryCode: CATEGORY_CODE });

  return (
    <div className="xl:pt-desktop-padding-top pt-mobile-padding-top">
      {/* FilterBar */}
      <FilterBar />
      {/* Breadcrumbs */}
      <Breadcrumbs label={CATEGORY_NAME} />
      <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />;
    </div>
  );
}
