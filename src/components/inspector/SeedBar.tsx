import React, { useState, useEffect } from "react";
import { Dices, Hash, Sparkles } from "lucide-react";

interface SeedBarProps {
  seed: string | number;
  onUpdateSeed: (seed: string | number) => void;
  onRandomize: () => void;
}

const QUICK_SEEDS = ["108", "1008", "432", "72", "360", "shiva", "shakti", "lotus"];

export const SeedBar: React.FC<SeedBarProps> = ({
  seed,
  onUpdateSeed,
  onRandomize,
}) => {
  const [localSeed, setLocalSeed] = useState(String(seed));

  useEffect(() => {
    setLocalSeed(String(seed));
  }, [seed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSeed.trim()) {
      onUpdateSeed(localSeed.trim());
    }
  };

  return (
    <div className="space-y-2.5 pb-3 border-b border-zinc-800/80">
      <div className="flex items-center justify-between text-xs">
        <label className="text-zinc-300 font-medium flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-amber-500" />
          Deterministic Seed
        </label>
        <button
          type="button"
          onClick={onRandomize}
          className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
        >
          <Dices className="w-3.5 h-3.5" />
          Randomize
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={localSeed}
            onChange={(e) => setLocalSeed(e.target.value)}
            onBlur={() => onUpdateSeed(localSeed)}
            placeholder="e.g. 108"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg transition-colors"
        >
          Set
        </button>
      </form>

      {/* Quick seed chips */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-zinc-400 mr-1 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-amber-500/80" />
          Sacred:
        </span>
        {QUICK_SEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onUpdateSeed(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
              String(seed) === s
                ? "bg-amber-500 text-zinc-950 font-bold"
                : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-750"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
