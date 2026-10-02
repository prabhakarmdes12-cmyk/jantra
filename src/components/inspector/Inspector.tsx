import React, { useState } from "react";
import { ChevronRight, ChevronDown, Sparkles, Layers, Sliders, Palette, HeartPulse, RefreshCw, Bookmark } from "lucide-react";
import { JantraRecipe, SymmetryMode, RingSpacing, LineCap, PrimaryMotif, SecondaryMotif, BinduStyle } from "../../types/recipe";
import { SeedBar } from "./SeedBar";
import { SymmetryPanel } from "./SymmetryPanel";
import { StructurePanel } from "./StructurePanel";
import { MotifsPanel } from "./MotifsPanel";
import { PranaPanel } from "./PranaPanel";
import { StylePanel } from "./StylePanel";

interface InspectorProps {
  recipe: JantraRecipe;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateSeed: (seed: string | number) => void;
  onRandomizeSeed: () => void;
  onUpdateSymmetry: (symmetry: Partial<JantraRecipe["parameters"]["symmetry"]>) => void;
  onUpdateRings: (rings: Partial<JantraRecipe["parameters"]["rings"]>) => void;
  onUpdateRecursion: (recursion: Partial<JantraRecipe["parameters"]["recursion"]>) => void;
  onUpdateDensity: (density: number) => void;
  onUpdatePrana: (prana: number) => void;
  onUpdateLine: (line: Partial<JantraRecipe["parameters"]["line"]>) => void;
  onUpdateMotifs: (motifs: Partial<JantraRecipe["parameters"]["motifs"]>) => void;
  onUpdatePalette: (palette: Partial<JantraRecipe["parameters"]["palette"]>) => void;
  onUpdateCanvas: (canvas: Partial<JantraRecipe["canvas"]>) => void;
  onResetToDefault: () => void;
  onOpenPresets: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  recipe,
  isOpen,
  onToggleOpen,
  onUpdateSeed,
  onRandomizeSeed,
  onUpdateSymmetry,
  onUpdateRings,
  onUpdateRecursion,
  onUpdateDensity,
  onUpdatePrana,
  onUpdateLine,
  onUpdateMotifs,
  onUpdatePalette,
  onUpdateCanvas,
  onResetToDefault,
  onOpenPresets,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    symmetry: true,
    structure: true,
    motifs: true,
    prana: true,
    style: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const p = recipe.parameters;

