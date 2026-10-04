import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { GRAMMAR_FAMILIES, JantraRecipe } from "../../types/recipe";
import { PRANA_STAGES } from "../../engine/prana";
import { ARTISAN_PALETTES } from "../../presets/palettes";
import { Slider } from "../common/Slider";
import { SegmentedControl } from "../common/SegmentedControl";
import { ColorPicker } from "../common/ColorPicker";
import { ExportCard } from "./ExportCard";
import { InspectTabs } from "./InspectTabs";
import { useRecipe } from "../../hooks/useRecipe";

type Controls = ReturnType<typeof useRecipe>;

interface InspectorRailProps {
  mode: "create" | "inspect";
  recipe: JantraRecipe;
  scene: GeneratedScene;
  controls: Controls;
  hiddenLayers: Set<string>;
  onToggleLayer: (id: string) => void;
}

const Section: React.FC<{ title: string; defaultOpen?: boolean; children: React.ReactNode; hint?: string }> = ({
  title,
  defaultOpen = true,
  children,
  hint,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-zinc-800/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left group"
      >
        <ChevronDown
          className={`w-3 h-3 text-zinc-600 group-hover:text-zinc-300 transition-all ${open ? "" : "-rotate-90"}`}
        />
        <h3 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 group-hover:text-zinc-200 uppercase transition-colors">
          {title}
        </h3>
        {hint && <span className="ml-auto font-mono text-[10px] text-zinc-600">{hint}</span>}
      </button>
      {open && <div className="px-3.5 pb-4 space-y-3.5">{children}</div>}
    </section>
  );
};

