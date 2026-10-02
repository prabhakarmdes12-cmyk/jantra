import React, { useState } from "react";
import { Sparkles, ArrowRight, Check, X } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { parseIntentPrompt } from "../../ai/intentParser";
import { IntentParseResult } from "../../ai/schema";

interface IntentBarProps {
  currentRecipe: JantraRecipe;
  onApplyRecipe: (recipe: JantraRecipe) => void;
}

const SAMPLE_PROMPTS = [
  "Sri Yantra 9-triangles with stepped temple gates",
  "Minimalist 8-fold lotus with high prana",
  "Brahma Mudi Sikku Kolam continuous loops",
  "Dense 32-segment Sahasrara crown with golden rings",
  "12-fold Anahata lotus in cosmic cyan",
];

export const IntentBar: React.FC<IntentBarProps> = ({
  currentRecipe,
  onApplyRecipe,
}) => {
  const [prompt, setPrompt] = useState("");
  const [previewResult, setPreviewResult] = useState<IntentParseResult | null>(null);

  const handleInterpret = (textToParse: string) => {
    if (!textToParse.trim()) return;
    const result = parseIntentPrompt(textToParse, currentRecipe);
    setPreviewResult(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInterpret(prompt);
  };

  const handleApply = () => {
    if (previewResult) {
      onApplyRecipe(previewResult.suggestedRecipe);
      setPreviewResult(null);
      setPrompt("");
    }
  };

  const handleDiscard = () => {
    setPreviewResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Interpretation Preview Card */}
      {previewResult && (
        <div className="mb-2 p-3.5 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-black/60 text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white">Interpreted Intent</span>
                <span className="text-[11px] text-zinc-400 block font-serif italic">
                  “{previewResult.rawPrompt}”
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Discard
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors flex items-center gap-1 shadow-md shadow-amber-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Recipe
              </button>
            </div>
          </div>

          {/* Mapped changes diff chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80 text-[11px] font-mono">
            {previewResult.changesSummary.map((c, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1"
              >
                <span className="text-zinc-500">{c.label}:</span>
                <span className="text-amber-400">{c.to}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Input Field & Prompt Bar */}
      <div className="relative bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-800/90 shadow-2xl p-1.5 flex flex-col gap-1.5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe visual grammar intent (e.g. 'Sri Yantra with stepped temple gates')..."
            className="w-full bg-transparent border-none py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-zinc-950 font-bold transition-all shrink-0"
            title="Interpret Natural Language Intent"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-2 pb-1 scrollbar-none text-[10px]">
          <span className="text-zinc-400 whitespace-nowrap">Try:</span>
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(p);
                handleInterpret(p);
              }}
              className="px-2 py-0.5 rounded-full bg-zinc-800/70 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 whitespace-nowrap border border-zinc-700/50 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
