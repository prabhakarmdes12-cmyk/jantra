import React, { useMemo, useState } from "react";
import { Eye, EyeOff, Copy, Check, ChevronRight, Layers as LayersIcon, Code2, Ruler, Crosshair } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";
import { serializeSceneToSVG } from "../../engine/serializer";
import { copyToClipboard } from "../../utils/download";
import { ringRadii } from "../../engine/geom";

type Tab = "layers" | "code" | "spacing" | "vertices";

interface InspectTabsProps {
  scene: GeneratedScene;
  recipe: JantraRecipe;
  hiddenLayers: Set<string>;
  onToggleLayer: (id: string) => void;
}

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "layers", label: "Layers", icon: LayersIcon },
  { id: "code", label: "Code", icon: Code2 },
  { id: "spacing", label: "Spacing", icon: Ruler },
  { id: "vertices", label: "Vertices", icon: Crosshair },
];

/** Pull the absolute move/line/curve endpoints out of a path `d`. */
function extractVertices(d: string, limit = 400): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const re = /([MLCQ])\s*([-\d.eE,\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d)) && out.length < limit) {
    const nums = m[2].trim().split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
    // Endpoint is the last coordinate pair of the command.
    if (nums.length >= 2) out.push([nums[nums.length - 2], nums[nums.length - 1]]);
  }
  return out;
}

