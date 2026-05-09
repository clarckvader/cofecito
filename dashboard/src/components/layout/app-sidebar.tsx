"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/farms", label: "Farm Assets", icon: Sprout },
  { href: "/lots", label: "Variety Registry", icon: FlaskConical },
  { href: "/barista", label: "Barista Terminal", icon: Coffee },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/users", label: "User Management", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
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

      {/* Connect Wallet */}
      <div className="px-3 pb-4">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--outline-variant)] text-[var(--on-surface-variant)] text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
          <Wallet size={16} />
          Connect Wallet
        </button>
        <div className="flex items-center justify-between mt-3 px-1">
          <Link href="/settings" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
            <Settings size={16} />
          </Link>
          <Link href="/support" className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
            <HelpCircle size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
