"use client";

import { Search, Bell, User } from "lucide-react";
import Link from "next/link";

const navLinks = ["Farms", "Lots", "Trucks", "NFTs"];

export function Topbar() {
  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-[var(--outline-variant)] bg-[var(--surface)]">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xs bg-[var(--surface-container)] rounded-lg px-3 py-2 text-sm text-[var(--on-surface-variant)]">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search the ecosystem..."
          className="bg-transparent outline-none w-full text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)] text-sm"
        />
      </div>

      {/* Quick links */}
      <nav className="hidden md:flex items-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link}
            href={`/${link.toLowerCase()}`}
            className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors"
          >
            {link}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        {/* Terminal Sync badge */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-high)] text-xs text-[var(--on-surface-variant)] border border-[var(--outline-variant)]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Terminal Sync
        </button>

        {/* Mint button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary-container)] text-xs text-[var(--primary)] font-semibold">
          Mint Coffee NFT
        </button>

        <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors p-1">
          <Bell size={18} />
        </button>
        <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors p-1">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