export const InspectorRail: React.FC<InspectorRailProps> = ({
  mode,
  recipe,
  scene,
  controls,
  hiddenLayers,
  onToggleLayer,
}) => {
  const p = recipe.parameters;
  const detail = p.detail ?? {
    ribbing: true,
    ribCount: 5,
    stipple: true,
    nodes: true,
    construction: true,
    lattice: false,
  };
  const family = GRAMMAR_FAMILIES.find((f) => f.id === recipe.grammar.family);

  const stage = [...PRANA_STAGES].reverse().find((s) => p.prana >= s.at) ?? PRANA_STAGES[0];

  const toggles: Array<{ key: keyof typeof detail; label: string }> = [
    { key: "ribbing", label: "Petal veins" },
    { key: "stipple", label: "Stipple orbits" },
    { key: "nodes", label: "Celestial nodes" },
    { key: "construction", label: "Construction" },
    { key: "lattice", label: "Jali lattice" },
  ];

  return (
    <aside
      className={`shrink-0 flex flex-col border-l border-zinc-800/80 bg-[#0b0b0e] transition-[width] duration-200 ${
        mode === "inspect" ? "w-[400px]" : "w-[316px]"
      }`}
    >
      {mode === "inspect" ? (
        <>
          <div className="px-3.5 pt-3.5 pb-2.5">
            <h2 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">Technical Inspect</h2>
            <p className="text-[10.5px] text-zinc-600 mt-0.5 font-mono">
              {scene.totalPaths} paths · {scene.totalVertices.toLocaleString()} nodes ·{" "}
              {Math.round(scene.computedLength).toLocaleString()} px drawn
            </p>
          </div>
          <InspectTabs scene={scene} recipe={recipe} hiddenLayers={hiddenLayers} onToggleLayer={onToggleLayer} />
          <div className="shrink-0 p-3 border-t border-zinc-800/80">
            <ExportCard scene={scene} recipe={recipe} />
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* ------------------------------ STRUCTURE ------------------------------ */}
          <Section title="Structure" hint={family?.sanskrit}>
            <Slider
              label="Symmetry"
              value={p.symmetry.segments}
              min={3}
              max={36}
              onChange={(v) => controls.updateSymmetry({ segments: Math.round(v) })}
              unit="fold"
              description="Rotational divisions of the plate."
            />
            <SegmentedControl
              label="Mode"
              size="sm"
              value={p.symmetry.mode}
              options={[
                { value: "radial", label: "Radial" },
                { value: "bilateral", label: "Mirror" },
                { value: "grid", label: "Grid" },
                { value: "hybrid", label: "Hybrid" },
              ]}
              onChange={(v) => controls.updateSymmetry({ mode: v as typeof p.symmetry.mode })}
            />
            {p.symmetry.mode === "hybrid" && (
              <Slider
                label="Outer multiplier"
                value={p.symmetry.outerMultiplier ?? 2}
                min={1}
                max={3}
                onChange={(v) => controls.updateSymmetry({ outerMultiplier: Math.round(v) })}
                unit="×"
                description="Outer registers step up to 2× or 3× the base fold."
              />
            )}
            <Slider
              label="Rings"
              value={p.rings.count}
              min={1}
              max={14}
              onChange={(v) => controls.updateRings({ count: Math.round(v) })}
              description="Concentric registers between bindu and rim."
            />
            <SegmentedControl
              label="Ring spacing"
              size="sm"
              value={p.rings.spacing}
              options={[
                { value: "linear", label: "Linear" },
                { value: "golden", label: "Golden" },
                { value: "harmonic", label: "Harmonic" },
                { value: "exponential", label: "Exp" },
              ]}
              onChange={(v) => controls.updateRings({ spacing: v as typeof p.rings.spacing })}
            />
            <Slider
              label="Density"
              value={p.density}
              min={0}
              max={1}
              step={0.01}
              onChange={controls.updateDensity}
              formatValue={(v) => v.toFixed(2)}
            />
            <Slider
              label="Recursion depth"
              value={p.recursion.depth}
              min={1}
              max={6}
              onChange={(v) => controls.updateRecursion({ depth: Math.round(v) })}
            />
          </Section>

          {/* ------------------------------ VARIATION ------------------------------ */}
          <Section title="Variation & Style" hint={`prāṇa ${p.prana}`}>
            <div>
              <Slider
                label="Prāṇa"
                value={p.prana}
                min={0}
                max={100}
                onChange={controls.updatePrana}
                description={stage.note}
              />
              <div className="mt-2 flex gap-1">
                {PRANA_STAGES.map((s) => (
                  <button
                    key={s.at}
                    type="button"
                    onClick={() => controls.updatePrana(s.at)}
                    title={s.note}
                    className={`flex-1 py-1 rounded-md border text-[10px] font-mono transition-colors ${
                      p.prana === s.at
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {s.at}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-zinc-600 leading-snug">
                <span className="text-zinc-400">{stage.label}</span> — controlled life inside a deterministic system.
              </p>
            </div>

            <Slider
              label="Asymmetry"
              value={p.symmetry.asymmetry ?? 0}
              min={0}
              max={30}
              onChange={(v) => controls.updateSymmetry({ asymmetry: v })}
              unit="°"
              description="Deliberate off-axis rotation of the whole plate."
            />
            <Slider
              label="Line weight"
              value={p.line.weight}
              min={0.3}
              max={6}
              step={0.01}
              onChange={(v) => controls.updateLine({ weight: v })}
              unit="px"
              formatValue={(v) => v.toFixed(2)}
            />
            <SegmentedControl
              label="Line cap"
              size="sm"
              value={p.line.cap}
              options={[
                { value: "butt", label: "Butt" },
                { value: "round", label: "Round" },
                { value: "square", label: "Square" },
              ]}
              onChange={(v) => controls.updateLine({ cap: v as typeof p.line.cap })}
            />

            <div className="space-y-1.5 pt-1">
              <span className="text-xs text-zinc-300 font-medium block">Detail layers</span>
              <div className="grid grid-cols-2 gap-1">
                {toggles.map(({ key, label }) => {
                  const on = Boolean(detail[key]);
                  return (
                    <button
                      key={String(key)}
                      type="button"
                      onClick={() => controls.updateDetail({ [key]: !on } as never)}
                      className={`px-2 py-1.5 rounded-md border text-[10.5px] text-left transition-colors ${
                        on
                          ? "border-amber-500/40 bg-amber-500/[0.07] text-amber-300"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            {detail.ribbing && (
              <Slider
                label="Veins per petal"
                value={detail.ribCount}
                min={3}
                max={7}
                onChange={(v) => controls.updateDetail({ ribCount: Math.round(v) })}
              />
            )}
          </Section>

          {/* ------------------------------ MOTION ------------------------------ */}
          <Section title="Motion & Evolution" defaultOpen={false} hint={`gen ${recipe.provenance.generation ?? 0}`}>
            <Slider
              label="Bindu radius"
              value={p.motifs.bindu.radius}
              min={3}
              max={40}
              onChange={(v) => controls.updateMotifs({ bindu: { ...p.motifs.bindu, radius: Math.round(v) } })}
              unit="px"
            />
            <SegmentedControl
              label="Bindu style"
              size="sm"
              value={p.motifs.bindu.style}
              options={[
                { value: "solid", label: "Solid" },
                { value: "radiant", label: "Radiant" },
                { value: "hollow", label: "Hollow" },
                { value: "triple_aura", label: "Aura" },
              ]}
              onChange={(v) => controls.updateMotifs({ bindu: { ...p.motifs.bindu, style: v as never } })}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300 font-medium">Bhūpura enclosure</span>
              <button
                type="button"
                onClick={() =>
                  controls.updateMotifs({ bhupura: { ...p.motifs.bhupura, enabled: !p.motifs.bhupura.enabled } })
                }
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  p.motifs.bhupura.enabled ? "bg-amber-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                    p.motifs.bhupura.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {p.motifs.bhupura.enabled && (
              <>
                <Slider
                  label="Wall steps"
                  value={p.motifs.bhupura.steps}
                  min={1}
                  max={4}
                  onChange={(v) => controls.updateMotifs({ bhupura: { ...p.motifs.bhupura, steps: Math.round(v) } })}
                />
                <Slider
                  label="Gates"
                  value={p.motifs.bhupura.gates}
                  min={0}
                  max={4}
                  onChange={(v) => controls.updateMotifs({ bhupura: { ...p.motifs.bhupura, gates: Math.round(v) } })}
                />
              </>
            )}
            <p className="text-[10px] text-zinc-600 leading-snug font-mono">
              lineage {recipe.provenance.lineageId ?? String(recipe.seed)} · mutation{" "}
              {recipe.provenance.mutation ?? "root"}
            </p>
          </Section>

          {/* ------------------------------ COLOUR ------------------------------ */}
          <Section title="Colour & Output" defaultOpen={false}>
            <div className="grid grid-cols-4 gap-1.5">
              {ARTISAN_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() =>
                    controls.updatePalette({
                      stroke: pal.stroke,
                      accent: pal.accent,
                      secondaryStroke: pal.secondaryStroke,
                      construction: pal.construction ?? p.palette.construction,
                    })
                  }
                  title={pal.name}
                  className="group rounded-lg border border-zinc-800 hover:border-amber-500/50 p-1 transition-colors"
                >
                  <span className="flex h-5 rounded overflow-hidden">
                    <span className="flex-1" style={{ background: pal.stroke }} />
                    <span className="flex-1" style={{ background: pal.accent }} />
                    <span className="flex-1" style={{ background: pal.secondaryStroke }} />
                  </span>
                  <span className="block mt-1 text-[9px] text-zinc-600 group-hover:text-zinc-300 truncate transition-colors">
                    {pal.name}
                  </span>
                </button>
              ))}
            </div>
            <ColorPicker label="Primary stroke" value={p.palette.stroke} onChange={(c) => controls.updatePalette({ stroke: c })} />
            <ColorPicker label="Accent" value={p.palette.accent} onChange={(c) => controls.updatePalette({ accent: c })} />
            <ColorPicker
              label="Construction"
              value={p.palette.construction ?? "#06b6d4"}
              onChange={(c) => controls.updatePalette({ construction: c })}
            />
            <ColorPicker
              label="Canvas background"
              value={recipe.canvas.background}
              allowTransparent
              onChange={(c) => controls.updateCanvas({ background: c })}
            />
            <SegmentedControl
              label="Canvas size"
              size="sm"
              value={String(recipe.canvas.width)}
              options={[
                { value: "1200", label: "1200" },
                { value: "1600", label: "1600" },
                { value: "2400", label: "2400" },
              ]}
              onChange={(v) => controls.updateCanvas({ width: Number(v), height: Number(v) })}
            />
          </Section>

          <div className="p-3">
            <ExportCard scene={scene} recipe={recipe} />
          </div>
        </div>
      )}
    </aside>
  );
};
