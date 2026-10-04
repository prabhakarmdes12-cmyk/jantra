import React, { useCallback, useEffect, useRef, useState } from "react";
import { MousePointer2, Hand, ZoomIn, Maximize2, Frame, Grid3x3, Crosshair, Minus, Plus, Play, CornerUpLeft } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";
import { SceneSVG } from "../canvas/SceneSVG";

export type Tool = "select" | "pan" | "zoom" | "fit" | "frame";

interface ViewportProps {
  scene: GeneratedScene;
  recipe: JantraRecipe;
  growth: number;
  isGrowing: boolean;
  onReplayGrowth: () => void;
  hiddenLayers: Set<string>;
  showFrame: boolean;
  onToggleFrame: () => void;
}

const TOOLS: Array<{ id: Tool; icon: React.ElementType; label: string; key: string }> = [
  { id: "select", icon: MousePointer2, label: "Select", key: "V" },
  { id: "pan", icon: Hand, label: "Pan", key: "H" },
  { id: "zoom", icon: ZoomIn, label: "Zoom", key: "Z" },
  { id: "fit", icon: Maximize2, label: "Fit to screen", key: "F" },
  { id: "frame", icon: Frame, label: "Frame guides", key: "R" },
];

export const Viewport: React.FC<ViewportProps> = ({
  scene,
  recipe,
  growth,
  isGrowing,
  onReplayGrowth,
  hiddenLayers,
  showFrame,
  onToggleFrame,
}) => {
  const [tool, setTool] = useState<Tool>("select");
  const [zoom, setZoom] = useState(0.78);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);

  const reset = useCallback(() => {
    setZoom(0.78);
    setPan({ x: 0, y: 0 });
  }, []);

  const nudgeZoom = useCallback((factor: number) => {
    setZoom((z) => Math.min(6, Math.max(0.1, z * factor)));
  }, []);

  const pickTool = useCallback(
    (id: Tool) => {
      if (id === "fit") {
        reset();
        return;
      }
      if (id === "frame") {
        onToggleFrame();
        return;
      }
      setTool(id);
    },
    [reset, onToggleFrame]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") spaceDown.current = true;
      const map: Record<string, Tool> = { v: "select", h: "pan", z: "zoom", f: "fit", r: "frame" };
      const t = map[e.key.toLowerCase()];
      if (t && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        pickTool(t);
      }
      if (e.key === "0" && !e.metaKey && !e.ctrlKey) reset();
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowGrid((val) => !val);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [pickTool, reset]);

  const onMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".no-pan")) return;
    if (tool === "zoom") {
      nudgeZoom(e.shiftKey ? 1 / 1.3 : 1.3);
      return;
    }
    if (tool === "pan" || spaceDown.current || e.button === 1) {
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    setZoom((prev) => {
      const next = Math.min(6, Math.max(0.1, prev * factor));
      const ratio = next / prev;
      setPan((p) => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
      return next;
    });
  };

  const cursor = dragging ? "grabbing" : tool === "pan" ? "grab" : tool === "zoom" ? "zoom-in" : "default";

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 overflow-hidden bg-[#09090b] select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onWheel={onWheel}
      style={{ cursor }}
    >
      {/* Technical grid backdrop */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.55]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(113,113,122,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(113,113,122,0.09) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 42%, rgba(245,158,11,0.05), transparent 62%)" }}
      />

      {/* Artwork */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: dragging ? "none" : "transform 140ms cubic-bezier(.22,.61,.36,1)",
          }}
        >
          <div className="relative">
            {showFrame && (
              <div className="absolute -inset-6 border border-dashed border-cyan-500/25 rounded-sm pointer-events-none" />
            )}
            <SceneSVG
              scene={scene}
              width={720}
              height={720}
              growth={growth}
              hiddenLayers={hiddenLayers}
              glow={false}
              className="drop-shadow-[0_0_60px_rgba(245,158,11,0.07)]"
            />
          </div>
        </div>
      </div>

      {/* Floating tool palette */}
      <div className="no-pan absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 p-1 rounded-xl border border-zinc-800/90 bg-[#0b0b0e]/95 backdrop-blur-sm shadow-xl">
        {TOOLS.map(({ id, icon: Icon, label, key }) => {
          const isActive = id === tool || (id === "frame" && showFrame);
          return (
            <button
              key={id}
              type="button"
              onClick={() => pickTool(id)}
              title={`${label} (${key})`}
              className={`w-9 h-9 grid place-items-center rounded-lg transition-colors ${
                isActive ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
            </button>
          );
        })}
        <div className="h-px mx-1.5 my-0.5 bg-zinc-800" />
        <button
          type="button"
          onClick={() => setShowGrid((v) => !v)}
          title="Toggle grid (G)"
          className={`w-9 h-9 grid place-items-center rounded-lg transition-colors ${
            showGrid ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80"
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReplayGrowth}
          title="Replay growth animation"
          className={`w-9 h-9 grid place-items-center rounded-lg transition-colors ${
            isGrowing ? "bg-amber-500/20 text-amber-300" : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80"
          }`}
        >
          <Play className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom-left zoom controls — a vertical stack */}
      <div className="no-pan absolute left-4 bottom-4 flex flex-col items-center gap-0.5 p-1 rounded-xl border border-zinc-800/90 bg-[#0b0b0e]/95 backdrop-blur-sm shadow-xl">
        <button
          type="button"
          onClick={() => nudgeZoom(1.2)}
          title="Zoom in"
          className="w-8 h-8 grid place-items-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => nudgeZoom(1 / 1.2)}
          title="Zoom out"
          className="w-8 h-8 grid place-items-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/80 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="py-1 font-mono text-[11px] text-zinc-200 tabular-nums leading-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={reset}
          title="Reset view (0)"
          className="w-8 h-8 grid place-items-center rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/80 transition-colors"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom-right geometry counter */}
      <div className="no-pan absolute right-4 bottom-4 px-3 py-1.5 rounded-xl border border-zinc-800/90 bg-[#0b0b0e]/95 backdrop-blur-sm shadow-xl">
        <p className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-zinc-200">{scene.totalPaths.toLocaleString()}</span> paths
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-200">{scene.totalVertices.toLocaleString()}</span> nodes
        </p>
      </div>

      {/* Top-left readout */}
      <div className="no-pan absolute left-4 top-4 flex items-center gap-2 font-mono text-[10.5px] text-zinc-600">
        <Crosshair className="w-3 h-3 text-cyan-500/70" />
        <span className="text-zinc-500">{recipe.grammar.family}</span>
        <span className="text-zinc-800">·</span>
        <span>seed {String(recipe.seed)}</span>
        <span className="text-zinc-800">·</span>
        <span>{recipe.canvas.width}×{recipe.canvas.height}</span>
      </div>
    </div>
  );
};
