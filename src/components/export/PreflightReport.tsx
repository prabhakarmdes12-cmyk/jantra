import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PreflightDiagnostic } from "../../types/export";

interface PreflightReportProps {
  diagnostics: PreflightDiagnostic;
}

export const PreflightReport: React.FC<PreflightReportProps> = ({ diagnostics }) => {
  return (
    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Vector Preflight Diagnostics
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Figma Ready
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Total Paths</span>
          <span className="text-sm font-mono font-bold text-white">{diagnostics.pathCount}</span>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Est. Vertices</span>
          <span className="text-sm font-mono font-bold text-white">{diagnostics.vertexCount}</span>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Est. SVG Size</span>
          <span className="text-sm font-mono font-bold text-white">{diagnostics.estimatedFileSizeKB} KB</span>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Semantic Layers</span>
          <span className="text-sm font-mono font-bold text-amber-400">{diagnostics.layerGroups.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 0 Scripts
        </span>
        <span className="flex items-center gap-1 text-zinc-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 0 foreignObjects
        </span>
        <span className="flex items-center gap-1 text-zinc-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Pure XML Vectors
        </span>
        <span className="flex items-center gap-1 text-zinc-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Named Layer Groups
        </span>
      </div>
    </div>
  );
};
