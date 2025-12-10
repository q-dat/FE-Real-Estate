export const revalidate = 0;

import ClientInteriorAdminPage from './ClientInteriorAdminPage';
import { interiorService } from '@/services/interiorsService';

export default async function RentalPostAdminPage() {
  const items = await interiorService.getAll();
  return <ClientInteriorAdminPage items={items ?? []} />;
}
