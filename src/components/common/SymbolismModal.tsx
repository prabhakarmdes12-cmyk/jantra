import React from "react";
import { X, Sparkles, BookOpen, Compass, Layers, Shield, Download } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { analyzeSymbolism } from "../../utils/symbolism";
import { downloadTextFile } from "../../utils/download";

interface SymbolismModalProps {
  isOpen: boolean;
  recipe: JantraRecipe;
  onClose: () => void;
}

export const SymbolismModal: React.FC<SymbolismModalProps> = ({
  isOpen,
  recipe,
  onClose,
}) => {
  if (!isOpen) return null;

  const symbolism = analyzeSymbolism(recipe);

  const handleDownloadProvenanceCard = () => {
    const cardContent = {
      title: "JANTRA — Certificate of Generative Provenance",
      dateGenerated: new Date().toISOString(),
      seed: recipe.seed,
      checksum: recipe.checksum || "verified",
      engineVersion: recipe.engineVersion,
      symbolism,
      recipe,
    };
    downloadTextFile(
      JSON.stringify(cardContent, null, 2),
      `jantra-provenance-seed-${recipe.seed}.json`,
      "application/json"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-zinc-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{symbolism.title}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-serif border border-amber-500/20">
                  {symbolism.sanskritTerm}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{symbolism.cosmologySummary}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Pillars of Geometric Meaning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Compass className="w-4 h-4 text-amber-400" />
              Symmetry & Spatial Order
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {symbolism.geometricBalance.symmetryMeaning}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sky-300">
              <Layers className="w-4 h-4 text-sky-400" />
              Vritta & Orbital Rhythm
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {symbolism.geometricBalance.ringsCosmology}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-rose-300">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Prana & Line Vitality
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {symbolism.geometricBalance.pranaInterpretation}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              Symbolic Lineage & Archetype
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {symbolism.geometricBalance.archetypeLineage}
            </p>
          </div>
        </div>

        {/* Elements Breakdown List */}
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
            Structural Layer Anatomy
          </span>

          <div className="divide-y divide-zinc-800/60">
            {symbolism.elements.map((el, idx) => (
              <div key={idx} className="py-2 flex items-start justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-amber-400 block">{el.symbol}</span>
                  <span className="text-[11px] text-zinc-400 leading-relaxed">{el.meaning}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {el.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
          <span className="text-[11px] text-zinc-500 font-mono">
            Deterministic Seed: <strong className="text-amber-400">{recipe.seed}</strong>
          </span>

          <button
            type="button"
            onClick={handleDownloadProvenanceCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors border border-zinc-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            Download Provenance Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