  return (
    <>
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="fixed right-4 top-20 z-40 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 shadow-xl text-zinc-200 hover:text-white hover:border-zinc-700 transition-all group"
          title="Open Visual Grammar Inspector"
        >
          <Sliders className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Inspector</span>
        </button>
      )}

      {/* Main Inspector Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-40 w-80 sm:w-88 bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800/90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Visual Grammar</h2>
              <p className="text-[10px] text-zinc-400 font-mono">Engine v{recipe.engineVersion}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenPresets}
              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors"
              title="Open Preset Library"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onResetToDefault}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reset to default recipe"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-1"
              title="Close Inspector"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Accordion Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Seed Bar */}
          <SeedBar
            seed={recipe.seed}
            onUpdateSeed={onUpdateSeed}
            onRandomize={onRandomizeSeed}
          />

          {/* 1. Symmetry Section */}
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("symmetry")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-850/50 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Symmetry & Rotation
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  {p.symmetry.segments}F • {p.symmetry.mode}
                </span>
                {openSections.symmetry ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>

            {openSections.symmetry && (
              <div className="p-3 pt-1 border-t border-zinc-800/60">
                <SymmetryPanel
                  mode={p.symmetry.mode}
                  segments={p.symmetry.segments}
                  onChangeMode={(mode: SymmetryMode) => onUpdateSymmetry({ mode })}
                  onChangeSegments={(segments: number) => onUpdateSymmetry({ segments })}
                />
              </div>
            )}
          </div>

          {/* 2. Structure & Rings Section */}
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("structure")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-850/50 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Rings & Structure
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  {p.rings.count}R • {p.rings.spacing}
                </span>
                {openSections.structure ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>

            {openSections.structure && (
              <div className="p-3 pt-1 border-t border-zinc-800/60">
                <StructurePanel
                  ringsCount={p.rings.count}
                  spacing={p.rings.spacing}
                  showGuideLines={p.rings.showGuideLines}
                  recursionDepth={p.recursion.depth}
                  recursionScale={p.recursion.scale}
                  density={p.density}
                  onChangeRingsCount={(count: number) => onUpdateRings({ count })}
                  onChangeSpacing={(spacing: RingSpacing) => onUpdateRings({ spacing })}
                  onChangeShowGuideLines={(showGuideLines: boolean) => onUpdateRings({ showGuideLines })}
                  onChangeRecursionDepth={(depth: number) => onUpdateRecursion({ depth })}
                  onChangeRecursionScale={(scale: number) => onUpdateRecursion({ scale })}
                  onChangeDensity={onUpdateDensity}
                />
              </div>
            )}
          </div>

          {/* 3. Motifs & Gates Section */}
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("motifs")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-850/50 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Motifs & Sacred Gates
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  {p.motifs.primary}
                </span>
                {openSections.motifs ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>

            {openSections.motifs && (
              <div className="p-3 pt-1 border-t border-zinc-800/60">
                <MotifsPanel
                  primary={p.motifs.primary}
                  secondary={p.motifs.secondary}
                  binduRadius={p.motifs.bindu.radius}
                  binduStyle={p.motifs.bindu.style}
                  bhupuraEnabled={p.motifs.bhupura.enabled}
                  bhupuraSteps={p.motifs.bhupura.steps}
                  bhupuraGates={p.motifs.bhupura.gates}
                  bhupuraFinials={p.motifs.bhupura.finials ?? true}
                  onChangePrimary={(primary: PrimaryMotif) => onUpdateMotifs({ primary })}
                  onChangeSecondary={(secondary: SecondaryMotif) => onUpdateMotifs({ secondary })}
                  onChangeBinduRadius={(radius: number) => onUpdateMotifs({ bindu: { ...p.motifs.bindu, radius } })}
                  onChangeBinduStyle={(style: BinduStyle) => onUpdateMotifs({ bindu: { ...p.motifs.bindu, style } })}
                  onChangeBhupuraEnabled={(enabled: boolean) => onUpdateMotifs({ bhupura: { ...p.motifs.bhupura, enabled } })}
                  onChangeBhupuraSteps={(steps: number) => onUpdateMotifs({ bhupura: { ...p.motifs.bhupura, steps } })}
                  onChangeBhupuraGates={(gates: number) => onUpdateMotifs({ bhupura: { ...p.motifs.bhupura, gates } })}
                  onChangeBhupuraFinials={(finials: boolean) => onUpdateMotifs({ bhupura: { ...p.motifs.bhupura, finials } })}
                />
              </div>
            )}
          </div>

          {/* 4. Prana (Imperfection) Section */}
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("prana")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-850/50 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                Prana (Imperfection)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  {Math.round(p.prana * 100)}%
                </span>
                {openSections.prana ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>

            {openSections.prana && (
              <div className="p-3 pt-1 border-t border-zinc-800/60">
                <PranaPanel
                  prana={p.prana}
                  onChangePrana={onUpdatePrana}
                />
              </div>
            )}
          </div>

          {/* 5. Style & Colors Section */}
          <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("style")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-850/50 transition-colors"
            >
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Line & Styling
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  {p.line.weight}px
                </span>
                {openSections.style ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>

            {openSections.style && (
              <div className="p-3 pt-1 border-t border-zinc-800/60">
                <StylePanel
                  weight={p.line.weight}
                  cap={p.line.cap}
                  strokeColor={p.palette.stroke}
                  accentColor={p.palette.accent}
                  backgroundColor={recipe.canvas.background}
                  glowEffect={recipe.canvas.glowEffect}
                  onChangeWeight={(weight: number) => onUpdateLine({ weight })}
                  onChangeCap={(cap: LineCap) => onUpdateLine({ cap })}
                  onChangeStrokeColor={(stroke: string) => onUpdatePalette({ stroke })}
                  onChangeAccentColor={(accent: string) => onUpdatePalette({ accent })}
                  onChangeBackgroundColor={(background: string) => onUpdateCanvas({ background })}
                  onChangeGlowEffect={(glowEffect: boolean) => onUpdateCanvas({ glowEffect })}
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