export const InspectTabs: React.FC<InspectTabsProps> = ({ scene, recipe, hiddenLayers, onToggleLayer }) => {
  const [tab, setTab] = useState<Tab>("layers");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [codeMode, setCodeMode] = useState<"svg" | "json">("svg");
  const [copied, setCopied] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const svg = useMemo(() => serializeSceneToSVG(scene, recipe), [scene, recipe]);
  const json = useMemo(() => JSON.stringify(recipe, null, 2), [recipe]);
  const code = codeMode === "svg" ? svg : json;

  const radii = useMemo(() => {
    const R = Math.min(recipe.canvas.width, recipe.canvas.height) / 2;
    const artR = R * (recipe.parameters.motifs.bhupura.enabled ? 0.805 : 0.95);
    const scaleRef = R / 736;
    const binduR = Math.max(3, recipe.parameters.motifs.bindu.radius) * scaleRef;
    const core = Math.min(Math.max(binduR * 3.4, R * 0.05), R * 0.2);
    return ringRadii(Math.max(1, Math.min(14, recipe.parameters.rings.count)), recipe.parameters.rings.spacing, core, artR);
  }, [recipe]);

  const allPaths = useMemo(
    () => scene.groups.flatMap((g) => g.elements.filter((e): e is typeof e & { d: string } => "d" in e)),
    [scene]
  );
  const target = allPaths.find((p) => p.id === selectedPath) ?? allPaths[0];
  const vertices = useMemo(() => (target ? extractVertices(target.d) : []), [target]);

  const copy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="grid grid-cols-4 gap-0.5 p-1 mx-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-[10.5px] font-medium transition-colors ${
              tab === id ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        {/* ------------------------------ LAYERS ----------------------------- */}
        {tab === "layers" && (
          <ul className="space-y-0.5">
            {scene.groups.map((group) => {
              const isOpen = openGroups.has(group.id);
              const hidden = hiddenLayers.has(group.id);
              return (
                <li key={group.id}>
                  <div
                    className={`flex items-center gap-1 rounded-md px-1.5 py-1.5 hover:bg-zinc-900/70 transition-colors ${
                      hidden ? "opacity-45" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups((prev) => {
                          const next = new Set(prev);
                          next.has(group.id) ? next.delete(group.id) : next.add(group.id);
                          return next;
                        })
                      }
                      className="p-0.5 text-zinc-600 hover:text-zinc-200"
                    >
                      <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </button>
                    <span className="flex-1 min-w-0 text-[11.5px] text-zinc-200 truncate">{group.label}</span>
                    <span className="font-mono text-[9.5px] text-zinc-600 tabular-nums">{group.elements.length}</span>
                    <button
                      type="button"
                      onClick={() => onToggleLayer(group.id)}
                      className="p-0.5 text-zinc-600 hover:text-amber-400 transition-colors"
                      title={hidden ? "Show layer" : "Hide layer"}
                    >
                      {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  {isOpen && (
                    <ul className="ml-5 border-l border-zinc-800/80 pl-2 py-0.5 space-y-0.5">
                      {group.elements.map((el) => (
                        <li key={el.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPath(el.id);
                              setTab("vertices");
                            }}
                            className="w-full flex items-center gap-1.5 text-left px-1.5 py-1 rounded hover:bg-zinc-900/70 transition-colors"
                          >
                            <span
                              className="w-2 h-2 rounded-[2px] shrink-0 border border-zinc-700"
                              style={{ background: (el.stroke as string) ?? "transparent" }}
                            />
                            <span className="font-mono text-[10px] text-zinc-500 truncate">{el.id}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* ------------------------------- CODE ------------------------------ */}
        {tab === "code" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 p-0.5 rounded-md bg-zinc-950 border border-zinc-800">
                {(["svg", "json"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCodeMode(m)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                      codeMode === m ? "bg-zinc-800 text-amber-300" : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[10px] text-zinc-600">
                {(new Blob([code]).size / 1024).toFixed(1)} KB · {code.split("\n").length} lines
              </span>
              <button
                type="button"
                onClick={copy}
                className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-800 text-[10px] text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="rounded-lg border border-zinc-800 bg-[#09090b] p-2.5 overflow-auto max-h-[52vh] font-mono text-[10px] leading-relaxed text-zinc-400 whitespace-pre">
              {code.length > 60000 ? `${code.slice(0, 60000)}\n… truncated for display, export for the full file` : code}
            </pre>
          </div>
        )}

        {/* ----------------------------- SPACING ----------------------------- */}
        {tab === "spacing" && (
          <div className="space-y-3">
            <p className="text-[10.5px] text-zinc-500 leading-snug">
              Ring progression under <span className="font-mono text-amber-400">{recipe.parameters.rings.spacing}</span>{" "}
              spacing, measured from the bindu clearance out to the art radius.
            </p>
            <table className="w-full font-mono text-[10.5px] tabular-nums">
              <thead>
                <tr className="text-zinc-600 border-b border-zinc-800">
                  <th className="text-left font-normal py-1">#</th>
                  <th className="text-right font-normal py-1">radius</th>
                  <th className="text-right font-normal py-1">Δ</th>
                  <th className="text-right font-normal py-1">ratio</th>
                </tr>
              </thead>
              <tbody>
                {radii.map((r, i) => {
                  const prev = i > 0 ? radii[i - 1] : 0;
                  return (
                    <tr key={i} className="border-b border-zinc-900/80">
                      <td className="py-1 text-zinc-600">{String(i).padStart(2, "0")}</td>
                      <td className="py-1 text-right text-zinc-200">{r.toFixed(2)}</td>
                      <td className="py-1 text-right text-zinc-500">{i > 0 ? (r - prev).toFixed(2) : "—"}</td>
                      <td className="py-1 text-right text-cyan-500/80">{i > 0 ? (r / prev).toFixed(4) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ----------------------------- VERTICES ---------------------------- */}
        {tab === "vertices" && (
          <div className="space-y-2">
            <select
              value={target?.id ?? ""}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 font-mono text-[10.5px] text-zinc-200 outline-none focus:border-amber-500/60"
            >
              {allPaths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
            <p className="font-mono text-[10px] text-zinc-600">
              {vertices.length} endpoints{vertices.length >= 400 ? " (first 400)" : ""} · stroke {target?.stroke} ·{" "}
              {target?.strokeWidth?.toFixed?.(2) ?? "—"}px
            </p>
            <table className="w-full font-mono text-[10.5px] tabular-nums">
              <thead>
                <tr className="text-zinc-600 border-b border-zinc-800">
                  <th className="text-left font-normal py-1">i</th>
                  <th className="text-right font-normal py-1">x</th>
                  <th className="text-right font-normal py-1">y</th>
                  <th className="text-right font-normal py-1">r</th>
                  <th className="text-right font-normal py-1">θ°</th>
                </tr>
              </thead>
              <tbody>
                {vertices.map(([x, y], i) => (
                  <tr key={i} className="border-b border-zinc-900/80">
                    <td className="py-0.5 text-zinc-700">{String(i).padStart(3, "0")}</td>
                    <td className="py-0.5 text-right text-zinc-300">{x.toFixed(2)}</td>
                    <td className="py-0.5 text-right text-zinc-300">{y.toFixed(2)}</td>
                    <td className="py-0.5 text-right text-zinc-500">{Math.hypot(x, y).toFixed(2)}</td>
                    <td className="py-0.5 text-right text-cyan-500/70">
                      {(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
