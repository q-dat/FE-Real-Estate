import { realEstateProjectService } from '@/services/realEstateProjectService';
import ClientRealEstateProjectPage from './ClientRealEstateProjectPage';

export default async function Page() {
  const projects = await realEstateProjectService.getAll();

  return (
 <>
 <ClientRealEstateProjectPage projects={projects}/>
 </>
  );
}

