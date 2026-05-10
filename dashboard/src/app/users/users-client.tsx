"use client";

import { useState } from "react";
import { Plus, Trash2, Truck as TruckIcon, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LoginModal } from "@/components/auth/login-modal";
import { api, type Truck, type Barista } from "@/lib/api";

type Props = { initialTrucks: Truck[] };

export default function UsersClient({ initialTrucks }: Props) {
  const { isAdmin } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [showLogin, setShowLogin] = useState(false);
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [showBaristaForm, setShowBaristaForm] = useState<string | null>(null); // truckId
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(trucks[0] ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [truckForm, setTruckForm] = useState({ name: "", location: "", lat: -17.78, lng: -63.18 });
  const [baristaName, setBaristaName] = useState("");

  function requireAdmin(cb: () => void) {
    if (!isAdmin) { setShowLogin(true); return; }
    cb();
  }

  async function createTruck(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const truck = await api.trucks.create({ ...truckForm, active: true }) as Truck;
      setTrucks((t) => [...t, { ...truck, baristas: [] }]);
      setShowTruckForm(false);
      setTruckForm({ name: "", location: "", lat: -17.78, lng: -63.18 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createBarista(truckId: string) {
    if (!baristaName.trim()) return;
    setSaving(true);
    try {
      const barista = await api.baristas.create({ name: baristaName, truckId });
      setTrucks((ts) =>
        ts.map((t) => t.id === truckId ? { ...t, baristas: [...t.baristas, barista] } : t)
      );
      if (selectedTruck?.id === truckId) {
        setSelectedTruck((t) => t ? { ...t, baristas: [...t.baristas, barista] } : t);
      }
      setBaristaName("");
      setShowBaristaForm(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBarista(baristaId: string, truckId: string) {
    if (!confirm("¿Eliminar este barista?")) return;
    try {
      await api.baristas.delete(baristaId);
      setTrucks((ts) =>
        ts.map((t) => t.id === truckId ? { ...t, baristas: t.baristas.filter((b) => b.id !== baristaId) } : t)
      );
      if (selectedTruck?.id === truckId) {
        setSelectedTruck((t) => t ? { ...t, baristas: t.baristas.filter((b) => b.id !== baristaId) } : t);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--on-surface)]">User Management</h1>
            <p className="text-sm text-[var(--on-surface-variant)]">Gestión de trucks, baristas y operadores.</p>
          </div>
          <button
            onClick={() => requireAdmin(() => setShowTruckForm(true))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Nuevo Truck
          </button>
        </div>

        {/* Truck form */}
        {showTruckForm && (
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
            <div className="text-sm font-semibold text-[var(--on-surface)] mb-4">Nuevo Truck</div>
            <form onSubmit={createTruck} className="grid grid-cols-2 gap-3">
              {[
                ["name", "Nombre del truck *", "text"],
                ["location", "Ubicación / dirección *", "text"],
                ["lat", "Latitud", "number"],
                ["lng", "Longitud", "number"],
              ].map(([k, label, type]) => (
                <div key={k}>
                  <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={String(truckForm[k as keyof typeof truckForm])}
                    onChange={(e) => setTruckForm((f) => ({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              ))}
              {error && <p className="col-span-2 text-xs text-red-400">{error}</p>}
              <div className="col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowTruckForm(false)} className="px-4 py-2 text-sm text-[var(--on-surface-variant)]">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-50">
                  {saving ? "Guardando..." : "Crear Truck"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Trucks list */}
          <div className="lg:col-span-2 bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
              <span className="text-sm font-semibold text-[var(--on-surface)]">Trucks</span>
              <span className="text-xs text-[var(--on-surface-variant)]">{trucks.length} registrados</span>
            </div>
            <div className="divide-y divide-[var(--outline-variant)]">
              {trucks.map((truck) => (
                <div
                  key={truck.id}
                  onClick={() => setSelectedTruck(truck)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    selectedTruck?.id === truck.id ? "bg-[var(--primary-container)]/10" : "hover:bg-[var(--surface-high)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TruckIcon size={14} className="text-[var(--primary)]" />
                      <span className="text-sm font-semibold text-[var(--on-surface)]">{truck.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Activo
                    </span>
                  </div>
                  <div className="text-xs text-[var(--on-surface-variant)] mt-1 ml-5">
                    {truck.location} · {truck.baristas.length} baristas
                  </div>
                </div>
              ))}
              {trucks.length === 0 && (
                <div className="px-4 py-10 text-center text-xs text-[var(--on-surface-variant)]">No hay trucks registrados.</div>
              )}
            </div>
          </div>

          {/* Baristas for selected truck */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
            {selectedTruck ? (
              <>
                <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-2">Baristas — {selectedTruck.name}</div>
                <div className="space-y-2 mb-3">
                  {selectedTruck.baristas.map((b: Barista) => (
                    <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-[var(--outline-variant)] last:border-0">
                      <div className="flex items-center gap-2">
                        <UserCircle size={14} className="text-[var(--on-surface-variant)]" />
                        <span className="text-sm text-[var(--on-surface)]">{b.name}</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => deleteBarista(b.id, selectedTruck.id)}
                          className="text-[var(--on-surface-variant)] hover:text-red-400 p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {selectedTruck.baristas.length === 0 && (
                    <p className="text-xs text-[var(--on-surface-variant)] py-2">Sin baristas asignados.</p>
                  )}
                </div>

                {showBaristaForm === selectedTruck.id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={baristaName}
                      onChange={(e) => setBaristaName(e.target.value)}
                      placeholder="Nombre del barista"
                      className="flex-1 bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-2 py-1.5 text-xs text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createBarista(selectedTruck.id);
                        if (e.key === "Escape") setShowBaristaForm(null);
                      }}
                    />
                    <button
                      onClick={() => createBarista(selectedTruck.id)}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold disabled:opacity-50"
                    >
                      {saving ? "..." : "Agregar"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => requireAdmin(() => setShowBaristaForm(selectedTruck.id))}
                    className="w-full flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
                  >
                    <Plus size={12} /> Agregar barista
                  </button>
                )}
              </>
            ) : (
              <div className="text-center text-xs text-[var(--on-surface-variant)] py-8">
                Selecciona un truck para ver sus baristas
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
