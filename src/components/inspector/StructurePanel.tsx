import React from "react";
import { RingSpacing } from "../../types/recipe";
import { SegmentedControl } from "../common/SegmentedControl";
import { Slider } from "../common/Slider";

interface StructurePanelProps {
  ringsCount: number;
  spacing: RingSpacing;
  showGuideLines?: boolean;
  recursionDepth: number;
  recursionScale: number;
  density: number;
  onChangeRingsCount: (count: number) => void;
  onChangeSpacing: (spacing: RingSpacing) => void;
  onChangeShowGuideLines: (show: boolean) => void;
  onChangeRecursionDepth: (depth: number) => void;
  onChangeRecursionScale: (scale: number) => void;
  onChangeDensity: (density: number) => void;
}

const SPACING_OPTIONS: { value: RingSpacing; label: string }[] = [
  { value: "harmonic", label: "Harmonic" },
  { value: "golden", label: "Golden (φ)" },
  { value: "exponential", label: "Exp" },
  { value: "linear", label: "Linear" },
];

export const StructurePanel: React.FC<StructurePanelProps> = ({
  ringsCount,
  spacing,
  showGuideLines = false,
  recursionDepth,
  recursionScale,
  density,
  onChangeRingsCount,
  onChangeSpacing,
  onChangeShowGuideLines,
  onChangeRecursionDepth,
  onChangeRecursionScale,
  onChangeDensity,
}) => {
  return (
    <div className="space-y-4">
      <Slider
        label="Concentric Rings (Vritta)"
        value={ringsCount}
        min={1}
        max={12}
        step={1}
        onChange={onChangeRingsCount}
        unit="rings"
        description="Number of concentric boundary orbits expanding outward."
      />

      <SegmentedControl
        label="Radial Ring Spacing Progression"
        value={spacing}
        options={SPACING_OPTIONS}
        onChange={onChangeSpacing}
        size="sm"
      />

      <div className="pt-1 border-t border-zinc-800/60 space-y-3">
        <Slider
          label="Recursion Depth"
          value={recursionDepth}
          min={0}
          max={6}
          step={1}
          onChange={onChangeRecursionDepth}
          unit="levels"
          description="Geometric nested scaling iterations of the core motif."
        />

        <Slider
          label="Recursion Scale Ratio"
          value={recursionScale}
          min={0.2}
          max={0.9}
          step={0.02}
          onChange={onChangeRecursionScale}
          formatValue={(v) => `${Math.round(v * 100)}%`}
          description="Scale contraction factor for each nested level."
        />
      </div>

      <div className="pt-1 border-t border-zinc-800/60 space-y-3">
        <Slider
          label="Density & Subdivision"
          value={density}
          min={0.05}
          max={1.0}
          step={0.05}
          onChange={onChangeDensity}
          formatValue={(v) => `${Math.round(v * 100)}%`}
          description="Controls secondary ornament population and radial ticks."
        />

        {/* Construction Guide Lines Toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-zinc-300 font-medium">Construction Spoke Guides</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showGuideLines}
              onChange={(e) => onChangeShowGuideLines(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950" />
          </label>
        </div>
      </div>
    </div>
  );
};
