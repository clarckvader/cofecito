"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LoginModal } from "@/components/auth/login-modal";
import { api, type Lot, type Farm } from "@/lib/api";

type Props = { lots: Lot[]; farms: Farm[] };

const statusColors: Record<string, string> = {
  WASHED:             "bg-blue-900/40 text-blue-300",
  NATURAL:            "bg-yellow-900/40 text-yellow-300",
  HONEY:              "bg-orange-900/40 text-orange-300",
  ANAEROBIC:          "bg-purple-900/40 text-purple-300",
  CARBONIC_MACERATION:"bg-red-900/40 text-red-300",
};

const PROCESSES = ["NATURAL", "WASHED", "HONEY", "ANAEROBIC", "CARBONIC_MACERATION"];

const EMPTY_FORM = {
  farmId: "", name: "", variety: "", process: "WASHED",
  harvestDate: "", cuppingScore: "", cuppingNotes: "",
  roastLevel: "", roaster: "", cupper: "",
};

export default function LotsClient({ lots: initialLots, farms }: Props) {
  const { isAdmin } = useAuth();
  const [lots, setLots] = useState<Lot[]>(initialLots);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(lots[0] ?? null);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function f(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.farmId || !form.name || !form.variety || !form.harvestDate) {
      setError("Completa los campos obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        harvestDate: new Date(form.harvestDate).toISOString(),
        cuppingScore: form.cuppingScore ? Number(form.cuppingScore) : undefined,
      };
      const lot = await api.lots.create(payload);
      setLots((prev) => [lot, ...prev]);
      setSelectedLot(lot);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function inputClass() {
    return "w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]";
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--on-surface)]">Registro de Lote</h1>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Información completa de lotes certificados en la blockchain Solana.
            </p>
          </div>
          <button
            onClick={() => isAdmin ? setShowForm(true) : setShowLogin(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Nuevo Lote
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
            <div className="text-sm font-semibold text-[var(--on-surface)] mb-4">Nuevo Lote de Café</div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Finca *</label>
                <select value={form.farmId} onChange={f("farmId")} className={inputClass()}>
                  <option value="">Seleccionar finca...</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>{farm.name} — {farm.region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Nombre del lote *</label>
                <input value={form.name} onChange={f("name")} placeholder="Ej: Lot-2026-001" className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Variedad *</label>
                <input value={form.variety} onChange={f("variety")} placeholder="Geisha, Bourbon, Typica..." className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Proceso *</label>
                <select value={form.process} onChange={f("process")} className={inputClass()}>
                  {PROCESSES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Fecha de cosecha *</label>
                <input type="date" value={form.harvestDate} onChange={f("harvestDate")} className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Score SCA</label>
                <input type="number" min="0" max="100" value={form.cuppingScore} onChange={f("cuppingScore")} placeholder="87.5" className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Catador</label>
                <input value={form.cupper} onChange={f("cupper")} className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Nivel de tueste</label>
                <input value={form.roastLevel} onChange={f("roastLevel")} placeholder="Claro, Medio, Oscuro..." className={inputClass()} />
              </div>
              <div>
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Tostador</label>
                <input value={form.roaster} onChange={f("roaster")} className={inputClass()} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Notas de cata</label>
                <textarea value={form.cuppingNotes} onChange={f("cuppingNotes")} rows={2} placeholder="Frutal, chocolate, notas cítricas..." className={`${inputClass()} resize-none`} />
              </div>
              {error && <p className="col-span-2 text-xs text-red-400">{error}</p>}
              <div className="col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--on-surface-variant)]">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-50">
                  {saving ? "Guardando..." : "Crear Lote"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Lots table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
                <span className="text-sm font-semibold text-[var(--on-surface)]">Todos los Lotes</span>
                <span className="text-xs text-[var(--on-surface-variant)]">{lots.length} registrados</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--outline-variant)]">
                    {["NOMBRE", "VARIEDAD", "PROCESO", "FINCA", "SCA", "ESTADO"].map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-[var(--on-surface-variant)] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--outline-variant)]">
                  {lots.map((lot) => (
                    <tr
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className={`cursor-pointer transition-colors ${
                        selectedLot?.id === lot.id ? "bg-[var(--primary-container)]/10" : "hover:bg-[var(--surface-high)]"
                      }`}
                    >
                      <td className="px-4 py-3 text-[var(--primary)] font-semibold">{lot.name}</td>
                      <td className="px-4 py-3">
                        <span className="bg-[var(--surface-high)] text-[var(--on-surface)] px-2 py-0.5 rounded">{lot.variety}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded font-medium ${statusColors[lot.process] ?? "bg-[var(--surface-high)] text-[var(--on-surface-variant)]"}`}>
                          {lot.process}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--on-surface-variant)]">{lot.farm?.name}</td>
                      <td className="px-4 py-3 text-[var(--primary)] font-mono font-semibold">{lot.cuppingScore ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded ${lot.active ? "bg-green-900/40 text-green-300" : "bg-[var(--surface-high)] text-[var(--on-surface-variant)]"}`}>
                          {lot.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {lots.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--on-surface-variant)]">No hay lotes registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          <div className="space-y-4">
            {selectedLot ? (
              <>
                <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
                  <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">Detalle del Lote</div>
                  <div className="text-sm font-bold text-[var(--primary)] mb-1">{selectedLot.name}</div>
                  <div className="space-y-2 text-xs">
                    {[
                      ["Finca",      selectedLot.farm?.name],
                      ["Productor",  selectedLot.farm?.producer],
                      ["Región",     selectedLot.farm?.region],
                      ["Altitud",    selectedLot.farm?.altitude ? `${selectedLot.farm.altitude} msnm` : "—"],
                      ["Cosecha",    new Date(selectedLot.harvestDate).toLocaleDateString("es-BO", { year: "numeric", month: "long" })],
                      ["Tueste",     selectedLot.roastLevel],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[var(--on-surface-variant)]">{k}</span>
                        <span className="text-[var(--on-surface)]">{v}</span>
                      </div>
                    ))}
                    {selectedLot.cuppingScore && (
                      <div className="flex justify-between">
                        <span className="text-[var(--on-surface-variant)]">Score SCA</span>
                        <span className="text-[var(--primary)] font-bold">{selectedLot.cuppingScore}</span>
                      </div>
                    )}
                    {selectedLot.cuppingNotes && (
                      <div className="pt-2 border-t border-[var(--outline-variant)]">
                        <div className="text-[var(--on-surface-variant)] mb-1">Notas de cata</div>
                        <div className="text-[var(--on-surface)] italic">"{selectedLot.cuppingNotes}"</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
                  <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">Blockchain Status</div>
                  {selectedLot.blockchainHash ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-green-400">Registrado on-chain</span>
                      </div>
                      <div className="font-mono text-[10px] text-[var(--on-surface-variant)] break-all">{selectedLot.blockchainHash}</div>
                      {selectedLot.txSignature && (
                        <a
                          href={`https://solscan.io/tx/${selectedLot.txSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--outline-variant)] text-xs text-[var(--primary)] hover:bg-[var(--surface-high)] transition-colors"
                        >
                          <ExternalLink size={12} /> Ver en Solscan
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-[var(--on-surface-variant)]">Pendiente de registro on-chain</div>
                  )}
                </div>

                {selectedLot.metadataIpfs && (
                  <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
                    <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-2">IPFS</div>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${selectedLot.metadataIpfs}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-[var(--primary)] break-all hover:underline"
                    >
                      {selectedLot.metadataIpfs}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-8 text-center text-xs text-[var(--on-surface-variant)]">
                Selecciona un lote para ver el detalle
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={() => setShowForm(true)} />}
    </>
  );
}
