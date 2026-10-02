import React from "react";
import { PrimaryMotif, SecondaryMotif, BinduStyle } from "../../types/recipe";
import { SegmentedControl } from "../common/SegmentedControl";
import { Slider } from "../common/Slider";

interface MotifsPanelProps {
  primary: PrimaryMotif;
  secondary: SecondaryMotif;
  binduRadius: number;
  binduStyle: BinduStyle;
  bhupuraEnabled: boolean;
  bhupuraSteps: number;
  bhupuraGates: number;
  bhupuraFinials?: boolean;
  onChangePrimary: (m: PrimaryMotif) => void;
  onChangeSecondary: (m: SecondaryMotif) => void;
  onChangeBinduRadius: (r: number) => void;
  onChangeBinduStyle: (s: BinduStyle) => void;
  onChangeBhupuraEnabled: (enabled: boolean) => void;
  onChangeBhupuraSteps: (steps: number) => void;
  onChangeBhupuraGates: (gates: number) => void;
  onChangeBhupuraFinials?: (finials: boolean) => void;
}

const PRIMARY_MOTIFS: { value: PrimaryMotif; label: string }[] = [
  { value: "sri_yantra", label: "Sri Yantra" },
  { value: "lotus_pointed", label: "Pointed Lotus" },
  { value: "lotus_double", label: "Double Lotus" },
  { value: "lotus_lobe", label: "Lotus Lobe" },
  { value: "kolam_knot", label: "Sikku Kolam" },
  { value: "triangle", label: "Trikona Tri" },
  { value: "star", label: "Star Polygon" },
  { value: "chevron", label: "Chevron Jali" },
  { value: "diamond", label: "Diamond" },
  { value: "petal", label: "Classic Petal" },
];

const SECONDARY_MOTIFS: { value: SecondaryMotif; label: string }[] = [
  { value: "dot", label: "Dot" },
  { value: "circle", label: "Circle" },
  { value: "flame", label: "Flame" },
  { value: "teardrop", label: "Drop" },
  { value: "triangle", label: "Tri" },
  { value: "cross", label: "Cross" },
  { value: "none", label: "None" },
];

const BINDU_STYLES: { value: BinduStyle; label: string }[] = [
  { value: "triple_aura", label: "3-Aura" },
  { value: "radiant", label: "Radiant" },
  { value: "solid", label: "Solid" },
  { value: "hollow", label: "Hollow" },
];

export const MotifsPanel: React.FC<MotifsPanelProps> = ({
  primary,
  secondary,
  binduRadius,
  binduStyle,
  bhupuraEnabled,
  bhupuraSteps,
  bhupuraGates: _bhupuraGates,
  bhupuraFinials = true,
  onChangePrimary,
  onChangeSecondary,
  onChangeBinduRadius,
  onChangeBinduStyle,
  onChangeBhupuraEnabled,
  onChangeBhupuraSteps,
  onChangeBhupuraGates: _onChangeBhupuraGates,
  onChangeBhupuraFinials,
}) => {
  return (
    <div className="space-y-4">
      {/* Primary Motif */}
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-300 font-medium block">
          Primary Visual Grammar Motif
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
          {PRIMARY_MOTIFS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChangePrimary(m.value)}
              className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-all text-center ${
                primary === m.value
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Accent Motif */}
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-300 font-medium block">
          Secondary Accents & Ornaments
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
          {SECONDARY_MOTIFS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChangeSecondary(m.value)}
              className={`py-1 px-1 rounded-md text-[10px] font-medium transition-all text-center ${
                secondary === m.value
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bindu Center Origin */}
      <div className="pt-3 border-t border-zinc-800/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-amber-300/90">Bindu (Sacred Center Origin)</span>
        </div>

        <SegmentedControl
          value={binduStyle}
          options={BINDU_STYLES}
          onChange={onChangeBinduStyle}
          size="sm"
        />

        <Slider
          label="Bindu Radius"
          value={binduRadius}
          min={2}
          max={40}
          step={1}
          onChange={onChangeBinduRadius}
          unit="px"
        />
      </div>

      {/* Bhupura Stepped Enclosure */}
      <div className="pt-3 border-t border-zinc-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-300/90">
            Bhupura (Sacred Stepped Temple Enclosure)
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={bhupuraEnabled}
              onChange={(e) => onChangeBhupuraEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950" />
          </label>
        </div>

        {bhupuraEnabled && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-200">
            <Slider
              label="Stepped Terraces (Triloka)"
              value={bhupuraSteps}
              min={1}
              max={3}
              step={1}
              onChange={onChangeBhupuraSteps}
              unit="tiers"
              description="Concentric stepped perimeter earth terraces."
            />

            {onChangeBhupuraFinials && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400">Kalasha Gate Finials</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bhupuraFinials}
                    onChange={(e) => onChangeBhupuraFinials(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-3.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-zinc-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950" />
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
