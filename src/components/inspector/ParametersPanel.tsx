import React from "react";
import {
  Asterisk,
  FlipHorizontal2,
  Grid2x2,
  Network,
  Shapes,
  Sparkles,
  GitBranch,
  Palette,
  Moon,
  Sun,
  Shuffle,
} from "lucide-react";
import { JantraRecipe, MutationMode, SymmetryMode } from "../../types/recipe";
import { INK_PALETTES, matchInkPalette } from "../../presets/inkPalettes";
import { PRANA_STAGES } from "../../engine/prana";
import { NumberSlider } from "../common/NumberSlider";
import { useRecipe } from "../../hooks/useRecipe";

type Controls = ReturnType<typeof useRecipe>;

interface ParametersPanelProps {
  recipe: JantraRecipe;
  controls: Controls;
}

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({
  title,
  icon: Icon,
  children,
}) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-[12.5px] font-semibold text-zinc-100">
      <Icon className="w-3.5 h-3.5 text-amber-500" />
      {title}
    </h3>
    <div className="space-y-2.5">{children}</div>
  </section>
);

const SYMMETRY_MODES: Array<{ id: SymmetryMode; label: string; icon: React.ElementType }> = [
  { id: "radial", label: "Radial", icon: Asterisk },
  { id: "bilateral", label: "Mirror", icon: FlipHorizontal2 },
  { id: "grid", label: "Grid", icon: Grid2x2 },
  { id: "hybrid", label: "Hybrid", icon: Network },
];

const MUTATIONS: Array<{ id: MutationMode; label: string; note: string }> = [
  { id: "structured", label: "Structured", note: "Canonical operators only — the textbook six." },
  { id: "balanced", label: "Balanced", note: "Canonical direction plus seeded sub-variation." },
  { id: "wild", label: "Wild", note: "Larger jumps; operators may swap the grammar family." },
];

