import React, { useMemo, useState } from "react";
import { Download, FileCode2, Image as ImageIcon, Braces, Check, Loader2 } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";
import { serializeSceneToSVG } from "../../engine/serializer";
import { downloadSVG, downloadPNG, downloadJSON } from "../../utils/download";

type Format = "svg" | "png" | "json";

interface ExportCardProps {
  scene: GeneratedScene;
  recipe: JantraRecipe;
}

const SCALES = [1, 2, 4] as const;

export const ExportCard: React.FC<ExportCardProps> = ({ scene, recipe }) => {
  const [format, setFormat] = useState<Format>("svg");
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

  const options: Array<{ id: Format; label: string; hint: string; icon: React.ElementType }> = [
    { id: "svg", label: "SVG", hint: "Recommended", icon: FileCode2 },
    { id: "png", label: "PNG", hint: `${scene.width * scale} px`, icon: ImageIcon },
    { id: "json", label: "JSON", hint: "Recipe", icon: Braces },
  ];

  const diagnostics = [
    `${scene.totalPaths.toLocaleString()} paths · ${scene.totalVertices.toLocaleString()} nodes`,
    `${scene.width} × ${scene.height}`,
    transparent ? "Transparent background" : `Background ${recipe.canvas.background}`,
    `${sizeKb} KB`,
  ];

  const guarantees = ["Editable vectors", "No external dependencies", "Figma / Illustrator / Inkscape compatible"];

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-zinc-950/70 p-3.5 space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Export</h3>
        <span className="font-mono text-[10px] text-zinc-600">{format === "png" ? `${scale}x` : "vector"}</span>
      </div>

      {/* Format radios */}
      <div className="space-y-1.5">
        {options.map(({ id, label, hint, icon: Icon }) => {
          const active = format === id;
          return (
            <label
              key={id}
              className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 cursor-pointer transition-all ${
                active
                  ? "border-amber-500/60 bg-amber-500/[0.08]"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name="export-format"
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
              <span className={`text-[12px] font-medium ${active ? "text-zinc-100" : "text-zinc-300"}`}>{label}</span>
              <span className="ml-auto font-mono text-[10px] text-zinc-500">{hint}</span>
            </label>
          );
        })}
      </div>

      {format === "png" && (
        <div className="flex gap-1 pl-0.5">
          {SCALES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`flex-1 py-1 rounded-md border text-[11px] font-mono transition-colors ${
                scale === s
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      )}

      {/* Diagnostics readout */}
      <div className="rounded-lg border border-zinc-800/80 bg-[#09090b] px-2.5 py-2 space-y-1">
        <p className="font-mono text-[10px] text-zinc-500 leading-relaxed">
          {format === "svg" ? "Editable SVG" : format === "png" ? `Raster PNG @${scale}x` : "JSON recipe"}
          <span className="text-zinc-700"> • </span>
          {diagnostics.join(" • ")}
        </p>
        {format !== "png" && (
          <ul className="space-y-0.5 pt-0.5">
            {guarantees.map((g) => (
              <li key={g} className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-500/80">
                <Check className="w-2.5 h-2.5 shrink-0" strokeWidth={3} />
                {g}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 font-semibold text-[13px] py-2.5 transition-colors shadow-[0_6px_20px_-8px_rgba(245,158,11,0.8)]"
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
    </div>
  );
};
