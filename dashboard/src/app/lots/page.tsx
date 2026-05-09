"use client";

import { useState } from "react";
import { ExternalLink, Plus, ArrowRight } from "lucide-react";

const recentLots = [
  { id: "#COF-8821", variety: "Geisha Micro-Lot", truck: "TRUCK-01", status: "IN TRANSIT" },
  { id: "#COF-8790", variety: "Caturra Peaberry", truck: "Unassigned", status: "PROCESSING" },
];

const varieties = [
  "Geisha (Specialty Grade)",
  "Bourbon",
  "Typica",
  "Caturra",
  "Pacamara",
  "SL28",
];

const processes = [
  "Natural (Dry Process)",
  "Washed (Wet Process)",
  "Honey",
  "Anaerobic",
  "Carbonic Maceration",
];

const statusColors: Record<string, string> = {
  "IN TRANSIT": "bg-blue-900/40 text-blue-300",
  "PROCESSING": "bg-purple-900/40 text-purple-300",
};

const quickTags = ["SINGLE ORIGIN", "ROAST LIGHT", "ELEVATION 1800+", "SOL 2.0", "NFT READY"];

export default function LotsPage() {
  const [score, setScore] = useState(88.5);
  const [variety, setVariety] = useState(varieties[0]);
  const [process, setProcess] = useState(processes[0]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--on-surface)]">Registro de Lote</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">Complete detailed lot information and certify origin on the Solana blockchain for complete roast-to-retail transparency.</p>
        </div>
        <div className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg px-3 py-1.5">
          ✓ Draft Saved 2m ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top fields */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase block mb-2">VARIEDAD DE GRANO</label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2.5 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              >
                {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase block mb-2">MÉTODO DE PROCESO</label>
              <select
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2.5 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              >
                {processes.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase block mb-2">TEMPORADA DE COSECHA</label>
              <input
                type="month"
                defaultValue="2023-11"
                className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2.5 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase block mb-2">ALTURA (M.S.N.M.)</label>
              <div className="flex items-center gap-2 bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2.5">
                <input
                  type="number"
                  defaultValue={1850}
                  className="bg-transparent text-sm text-[var(--on-surface)] outline-none w-full"
                />
                <span className="text-xs text-[var(--on-surface-variant)]">m</span>
              </div>
            </div>
          </div>

          {/* Cupping score */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
            <label className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase block mb-4">CUPPING SCORE (SCA STANDARD)</label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--on-surface-variant)]">80 (Premium)</span>
              <span className="text-2xl font-black text-[var(--primary)]">{score}</span>
              <span className="text-xs text-[var(--on-surface-variant)]">100 (Excellent)</span>
            </div>
            <input
              type="range"
              min={80}
              max={100}
              step={0.5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-[#f5be44]"
            />
            <div className="flex justify-between text-[10px] text-[var(--on-surface-variant)] mt-1">
              <span>80 (Baseline)</span>
              <span>100 (Elusive)</span>
            </div>
          </div>

          {/* Recent lots table */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
              <span className="text-sm font-semibold text-[var(--on-surface)]">Lotes Recientes</span>
              <button className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline">
                Exportar Reporte <ArrowRight size={12} />
              </button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--outline-variant)]">
                  {["LOT ID", "VARIETY", "TRUCK ASSIGNMENT STATUS", "ACTIONS"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-[var(--on-surface-variant)] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--outline-variant)]">
                {recentLots.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--surface-high)] transition-colors">
                    <td className="px-4 py-3 text-[var(--primary)] font-mono font-semibold">{row.id}</td>
                    <td className="px-4 py-3 text-[var(--on-surface)]">{row.variety}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--on-surface-variant)]">{row.truck}</span>
                        {row.status && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[row.status] ?? ""}`}>{row.status}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-[var(--primary)] hover:underline flex items-center gap-1">
                        View <ArrowRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[var(--on-surface-variant)] flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[var(--surface-high)] flex items-center justify-center text-[8px]">2</span>
              Currently being edited by the Production Team
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-[var(--outline-variant)] text-sm text-[var(--on-surface-variant)] hover:border-[var(--outline)] transition-colors">
                Discard Changes
              </button>
              <button className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity">
                Finalize &amp; Sign Lot
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Blockchain status */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
            <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">Blockchain Status</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">SOL NETWORK · Live</span>
            </div>
            <div className="space-y-2 text-xs text-[var(--on-surface-variant)]">
              <div className="flex justify-between">
                <span>Last Track Registry</span>
                <span className="font-mono text-[var(--on-surface)]">7sF4q...2M4k, 60s</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>Permanently Registered</span>
              </div>
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--outline-variant)] text-xs text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
              <ExternalLink size={12} /> Verificar en Explorador
            </button>
          </div>

          {/* Photo placeholder */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] overflow-hidden">
            <div className="h-36 bg-[var(--surface-high)] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-1">🫘</div>
                <div className="text-[10px] text-[var(--on-surface-variant)]">Lot Inspection Photo</div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-xs font-semibold text-[var(--on-surface)] mb-0.5">LAST INSPECTION</div>
              <div className="text-[10px] text-[var(--on-surface-variant)]">Authentic Geisha Profile: Lot 8821 Analysis</div>
            </div>
            <button className="w-full flex items-center justify-center gap-1 py-2 border-t border-[var(--outline-variant)] text-xs text-[var(--primary)] hover:bg-[var(--surface-high)] transition-colors">
              <Plus size={12} /> Add Photo
            </button>
          </div>

          {/* Quick tags */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
            <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">QUICK METADATA TAGS</div>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => (
                <span key={tag} className="bg-[var(--surface-high)] text-[var(--on-surface-variant)] text-[10px] px-2 py-1 rounded font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
