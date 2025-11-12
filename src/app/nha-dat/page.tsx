import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';
import { rentalCategoryService } from '@/services/rentalCategoryService';

const CATEGORY_NAME = 'Mua bán nhà đất';

export default async function Page() {
  // Fetch danh mục
  const categories = await rentalCategoryService.getAll({ name: CATEGORY_NAME });

  // Lấy ID động từ response
  const categoryId = categories?.[0]?._id;

  if (!categoryId) {
    console.error('Không tìm thấy danh mục hợp lệ');
    return <div>Không tìm thấy danh mục phù hợp.</div>;
  }

  // Fetch bài đăng theo categoryId động
  const posts = await rentalPostAdminService.getAll({ catalogID: categoryId });

  return <RentalGrid posts={posts} title="Mua Bán Nhà Đất" slogan="" />;
}
