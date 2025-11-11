import { rentalPostAdminService } from '@/services/rentalPostAdminService';
import { RentalGrid } from '@/components/userPage/rental';

// ID danh mục gắn tĩnh trước, sau này sẽ map động
const CATEGORY_ID = '69036fe41979ee99fca4c0ff';

export default async function Page() {
  // Fetch dữ liệu SSR
  const posts = await rentalPostAdminService.getAll({ catalogID: CATEGORY_ID });

  return <RentalGrid posts={posts} title="Cho Thuê Phòng Trọ" slogan="Tìm phòng trọ giá rẻ, vị trí thuận tiện, đầy đủ tiện nghi" />;
}
