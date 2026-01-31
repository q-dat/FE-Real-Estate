export const revalidate = 0;

import { interiorCategoryService } from '@/services/interiorCategory.service';
import ClientInteriorAdminPage from './ClientInteriorAdminPage';
import { interiorService } from '@/services/interior.service';

export default async function RentalPostAdminPage() {
  const interiors = await interiorService.getAll();
  const categories = await interiorCategoryService.getAll();

  return <ClientInteriorAdminPage interiors={interiors ?? []} categories={Array.isArray(categories) ? categories : []} />;
}
