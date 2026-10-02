import React from "react";
import { Plus, Minus, Maximize2, RotateCcw, Grid, Eye, LayoutGrid, BookOpen, Wand2 } from "lucide-react";

interface ControlsOverlayProps {
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  isPatternMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetView: () => void;
  onToggleGrid: () => void;
  onToggleGuides: () => void;
  onTogglePatternMode: () => void;
  onOpenSymbolism: () => void;
  onOpenEvolution: () => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  zoom,
  showGrid,
  showGuides,
  isPatternMode,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetView,
  onToggleGrid,
  onToggleGuides,
  onTogglePatternMode,
  onOpenSymbolism,
  onOpenEvolution,
}) => {
  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-16 sm:bottom-6 left-4 z-30 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-zinc-800/90 shadow-xl shadow-black/40 text-zinc-300">
      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Zoom Level Indicator */}
      <span className="font-mono text-xs px-1.5 min-w-[42px] text-center text-zinc-200">
        {zoomPct}%
      </span>

      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

      {/* Fit to screen */}
      <button
        type="button"
        onClick={onFitToScreen}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        title="Fit Composition to Screen (F)"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Reset view */}
      <button
        type="button"
        onClick={onResetView}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        title="Reset Zoom & Pan to Center"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

      {/* Grid toggle */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`p-1.5 rounded-lg transition-colors ${
          showGrid
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
        }`}
        title="Toggle Background Coordinate Grid (G)"
      >
        <Grid className="w-4 h-4" />
      </button>

      {/* Guide Lines toggle */}
      <button
        type="button"
        onClick={onToggleGuides}
        className={`p-1.5 rounded-lg transition-colors ${
          showGuides
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
        }`}
        title="Toggle Construction Guidelines"
      >
        <Eye className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

      {/* Seamless Textile Tile Pattern Mode */}
      <button
        type="button"
        onClick={onTogglePatternMode}
        className={`p-1.5 rounded-lg transition-colors ${
          isPatternMode
            ? "bg-amber-500 text-zinc-950 font-bold"
            : "hover:bg-zinc-800 text-zinc-400 hover:text-amber-300"
        }`}
        title="Toggle Seamless Textile / Jali Repeat Grid Mode"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {/* Variations & Evolution */}
      <button
        type="button"
        onClick={onOpenEvolution}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
        title="Explore Harmonic Variations & Mutations Matrix"
      >
        <Wand2 className="w-4 h-4" />
      </button>

      {/* Symbolism & Anatomy */}
      <button
        type="button"
        onClick={onOpenSymbolism}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
        title="Inspect Sacred Geometric Anatomy & Symbolism"
      >
        <BookOpen className="w-4 h-4" />
      </button>
    </div>
  );
};
