import React from "react";
import { SymmetryMode } from "../../types/recipe";
import { SegmentedControl } from "../common/SegmentedControl";
import { Slider } from "../common/Slider";

interface SymmetryPanelProps {
  mode: SymmetryMode;
  segments: number;
  onChangeMode: (mode: SymmetryMode) => void;
  onChangeSegments: (segments: number) => void;
}

const SYMMETRY_MODES: { value: SymmetryMode; label: string }[] = [
  { value: "radial", label: "Radial" },
  { value: "bilateral", label: "Mirror" },
  { value: "grid", label: "Grid" },
  { value: "hybrid", label: "Hybrid" },
];

const PRESET_SEGMENTS = [4, 6, 8, 12, 16, 24, 32];

export const SymmetryPanel: React.FC<SymmetryPanelProps> = ({
  mode,
  segments,
  onChangeMode,
  onChangeSegments,
}) => {
  return (
    <div className="space-y-4">
      <SegmentedControl
        label="Symmetry Mode"
        value={mode}
        options={SYMMETRY_MODES}
        onChange={onChangeMode}
        size="sm"
      />

      <Slider
        label="Radial Segments (N-Fold)"
        value={segments}
        min={2}
        max={32}
        step={1}
        onChange={onChangeSegments}
        unit="folds"
        description="Rotational division segments around the origin bindu."
      />

      {/* Preset segment chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-zinc-400">Quick folds:</span>
        {PRESET_SEGMENTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChangeSegments(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              segments === s
                ? "bg-amber-500 text-zinc-950 font-semibold"
                : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
