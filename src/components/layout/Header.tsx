import React from "react";
import { Dices, RotateCcw, RotateCw, Download, Bookmark, Info, Command, Sliders, Wand2, Heart } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";

interface HeaderProps {
  recipe: JantraRecipe;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRandomizeSeed: () => void;
  onOpenPresets: () => void;
  onOpenEvolution: () => void;
  onOpenSketchbook: () => void;
  onOpenExport: () => void;
  onOpenAbout: () => void;
  onOpenShortcuts: () => void;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  recipe,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRandomizeSeed,
  onOpenPresets,
  onOpenEvolution,
  onOpenSketchbook,
  onOpenExport,
  onOpenAbout,
  onOpenShortcuts,
  isInspectorOpen,
  onToggleInspector,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & North Star */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20">
            य
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white">JANTRA</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                v0.1.0
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-zinc-400 leading-none">
              Generative Indian Visual Intelligence
            </p>
          </div>
        </div>

        <div className="hidden md:block w-[1px] h-5 bg-zinc-800 mx-1" />

        {/* Quick Seed Display & Randomize */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 text-xs">
          <span className="text-[11px] text-zinc-400">Seed:</span>
          <span className="font-mono text-amber-300 font-semibold">{recipe.seed}</span>
          <button
            type="button"
            onClick={onRandomizeSeed}
            className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors ml-0.5"
            title="Randomize seed (deterministic generator)"
          >
            <Dices className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center / Action Toolbar */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
            title="Undo (Cmd+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800 transition-colors"
            title="Redo (Cmd+Shift+Z)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Variations Matrix */}
        <button
          type="button"
          onClick={onOpenEvolution}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
          title="Explore Harmonic Variations & Mutations"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Evolve</span>
        </button>

        {/* Sketchbook / Favorites */}
        <button
          type="button"
          onClick={onOpenSketchbook}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
          title="Artist Sketchbook & Favorites"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Sketchbook</span>
        </button>

        {/* Presets Button */}
        <button
          type="button"
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/15"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export SVG</span>
        </button>

        <div className="w-[1px] h-5 bg-zinc-800 mx-1" />

        {/* Shortcuts */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Keyboard shortcuts"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* About / Cultural Thesis */}
        <button
          type="button"
          onClick={onOpenAbout}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Cultural Integrity & Computational Design Thesis"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Mobile Inspector Toggle */}
        <button
          type="button"
          onClick={onToggleInspector}
          className={`p-1.5 rounded-lg transition-colors md:hidden ${
            isInspectorOpen ? "bg-amber-500 text-zinc-950" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
          title="Toggle Inspector"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
