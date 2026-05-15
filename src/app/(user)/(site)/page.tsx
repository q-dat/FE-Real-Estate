export const revalidate = 300;

import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import ClientHomePage from './ClientHomePage';
import { homeMetadata } from '@/metadata/home.metadata';

export const metadata = homeMetadata;

const HOME_PAGE_LIMIT = 8;

export default async function Home() {
  const [salePosts, apartmentPosts, housePosts, businessSpacePosts] = await Promise.all([
    rentalPostAdminService.getAll({
      categoryCode: 0,
      page: 1,
      limit: HOME_PAGE_LIMIT,
    }),

    rentalPostAdminService.getAll({
      categoryCode: 1,
      page: 1,
      limit: HOME_PAGE_LIMIT,
    }),

    rentalPostAdminService.getAll({
      categoryCode: 2,
      page: 1,
      limit: HOME_PAGE_LIMIT,
    }),

    rentalPostAdminService.getAll({
      categoryCode: 3,
      page: 1,
      limit: HOME_PAGE_LIMIT,
    }),
  ]);

  return (
    <ClientHomePage
      salePosts={salePosts}
      apartmentPosts={apartmentPosts}
      housePosts={housePosts}
      businessSpacePosts={businessSpacePosts}
    />
  );
}