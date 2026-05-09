import { ArrowUpRight } from "lucide-react";

const stats = [
  { label: "TOTAL TAZAS", value: "1,284,092", sub: "+12% this month", color: "text-[var(--primary)]" },
  { label: "LOTES ACTIVOS", value: "432", sub: "# In flow", color: "text-[var(--secondary)]" },
  { label: "NFTS MINTEADOS", value: "41,850", sub: "On Solana Mainnet", color: "text-[var(--primary)]" },
  { label: "FEEDBACK SCORE", value: "4.88", sub: "★ High Sentiment", color: "text-green-400" },
];

const recentFeedback = [
  { name: "Marco V.", lot: "LOT #882", text: "Exceptional quality, the citric notes are very pronounced this season.", rating: 5 },
  { name: "Elena R.", lot: "LOT #770", text: "Smooth body with a heavy chocolate finish. Perfect for espresso blends.", rating: 4 },
  { name: "Julián S.", lot: "LOT #750", text: "Processing was very clean. No fermentation defects found in this batch.", rating: 5 },
];

const transitLots = [
  { id: "#COF-8821", origin: "Finca El Sol", variety: "Geisha", status: "In Transit", destination: "La Paz Dry Mill", blockchain: "0x4B...2A12", eta: "2h 45m" },
  { id: "#COF-8842", origin: "Pacha Mama Estate", variety: "Caturra", status: "At Checkpoint", destination: "Santa Cruz Roastery", blockchain: "0x1F...8B3E", eta: "Delayed" },
  { id: "#COF-9901", origin: "Andean Heights", variety: "Typica", status: "Processing", destination: "Warehouse Alpha", blockchain: "0x9C...4D71", eta: "Completed" },
  { id: "#COF-9122", origin: "Celestial Los Andes", variety: "Gesha", status: "In Transit", destination: "La Paz Dry Mill", blockchain: "0x7A...F901", eta: "5h 13m" },
];

const statusColors: Record<string, string> = {
  "In Transit": "bg-blue-900/40 text-blue-300",
  "At Checkpoint": "bg-yellow-900/40 text-yellow-300",
  "Processing": "bg-purple-900/40 text-purple-300",
  "Completed": "bg-green-900/40 text-green-300",
  "Delayed": "bg-red-900/40 text-red-300",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--surface-container)] rounded-xl p-4 border border-[var(--outline-variant)]">
            <div className="text-[10px] tracking-widest text-[var(--on-surface-variant)] uppercase mb-2">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--on-surface-variant)] mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Map + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
            <span className="text-sm font-semibold text-[var(--on-surface)]">Mapa de Ecosistema</span>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              14 Active Trucks
            </span>
          </div>
          <div className="h-56 bg-[#0d1117] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺</div>
              <div className="text-xs text-[var(--on-surface-variant)]">Real-time truck locations &amp; farm clusters</div>
              <div className="mt-3 inline-flex items-center gap-2 bg-[var(--surface-high)] rounded-lg px-3 py-1.5 text-xs text-[var(--on-surface)]">
                📍 Caranavi Station — Processing 45.3 Tons
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
          <div className="px-4 py-3 border-b border-[var(--outline-variant)]">
            <div className="text-sm font-semibold text-[var(--on-surface)]">Feedback Reciente</div>
            <div className="text-xs text-[var(--on-surface-variant)]">Sensory ratings from Baristas</div>
          </div>
          <div className="divide-y divide-[var(--outline-variant)]">
            {recentFeedback.map((f) => (
              <div key={f.name} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--on-surface)]">{f.name}</span>
                  <span className="text-[10px] text-[var(--on-surface-variant)] bg-[var(--surface-high)] px-2 py-0.5 rounded">{f.lot}</span>
                </div>
                <p className="text-[11px] text-[var(--on-surface-variant)] leading-relaxed">{f.text}</p>
                <div className="text-[var(--primary)] text-xs mt-1">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3">
            <button className="w-full text-xs text-[var(--primary)] border border-[var(--primary-container)] rounded-lg py-2 hover:bg-[var(--primary-container)] transition-colors">
              View All Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Transit table */}
      <div className="bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
          <div>
            <div className="text-sm font-semibold text-[var(--on-surface)]">Lotes en Tránsito</div>
            <div className="text-xs text-[var(--on-surface-variant)]">Real-time ledger of coffee movement</div>
          </div>
          <button className="flex items-center gap-1 text-xs text-[var(--primary)] border border-[var(--primary-container)] rounded-lg px-3 py-1.5 hover:bg-[var(--primary-container)] transition-colors">
            <ArrowUpRight size={12} /> Export Ledger
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--outline-variant)]">
                {["LOT ID", "ORIGIN FARM", "VARIETY", "TRANSIT STATUS", "DESTINATION", "BLOCKCHAIN HASH", "ETA"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[var(--on-surface-variant)] font-medium tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {transitLots.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--surface-high)] transition-colors">
                  <td className="px-4 py-3 text-[var(--primary)] font-mono font-semibold">{row.id}</td>
                  <td className="px-4 py-3 text-[var(--on-surface)]">{row.origin}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[var(--surface-high)] text-[var(--on-surface)] px-2 py-0.5 rounded text-[10px]">{row.variety}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[row.status] ?? ""}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--on-surface-variant)]">{row.destination}</td>
                  <td className="px-4 py-3 font-mono text-[var(--on-surface-variant)]">{row.blockchain}</td>
                  <td className="px-4 py-3 text-[var(--on-surface-variant)]">{row.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
