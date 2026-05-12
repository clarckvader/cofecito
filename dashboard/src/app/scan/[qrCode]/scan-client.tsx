"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Conversation } from "@elevenlabs/client";
import {
  Mic, MicOff, Coffee, MapPin, Mountain, Thermometer,
  Timer, Droplets, Wallet, ExternalLink, CheckCircle2, Loader2
} from "lucide-react";

type Cup = {
  id: string;
  qrCode: string;
  redeemed: boolean;
  walletAddress: string | null;
  mintAddress: string | null;
  method: string;
  waterTemp: number | null;
  extractionTime: number | null;
  coffeeDose: number | null;
  waterRatio: number | null;
  baristaNotes: string | null;
  lot: {
    name: string;
    variety: string;
    process: string;
    cuppingScore: number | null;
    cuppingNotes: string | null;
    roastLevel: string | null;
    farm: {
      name: string;
      region: string;
      altitude: number;
      producer: string;
    };
  };
  truck: { name: string };
  barista: { name: string };
};

type Props = { cup: Cup; agentId?: string };

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const processLabel: Record<string, string> = {
  WASHED: "Lavado", NATURAL: "Natural", HONEY: "Honey",
  ANAEROBIC: "Anaeróbico", CARBONIC_MACERATION: "Maceración Carbónica",
};

