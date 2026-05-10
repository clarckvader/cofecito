import { api } from "@/lib/api";
import FarmsClient from "./farms-client";

export default async function FarmsPage() {
  const farms = await api.farms.list().catch(() => []);
  return <FarmsClient initialFarms={farms} />;
}
