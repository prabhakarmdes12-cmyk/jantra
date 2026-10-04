import React, { useMemo, useState } from "react";
import { Sparkles, ArrowLeft, CornerDownRight } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { ancestryOf, generationOf, lineageIdOf, spawnDescendants } from "../../engine/genealogy";
import { VectorThumbnail } from "./VectorThumbnail";

interface EvolveViewProps {
  recipe: JantraRecipe;
  onSelect: (recipe: JantraRecipe) => void;
}

/**
 * The full-screen genealogy browser: the active plate on the left, its six
 * (or three) descendants as a large grid, and the ancestor chain above.
 */
export const EvolveView: React.FC<EvolveViewProps> = ({ recipe, onSelect }) => {
  const [pivot, setPivot] = useState<JantraRecipe>(recipe);
  const pivotId = lineageIdOf(pivot);
  const activeId = lineageIdOf(recipe);
  const generation = generationOf(pivotId);
  const ancestry = useMemo(() => ancestryOf(pivotId), [pivotId]);
  const descendants = useMemo(() => spawnDescendants(pivot), [pivot]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#09090b]">
      <div className="max-w-[1400px] mx-auto px-8 py-7">
        <header className="flex items-start gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold text-zinc-50">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Evolution
            </h2>
            <p className="text-[12.5px] text-zinc-500 mt-1 max-w-xl leading-snug">
              Every seed spawns a fixed set of descendants through named mutation operators. The whole tree is
              reproducible from the root seed alone — share a lineage id and the recipient gets identical art.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {pivotId !== activeId && (
              <button
                type="button"
                onClick={() => setPivot(recipe)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[12px] text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {activeId}
              </button>
            )}
            <span className="font-mono text-[11px] text-zinc-600">generation {generation}</span>
          </div>
        </header>

        {/* Ancestor chain */}
        <nav className="flex items-center gap-1.5 mb-5 flex-wrap">
          {ancestry.map((node, i) => (
            <React.Fragment key={node}>
              {i > 0 && <CornerDownRight className="w-3 h-3 text-zinc-700" />}
              <button
                type="button"
                onClick={() => setPivot(recipe)}
                disabled={node !== pivotId}
                className={`font-mono text-[11.5px] px-2 py-1 rounded-md border transition-colors ${
                  node === pivotId
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-zinc-800/80 text-zinc-600"
                }`}
              >
                {node}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Parent */}
          <section>
            <h3 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase mb-2.5">Parent</h3>
            <div className="rounded-2xl border border-amber-500/50 bg-amber-500/[0.05] p-3">
              <div className="aspect-square grid place-items-center rounded-xl bg-[#09090b] overflow-hidden">
                <VectorThumbnail recipe={pivot} size={272} />
              </div>
              <p className="mt-3 font-mono text-[14px] text-amber-300">{pivotId}</p>
              <p className="text-[11px] text-zinc-500 mt-1 capitalize">
                {pivot.grammar.family} · {pivot.parameters.symmetry.segments}-fold · prāṇa{" "}
                {pivot.parameters.prana}
              </p>
            </div>
          </section>

          {/* Descendants */}
          <section>
            <h3 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase mb-2.5">
              Descendants · {descendants.length}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {descendants.map((node) => (
                <article
                  key={node.lineageId}
                  className={`group rounded-2xl border p-2.5 transition-all ${
                    node.lineageId === activeId
                      ? "border-amber-500/55 bg-amber-500/[0.05]"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-amber-500/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(node.recipe)}
                    className="w-full aspect-square grid place-items-center rounded-xl bg-[#09090b] overflow-hidden"
                    title={`Load ${node.lineageId}`}
                  >
                    <VectorThumbnail recipe={node.recipe} size={190} />
                  </button>
                  <div className="flex items-baseline gap-2 mt-2.5">
                    <p className="font-mono text-[12.5px] text-zinc-200 group-hover:text-amber-300 transition-colors">
                      {node.lineageId}
                    </p>
                    <p className="text-[10px] text-zinc-600 truncate">{node.operator.name}</p>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-snug mt-0.5 h-7">{node.operator.summary}</p>
                  <div className="flex gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => onSelect(node.recipe)}
                      className="flex-1 py-1 rounded-md bg-zinc-800/80 hover:bg-amber-500 hover:text-zinc-950 text-[10.5px] text-zinc-300 font-medium transition-colors"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => setPivot(node.recipe)}
                      className="flex-1 py-1 rounded-md border border-zinc-800 hover:border-amber-500/50 text-[10.5px] text-zinc-400 hover:text-amber-300 transition-colors"
                    >
                      Branch
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