export const ParametersPanel: React.FC<ParametersPanelProps> = ({ recipe, controls }) => {
  const p = recipe.parameters;
  const stage = [...PRANA_STAGES].reverse().find((s) => p.prana >= s.at) ?? PRANA_STAGES[0];
  const activeInk = matchInkPalette(p.palette.stroke, p.palette.accent);
  const evolution = p.evolution ?? { strength: 50, mutation: "structured" as MutationMode };
  const isLight = recipe.canvas.background !== "transparent" && recipe.canvas.background > "#888888";

  return (
    <div className="px-4 py-4 space-y-6">
      {/* ------------------------------------------------ STRUCTURE ---- */}
      <Section title="Structure" icon={Shapes}>
        <div className="grid grid-cols-4 gap-1.5">
          {SYMMETRY_MODES.map(({ id, label, icon: Icon }) => {
            const active = p.symmetry.mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => controls.updateSymmetry({ mode: id, outerMultiplier: id === "hybrid" ? 2 : 1 })}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all ${
                  active
                    ? "border-amber-500/70 bg-amber-500/[0.09] text-amber-400"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10.5px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        <NumberSlider
          label="Radial Segments"
          value={p.symmetry.segments}
          min={3}
          max={36}
          onChange={(v) => controls.updateSymmetry({ segments: Math.round(v) })}
          title="Rotational divisions of the plate."
        />
        {p.symmetry.mode === "hybrid" && (
          <NumberSlider
            label="Outer Multiplier"
            value={p.symmetry.outerMultiplier ?? 2}
            min={1}
            max={3}
            onChange={(v) => controls.updateSymmetry({ outerMultiplier: Math.round(v) })}
            title="Outer registers step up to 2x or 3x the base fold."
          />
        )}
        <NumberSlider
          label="Concentric Rings"
          value={p.rings.count}
          min={1}
          max={14}
          onChange={(v) => controls.updateRings({ count: Math.round(v) })}
        />
        <NumberSlider
          label="Recursion Depth"
          value={p.recursion.depth}
          min={1}
          max={6}
          onChange={(v) => controls.updateRecursion({ depth: Math.round(v) })}
        />

        <div className="flex items-center gap-3">
          <span className="w-[132px] shrink-0 text-[12px] text-zinc-300">Ring Spacing</span>
          <div className="flex-1 grid grid-cols-4 gap-1">
            {(["linear", "golden", "harmonic", "exponential"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => controls.updateRings({ spacing: s })}
                title={s}
                className={`py-1 rounded-md border text-[10px] capitalize transition-colors ${
                  p.rings.spacing === s
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {s === "exponential" ? "Exp" : s}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------------------- VARIATION & STYLE ---- */}
      <Section title="Variation & Style" icon={Sparkles}>
        <NumberSlider
          label="Density"
          value={Math.round(p.density * 100)}
          min={5}
          max={100}
          onChange={(v) => controls.updateDensity(v / 100)}
        />
        <NumberSlider
          label="Line Weight"
          value={p.line.weight}
          min={0.3}
          max={6}
          step={0.1}
          precision={1}
          onChange={(v) => controls.updateLine({ weight: v })}
        />
        <NumberSlider
          label="Detail Level"
          value={p.detailLevel ?? 60}
          min={0}
          max={100}
          onChange={controls.updateDetailLevel}
          title="Progressively switches on construction, stipple, ribbing, nodes and lattice."
        />
        <NumberSlider
          label="Prana"
          hint="(Organic Variation)"
          value={p.prana}
          min={0}
          max={100}
          onChange={controls.updatePrana}
          title={stage.note}
        />
        <div className="flex gap-1 pl-[144px]">
          {PRANA_STAGES.map((s) => (
            <button
              key={s.at}
              type="button"
              onClick={() => controls.updatePrana(s.at)}
              title={`${s.label} — ${s.note}`}
              className={`flex-1 py-0.5 rounded text-[9.5px] font-mono border transition-colors ${
                p.prana === s.at
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800/80 text-zinc-600 hover:text-zinc-300"
              }`}
            >
              {s.at}
            </button>
          ))}
        </div>
        <p className="pl-[144px] text-[10px] text-zinc-600 leading-snug">
          <span className="text-zinc-400">{stage.label}</span> · {stage.note}
        </p>

        <NumberSlider
          label="Asymmetry"
          value={p.symmetry.asymmetry ?? 0}
          min={0}
          max={30}
          onChange={(v) => controls.updateSymmetry({ asymmetry: v })}
          title="Deliberate off-axis rotation of the whole plate, in degrees."
        />
      </Section>

      {/* --------------------------------------- MOTION & EVOLUTION --- */}
      <Section title="Motion & Evolution" icon={GitBranch}>
        <NumberSlider
          label="Evolution Strength"
          value={evolution.strength}
          min={0}
          max={100}
          onChange={(v) => controls.updateEvolution({ strength: v })}
          title="How far each descendant travels from its parent. Direction stays deterministic."
        />

        <div className="flex items-center gap-3">
          <span className="w-[132px] shrink-0 text-[12px] text-zinc-300">Mutation</span>
          <div className="relative flex-1">
            <Shuffle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <select
              value={evolution.mutation}
              onChange={(e) => controls.updateEvolution({ mutation: e.target.value as MutationMode })}
              className="w-full appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/60 rounded-lg pl-8 pr-7 py-1.5 text-[12px] text-zinc-100 outline-none transition-colors cursor-pointer"
            >
              {MUTATIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-[9px] pointer-events-none">
              ▼
            </span>
          </div>
        </div>
        <p className="pl-[144px] text-[10px] text-zinc-600 leading-snug">
          {MUTATIONS.find((m) => m.id === evolution.mutation)?.note}
        </p>

        <NumberSlider
          label="Bindu Radius"
          value={p.motifs.bindu.radius}
          min={2}
          max={40}
          onChange={(v) => controls.updateMotifs({ bindu: { ...p.motifs.bindu, radius: Math.round(v) } })}
        />
        <div className="flex items-center gap-3">
          <span className="w-[132px] shrink-0 text-[12px] text-zinc-300">Bhūpura</span>
          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                controls.updateMotifs({ bhupura: { ...p.motifs.bhupura, enabled: !p.motifs.bhupura.enabled } })
              }
              className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                p.motifs.bhupura.enabled ? "bg-amber-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                  p.motifs.bhupura.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
            {p.motifs.bhupura.enabled && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => controls.updateMotifs({ bhupura: { ...p.motifs.bhupura, steps: n } })}
                    title={`${n} wall step${n > 1 ? "s" : ""}`}
                    className={`w-6 h-6 rounded-md border font-mono text-[10px] transition-colors ${
                      p.motifs.bhupura.steps === n
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                        : "border-zinc-800 text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------ COLOR & OUTPUT ---- */}
      <Section title="Color & Output" icon={Palette}>
        <div className="flex items-center gap-2.5">
          {INK_PALETTES.map((ink) => {
            const active = activeInk?.id === ink.id;
            return (
              <button
                key={ink.id}
                type="button"
                onClick={() => controls.applyInk(ink)}
                title={`${ink.name} — ${ink.note}`}
                className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                  active ? "border-amber-400 scale-105" : "border-zinc-700 hover:border-zinc-500"
                }`}
                style={{ background: ink.swatch }}
              >
                {active && (
                  <span className="absolute -inset-[5px] rounded-full border border-amber-500/40 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() =>
              controls.updateCanvas({
                background: recipe.canvas.background === "transparent" ? activeInk?.background ?? "#09090b" : "transparent",
              })
            }
            className={`px-3 py-2 rounded-lg border text-[12px] transition-colors ${
              recipe.canvas.background === "transparent"
                ? "border-amber-500/50 bg-amber-500/[0.08] text-amber-300"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
            }`}
          >
            {recipe.canvas.background === "transparent" ? "Transparent" : "Background"}
          </button>

          <div className="relative flex-1">
            <select
              value={isLight ? "light" : "dark"}
              onChange={(e) =>
                controls.updateCanvas({ background: e.target.value === "light" ? "#f3eee3" : "#09090b" })
              }
              className="w-full appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500/60 rounded-lg pl-8 pr-7 py-2 text-[12px] text-zinc-100 outline-none transition-colors cursor-pointer"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
            {isLight ? (
              <Sun className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400 pointer-events-none" />
            ) : (
              <Moon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            )}
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-[9px] pointer-events-none">
              ▼
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 pt-0.5">
          {([1200, 1600, 2400] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => controls.updateCanvas({ width: size, height: size })}
              className={`flex-1 py-1.5 rounded-lg border font-mono text-[11px] transition-colors ${
                recipe.canvas.width === size
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
};
