const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cf_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function mutation<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `API ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const post  = <T>(path: string, body: unknown) => mutation<T>("POST",   path, body);
const put   = <T>(path: string, body: unknown) => mutation<T>("PUT",    path, body);
const patch = <T>(path: string, body: unknown) => mutation<T>("PATCH",  path, body);
const del   = <T>(path: string)                => mutation<T>("DELETE", path);

// ── Types ──────────────────────────────────────────────────────────────────

export type Farm = {
  id: string;
  name: string;
  country: string;
  region: string;
  altitude: number;
  lat: number;
  lng: number;
  producer: string;
  story: string | null;
  photoIpfs: string | null;
  createdAt: string;
  lots?: { id: string; name: string }[];
};

export type Lot = {
  id: string;
  farmId: string;
  farm: Farm;
  name: string;
  variety: string;
  process: string;
  harvestDate: string;
  cuppingScore: number | null;
  cuppingNotes: string | null;
  cupper: string | null;
  roastLevel: string | null;
  roastDate: string | null;
  roaster: string | null;
  metadataIpfs: string | null;
  blockchainHash: string | null;
  txSignature: string | null;
  active: boolean;
  createdAt: string;
};

export type Truck = {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  active: boolean;
  baristas: Barista[];
};

export type Barista = {
  id: string;
  name: string;
  truckId: string;
};

export type MenuItem = {
  id: string;
  truckId: string;
  lotId: string;
  lot: Lot;
  price: number;
  active: boolean;
};

export type Cup = {
  id: string;
  qrCode: string;
  lotId: string;
  lot: Lot;
  truckId: string;
  truck: Truck;
  baristaId: string;
  barista: Barista;
  method: string;
  waterTemp: number | null;
  extractionTime: number | null;
  coffeeDose: number | null;
  waterRatio: number | null;
  baristaNotes: string | null;
  redeemed: boolean;
  redeemedAt: string | null;
  walletAddress: string | null;
  mintAddress: string | null;
  createdAt: string;
};

export type FeedbackStats = {
  totalCups: number;
  avgScoreSCA: number | null;
  aromaProfile: Record<string, number>;
  topNotas: { key: string; count: number }[];
  avgSensory: Record<string, number | null>;
};

export type AnalyticsOverview = {
  totalFarms: number;
  totalLots: number;
  totalTrucks: number;
  totalCups: number;
  redeemedCups: number;
  totalNFTs: number;
  recentCups: (Cup & { lot: { name: string; variety: string }; truck: { name: string }; barista: { name: string } })[];
  processDist: { process: string; count: number }[];
};

// ── API calls ──────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (username: string, password: string) =>
      post<{ token: string }>("/api/auth/login", { username, password }),
  },
  farms: {
    list:   ()              => get<Farm[]>("/api/farms"),
    get:    (id: string)    => get<Farm>(`/api/farms/${id}`),
    create: (data: Omit<Farm, "id" | "createdAt" | "lots">) =>
      post<Farm>("/api/farms", data),
    update: (id: string, data: Partial<Farm>) =>
      put<Farm>(`/api/farms/${id}`, data),
    delete: (id: string)    => del<{ ok: boolean }>(`/api/farms/${id}`),
  },
  lots: {
    list: (params?: { farmId?: string; active?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.farmId) qs.set("farmId", params.farmId);
      if (params?.active !== undefined) qs.set("active", String(params.active));
      return get<Lot[]>(`/api/lots${qs.size ? `?${qs}` : ""}`);
    },
    get:    (id: string)    => get<Lot>(`/api/lots/${id}`),
    create: (data: unknown) => post<Lot>("/api/lots", data),
    update: (id: string, data: unknown) => put<Lot>(`/api/lots/${id}`, data),
    setActive: (id: string, active: boolean) =>
      patch<Lot>(`/api/lots/${id}/active`, { active }),
  },
  trucks: {
    list:   ()              => get<Truck[]>("/api/trucks"),
    get:    (id: string)    => get<Truck>(`/api/trucks/${id}`),
    create: (data: unknown) => post<Truck>("/api/trucks", data),
    update: (id: string, data: unknown) => put<Truck>(`/api/trucks/${id}`, data),
  },
  baristas: {
    create: (data: { name: string; truckId: string }) =>
      post<Barista>("/api/trucks/baristas", data),
    delete: (baristaId: string) =>
      del<{ ok: boolean }>(`/api/trucks/baristas/${baristaId}`),
  },
  menus: {
    byTruck: (truckId: string) => get<MenuItem[]>(`/api/menus/truck/${truckId}`),
  },
  cups: {
    get: (qrCode: string) => get<Cup>(`/api/cups/${qrCode}`),
  },
  feedback: {
    byFarm: (farmId: string) => get<FeedbackStats>(`/api/feedback/farm/${farmId}`),
    byLot:  (lotId: string)  => get<FeedbackStats>(`/api/feedback/lot/${lotId}`),
  },
  trazabilidad: {
    lot: (lotId: string) =>
      get<Lot & { solscanUrl: string | null }>(`/api/trazabilidad/lot/${lotId}`),
  },
  analytics: {
    overview: () => get<AnalyticsOverview>("/api/analytics/overview"),
  },
};
