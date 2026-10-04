import React, { useState } from "react";
import { Undo2, Redo2, Dices, Layers3, PenTool, Share2, Check, Library } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { copyToClipboard } from "../../utils/download";

export type StudioMode = "create" | "inspect";

interface TopBarProps {
  recipe: JantraRecipe;
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onSeedChange: (seed: string) => void;
  onRandomSeed: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenPresets: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  recipe,
  mode,
  onModeChange,
  onSeedChange,
  onRandomSeed,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenPresets,
}) => {
  const [draft, setDraft] = useState(String(recipe.seed));
  const [copied, setCopied] = useState(false);

  React.useEffect(() => setDraft(String(recipe.seed)), [recipe.seed]);

  const share = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1700);
    }
  };

  return (
    <header className="shrink-0 h-[52px] px-3 flex items-center gap-3 border-b border-zinc-800/80 bg-[#0b0b0e]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 pl-1 pr-2">
        <svg viewBox="-50 -50 100 100" width="25" height="25" aria-hidden>
          <circle cx="0" cy="0" r="42" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <path d="M0 -42 L36.4 21 L-36.4 21 Z" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" />
          <path d="M0 42 L-36.4 -21 L36.4 -21 Z" fill="none" stroke="#71717a" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="0" cy="0" r="6" fill="#f59e0b" />
        </svg>
        <div className="leading-none">
          <h1 className="text-[15px] font-semibold tracking-[0.2em] text-zinc-100">JANTRA</h1>
          <p className="text-[9px] font-mono tracking-[0.1em] text-zinc-600 mt-0.5">
            यन्त्र · v{recipe.engineVersion}
          </p>
        </div>
      </div>

      <div className="w-px h-6 bg-zinc-800" />

      {/* Mode switch */}
      <div className="flex gap-0.5 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
        {([
          { id: "create" as const, label: "Create", icon: PenTool },
          { id: "inspect" as const, label: "Inspect", icon: Layers3 },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
              mode === id ? "bg-amber-500 text-zinc-950" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Seed */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) onSeedChange(draft.trim());
        }}
        className="flex items-center gap-1.5"
      >
        <label className="text-[10px] font-mono tracking-[0.14em] text-zinc-600 uppercase">Seed</label>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft.trim() && onSeedChange(draft.trim())}
          className="w-[108px] bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-md px-2 py-1 font-mono text-[12px] text-amber-300 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={onRandomSeed}
          title="Random seed"
          className="w-7 h-7 grid place-items-center rounded-md border border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
        >
          <Dices className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenPresets}
          className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-zinc-800 text-[11.5px] text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
        >
          <Library className="w-3.5 h-3.5" />
          Presets
        </button>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            className="w-7 h-7 grid place-items-center rounded-md border border-zinc-800 text-zinc-500 enabled:hover:text-zinc-100 disabled:opacity-35 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⇧⌘Z)"
            className="w-7 h-7 grid place-items-center rounded-md border border-zinc-800 text-zinc-500 enabled:hover:text-zinc-100 disabled:opacity-35 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={share}
          title="Copy shareable link"
          className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-zinc-800 text-[11.5px] text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </header>
  );
};
