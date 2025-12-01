import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';

// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng

const CATEGORY_CODE = 4;
const CATEGORY_NAME = 'Mua bán nhà đất';

export default async function Page() {
  const posts = await rentalPostAdminService.getAll({ categoryCode: CATEGORY_CODE });

  return <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />;
}
