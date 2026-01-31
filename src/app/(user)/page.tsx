export const revalidate = 0

import { rentalPostAdminService } from '@/services/rentalPostAdmin.service';
import ClientHomePage from './ClientHomePage';
import { homeMetadata } from '@/metadata/home.metadata';

export const metadata = homeMetadata;

export default async function Home() {
  const [salePosts, apartmentPosts, housePosts, businessSpacePosts] = await Promise.all([
    rentalPostAdminService.getAll({ categoryCode: 0 }), // Mua bán nhà đất
    rentalPostAdminService.getAll({ categoryCode: 1 }), // Căn hộ cho thuê
    rentalPostAdminService.getAll({ categoryCode: 2 }), // Nhà nguyên căn
    rentalPostAdminService.getAll({ categoryCode: 3 }), // Cho thuê mặt bằng
  ]);

  return <ClientHomePage salePosts={salePosts} apartmentPosts={apartmentPosts} housePosts={housePosts} businessSpacePosts={businessSpacePosts} />;
}
