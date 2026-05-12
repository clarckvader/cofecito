"use client";

import { useState } from "react";
import { QrCode, FileText } from "lucide-react";
import type { Lot, Truck } from "@/lib/api";

const methods = [
  { id: "Espresso", label: "ESPRESSO", icon: "☕" },
  { id: "V60", label: "V60", icon: "🫗" },
  { id: "Chemex", label: "CHEMEX", icon: "⚗️" },
  { id: "AeroPress", label: "AEROPRESS", icon: "🔧" },
  { id: "ColdBrew", label: "COLD BREW", icon: "🧊" },
  { id: "Sifon", label: "OTHER", icon: "•••" },
];

type Props = { lots: Lot[]; trucks: Truck[] };

export default function BaristaTerminal({ lots, trucks }: Props) {
  const [selectedLotId, setSelectedLotId] = useState(lots[0]?.id ?? "");
  const [selectedMethod, setSelectedMethod] = useState("Espresso");
  const [params, setParams] = useState({ temp: "93", time: "26", dose: "18.5", ratio: "1:2" });
  const [generating, setGenerating] = useState(false);
  const [lastQr, setLastQr] = useState<{ qrCode: string; qrImageBase64: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const truck = trucks[0];
  const barista = truck?.baristas[0];

  async function handleGenerate() {
    if (!selectedLotId || !truck || !barista) return;
    setGenerating(true);
    setError(null);
    try {
      // Use stored admin token, or login as admin if not available
      let token = localStorage.getItem("cf_token");
      if (!token) {
        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "cofecito2026" }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error ?? "Login failed");
        token = loginData.token;
        localStorage.setItem("cf_token", token!);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cups/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lotId: selectedLotId,
          truckId: truck.id,
          baristaId: barista.id,
          method: selectedMethod,
          waterTemp: Number(params.temp),
          extractionTime: Number(params.time),
          coffeeDose: Number(params.dose),
          waterRatio: parseFloat(params.ratio.split(":")[1] ?? "2"),
        }),
      });
      if (!res.ok) {
        // Token may have expired — clear and retry once
        if (res.status === 401) {
          localStorage.removeItem("cf_token");
          throw new Error("Sesión expirada, intenta de nuevo");
        }
        throw new Error(await res.text());
      }
      const data = await res.json();
      setLastQr({ qrCode: data.qrCode, qrImageBase64: data.qrImageBase64 });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            {lots.map((lot) => (
              <button
                key={lot.id}
                onClick={() => setSelectedLotId(lot.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  selectedLotId === lot.id
                    ? "border-[var(--primary)] bg-[var(--primary-container)]/20"
                    : "border-[var(--outline-variant)] hover:border-[var(--outline)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--on-surface)]">{lot.name}</span>
                  {selectedLotId === lot.id && <span className="text-[var(--primary)] text-xs">✓</span>}
                </div>
                <div className="text-[10px] text-[var(--on-surface-variant)] font-mono">
                  {lot.variety} · {lot.process} · {lot.farm?.name}
                </div>
                {lot.cuppingScore && (
                  <div className="text-[10px] text-[var(--primary)] mt-1">SCA {lot.cuppingScore}</div>
                )}
              </button>
            ))}
            {lots.length === 0 && (
              <p className="text-xs text-[var(--on-surface-variant)] col-span-2">No hay lotes activos disponibles.</p>
            )}
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
              { key: "ratio", label: "RATIO", unit: "" },
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
                  {unit && <span className="text-[var(--on-surface-variant)] text-xs">{unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-xs text-red-300">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !selectedLotId}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <QrCode size={20} />
          {generating ? "GENERANDO..." : "GENERAR QR"}
        </button>

        {/* QR result */}
        {lastQr && (
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--primary)] p-5 text-center">
            <div className="text-xs text-green-400 mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              QR generado exitosamente
            </div>
            <div className="font-mono text-[var(--primary)] text-lg font-bold mb-4">{lastQr.qrCode}</div>
            <img
              src={`data:image/png;base64,${lastQr.qrImageBase64}`}
              alt="QR Code"
              className="mx-auto w-44 h-44 rounded-lg"
            />
            <div className="text-xs text-[var(--on-surface-variant)] mt-3 mb-4">
              Mostrar al cliente para escanear
            </div>

            {/* Demo link */}
            <div className="border-t border-[var(--outline-variant)] pt-4">
              <div className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mb-2">
                Link de demo (sin app móvil)
              </div>
              <a
                href={`/scan/${lastQr.qrCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--on-primary)] text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <QrCode size={14} />
                Abrir experiencia del cliente →
              </a>
              <div className="text-[10px] text-[var(--on-surface-variant)] mt-2 font-mono break-all">
                /scan/{lastQr.qrCode}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="space-y-4">
        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
          <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">Terminal Activa</div>
          {truck ? (
            <>
              <div className="text-sm font-semibold text-[var(--on-surface)]">{truck.name}</div>
              <div className="text-xs text-[var(--on-surface-variant)] mt-1">{truck.location}</div>
              <div className="mt-3 space-y-1">
                {truck.baristas.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    {b.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-[var(--on-surface-variant)]">No hay truck asignado</div>
          )}
        </div>

        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
          <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">NEXT BLOCKCHAIN ENTRY</div>
          <div className="text-sm font-semibold text-[var(--on-surface)] mb-3">Resumen de Extracción</div>
          <div className="space-y-2 text-xs text-[var(--on-surface-variant)]">
            <div className="flex justify-between">
              <span>Red</span>
              <span className="text-green-400">Solana Devnet</span>
            </div>
            <div className="flex justify-between">
              <span>Gas estimado</span>
              <span className="font-mono">~0.000009 SOL</span>
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
