import React, { useState } from "react";
import { X, Download, Copy, Check, FileCode, Image, Link, Upload, Sparkles, AlertCircle, PlayCircle, Printer, Code } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { GeneratedScene } from "../../types/geometry";
import { serializeSceneToSVG, computePreflightDiagnostics } from "../../engine/serializer";
import { downloadTextFile, exportSceneToPNG, downloadBlob, copyToClipboard } from "../../utils/download";
import { PreflightReport } from "./PreflightReport";

interface ExportModalProps {
  isOpen: boolean;
  recipe: JantraRecipe;
  scene: GeneratedScene;
  onClose: () => void;
  onImportRecipe: (recipe: JantraRecipe) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  recipe,
  scene,
  onClose,
  onImportRecipe,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);

  if (!isOpen) return null;

  const svgFull = serializeSceneToSVG(scene, recipe, { minified: false, includeMetadata: true, animated: false });
  const svgAnimated = serializeSceneToSVG(scene, recipe, { minified: false, includeMetadata: true, animated: true });
  const svgPlotter = serializeSceneToSVG(scene, recipe, { minified: false, includeMetadata: true, plotterMode: true });
  const svgMinified = serializeSceneToSVG(scene, recipe, { minified: true, includeMetadata: false });
  const diagnostics = computePreflightDiagnostics(scene, svgFull);

  const handleCopy = async (type: "svg" | "json" | "url") => {
    let text = "";
    if (type === "svg") text = svgFull;
    else if (type === "json") text = JSON.stringify(recipe, null, 2);
    else if (type === "url") text = window.location.href;

    const success = await copyToClipboard(text);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleDownloadSVG = (mode: "standard" | "minified" | "animated" | "plotter" = "standard") => {
    let content = svgFull;
    let suffix = "";
    if (mode === "minified") {
      content = svgMinified;
      suffix = "-min";
    } else if (mode === "animated") {
      content = svgAnimated;
      suffix = "-animated";
    } else if (mode === "plotter") {
      content = svgPlotter;
      suffix = "-plotter-hairline";
    }

    const filename = `jantra-seed-${recipe.seed}${suffix}.svg`;
    downloadTextFile(content, filename, "image/svg+xml");
  };

  const handleDownloadJSON = () => {
    const content = JSON.stringify(recipe, null, 2);
    const filename = `jantra-recipe-${recipe.seed}.json`;
    downloadTextFile(content, filename, "application/json");
  };

  const handleDownloadPNG = async (scale: 1 | 2 | 4 | 5.12) => {
    try {
      setIsExportingPNG(true);
      const targetScale = scale === 5.12 ? 5.12 : (scale as 1 | 2 | 4);
      const blob = await exportSceneToPNG(
        svgFull,
        recipe.canvas.width,
        recipe.canvas.height,
        targetScale as (1 | 2 | 4),
        recipe.canvas.background
      );
      const sizeLabel = scale === 5.12 ? "8k" : `${scale}x`;
      const filename = `jantra-seed-${recipe.seed}@${sizeLabel}.png`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("PNG export error:", err);
      alert("Failed to export PNG. See console for details.");
    } finally {
      setIsExportingPNG(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && parsed.schemaVersion && parsed.parameters) {
          onImportRecipe(parsed as JantraRecipe);
          onClose();
        } else {
          setImportError("Invalid recipe format: Missing schemaVersion or parameters.");
        }
      } catch (err) {
        setImportError("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export & Studio Deliverables</h2>
              <p className="text-xs text-zinc-400">Layered SVGs, Animated SVGs, Pen Plotter / CNC mode, and High-Res PNGs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preflight Diagnostics */}
        <PreflightReport diagnostics={diagnostics} />

        {/* Primary Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SVG Options */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-white font-semibold text-xs">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Vector SVG Downloads
                </span>
                <button
                  type="button"
                  onClick={() => setShowCodePreview(!showCodePreview)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                >
                  <Code className="w-3 h-3" />
                  {showCodePreview ? "Hide XML" : "Inspect XML"}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Organized into semantic groups (`#jantra-petals`, `#jantra-rings`) ready for Figma, Illustrator, and Inkscape.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDownloadSVG("standard")}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/15"
              >
                <Download className="w-3.5 h-3.5" />
                Download Editable SVG (Figma Ready)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSVG("animated")}
                  className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/20 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  title="Self-animating progressive vector with CSS keyframes"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Animated SVG
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSVG("plotter")}
                  className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-sky-500/20 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  title="Single hairline stroke path optimization for AxiDraw, CNC & Laser Cutters"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Plotter / CNC
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDownloadSVG("minified")}
                  className="flex-1 py-1 px-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono transition-colors text-center"
                >
                  Minified Web
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy("svg")}
                  className="py-1 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono transition-colors flex items-center gap-1"
                >
                  {copiedType === "svg" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Code
                </button>
              </div>
            </div>
          </div>

          {/* PNG Raster Exports */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                <Image className="w-4 h-4 text-sky-400" />
                Raster PNG Renders
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Off-screen hardware-accelerated canvas renders up to 4x & 8K print quality.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isExportingPNG}
                onClick={() => handleDownloadPNG(1)}
                className="py-2.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
              >
                <span>1x PNG</span>
                <span className="text-[9px] font-mono text-zinc-400">1600×1600</span>
              </button>

              <button
                type="button"
                disabled={isExportingPNG}
                onClick={() => handleDownloadPNG(2)}
                className="py-2.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
              >
                <span>2x Retina</span>
                <span className="text-[9px] font-mono text-zinc-400">3200×3200</span>
              </button>

              <button
                type="button"
                disabled={isExportingPNG}
                onClick={() => handleDownloadPNG(4)}
                className="py-2.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-0.5"
              >
                <span>4x Ultra-Res</span>
                <span className="text-[9px] font-mono text-amber-400/80">6400×6400</span>
              </button>
            </div>
          </div>
        </div>

        {/* XML Code Preview Overlay */}
        {showCodePreview && (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-400">Raw SVG Vector Preview ({diagnostics.pathCount} paths)</span>
              <button
                type="button"
                onClick={() => handleCopy("svg")}
                className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy SVG Code
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-850 font-mono text-[10px] text-zinc-300 max-h-40 overflow-y-auto whitespace-pre leading-relaxed scrollbar-thin">
              {svgFull.slice(0, 3000)}...
            </pre>
          </div>
        )}

        {/* Recipe JSON & URL Sharing */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Portable Recipe & URL Sharing
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Recipe
            </button>

            <button
              type="button"
              onClick={() => handleCopy("json")}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copiedType === "json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Recipe JSON
            </button>

            <button
              type="button"
              onClick={() => handleCopy("url")}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copiedType === "url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
              Copy Shareable URL
            </button>

            <label className="py-1.5 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-700/60">
              <Upload className="w-3.5 h-3.5" />
              Import Recipe
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importError && (
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {importError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
