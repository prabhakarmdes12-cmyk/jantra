import React, { useMemo } from "react";
import { X, Wand2 } from "lucide-react";
import { JantraRecipe, SymmetryMode, RingSpacing } from "../../types/recipe";
import { generateScene } from "../../engine/generator";
import { serializeSceneToSVG } from "../../engine/serializer";
import { ARTISAN_PALETTES } from "../../presets/palettes";

interface EvolutionModalProps {
  isOpen: boolean;
  baseRecipe: JantraRecipe;
  onSelectVariation: (recipe: JantraRecipe) => void;
  onClose: () => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  isOpen,
  baseRecipe,
  onSelectVariation,
  onClose,
}) => {
  if (!isOpen) return null;

  // Generate 4 creative mutations based on the baseRecipe
  const variations = useMemo(() => {
    const list: { id: string; name: string; tag: string; recipe: JantraRecipe; svg: string }[] = [];

    // Variation 1: Harmonic Resonance (Golden / Exponential rings + higher density)
    const v1Recipe: JantraRecipe = {
      ...baseRecipe,
      seed: `${baseRecipe.seed}_harm`,
      parameters: {
        ...baseRecipe.parameters,
        rings: {
          ...baseRecipe.parameters.rings,
          spacing: (baseRecipe.parameters.rings.spacing === "golden" ? "harmonic" : "golden") as RingSpacing,
          count: Math.min(10, baseRecipe.parameters.rings.count + 2),
        },
        density: Math.min(0.85, baseRecipe.parameters.density + 0.2),
      },
    };
    const s1 = generateScene(v1Recipe);
    list.push({
      id: "v1",
      name: "Harmonic Orbital Bloom",
      tag: "Golden Spacing + Density",
      recipe: v1Recipe,
      svg: serializeSceneToSVG(s1, v1Recipe, { minified: true }),
    });

    // Variation 2: Symmetry Octave (Double or half segments)
    const newSegments = baseRecipe.parameters.symmetry.segments === 8 ? 16 : (baseRecipe.parameters.symmetry.segments === 16 ? 12 : 8);
    const v2Recipe: JantraRecipe = {
      ...baseRecipe,
      seed: `${baseRecipe.seed}_sym`,
      parameters: {
        ...baseRecipe.parameters,
        symmetry: {
          ...baseRecipe.parameters.symmetry,
          segments: newSegments,
          mode: "radial" as SymmetryMode,
        },
        recursion: {
          ...baseRecipe.parameters.recursion,
          depth: Math.min(5, baseRecipe.parameters.recursion.depth + 1),
        },
      },
    };
    const s2 = generateScene(v2Recipe);
    list.push({
      id: "v2",
      name: `${newSegments}-Fold Symmetry Shift`,
      tag: "Higher Fold Resonance",
      recipe: v2Recipe,
      svg: serializeSceneToSVG(s2, v2Recipe, { minified: true }),
    });

    // Variation 3: Organic Prana Kolam Drift (Warm living human vitality)
    const v3Recipe: JantraRecipe = {
      ...baseRecipe,
      seed: `${baseRecipe.seed}_prana`,
      parameters: {
        ...baseRecipe.parameters,
        prana: Math.min(0.28, Math.max(0.14, baseRecipe.parameters.prana + 0.1)),
        line: {
          ...baseRecipe.parameters.line,
          weight: Math.min(4.0, baseRecipe.parameters.line.weight * 1.3),
          cap: "round",
        },
      },
    };
    const s3 = generateScene(v3Recipe);
    list.push({
      id: "v3",
      name: "Vital Prana & Human Stroke",
      tag: "Living Imperfection",
      recipe: v3Recipe,
      svg: serializeSceneToSVG(s3, v3Recipe, { minified: true }),
    });

    // Variation 4: Mineral Pigment Alchemy (Artisan Palette Shift)
    const randomPalette = ARTISAN_PALETTES[Math.floor(Math.random() * ARTISAN_PALETTES.length)];
    const v4Recipe: JantraRecipe = {
      ...baseRecipe,
      seed: `${baseRecipe.seed}_pal`,
      canvas: {
        ...baseRecipe.canvas,
        background: randomPalette.background,
      },
      parameters: {
        ...baseRecipe.parameters,
        palette: {
          ...baseRecipe.parameters.palette,
          stroke: randomPalette.stroke,
          accent: randomPalette.accent,
        },
      },
    };
    const s4 = generateScene(v4Recipe);
    list.push({
      id: "v4",
      name: `${randomPalette.name}`,
      tag: randomPalette.tradition,
      recipe: v4Recipe,
      svg: serializeSceneToSVG(s4, v4Recipe, { minified: true }),
    });

    return list;
  }, [baseRecipe]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Harmonic Variations Matrix</h2>
              <p className="text-xs text-zinc-400">Explore 4 creative evolutionary branches generated from your current recipe</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Up Variations Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {variations.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                onSelectVariation(v.recipe);
                onClose();
              }}
              className="group relative p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-850/60 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 block">
                    {v.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {v.tag}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 group-hover:bg-amber-500 group-hover:text-zinc-950 font-medium transition-colors">
                  Evolve ↵
                </span>
              </div>

              {/* Mini SVG Preview */}
              <div className="w-full aspect-square rounded-lg bg-[#0a0a0c] border border-zinc-850 overflow-hidden flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: v.svg }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
