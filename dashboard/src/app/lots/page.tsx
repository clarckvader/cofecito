export const dynamic = "force-dynamic";

import { api } from "@/lib/api";
import LotsClient from "./lots-client";

export default async function LotsPage() {
  const [lots, farms] = await Promise.all([
    api.lots.list(),
    api.farms.list(),
  ]);
  return <LotsClient lots={lots} farms={farms} />;
}
