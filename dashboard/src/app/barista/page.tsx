import { api } from "@/lib/api";
import BaristaTerminal from "./terminal";

export default async function BaristaPage() {
  const lots = await api.lots.list({ active: true });
  const trucks = await api.trucks.list();

  return <BaristaTerminal lots={lots} trucks={trucks} />;
}
