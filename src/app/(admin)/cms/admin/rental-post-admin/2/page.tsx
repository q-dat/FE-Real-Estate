export const revalidate = 0;

import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { rentalCategoryService } from '@/services/rentalCategoryService';
import ClientRentalPostAdminPage from '../ClientRentalPostAdminPage';

// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng
const CATEGORY_CODE = 2;

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function RentalPostAdminPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;

  const params: Record<string, string | number> = {
    categoryCode: CATEGORY_CODE,
  };

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      params[key] = value[0];
    }
  });

  const [posts, categories] = await Promise.all([rentalPostAdminService.getAll(params), rentalCategoryService.getAll()]);

  return <ClientRentalPostAdminPage posts={Array.isArray(posts) ? posts : []} categories={Array.isArray(categories) ? categories : []} />;
}
