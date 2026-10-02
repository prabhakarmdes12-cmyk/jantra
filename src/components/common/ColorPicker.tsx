import React from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  allowTransparent?: boolean;
}

const DEFAULT_PRESETS = [
  "#f4f4f5", // Pure Ivory / Zinc-100
  "#fef3c7", // Warm Gold Ivory
  "#f59e0b", // Saffron / Amber
  "#fbbf24", // Radiant Gold
  "#f43f5e", // Kumkum Crimson
  "#e11d48", // Sacred Ruby
  "#38bdf8", // Sky Azure
  "#a1a1aa", // Cool Silver
  "#71717a", // Muted Zinc
  "#09090b", // Deep Charcoal
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  allowTransparent = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-300 font-medium">{label}</label>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-300 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-700/60">
          <div
            className="w-3 h-3 rounded-full border border-zinc-600 shadow-inner"
            style={{ backgroundColor: value === "transparent" ? "transparent" : value }}
          />
          <span>{value}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange("transparent")}
            title="Transparent"
            className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-mono transition-all ${
              value === "transparent"
                ? "border-amber-500 ring-2 ring-amber-500/30 font-bold text-amber-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Ø
          </button>
        )}

        {presets.map((c) => {
          const isSelected = value.toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${
                isSelected
                  ? "border-amber-400 ring-2 ring-amber-500/50 scale-105"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          );
        })}

        {/* Custom hex input */}
        <label className="relative flex items-center justify-center w-6 h-6 rounded-md border border-dashed border-zinc-650 hover:border-zinc-400 cursor-pointer bg-zinc-800 text-zinc-400 hover:text-zinc-200">
          <span className="text-[10px] font-mono">+</span>
          <input
            type="color"
            value={value.startsWith("#") ? value : "#f59e0b"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>
    </div>
  );
};
