import { rentalPostAdminService } from "@/services/rentalPostAdminService";
import ClientHomePage from "./ClientHomePage";

export default async function Home() {
  const posts = await rentalPostAdminService.getAll();

  return <ClientHomePage posts={posts} />;
}
