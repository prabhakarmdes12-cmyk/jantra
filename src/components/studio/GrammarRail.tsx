import React, { useState } from "react";
import { Sparkles, CornerDownLeft, Shuffle } from "lucide-react";
import { GRAMMAR_FAMILIES, GrammarFamily, JantraRecipe } from "../../types/recipe";
import { PROMPT_CHIPS, PRESETS } from "../../presets/defaultPresets";
import { parseIntentPrompt } from "../../ai/intentParser";

interface GrammarRailProps {
  active: GrammarFamily;
  recipe: JantraRecipe;
  onSelectFamily: (family: GrammarFamily) => void;
  onApplyRecipe: (recipe: JantraRecipe) => void;
  onOpenPresets: () => void;
}

export const GrammarRail: React.FC<GrammarRailProps> = ({
  active,
  recipe,
  onSelectFamily,
  onApplyRecipe,
  onOpenPresets,
}) => {
  const [prompt, setPrompt] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const runPrompt = (text: string) => {
    if (!text.trim()) return;
    const result = parseIntentPrompt(text, recipe);
    onApplyRecipe(result.suggestedRecipe);
    setNote(result.summary);
    window.setTimeout(() => setNote(null), 4200);
  };

  const applyChip = (chip: (typeof PROMPT_CHIPS)[number]) => {
    const preset = chip.presetId ? PRESETS.find((p) => p.id === chip.presetId) : undefined;
    if (preset) {
      onApplyRecipe({
        ...preset.recipe,
        seed: recipe.seed,
        provenance: {
          ...preset.recipe.provenance,
          lineageId: String(recipe.seed),
          generation: String(recipe.seed).split("-").length - 1,
          promptText: chip.prompt,
        },
      });
      setNote(`Loaded “${preset.name}”`);
      window.setTimeout(() => setNote(null), 3200);
    } else {
      runPrompt(chip.prompt);
    }
  };

  return (
    <aside className="hidden md:flex w-[268px] shrink-0 flex-col border-r border-zinc-800/80 bg-[#0b0b0e]">
      <div className="px-4 pt-4 pb-2.5 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">Visual Grammar</h2>
        <button
          type="button"
          onClick={onOpenPresets}
          className="text-[10px] font-mono text-amber-500/80 hover:text-amber-400 transition-colors"
        >
          Library
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {GRAMMAR_FAMILIES.map((family) => {
          const isActive = family.id === active;
          return (
            <button
              key={family.id}
              type="button"
              onClick={() => onSelectFamily(family.id)}
              title={family.description}
              className={`group w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                isActive
                  ? "border-amber-500/60 bg-amber-500/[0.07] shadow-[0_0_0_1px_rgba(245,158,11,0.12)]"
                  : "border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/70"
              }`}
            >
              <span
                className={`shrink-0 grid place-items-center w-10 h-10 rounded-lg border transition-colors ${
                  isActive ? "border-amber-500/40 bg-amber-500/10" : "border-zinc-800 bg-zinc-950/60"
                }`}
              >
                <svg viewBox="-54 -54 108 108" width="26" height="26" aria-hidden>
                  <path
                    d={family.glyph}
                    fill="none"
                    stroke={isActive ? "#f59e0b" : "#a1a1aa"}
                    strokeWidth="3.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="transition-colors"
                  />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-1.5">
                  <span className={`text-[13px] font-semibold ${isActive ? "text-amber-300" : "text-zinc-200"}`}>
                    {family.name}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-normal">{family.sanskrit}</span>
                </span>
                <span className="block text-[10.5px] leading-tight text-zinc-500 truncate">{family.tagline}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick prompt card */}
      <div className="border-t border-zinc-800/80 p-3 space-y-2.5 bg-[#0d0d11]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <h3 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">Describe It</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runPrompt(prompt);
          }}
          className="relative"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="sixteen-fold lotus, high prana…"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-lg pl-3 pr-9 py-2 text-[12px] text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-zinc-900 transition-colors"
            title="Interpret prompt"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {PROMPT_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => applyChip(chip)}
              className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900/60 text-[10.5px] text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
            >
              {chip.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyChip(PROMPT_CHIPS[Math.floor(Math.random() * PROMPT_CHIPS.length)])}
            className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-900/60 text-[10.5px] text-zinc-500 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
            title="Surprise me"
          >
            <Shuffle className="w-3 h-3" />
          </button>
        </div>

        {note && <p className="text-[10px] leading-snug text-amber-400/90 font-mono">{note}</p>}
      </div>
    </aside>
  );
};
