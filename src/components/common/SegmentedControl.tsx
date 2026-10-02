import React from "react";

interface Option<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (val: T) => void;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs text-zinc-300 font-medium block">
          {label}
        </label>
      )}
      <div className="grid grid-flow-col auto-cols-fr gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center justify-center gap-1.5 rounded-md font-medium transition-all text-center ${
                size === "sm" ? "py-1 px-2 text-[11px]" : "py-1.5 px-2 text-xs"
              } ${
                isActive
                  ? "bg-amber-500 text-zinc-950 shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              {opt.icon && <span className="opacity-90">{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
