import React from "react";
import { Layers } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";

interface FooterProps {
  scene: GeneratedScene;
  recipe: JantraRecipe;
}

export const Footer: React.FC<FooterProps> = ({ scene, recipe }) => {
  return (
    <footer className="h-8 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono z-30 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Core: Offline Vector Engine</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-zinc-500">
          <span>|</span>
          <Layers className="w-3 h-3 text-zinc-400" />
          <span className="text-zinc-300">{scene.totalPaths} paths</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-zinc-500">
          <span>|</span>
          <span>{scene.totalVertices} nodes</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1 text-zinc-400">
          <span className="text-zinc-500">Grammar:</span>
          <span className="text-zinc-300">{recipe.grammar.id}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-zinc-500">Checksum:</span>
          <span className="text-amber-400/90 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px]">
            {recipe.checksum || "a7f92b"}
          </span>
        </div>
      </div>
    </footer>
  );
};
