import React from "react";
import { Slider } from "../common/Slider";
import { HeartPulse, Sparkles } from "lucide-react";

interface PranaPanelProps {
  prana: number;
  onChangePrana: (prana: number) => void;
}

export const PranaPanel: React.FC<PranaPanelProps> = ({
  prana,
  onChangePrana,
}) => {
  const getPranaStatus = (val: number) => {
    if (val <= 0.005) return { label: "Pristine CAD Geometry", color: "text-zinc-400" };
    if (val <= 0.08) return { label: "Subtle Human Warmth", color: "text-amber-400" };
    if (val <= 0.20) return { label: "Hand-Drawn Kolam Feel", color: "text-emerald-400" };
    return { label: "Organic Manuscript Vitality", color: "text-rose-400" };
  };

  const status = getPranaStatus(prana);

  // SVG wave indicator simulating jitter
  const wavePoints = [];
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 180;
    const jitter = Math.sin(i * 1.5) * (prana * 24);
    const y = 14 + jitter;
    wavePoints.push(`${x},${y}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
          <HeartPulse className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Prana (प्राण) — Living Imperfection</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 ${status.color}`}>
          {status.label}
        </span>
      </div>

      <Slider
        label="Controlled Jitter Amount"
        value={prana}
        min={0.0}
        max={0.35}
        step={0.01}
        onChange={onChangePrana}
        formatValue={(v) => `${Math.round(v * 100)}%`}
        description="Seeded continuous displacement applied to vertices without breaking symmetry."
      />

      {/* Visual Jitter Wave Gauge */}
      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span>Stroke Vitality Wave</span>
          <span className="font-mono">{prana === 0 ? "Rigid line" : "Organic stroke"}</span>
        </div>
        <svg className="w-full h-7 overflow-visible">
          <polyline
            points={wavePoints.join(" ")}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Quick prana presets */}
      <div className="flex gap-1.5 pt-1">
        {[
          { label: "Rigid (0%)", val: 0.0 },
          { label: "Subtle (6%)", val: 0.06 },
          { label: "Kolam (18%)", val: 0.18 },
          { label: "Vital (30%)", val: 0.3 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onChangePrana(p.val)}
            className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors ${
              Math.abs(prana - p.val) < 0.02
                ? "bg-amber-500 text-zinc-950 font-bold"
                : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10 text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500/80 shrink-0 mt-0.5" />
        <span>
          Traditional yantras are hand-inscribed on copper plates. Prana brings that breathing human spirit into procedural code.
        </span>
      </div>
    </div>
  );
};
