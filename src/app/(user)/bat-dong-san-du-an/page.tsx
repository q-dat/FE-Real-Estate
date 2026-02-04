import { realEstateProjectService } from '@/services/real-estate-project/realEstateProject.service';
import ClientRealEstateProjectPage from './ClientRealEstateProjectPage';

export default async function Page() {
  const projects = await realEstateProjectService.getAll();

  return (
 <>
 <ClientRealEstateProjectPage projects={projects}/>
 </>
  );
}

