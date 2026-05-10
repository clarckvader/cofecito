"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Coffee,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Wallet,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LoginModal } from "@/components/auth/login-modal";

const navItems = [
  { href: "/",          label: "Dashboard",       icon: LayoutDashboard },
  { href: "/farms",     label: "Farm Assets",      icon: Sprout },
  { href: "/lots",      label: "Variety Registry", icon: FlaskConical },
  { href: "/barista",   label: "Barista Terminal", icon: Coffee },
  { href: "/analytics", label: "Analytics",        icon: BarChart3 },
  { href: "/users",     label: "User Management",  icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { token, isAdmin, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("cf_wallet");
    if (stored) setWallet(stored);
  }, []);

  async function connectWallet() {
    const phantom = (window as any).phantom?.solana ?? (window as any).solana;
    if (!phantom) {
      window.open("https://phantom.app", "_blank");
      return;
    }
    try {
      const { publicKey } = await phantom.connect();
      const addr = publicKey.toString();
      sessionStorage.setItem("cf_wallet", addr);
      setWallet(addr);
    } catch {
      // user rejected
    }
  }

  function disconnectWallet() {
    sessionStorage.removeItem("cf_wallet");
    setWallet(null);
  }

  function shortAddr(addr: string) {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  }

  return (
    <>
      <aside className="flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r border-[var(--outline-variant)] bg-[var(--surface-low)]">
        {/* Logo */}
        <div className="px-5 py-6">
          <div className="text-[var(--primary)] font-black text-xl leading-none">Cofecito</div>
          <div className="text-[var(--primary)] font-black text-xl leading-none">Portal</div>
          <div className="text-[var(--on-surface-variant)] text-[10px] mt-1 tracking-widest uppercase">
            Ecosystem Management
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--primary-container)] text-[var(--primary)]"
                    : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-2">
          {/* Wallet */}
          {wallet ? (
            <button
              onClick={disconnectWallet}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--primary)] text-[var(--primary)] text-sm hover:bg-[var(--primary-container)] transition-colors"
            >
              <Wallet size={16} />
              <span className="font-mono text-xs flex-1 text-left">{shortAddr(wallet)}</span>
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}

          {/* Auth */}
          {isAdmin ? (
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--on-surface-variant)] text-xs hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              Cerrar sesión (admin)
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--on-surface-variant)] text-xs hover:text-[var(--primary)] transition-colors"
            >
              <LogIn size={14} />
              Iniciar sesión
            </button>
          )}

          <div className="flex items-center justify-between px-1 pt-1">
            <Link href="/settings" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
              <Settings size={16} />
            </Link>
            <Link href="/support" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
              <HelpCircle size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
