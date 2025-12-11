import { interiorService } from '@/services/interiorsService';
import ClientInteriorsPage from './ClientInteriorsPage';

const interiors = await interiorService.getAll();

export default function page() {
  return <ClientInteriorsPage interiors={interiors} />;
}
