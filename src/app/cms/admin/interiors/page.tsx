export const revalidate = 0;

import { interiorCategoryService } from '@/services/interiorCategoryService';
import ClientInteriorAdminPage from './ClientInteriorAdminPage';
import { interiorService } from '@/services/interiorsService';

export default async function RentalPostAdminPage() {
  const interiors = await interiorService.getAll();
  const categories = await interiorCategoryService.getAll();

  return <ClientInteriorAdminPage interiors={interiors ?? []} categories={Array.isArray(categories) ? categories : []} />;
}
