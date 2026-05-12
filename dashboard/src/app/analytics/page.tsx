export const dynamic = "force-dynamic";

import { Coffee, Layers, Store, Coins } from "lucide-react";
import { api } from "@/lib/api";

const processColors: Record<string, string> = {
  WASHED:             "bg-blue-900/40 text-blue-300",
  NATURAL:            "bg-yellow-900/40 text-yellow-300",
  HONEY:              "bg-orange-900/40 text-orange-300",
  ANAEROBIC:          "bg-purple-900/40 text-purple-300",
  CARBONIC_MACERATION:"bg-red-900/40 text-red-300",
};

export default async function AnalyticsPage() {
  const data = await api.analytics.overview().catch(() => null);

  if (!data) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-[var(--on-surface)]">Analytics</h1>
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-8 text-center text-sm text-[var(--on-surface-variant)]">
          No se pudo cargar los datos. Asegúrate que el backend esté corriendo.
        </div>
      </div>
    );
  }

  const redeemRate = data.totalCups > 0
    ? ((data.redeemedCups / data.totalCups) * 100).toFixed(1)
    : "0";

  const stats = [
    { label: "TAZAS TOTALES",  value: data.totalCups,    icon: Coffee,  color: "text-[var(--primary)]" },
    { label: "NFTs MINTEADOS", value: data.totalNFTs,    icon: Coins,   color: "text-green-400" },
    { label: "FINCAS",         value: data.totalFarms,   icon: Layers,  color: "text-[var(--secondary)]" },
    { label: "TRUCKS ACTIVOS", value: data.totalTrucks,  icon: Store,   color: "text-orange-400" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--on-surface)]">Analytics</h1>
        <p className="text-sm text-[var(--on-surface-variant)]">Resumen de actividad del ecosistema Cofecito.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--surface-container)] rounded-xl p-4 border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase">{s.label}</span>
              <s.icon size={14} className={s.color} />
            </div>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Redemption rate */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
          <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-4">Tasa de Canje</div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-black text-[var(--primary)]">{redeemRate}%</span>
            <span className="text-xs text-[var(--on-surface-variant)] pb-1">de tazas canjeadas como NFT</span>
          </div>
          <div className="h-2 bg-[var(--surface-high)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all"
              style={{ width: `${redeemRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--on-surface-variant)] mt-2">
            <span>{data.redeemedCups} canjeadas</span>
            <span>{data.totalCups - data.redeemedCups} pendientes</span>
          </div>
        </div>

        {/* Process distribution */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
          <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-4">Distribución por Proceso</div>
          {data.processDist.length === 0 ? (
            <p className="text-xs text-[var(--on-surface-variant)]">Sin datos de lotes.</p>
          ) : (
            <div className="space-y-2">
              {data.processDist.map((p) => (
                <div key={p.process} className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium min-w-[120px] ${processColors[p.process] ?? "bg-[var(--surface-high)] text-[var(--on-surface-variant)]"}`}>
                    {p.process}
                  </span>
                  <div className="flex-1 h-1.5 bg-[var(--surface-high)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full"
                      style={{ width: `${(p.count / data.totalLots) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--on-surface-variant)] w-4 text-right">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent cups */}
      <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
        <div className="px-4 py-3 border-b border-[var(--outline-variant)]">
          <span className="text-sm font-semibold text-[var(--on-surface)]">Tazas Recientes</span>
        </div>
        {data.recentCups.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-[var(--on-surface-variant)]">Sin tazas registradas aún.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--outline-variant)]">
                {["QR CODE", "LOTE", "TRUCK", "BARISTA", "MÉTODO", "CANJEADA"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[var(--on-surface-variant)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {data.recentCups.map((cup) => (
                <tr key={cup.id} className="hover:bg-[var(--surface-high)] transition-colors">
                  <td className="px-4 py-3 font-mono text-[var(--primary)]">{cup.qrCode}</td>
                  <td className="px-4 py-3 text-[var(--on-surface)]">{cup.lot.name}</td>
                  <td className="px-4 py-3 text-[var(--on-surface-variant)]">{cup.truck.name}</td>
                  <td className="px-4 py-3 text-[var(--on-surface-variant)]">{cup.barista.name}</td>
                  <td className="px-4 py-3 text-[var(--on-surface-variant)]">{cup.method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${cup.redeemed ? "bg-green-900/40 text-green-300" : "bg-[var(--surface-high)] text-[var(--on-surface-variant)]"}`}>
                      {cup.redeemed ? "Sí" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