export default function ScanClient({ cup, agentId }: Props) {
  const [redeemed, setRedeemed] = useState(cup.redeemed);
  const [mintAddress, setMintAddress] = useState(cup.mintAddress);
  const [wallet, setWallet] = useState(cup.walletAddress ?? "");
  const [step, setStep] = useState<"details" | "voice" | "claim">("details");
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");

  const [voiceStatus, setVoiceStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [voiceError, setVoiceError] = useState("");
  const conversationRef = useRef<Conversation | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => { conversationRef.current?.endSession(); };
  }, []);

  const startVoice = useCallback(async () => {
    setVoiceError("");
    setVoiceStatus("connecting");

    try {
      // Get signed WebSocket URL from backend (avoids WebRTC/LiveKit issues)
      const tokenRes = await fetch(`${BASE}/api/voice/token`);
      if (!tokenRes.ok) throw new Error("No se pudo obtener el token de voz.");
      const { signedUrl } = await tokenRes.json();

      conversationRef.current = await Conversation.startSession({
        signedUrl,
        onConnect: () => setVoiceStatus("active"),
        onDisconnect: () => setVoiceStatus(prev => prev === "active" ? "ended" : "idle"),
        onError: (msg: string) => {
          setVoiceError(typeof msg === "string" ? msg : "Error al conectar con el agente de voz.");
          setVoiceStatus("idle");
        },
        onModeChange: () => {},
      });
    } catch (err: any) {
      setVoiceError(err?.message ?? "No se pudo iniciar la sesión de voz.");
      setVoiceStatus("idle");
    }
  }, []);

  const stopVoice = useCallback(async () => {
    await conversationRef.current?.endSession();
    conversationRef.current = null;
    setVoiceStatus("ended");
  }, []);

  async function connectWallet() {
    const phantom = (window as any).phantom?.solana ?? (window as any).solana;
    if (!phantom) {
      window.open("https://phantom.app", "_blank");
      return;
    }
    const { publicKey } = await phantom.connect();
    setWallet(publicKey.toString());
  }

  async function claimNft() {
    if (!wallet.trim()) { setClaimError("Conecta tu wallet primero."); return; }
    setClaiming(true);
    setClaimError("");
    try {
      const res = await fetch(`${BASE}/api/cups/${cup.qrCode}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("cf_token") ?? ""}` },
        body: JSON.stringify({ walletAddress: wallet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRedeemed(true);
      setMintAddress(data.metadataUri ?? "pending");
      setStep("voice");
    } catch (err: any) {
      setClaimError(err.message);
    } finally {
      setClaiming(false);
    }
  }

  const { lot, truck, barista } = cup;
  const farm = lot.farm;

  return (
    <div className="min-h-screen bg-[#0D0905] text-white flex flex-col items-center px-4 pb-12">
      {/* Header */}
      <div className="w-full max-w-md pt-10 pb-6 text-center">
        <div className="text-[var(--primary)] font-black text-2xl tracking-tight">☕ Cofecito</div>
        <div className="text-xs text-[#8B5E3C] mt-1 tracking-widest uppercase">Tu experiencia de café</div>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Already redeemed banner */}
        {redeemed && step === "details" && (
          <div className="rounded-xl bg-green-900/30 border border-green-700/40 px-4 py-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            <span className="text-sm text-green-300">Este QR ya fue canjeado como NFT.</span>
          </div>
        )}

        {/* Coffee info card */}
        <div className="bg-[#1A0F07] rounded-2xl border border-[#3A2010] p-5">
          <div className="text-[10px] tracking-widest text-[#8B5E3C] uppercase mb-1">Lote</div>
          <div className="text-xl font-bold text-[#E8B84B] mb-0.5">{lot.name}</div>
          <div className="text-sm text-[#C8961A] mb-4">{lot.variety} · {processLabel[lot.process] ?? lot.process}</div>

          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-[#8B5E3C]" />
              <div>
                <div className="text-[#8B5E3C]">Finca</div>
                <div className="text-white font-medium">{farm.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mountain size={12} className="text-[#8B5E3C]" />
              <div>
                <div className="text-[#8B5E3C]">Altitud</div>
                <div className="text-white font-medium">{farm.altitude} msnm</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coffee size={12} className="text-[#8B5E3C]" />
              <div>
                <div className="text-[#8B5E3C]">Región</div>
                <div className="text-white font-medium">{farm.region}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coffee size={12} className="text-[#8B5E3C]" />
              <div>
                <div className="text-[#8B5E3C]">Productor</div>
                <div className="text-white font-medium">{farm.producer}</div>
              </div>
            </div>
          </div>

          {lot.cuppingScore && (
            <div className="mt-4 pt-3 border-t border-[#3A2010]">
              <span className="text-[10px] text-[#8B5E3C] uppercase tracking-widest">Score SCA</span>
              <div className="text-2xl font-black text-[#E8B84B]">{lot.cuppingScore} <span className="text-sm font-normal text-[#8B5E3C]">/ 100</span></div>
              {lot.cuppingNotes && <div className="text-xs text-[#C8961A] italic mt-1">"{lot.cuppingNotes}"</div>}
            </div>
          )}
        </div>

        {/* Preparation parameters */}
        <div className="bg-[#1A0F07] rounded-2xl border border-[#3A2010] p-5">
          <div className="text-[10px] tracking-widest text-[#8B5E3C] uppercase mb-3">Preparación</div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-[#3A2010] text-[#E8B84B] px-3 py-1 rounded-full text-xs font-medium">{cup.method}</span>
            {lot.roastLevel && <span className="bg-[#3A2010] text-[#C8961A] px-3 py-1 rounded-full text-xs">Tueste {lot.roastLevel}</span>}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {cup.waterTemp && (
              <div>
                <Thermometer size={14} className="text-[#8B5E3C] mx-auto mb-1" />
                <div className="text-white font-bold text-sm">{cup.waterTemp}°C</div>
                <div className="text-[10px] text-[#8B5E3C]">Temp.</div>
              </div>
            )}
            {cup.extractionTime && (
              <div>
                <Timer size={14} className="text-[#8B5E3C] mx-auto mb-1" />
                <div className="text-white font-bold text-sm">{cup.extractionTime}s</div>
                <div className="text-[10px] text-[#8B5E3C]">Extracción</div>
              </div>
            )}
            {cup.coffeeDose && (
              <div>
                <Droplets size={14} className="text-[#8B5E3C] mx-auto mb-1" />
                <div className="text-white font-bold text-sm">{cup.coffeeDose}g</div>
                <div className="text-[10px] text-[#8B5E3C]">Dosis</div>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-[#3A2010] flex justify-between text-xs text-[#8B5E3C]">
            <span>Barista: <span className="text-white">{barista.name}</span></span>
            <span>Truck: <span className="text-white">{truck.name}</span></span>
          </div>
          {cup.baristaNotes && (
            <div className="mt-2 text-xs text-[#C8961A] italic">"{cup.baristaNotes}"</div>
          )}
        </div>

        {/* Voice bitácora section */}
        {(step === "voice" || (redeemed && step === "details")) && (
          <div className="bg-[#1A0F07] rounded-2xl border border-[#3A2010] p-5 text-center">
            <div className="text-[10px] tracking-widest text-[#8B5E3C] uppercase mb-3">Bitácora Sensorial</div>
            <p className="text-sm text-[#C8961A] mb-5">
              {voiceStatus === "ended"
                ? "¡Gracias por compartir tu experiencia!"
                : "Cuéntanos qué sentiste con tu café. Nuestro asistente de voz te guiará."}
            </p>

            {voiceStatus === "active" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Escuchando...
                </div>
                <button
                  onClick={stopVoice}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center mx-auto transition-colors"
                >
                  <MicOff size={22} />
                </button>
                <p className="text-xs text-[#8B5E3C]">Toca para finalizar</p>
              </div>
            ) : voiceStatus === "connecting" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#E8B84B]">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Conectando...</span>
                </div>
              </div>
            ) : voiceStatus === "ended" ? (
              <div className="text-green-400 flex items-center justify-center gap-2 text-sm">
                <CheckCircle2 size={16} />
                Bitácora completada
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startVoice}
                  className="w-16 h-16 rounded-full bg-[#C8961A] hover:bg-[#E8B84B] flex items-center justify-center mx-auto transition-colors shadow-lg shadow-[#C8961A]/20"
                >
                  <Mic size={24} className="text-[#0D0905]" />
                </button>
                <p className="text-xs text-[#8B5E3C]">Toca el micrófono para iniciar</p>
                {voiceError && (
                  <p className="text-[10px] text-red-400 break-words">{voiceError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* NFT Claim section */}
        {!redeemed && step !== "claim" && (
          <button
            onClick={() => setStep("claim")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C8961A] to-[#E8B84B] text-[#0D0905] font-black text-base tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-[#C8961A]/30"
          >
            ✦ Reclamar mi NFT
          </button>
        )}

        {step === "claim" && !redeemed && (
          <div className="bg-[#1A0F07] rounded-2xl border border-[#3A2010] p-5">
            <div className="text-[10px] tracking-widest text-[#8B5E3C] uppercase mb-3">Reclamar NFT</div>
            <p className="text-xs text-[#8B5E3C] mb-4">
              Conecta tu wallet Solana para recibir tu NFT de esta taza.
            </p>

            {wallet ? (
              <div className="flex items-center gap-2 bg-[#3A2010] rounded-lg px-3 py-2 mb-4">
                <Wallet size={14} className="text-[#E8B84B]" />
                <span className="text-xs font-mono text-[#E8B84B] flex-1 truncate">{wallet}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#3A2010] text-[#C8961A] text-sm mb-4 hover:border-[#C8961A] transition-colors"
              >
                <Wallet size={16} />
                Conectar Phantom
              </button>
            )}

            {claimError && <p className="text-xs text-red-400 mb-3">{claimError}</p>}

            <button
              onClick={claimNft}
              disabled={claiming || !wallet}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C8961A] to-[#E8B84B] text-[#0D0905] font-bold text-sm disabled:opacity-40 transition-opacity"
            >
              {claiming ? (
                <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Minteando...</span>
              ) : (
                "Confirmar y Mintear NFT"
              )}
            </button>
          </div>
        )}

        {/* Minted NFT */}
        {redeemed && mintAddress && mintAddress !== "pending" && (
          <div className="bg-[#1A0F07] rounded-2xl border border-green-800/40 p-4 text-center">
            <CheckCircle2 size={20} className="text-green-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-green-300 mb-1">NFT Minteado</div>
            <div className="font-mono text-[10px] text-[#8B5E3C] break-all mb-3">{mintAddress}</div>
            <a
              href={`https://solscan.io/token/${mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#C8961A] hover:underline"
            >
              <ExternalLink size={12} /> Ver en Solscan
            </a>
          </div>
        )}

        {/* QR code reference */}
        <div className="text-center">
          <span className="text-[10px] font-mono text-[#3A2010]">{cup.qrCode}</span>
        </div>
      </div>
    </div>
  );
}
