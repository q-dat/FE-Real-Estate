import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';
import { rentalCategoryService } from '@/services/rentalCategoryService';

const CATEGORY_NAME = 'Cho thuê mặt bằng';

export default async function Page() {
  const categories = await rentalCategoryService.getAll({ name: CATEGORY_NAME });
  const categoryId = categories?.[0]?._id;

  if (!categoryId) {
    return <div>Không tìm thấy danh mục phù hợp.</div>;
  }

  const posts = await rentalPostAdminService.getAll({ catalogID: categoryId });

  return (
    <RentalGrid
      posts={posts}
      title={CATEGORY_NAME}
      slogan=""
    />
  );
}
