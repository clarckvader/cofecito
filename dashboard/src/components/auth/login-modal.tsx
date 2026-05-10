"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export function LoginModal({ onClose, onSuccess }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      onSuccess?.();
      onClose();
    } catch {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--on-surface)]">Admin Login</span>
          </div>
          <button onClick={onClose} className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Usuario</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--on-surface-variant)] mb-1 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--surface-high)] border border-[var(--outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-[10px] text-[var(--on-surface-variant)] text-center mt-3">
          usuario: admin · contraseña: cofecito2026
        </p>
      </div>
    </div>
  );
}
