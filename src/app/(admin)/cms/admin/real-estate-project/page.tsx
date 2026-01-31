export const revalidate = 0

import { realEstateProjectService } from '@/services/realEstateProject.service'
import ClientRealEstateProjectAdminPage from './ClientRealEstateProjectAdminPage'

export default async function RealEstateProjectAdminPage() {
  const projects = await realEstateProjectService.getAll()

  return (
    <ClientRealEstateProjectAdminPage
      projects={Array.isArray(projects) ? projects : []}
    />
  )
}
