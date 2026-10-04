import React, { useEffect, useState } from "react";
import {
  Undo2,
  Redo2,
  Copy,
  Check,
  Play,
  Sparkles,
  PenTool,
  BookMarked,
  Share2,
  Download,
} from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { copyToClipboard } from "../../utils/download";

export type StudioView = "create" | "evolve" | "sketchbook" | "export";

interface TopBarProps {
  recipe: JantraRecipe;
  view: StudioView;
  onViewChange: (view: StudioView) => void;
  onSeedChange: (seed: string) => void;
  onGenerate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  sketchbookCount: number;
}

const VIEWS: Array<{ id: StudioView; label: string; icon: React.ElementType }> = [
  { id: "create", label: "Create", icon: PenTool },
  { id: "evolve", label: "Evolve", icon: Sparkles },
  { id: "sketchbook", label: "Sketchbook", icon: BookMarked },
  { id: "export", label: "Export", icon: Download },
];

export const TopBar: React.FC<TopBarProps> = ({
  recipe,
  view,
  onViewChange,
  onSeedChange,
  onGenerate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  sketchbookCount,
}) => {
  const [draft, setDraft] = useState(String(recipe.seed));
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => setDraft(String(recipe.seed)), [recipe.seed]);

  const copySeed = async () => {
    if (await copyToClipboard(String(recipe.seed))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  const share = async () => {
    if (await copyToClipboard(window.location.href)) {
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    }
  };

  return (
    <header className="shrink-0 h-[72px] px-4 flex items-center gap-4 border-b border-zinc-800/70 bg-[#0a0a0c]">
      {/* ---------------------------------------------------- brand ---- */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.6)]">
          <span className="text-[22px] leading-none font-semibold text-zinc-950 -mt-0.5">य</span>
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold tracking-[0.04em] text-zinc-50 leading-none">JANTRA</h1>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] text-amber-400 leading-none">
              v{recipe.engineVersion}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 leading-none">Generative Indian Visual Intelligence</p>
        </div>
      </div>

      {/* ----------------------------------------------------- nav ----- */}
      <nav className="flex items-center gap-1 mx-auto">
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                active ? "text-amber-400" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {active ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              {label}
              {id === "sketchbook" && sketchbookCount > 0 && (
                <span className="font-mono text-[9.5px] text-zinc-600">{sketchbookCount}</span>
              )}
              {active && (
                <span className="absolute -bottom-[1.3rem] left-3 right-3 h-[2px] rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* --------------------------------------------------- actions --- */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-0.5 p-1 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            className="w-8 h-8 grid place-items-center rounded-lg text-zinc-400 enabled:hover:text-zinc-50 enabled:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⇧⌘Z)"
            className="w-8 h-8 grid place-items-center rounded-lg text-zinc-400 enabled:hover:text-zinc-50 enabled:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) onSeedChange(draft.trim());
          }}
          className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-xl border border-zinc-800 bg-zinc-900/50"
        >
          <span className="text-[12px] text-zinc-500">Seed</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => draft.trim() && onSeedChange(draft.trim())}
            className="w-[76px] bg-transparent font-mono text-[13px] font-medium text-zinc-50 outline-none"
          />
          <button
            type="button"
            onClick={copySeed}
            title="Copy seed"
            className="w-7 h-7 grid place-items-center rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </form>

        <button
          type="button"
          onClick={share}
          title="Copy a shareable link to this exact composition"
          className="w-9 h-9 grid place-items-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
        >
          {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onGenerate}
          title="Roll a fresh seed"
          className="inline-flex items-center gap-2 pl-4 pr-5 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-[14px] transition-colors shadow-[0_6px_20px_-8px_rgba(245,158,11,0.9)]"
        >
          <Play className="w-4 h-4 fill-zinc-950" />
          Generate
        </button>
      </div>
    </header>
  );
};
