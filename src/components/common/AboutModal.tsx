import React from "react";
import { X, Sparkles, Cpu, Layers, Compass, ShieldCheck } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-bold text-lg shadow-lg shadow-amber-500/20">
            य
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              JANTRA (यन्त्र)
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                v0.1.0
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Generative Indian Visual Intelligence & Computational Vector Engine
            </p>
          </div>
        </div>

        {/* North star thesis */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 mb-6">
          <p className="text-sm italic text-amber-200/90 leading-relaxed font-serif">
            “Can visual grammar be modeled as a computational system rather than copied as finished imagery?”
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            JANTRA turns structural visual rules into an interactive creative medium. A composition is not a flattened bitmap or an AI hallucination — it is a reproducible, deterministic recipe with geometry, symmetry, repetition, recursion, and controlled imperfection (Prana).
          </p>
        </div>

        {/* 3-Tier Cultural Integrity Classification */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Cultural Integrity & Computational Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 mb-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Tier 1: Geometry
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Pure algorithmic systems using universal geometric operations: radial grids, harmonic series, regular polygons.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Tier 2: Inspired Grammar
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Parametric abstractions inspired by Indian traditions: stepped Bhupura gateways, lotus petals (Padma), Bindu origins.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 mb-1">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Tier 3: Sacred Art
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Documented historical sacred mandalas. Explicitly separated from algorithmic inventions to prevent cultural misrepresentation.
              </p>
            </div>
          </div>
        </div>

        {/* Core Engine Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs text-zinc-300">
          <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-white block">100% Deterministic & Offline</span>
              <span className="text-[11px] text-zinc-400">Mulberry32 PRNG ensures seed 108 produces identical vector output every single time.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-white block">Controlled Imperfection (Prana)</span>
              <span className="text-[11px] text-zinc-400">Deterministic organic jitter gives strokes the living warmth of hand-drawn temple art.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-500">
          <span>Open-Source MIT License</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition-colors"
          >
            Enter Studio
          </button>
        </div>
      </div>
    </div>
  );
};
