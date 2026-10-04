import React, { useMemo, useState } from "react";
import { Download, FileCode2, Image as ImageIcon, Braces, Check, Loader2, PackageOpen } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";
import { serializeSceneToSVG } from "../../engine/serializer";
import { downloadSVG, downloadPNG, downloadJSON } from "../../utils/download";

export type ExportFormat = "svg" | "png" | "json";

interface ExportPanelProps {
  scene: GeneratedScene;
  recipe: JantraRecipe;
  /** `strip` is the compact card that sits beside the Evolution Gallery. */
  variant?: "strip" | "full";
}

const SCALES = [1, 2, 4] as const;

const OPTIONS: Array<{ id: ExportFormat; label: string; note: string; icon: React.ElementType }> = [
  { id: "svg", label: "SVG", note: "Editable vectors, no dependencies", icon: FileCode2 },
  { id: "png", label: "PNG", note: "High-resolution image", icon: ImageIcon },
  { id: "json", label: "JSON", note: "Recipe and parameters", icon: Braces },
];

export const ExportPanel: React.FC<ExportPanelProps> = ({ scene, recipe, variant = "strip" }) => {
  const [format, setFormat] = useState<ExportFormat>("svg");
  const [scale, setScale] = useState<(typeof SCALES)[number]>(2);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const svg = useMemo(() => serializeSceneToSVG(scene, recipe), [scene, recipe]);
  const sizeKb = useMemo(() => (new Blob([svg]).size / 1024).toFixed(1), [svg]);
  const baseName = `jantra-${recipe.grammar.family}-${String(recipe.seed)}`;
  const transparent = recipe.canvas.background === "transparent";

  const run = async () => {
    setBusy(true);
    try {
      if (format === "svg") downloadSVG(svg, `${baseName}.svg`);
      else if (format === "json") downloadJSON(recipe, `${baseName}.json`);
      else await downloadPNG(svg, `${baseName}@${scale}x.png`, scene.width * scale, scene.height * scale);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } finally {
      setBusy(false);
    }
  };

  const guarantees = ["Editable vectors", "No external dependencies", "Figma / Illustrator / Inkscape compatible"];

  return (
    <div className={variant === "full" ? "space-y-4" : "h-full flex flex-col gap-2 px-4 py-3"}>
      <header className="shrink-0 flex items-start gap-2">
        <PackageOpen className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-semibold text-zinc-100 leading-none">Export</h3>
          <p className="text-[10.5px] text-zinc-600 leading-snug mt-1">
            Download high-quality, editable vectors for use in design, print or digital products.
          </p>
        </div>
      </header>

      <div className={variant === "full" ? "grid sm:grid-cols-3 gap-2" : "flex-1 min-h-0 space-y-1"}>
        {OPTIONS.map(({ id, label, note, icon: Icon }) => {
          const active = format === id;
          return (
            <label
              key={id}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-all ${
                active ? "border-amber-500/60 bg-amber-500/[0.08]" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name={`export-${variant}`}
                checked={active}
                onChange={() => setFormat(id)}
                className="sr-only"
              />
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 grid place-items-center shrink-0 transition-colors ${
                  active ? "border-amber-500" : "border-zinc-600"
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </span>
              <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-amber-400" : "text-zinc-500"}`} />
              <span className="min-w-0">
                <span className="flex items-baseline gap-1.5">
                  <span className={`text-[12px] font-medium ${active ? "text-zinc-50" : "text-zinc-300"}`}>
                    {label}
                  </span>
                  {id === "svg" && <span className="text-[9.5px] text-amber-500/80">(Recommended)</span>}
                </span>
                <span className="block text-[9.5px] text-zinc-600 leading-tight truncate">{note}</span>
              </span>
            </label>
          );
        })}
      </div>

      {format === "png" && (
        <div className="shrink-0 flex gap-1">
          {SCALES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`flex-1 py-1 rounded-md border text-[10.5px] font-mono transition-colors ${
                scale === s
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {s}x · {scene.width * s}px
            </button>
          ))}
        </div>
      )}

      {variant === "full" && (
        <div className="rounded-lg border border-zinc-800/80 bg-[#09090b] px-3 py-2.5 space-y-1.5">
          <p className="font-mono text-[11px] text-zinc-500 leading-relaxed">
            {format === "svg" ? "Editable SVG" : format === "png" ? `Raster PNG @${scale}x` : "JSON recipe"}
            <span className="text-zinc-700"> • </span>
            {scene.totalPaths.toLocaleString()} paths · {scene.totalVertices.toLocaleString()} nodes
            <span className="text-zinc-700"> • </span>
            {scene.width} × {scene.height}
            <span className="text-zinc-700"> • </span>
            {transparent ? "Transparent background" : `Background ${recipe.canvas.background}`}
            <span className="text-zinc-700"> • </span>
            {sizeKb} KB
          </p>
          {format !== "png" && (
            <ul className="flex flex-wrap gap-x-4 gap-y-0.5">
              {guarantees.map((g) => (
                <li key={g} className="flex items-center gap-1.5 font-mono text-[10.5px] text-emerald-500/80">
                  <Check className="w-2.5 h-2.5 shrink-0" strokeWidth={3} />
                  {g}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="shrink-0 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 font-semibold text-[13px] py-2.5 transition-colors shadow-[0_6px_20px_-8px_rgba(245,158,11,0.9)]"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : done ? (
          <Check className="w-4 h-4" strokeWidth={3} />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {done ? "Downloaded" : `Download ${format.toUpperCase()}`}
      </button>

      {variant === "strip" && (
        <p className="shrink-0 font-mono text-[9.5px] text-zinc-700 text-center leading-none">
          {scene.totalPaths} paths · {sizeKb} KB · {scene.width}×{scene.height}
        </p>
      )}
    </div>
  );
};
