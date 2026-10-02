import React, { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { PRESETS } from "../../presets/defaultPresets";
import { JantraRecipe } from "../../types/recipe";

interface PresetsModalProps {
  isOpen: boolean;
  activeSeed: string | number;
  onSelectPreset: (recipe: JantraRecipe) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "all", label: "All Presets" },
  { id: "sacred", label: "Sacred Yantras" },
  { id: "kolam", label: "Kolam Loops" },
  { id: "floral", label: "Lotus & Padma" },
  { id: "archetype", label: "Archetypes" },
  { id: "minimal", label: "Minimalist" },
  { id: "architectural", label: "Architectural" },
];

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  activeSeed,
  onSelectPreset,
  onClose,
}) => {
  const [filter, setFilter] = useState("all");

  if (!isOpen) return null;

  const filteredPresets = filter === "all"
    ? PRESETS
    : PRESETS.filter((p) => p.category === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sacred & Computational Preset Library</h2>
              <p className="text-xs text-zinc-400">14+ reproducible vector compositions from Indian sacred traditions and computational geometry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-zinc-800/60 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === c.id
                  ? "bg-amber-500 text-zinc-950 font-semibold"
                  : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPresets.map((preset) => {
            const isActive = String(preset.recipe.seed) === String(activeSeed);
            const p = preset.recipe.parameters;

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset.recipe);
                  onClose();
                }}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                  isActive
                    ? "bg-zinc-850 border-amber-500 ring-1 ring-amber-500/50"
                    : "bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {preset.name}
                      </span>
                      {preset.sanskritName && (
                        <span className="text-[10px] text-amber-400/90 font-serif">
                          {preset.sanskritName}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase font-mono tracking-wider">
                      {preset.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-400">
                  <span className="text-amber-400/90 font-medium">Seed: {preset.recipe.seed}</span>
                  <span>{p.symmetry.segments}F • {p.motifs.primary}</span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
