import { realEstateProjectService } from '@/services/realEstateProject.service';
import ClientRealEstateProjectPage from './ClientRealEstateProjectPage';

export default async function Page() {
  const projects = await realEstateProjectService.getAll();

  return (
 <>
 <ClientRealEstateProjectPage projects={projects}/>
 </>
  );
}

