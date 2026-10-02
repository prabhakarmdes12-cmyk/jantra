import React from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
  formatValue?: (val: number) => string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  description,
  formatValue,
}) => {
  const displayVal = formatValue ? formatValue(value) : (step < 1 ? value.toFixed(2) : value.toString());

  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between text-xs">
        <label className="text-zinc-300 font-medium group-hover:text-zinc-100 transition-colors">
          {label}
        </label>
        <div className="flex items-center gap-1 font-mono text-[11px] bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60 text-zinc-200">
          <span>{displayVal}</span>
          {unit && <span className="text-zinc-400">{unit}</span>}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      />

      {description && (
        <p className="text-[10px] text-zinc-400 leading-tight">{description}</p>
      )}
    </div>
  );
};
