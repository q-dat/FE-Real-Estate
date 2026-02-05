export const revalidate = 0;

import ClientRentalPostAdminPage from '@/app/(admin)/cms/admin/rental-post-admin/ClientRentalPostAdminPage';
import { rentalCategoryService } from '@/services/rental/rentalCategory.service';

// 0. Bất động sản bán
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng
const CATEGORY_CODE = 3;

export default async function RentalPostAdminPage() {
  const categories = await rentalCategoryService.getAll();

  return <ClientRentalPostAdminPage posts={[]} categories={Array.isArray(categories) ? categories : []} categoryCode={CATEGORY_CODE} />;
}
