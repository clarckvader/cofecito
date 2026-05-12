export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import ScanClient from "./scan-client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getCup(qrCode: string) {
  const res = await fetch(`${BASE}/api/cups/${qrCode}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ScanPage({ params }: { params: Promise<{ qrCode: string }> }) {
  const { qrCode } = await params;
  const cup = await getCup(qrCode);

  if (!cup) notFound();

  return (
    <ScanClient
      cup={cup}
      agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? ""}
    />
  );
}
