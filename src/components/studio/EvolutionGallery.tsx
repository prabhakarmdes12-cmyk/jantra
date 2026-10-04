import React, { useDeferredValue, useMemo, useState } from "react";
import { GitBranch, Plus, Bookmark, ChevronRight, Sparkles } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { spawnDescendants, ancestryOf, generationOf, lineageIdOf } from "../../engine/genealogy";
import { VectorThumbnail } from "./VectorThumbnail";

interface EvolutionGalleryProps {
  recipe: JantraRecipe;
  onSelect: (child: JantraRecipe) => void;
  onNewSeed: () => void;
  onSave: () => void;
  savedCount: number;
}

export const EvolutionGallery: React.FC<EvolutionGalleryProps> = ({
  recipe,
  onSelect,
  onNewSeed,
  onSave,
  savedCount,
}) => {
  const [expanded, setExpanded] = useState(true);

  // The strip stays pinned to a "pivot" so you can audition siblings before
  // committing. Hitting Evolve re-pivots onto whatever is currently active.
  const [pivot, setPivot] = useState<JantraRecipe>(recipe);
  const activeId = lineageIdOf(recipe);
  const pivotId = lineageIdOf(pivot);

  // Thumbnail regeneration is deprioritised so dragging a slider stays smooth.
  const deferredPivot = useDeferredValue(pivot);
  const deferredActive = useDeferredValue(recipe);
  const stale = deferredActive !== recipe;

  const descendants = useMemo(() => spawnDescendants(deferredPivot), [deferredPivot]);
  const ancestry = useMemo(() => ancestryOf(activeId), [activeId]);
  const generation = generationOf(activeId);
  const canEvolve = activeId !== pivotId || descendants.length === 0;

  return (
    <section
      className={`shrink-0 border-t border-zinc-800/80 bg-[#0b0b0e] transition-[height] duration-200 ${
        expanded ? "h-[188px]" : "h-[42px]"
      }`}
    >
      <header className="h-[42px] px-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          title={expanded ? "Collapse gallery" : "Expand gallery"}
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
          <GitBranch className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">Evolution</span>
        </button>

        <nav className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
          {ancestry.map((node, i) => (
            <span key={node} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-zinc-700 text-[10px]">/</span>}
              <span
                className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded ${
                  node === activeId
                    ? "bg-amber-500/15 text-amber-300"
                    : node === pivotId
                      ? "text-zinc-400"
                      : "text-zinc-600"
                }`}
              >
                {node}
              </span>
            </span>
          ))}
          <span className="ml-1.5 shrink-0 text-[10px] font-mono text-zinc-600">gen {generation}</span>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPivot(recipe);
              setExpanded(true);
            }}
            title={`Spawn the next generation from ${activeId}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              canEvolve
                ? "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                : "border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Evolve
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
          >
            <Bookmark className="w-3 h-3" />
            Sketchbook
            {savedCount > 0 && <span className="font-mono text-[9.5px] text-zinc-500">{savedCount}</span>}
          </button>
          <button
            type="button"
            onClick={onNewSeed}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Seed
          </button>
        </div>
      </header>

      {expanded && (
        <div
          className={`h-[146px] px-4 pb-4 flex items-stretch gap-2.5 overflow-x-auto no-scrollbar transition-opacity ${
            stale ? "opacity-50" : "opacity-100"
          }`}
        >
          {/* Current */}
          <article className="shrink-0 w-[112px] rounded-xl border border-amber-500/55 bg-amber-500/[0.06] p-1.5 flex flex-col">
            <div className="flex-1 grid place-items-center rounded-lg bg-[#09090b]/70 overflow-hidden">
              <VectorThumbnail recipe={deferredActive} size={84} />
            </div>
            <div className="pt-1.5 px-0.5">
              <p className="font-mono text-[10.5px] text-amber-300 leading-none truncate">{activeId}</p>
              <p className="text-[9px] text-amber-500/60 mt-1 uppercase tracking-wider leading-none">Current</p>
            </div>
          </article>

          <div className="shrink-0 w-px bg-zinc-800/80 my-1" />

          {/* Descendants */}
          {descendants.map((node) => {
            const op = node.operator;
            const isActive = node.lineageId === activeId;
            return (
              <button
                key={node.lineageId}
                type="button"
                onClick={() => onSelect(node.recipe)}
                title={`${op.name} — ${op.summary}`}
                className={`group shrink-0 w-[112px] rounded-xl border p-1.5 flex flex-col text-left transition-all ${
                  isActive
                    ? "border-amber-500/55 bg-amber-500/[0.05]"
                    : "border-zinc-800/90 bg-zinc-900/30 hover:border-amber-500/50 hover:bg-zinc-900/70"
                }`}
              >
                <div className="flex-1 grid place-items-center rounded-lg bg-[#09090b]/70 overflow-hidden">
                  <VectorThumbnail recipe={node.recipe} size={84} />
                </div>
                <div className="pt-1.5 px-0.5">
                  <p className="font-mono text-[10.5px] text-zinc-300 group-hover:text-amber-300 leading-none truncate transition-colors">
                    {node.lineageId}
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider leading-none truncate">
                    {op.name}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="shrink-0 w-px bg-zinc-800/80 my-1" />

          <div className="shrink-0 w-[148px] rounded-xl border border-dashed border-zinc-800 grid place-items-center px-3">
            <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
              Children of{" "}
              <span className="font-mono text-zinc-400">{pivotId}</span>. Pick one to make it current, then hit{" "}
              <span className="text-amber-500/80">Evolve</span> to branch again.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
