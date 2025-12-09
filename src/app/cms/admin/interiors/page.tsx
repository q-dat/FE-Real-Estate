export const revalidate = 0;

import ClientInteriorAdminPage from './ClientInteriorAdminPage';
import { interiorService } from '@/services/interiorsService';

export default async function RentalPostAdminPage() {
  const interiors = await interiorService.getAll();

  return <ClientInteriorAdminPage interiors={Array.isArray(interiors) ? interiors : []} />;
}
