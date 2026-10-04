import React, { useState } from "react";
import { X, Bookmark, Library } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { PRESETS } from "../../presets/defaultPresets";
import { VectorThumbnail } from "./VectorThumbnail";

interface PresetLibraryProps {
  current: JantraRecipe;
  sketchbook: JantraRecipe[];
  onApply: (recipe: JantraRecipe) => void;
  onClose: () => void;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({ current, sketchbook, onApply, onClose }) => {
  const [tab, setTab] = useState<"presets" | "sketchbook">("presets");

  const items =
    tab === "presets"
      ? PRESETS.map((p) => ({ key: p.id, name: p.name, note: p.description, recipe: p.recipe }))
      : sketchbook.map((r) => ({
          key: String(r.seed) + r.grammar.family,
          name: String(r.seed),
          note: `${r.grammar.family} · prāṇa ${r.parameters.prana}`,
          recipe: r,
        }));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-5xl max-h-[84vh] flex flex-col rounded-2xl border border-zinc-800 bg-[#0b0b0e] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 h-14 px-5 flex items-center gap-3 border-b border-zinc-800">
          <Library className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">Library</h2>
          <div className="ml-3 flex gap-0.5 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
            {(
              [
                ["presets", `Presets (${PRESETS.length})`],
                ["sketchbook", `Sketchbook (${sketchbook.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-3 py-1.5 rounded-md text-[11.5px] font-medium transition-colors ${
                  tab === id ? "bg-amber-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto w-8 h-8 grid place-items-center rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-48 grid place-items-center text-center">
              <div>
                <Bookmark className="w-6 h-6 mx-auto text-zinc-700 mb-2" />
                <p className="text-[12px] text-zinc-500">
                  Nothing saved yet — hit <span className="text-amber-400">Sketchbook</span> under the canvas.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => {
                const isCurrent =
                  String(item.recipe.seed) === String(current.seed) &&
                  item.recipe.grammar.family === current.grammar.family;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onApply(item.recipe)}
                    className={`group rounded-xl border p-2 text-left transition-all ${
                      isCurrent
                        ? "border-amber-500/60 bg-amber-500/[0.06]"
                        : "border-zinc-800 bg-zinc-900/30 hover:border-amber-500/40 hover:bg-zinc-900/70"
                    }`}
                  >
                    <div className="aspect-square grid place-items-center rounded-lg bg-[#09090b] overflow-hidden">
                      <VectorThumbnail recipe={item.recipe} size={160} />
                    </div>
                    <p className="mt-2 text-[12px] font-medium text-zinc-200 group-hover:text-amber-300 transition-colors truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-zinc-600 leading-snug line-clamp-2">{item.note}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
