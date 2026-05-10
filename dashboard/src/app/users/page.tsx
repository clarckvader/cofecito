import { api } from "@/lib/api";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const trucks = await api.trucks.list().catch(() => []);
  return <UsersClient initialTrucks={trucks} />;
}
