"use client";

import { useState } from "react";
import { QrCode, FileText } from "lucide-react";

const activeLots = [
  { id: "#042", name: "Gesha Panameño", origin: "ORIGIN: BOQUETE | COSECHA: 2023", grade: "COSECHA: 2023" },
  { id: "#038", name: "Typica Oro Bolivia", origin: "ORIGIN: CARANAVI | COSECHA: 2024", grade: "COSECHA: 2024" },
];

const methods = [
  { id: "espresso", label: "ESPRESSO", icon: "☕" },
  { id: "v60", label: "V60", icon: "🫗" },
  { id: "chemex", label: "CHEMEX", icon: "⚗️" },
  { id: "aeropress", label: "AEROPRESS", icon: "🔧" },
  { id: "coldbrew", label: "COLD BREW", icon: "🧊" },
  { id: "other", label: "OTHER", icon: "•••" },
];

const historial = [
  { type: "Espresso", name: "Gesha", lot: "Lote: #042 Boquete", params: "93°C · 25s · 18.5g" },
  { type: "V60", name: "Typica", lot: "Lote: Caranavi Gold", params: "90°C · 3m · 15g" },
  { type: "Doble Espresso", name: "Gesha", lot: "Lote: #042 Boquete", params: "92°C · 3m · 9g" },
];

export default function BaristaPage() {
  const [selectedLot, setSelectedLot] = useState(activeLots[0].id);
  const [selectedMethod, setSelectedMethod] = useState("espresso");
  const [params, setParams] = useState({ temp: "93", time: "26", dose: "18.5", ratio: "1:2" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main form */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--on-surface)]">Nueva Taza</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">Configura la extracción de café de especialidad vinculada al blockchain.</p>
        </div>

        {/* Step 1 — Lot */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-semibold text-[var(--on-surface)]">Seleccionar Lote Activo</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeLots.map((lot) => (
              <button
                key={lot.id}
                onClick={() => setSelectedLot(lot.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  selectedLot === lot.id
                    ? "border-[var(--primary)] bg-[var(--primary-container)]/20"
                    : "border-[var(--outline-variant)] hover:border-[var(--outline)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--on-surface)]">{lot.name}</span>
                  {selectedLot === lot.id && <span className="text-[var(--primary)] text-xs">✓</span>}
                </div>
                <div className="text-[10px] text-[var(--on-surface-variant)] font-mono">{lot.origin}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Method */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-semibold text-[var(--on-surface)]">Método de Extracción</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-[10px] font-semibold transition-colors ${
                  selectedMethod === m.id
                    ? "border-[var(--primary)] bg-[var(--primary-container)]/20 text-[var(--primary)]"
                    : "border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:border-[var(--outline)]"
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 — Params */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-sm font-semibold text-[var(--on-surface)]">Parámetros Técnicos</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: "temp", label: "TEMP AGUA (°C)", unit: "°C" },
              { key: "time", label: "TIEMPO (SEG)", unit: "s" },
              { key: "dose", label: "DOSIS (G)", unit: "g" },
              { key: "ratio", label: "RATIO", unit: "R" },
            ].map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-[10px] text-[var(--on-surface-variant)] tracking-wide uppercase block mb-1">{label}</label>
                <div className="flex items-center gap-1 bg-[var(--surface-high)] rounded-lg px-3 py-2 border border-[var(--outline-variant)]">
                  <input
                    type="text"
                    value={params[key as keyof typeof params]}
                    onChange={(e) => setParams((p) => ({ ...p, [key]: e.target.value }))}
                    className="bg-transparent text-[var(--on-surface)] text-sm font-semibold w-full outline-none"
                  />
                  <span className="text-[var(--on-surface-variant)] text-xs">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate QR */}
        <button className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-base hover:opacity-90 transition-opacity">
          <QrCode size={20} />
          GENERAR QR
        </button>
      </div>

      {/* Right panel */}
      <div className="space-y-4">
        {/* Historial */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
            <span className="text-sm font-semibold text-[var(--on-surface)]">Historial de Hoy</span>
            <span className="text-xs text-[var(--primary)] bg-[var(--primary-container)]/30 px-2 py-0.5 rounded">{historial.length} tazas</span>
          </div>
          <div className="divide-y divide-[var(--outline-variant)]">
            {historial.map((h, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <span className="text-xl">☕</span>
                <div>
                  <div className="text-xs font-semibold text-[var(--on-surface)]">{h.type} — {h.name}</div>
                  <div className="text-[10px] text-[var(--on-surface-variant)]">{h.lot}</div>
                  <div className="text-[10px] text-[var(--on-surface-variant)] font-mono mt-0.5">{h.params}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain entry */}
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
          <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">NEXT BLOCKCHAIN ENTRY</div>
          <div className="text-sm font-semibold text-[var(--on-surface)] mb-3">Resumen de Extracción</div>
          <div className="space-y-2 text-xs text-[var(--on-surface-variant)]">
            <div className="flex justify-between">
              <span>Tx Hash</span>
              <span className="font-mono text-[var(--primary)]">SIMUL_INTL</span>
            </div>
            <div className="flex justify-between">
              <span>Gas Cost</span>
              <span className="font-mono">0.000009 SOL</span>
            </div>
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--outline-variant)] text-xs text-[var(--on-surface-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
            <FileText size={12} /> Ver Reporte Diario
          </button>
        </div>
      </div>
    </div>
  );
}
