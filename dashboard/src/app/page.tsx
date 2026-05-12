export const dynamic = "force-dynamic";

import { ArrowUpRight } from "lucide-react";
import { api, type Farm, type Lot } from "@/lib/api";

const statusColors: Record<string, string> = {
  "WASHED": "bg-blue-900/40 text-blue-300",
  "NATURAL": "bg-yellow-900/40 text-yellow-300",
  "HONEY": "bg-orange-900/40 text-orange-300",
  "ANAEROBIC": "bg-purple-900/40 text-purple-300",
  "CARBONIC_MACERATION": "bg-red-900/40 text-red-300",
};

export default async function DashboardPage() {
  const [farms, lots, trucks] = await Promise.all([
    api.farms.list(),
    api.lots.list({ active: true }),
    api.trucks.list(),
  ]);

  const totalFarms = farms.length;
  const totalLots = lots.length;
  const totalTrucks = trucks.length;
  const avgScore =
    lots.filter((l) => l.cuppingScore).length > 0
      ? (lots.reduce((a, l) => a + (l.cuppingScore ?? 0), 0) / lots.filter((l) => l.cuppingScore).length).toFixed(1)
      : "—";

  const stats = [
    { label: "FINCAS ACTIVAS", value: totalFarms, sub: "registradas en blockchain", color: "text-[var(--primary)]" },
    { label: "LOTES ACTIVOS", value: totalLots, sub: "en circulación", color: "text-[var(--secondary)]" },
    { label: "TRUCKS", value: totalTrucks, sub: "en operación", color: "text-[var(--primary)]" },
    { label: "CUPPING AVG", value: avgScore, sub: "score SCA promedio", color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--surface-container)] rounded-xl p-4 border border-[var(--outline-variant)]">
            <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-2">{s.label}</div>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--on-surface-variant)] mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Farms + Lots grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Farms */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
          <div className="px-4 py-3 border-b border-[var(--outline-variant)]">
            <div className="text-sm font-semibold text-[var(--on-surface)]">Fincas</div>
            <div className="text-xs text-[var(--on-surface-variant)]">Productores registrados</div>
          </div>
          <div className="divide-y divide-[var(--outline-variant)]">
            {farms.map((farm: Farm) => (
              <div key={farm.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--on-surface)]">{farm.name}</div>
                  <div className="text-xs text-[var(--on-surface-variant)]">{farm.region} · {farm.altitude} msnm · {farm.producer}</div>
                </div>
                <div className="text-xs text-[var(--primary)] font-mono">{farm.lots?.length ?? 0} lotes</div>
              </div>
            ))}
            {farms.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-[var(--on-surface-variant)]">No hay fincas registradas</div>
            )}
          </div>
        </div>

        {/* Trucks */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
          <div className="px-4 py-3 border-b border-[var(--outline-variant)]">
            <div className="text-sm font-semibold text-[var(--on-surface)]">Trucks</div>
            <div className="text-xs text-[var(--on-surface-variant)]">Terminales activas</div>
          </div>
          <div className="divide-y divide-[var(--outline-variant)]">
            {trucks.map((truck) => (
              <div key={truck.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--on-surface)]">{truck.name}</div>
                  <div className="text-xs text-[var(--on-surface-variant)]">{truck.location}</div>
                  <div className="text-xs text-[var(--on-surface-variant)] mt-0.5">{truck.baristas.length} baristas</div>
                </div>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  Live
                </span>
              </div>
            ))}
            {trucks.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-[var(--on-surface-variant)]">No hay trucks registrados</div>
            )}
          </div>
        </div>
      </div>

      {/* Lots table */}
      <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
          <div>
            <div className="text-sm font-semibold text-[var(--on-surface)]">Lotes Activos</div>
            <div className="text-xs text-[var(--on-surface-variant)]">Todos los lotes en circulación</div>
          </div>
          <a href="/lots" className="flex items-center gap-1 text-xs text-[var(--primary)] border border-[var(--primary-container)] rounded-lg px-3 py-1.5 hover:bg-[var(--primary-container)] transition-colors">
            <ArrowUpRight size={12} /> Nuevo Lote
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--outline-variant)]">
                {["LOTE", "FINCA", "VARIEDAD", "PROCESO", "CUPPING", "TOSTADOR", "ESTADO"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[var(--on-surface-variant)] font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {lots.map((lot: Lot) => (
                <tr key={lot.id} className="hover:bg-[var(--surface-high)] transition-colors">
                  <td className="px-4 py-3 text-[var(--primary)] font-semibold">{lot.name}</td>
                  <td className="px-4 py-3 text-[var(--on-surface)]">{lot.farm?.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[var(--surface-high)] text-[var(--on-surface)] px-2 py-0.5 rounded text-[10px]">{lot.variety}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[lot.process] ?? "bg-[var(--surface-high)] text-[var(--on-surface-variant)]"}`}>
                      {lot.process}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--primary)] font-mono font-semibold">
                    {lot.cuppingScore ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--on-surface-variant)]">{lot.roaster ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-green-900/40 text-green-300">Activo</span>
                  </td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[var(--on-surface-variant)]">No hay lotes activos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
