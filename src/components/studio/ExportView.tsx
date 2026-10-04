import React from "react";
import { Download } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";
import { SceneSVG } from "../canvas/SceneSVG";
import { ExportPanel } from "./ExportPanel";

interface ExportViewProps {
  scene: GeneratedScene;
  recipe: JantraRecipe;
}

export const ExportView: React.FC<ExportViewProps> = ({ scene, recipe }) => {
  const transparent = recipe.canvas.background === "transparent";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#09090b]">
      <div className="max-w-[1200px] mx-auto px-8 py-7">
        <header className="mb-6">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold text-zinc-50">
            <Download className="w-4 h-4 text-amber-500" />
            Export
          </h2>
          <p className="text-[12.5px] text-zinc-500 mt-1">
            What you see is exactly what lands in the file — no rasterising, no flattening, no surprises.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">
          <div
            className="rounded-2xl border border-zinc-800 p-6 grid place-items-center"
            style={{
              background: transparent
                ? "repeating-conic-gradient(#141418 0% 25%, #0d0d10 0% 50%) 50% / 22px 22px"
                : recipe.canvas.background,
            }}
          >
            <SceneSVG scene={scene} width={560} height={560} />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <ExportPanel scene={scene} recipe={recipe} variant="full" />
          </div>
        </div>
      </div>
    </div>
  );
};
