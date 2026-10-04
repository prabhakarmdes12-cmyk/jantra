import React, { useEffect, useState } from "react";

interface NumberSliderProps {
  label: string;
  /** Dimmed qualifier rendered after the label, e.g. "(Organic Variation)". */
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Decimal places in the readout box. 0 = integer. */
  precision?: number;
  title?: string;
}

/**
 * The studio's workhorse control: a hairline track with an amber fill up to
 * the thumb, and an editable monospace readout box on the right.
 */
export const NumberSlider: React.FC<NumberSliderProps> = ({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  onChange,
  precision = 0,
  title,
}) => {
  const [draft, setDraft] = useState(value.toFixed(precision));
  useEffect(() => setDraft(value.toFixed(precision)), [value, precision]);

  const pct = ((value - min) / (max - min)) * 100;

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
    else setDraft(value.toFixed(precision));
  };

  return (
    <div className="flex items-center gap-3" title={title}>
      <label className="w-[132px] shrink-0 text-[12px] text-zinc-300 leading-tight">
        {label}
        {hint && <span className="text-zinc-600 text-[10.5px]"> {hint}</span>}
      </label>

      <div className="relative flex-1 h-5 flex items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-zinc-800" />
        <div
          className="absolute left-0 h-[3px] rounded-full bg-amber-500"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="jantra-range relative w-full h-5 bg-transparent appearance-none cursor-pointer"
          aria-label={label}
        />
      </div>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-[46px] shrink-0 text-center bg-zinc-900/80 border border-zinc-800 focus:border-amber-500/60 rounded-md py-1 font-mono text-[11.5px] text-zinc-100 outline-none transition-colors tabular-nums"
      />
    </div>
  );
};
