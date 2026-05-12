"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, MapPin, Mountain, ImagePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LoginModal } from "@/components/auth/login-modal";
import { api, type Farm } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Props = { initialFarms: Farm[] };

const EMPTY_FORM = {
  name: "", region: "", country: "Bolivia", altitude: 1500,
  lat: -16.5, lng: -68.15, producer: "", story: "",
};

export default function FarmsClient({ initialFarms }: Props) {
  const { isAdmin } = useAuth();
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Farm | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function field(k: keyof typeof form, label: string, type = "text", props = {}) {
    return (
      <div key={k}>
        <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">{label}</label>
        <input
          type={type}
          value={String(form[k])}
          onChange={(e) => setForm((f) => ({ ...f, [k]: type === "number" ? Number(e.target.value) : e.target.value }))}
          className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
          {...props}
        />
      </div>
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let photoIpfs: string | null = null;
      if (photoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", photoFile);
        const token = localStorage.getItem("cf_token") ?? "";
        const res = await fetch(`${BASE}/api/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error("Error al subir la foto");
        const { cid } = await res.json();
        photoIpfs = cid;
        setUploading(false);
      }
      const farm = await api.farms.create({ ...form, photoIpfs });
      setFarms((f) => [farm, ...f]);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta finca?")) return;
    try {
      await api.farms.delete(id);
      setFarms((f) => f.filter((x) => x.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--on-surface)]">Farm Assets</h1>
            <p className="text-sm text-[var(--on-surface-variant)]">Fincas y productores registrados en la plataforma.</p>
          </div>
          <button
            onClick={() => isAdmin ? setShowForm(true) : setShowLogin(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Nueva Finca
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-5">
            <div className="text-sm font-semibold text-[var(--on-surface)] mb-4">Nueva Finca</div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              {field("name", "Nombre de la finca *")}
              {field("producer", "Productor *")}
              {field("region", "Región *")}
              {field("country", "País")}
              {field("altitude", "Altitud (msnm) *", "number")}
              {field("lat", "Latitud", "number")}
              {field("lng", "Longitud", "number")}
              <div className="col-span-2">
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Historia / descripción</label>
                <textarea
                  value={form.story}
                  onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
                  rows={2}
                  className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Foto de la finca</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-[var(--outline-variant)] rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="h-24 object-cover rounded" />
                  ) : (
                    <>
                      <ImagePlus size={20} className="text-[var(--on-surface-variant)]" />
                      <span className="text-xs text-[var(--on-surface-variant)]">Haz clic para subir una imagen</span>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              {error && <p className="col-span-2 text-xs text-red-400">{error}</p>}
              <div className="col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {uploading ? "Subiendo foto..." : saving ? "Guardando..." : "Crear Finca"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Farms list */}
          <div className="lg:col-span-2 bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
              <span className="text-sm font-semibold text-[var(--on-surface)]">Todas las Fincas</span>
              <span className="text-xs text-[var(--on-surface-variant)]">{farms.length} registradas</span>
            </div>
            <div className="divide-y divide-[var(--outline-variant)]">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  onClick={() => setSelected(farm)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    selected?.id === farm.id ? "bg-[var(--primary-container)]/10" : "hover:bg-[var(--surface-high)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--primary)]">{farm.name}</div>
                    <div className="text-xs text-[var(--on-surface-variant)] mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><MapPin size={10} />{farm.region}</span>
                      <span className="flex items-center gap-1"><Mountain size={10} />{farm.altitude} msnm</span>
                      <span>{farm.lots?.length ?? 0} lotes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-[var(--on-surface-variant)]">{farm.producer}</span>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(farm.id); }}
                        className="text-[var(--on-surface-variant)] hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {farms.length === 0 && (
                <div className="px-4 py-10 text-center text-xs text-[var(--on-surface-variant)]">
                  No hay fincas registradas. Crea la primera.
                </div>
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] p-4">
            {selected ? (
              <>
                <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-3">Detalle de Finca</div>
                <div className="text-sm font-bold text-[var(--primary)] mb-3">{selected.name}</div>
                <div className="space-y-2 text-xs">
                  {[
                    ["Productor", selected.producer],
                    ["País", selected.country],
                    ["Región", selected.region],
                    ["Altitud", `${selected.altitude} msnm`],
                    ["Coordenadas", `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`],
                    ["Lotes", String(selected.lots?.length ?? 0)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[var(--on-surface-variant)]">{k}</span>
                      <span className="text-[var(--on-surface)] text-right max-w-[60%]">{v}</span>
                    </div>
                  ))}
                  {selected.story && (
                    <div className="pt-2 border-t border-[var(--outline-variant)]">
                      <div className="text-[var(--on-surface-variant)] mb-1">Historia</div>
                      <div className="text-[var(--on-surface)] italic">"{selected.story}"</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-[var(--on-surface-variant)] py-8">
                Selecciona una finca para ver el detalle
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={() => setShowForm(true)} />}
    </>
  );
}
