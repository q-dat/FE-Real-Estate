import { interiorService } from '@/services/interior.service';
import ClientInteriorsPage from './ClientInteriorsPage';

export default async function Page() {
  const [interiorSamples, interiorFinished] = await Promise.all([
    interiorService.getAll({ categoryCode: 0 }), // Mẫu nội thất
    interiorService.getAll({ categoryCode: 1 }), // Thành phẩm đã hoàn thành
  ]);

  return <ClientInteriorsPage interiorSamples={interiorSamples} interiorFinished={interiorFinished} />;
}
