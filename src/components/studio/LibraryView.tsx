import React, { useState } from "react";
import { BookMarked, Library, Trash2 } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { PRESETS } from "../../presets/defaultPresets";
import { VectorThumbnail } from "./VectorThumbnail";

interface LibraryViewProps {
  current: JantraRecipe;
  sketchbook: JantraRecipe[];
  onApply: (recipe: JantraRecipe) => void;
  onRemove: (seed: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ current, sketchbook, onApply, onRemove }) => {
  const [tab, setTab] = useState<"sketchbook" | "presets">(sketchbook.length > 0 ? "sketchbook" : "presets");

  const items =
    tab === "presets"
      ? PRESETS.map((p) => ({ key: p.id, name: p.name, note: p.description, recipe: p.recipe, removable: false }))
      : sketchbook.map((r) => ({
          key: String(r.seed) + r.grammar.family,
          name: String(r.seed),
          note: `${r.grammar.family} · ${r.parameters.symmetry.segments}-fold · prāṇa ${r.parameters.prana}`,
          recipe: r,
          removable: true,
        }));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#09090b]">
      <div className="max-w-[1400px] mx-auto px-8 py-7">
        <header className="flex items-center gap-4 mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-[17px] font-semibold text-zinc-50">
              <BookMarked className="w-4 h-4 text-amber-500" />
              Sketchbook
            </h2>
            <p className="text-[12.5px] text-zinc-500 mt-1">
              Saved compositions and the shipped preset library. Everything here is a recipe, not an image.
            </p>
          </div>

          <div className="ml-auto flex gap-0.5 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
            {(
              [
                ["sketchbook", `Saved (${sketchbook.length})`],
                ["presets", `Presets (${PRESETS.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                  tab === id ? "bg-amber-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {items.length === 0 ? (
          <div className="h-64 grid place-items-center rounded-2xl border border-dashed border-zinc-800">
            <div className="text-center">
              <Library className="w-7 h-7 mx-auto text-zinc-700 mb-3" />
              <p className="text-[13px] text-zinc-400">Nothing saved yet.</p>
              <p className="text-[11.5px] text-zinc-600 mt-1">
                Hit <span className="text-amber-500">Save to Sketchbook</span> under the canvas in Create.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {items.map((item) => {
              const isCurrent =
                String(item.recipe.seed) === String(current.seed) &&
                item.recipe.grammar.family === current.grammar.family;
              return (
                <article
                  key={item.key}
                  className={`group relative rounded-2xl border p-2.5 transition-all ${
                    isCurrent
                      ? "border-amber-500/55 bg-amber-500/[0.05]"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-amber-500/40 hover:bg-zinc-900/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onApply(item.recipe)}
                    className="w-full aspect-square grid place-items-center rounded-xl bg-[#09090b] overflow-hidden"
                  >
                    <VectorThumbnail recipe={item.recipe} size={186} />
                  </button>
                  <p className="mt-2.5 text-[12.5px] font-medium text-zinc-200 group-hover:text-amber-300 transition-colors truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-zinc-600 leading-snug line-clamp-2 h-7">{item.note}</p>

                  {item.removable && (
                    <button
                      type="button"
                      onClick={() => onRemove(String(item.recipe.seed))}
                      title="Remove from sketchbook"
                      className="absolute top-3 right-3 w-7 h-7 grid place-items-center rounded-lg bg-zinc-950/85 border border-zinc-800 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
