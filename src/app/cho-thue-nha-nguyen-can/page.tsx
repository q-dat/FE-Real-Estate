import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';

// 0. Bất động sản thuê
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng
// 4. Mua bán nhà đất

const CATEGORY_CODE = 2;
const CATEGORY_NAME = 'Cho thuê nhà ở';

export default async function Page() {
  const posts = await rentalPostAdminService.getAll({ categoryCode: CATEGORY_CODE });

  return <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />;
}
