import React from "react";
import { LineCap, ColorTheme } from "../../types/recipe";
import { Slider } from "../common/Slider";
import { SegmentedControl } from "../common/SegmentedControl";
import { ColorPicker } from "../common/ColorPicker";
import { Sparkles } from "lucide-react";

interface StylePanelProps {
  weight: number;
  cap: LineCap;
  strokeColor: string;
  accentColor: string;
  backgroundColor: string;
  glowEffect?: boolean;
  onChangeWeight: (weight: number) => void;
  onChangeCap: (cap: LineCap) => void;
  onChangeStrokeColor: (color: string) => void;
  onChangeAccentColor: (color: string) => void;
  onChangeBackgroundColor: (color: string) => void;
  onChangeGlowEffect?: (glow: boolean) => void;
  onApplyTheme?: (theme: ColorTheme) => void;
}

const LINE_CAPS: { value: LineCap; label: string }[] = [
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
  { value: "butt", label: "Butt" },
];

const THEME_PALETTES = [
  { id: "saffron_gold", label: "Saffron Gold", stroke: "#fef3c7", accent: "#f59e0b", bg: "#09090b" },
  { id: "sacred_copper", label: "Sacred Copper", stroke: "#fed7aa", accent: "#ea580c", bg: "#0c0a09" },
  { id: "midnight_cyan", label: "Midnight Azure", stroke: "#e0f2fe", accent: "#38bdf8", bg: "#030712" },
  { id: "kumkum_ruby", label: "Kumkum Crimson", stroke: "#ffe4e6", accent: "#f43f5e", bg: "#0f0508" },
  { id: "temple_bronze", label: "Temple Bronze", stroke: "#fde68a", accent: "#b45309", bg: "#1c1917" },
  { id: "pure_silver", label: "Silver Ivory", stroke: "#f4f4f5", accent: "#a1a1aa", bg: "#09090b" },
];

export const StylePanel: React.FC<StylePanelProps> = ({
  weight,
  cap,
  strokeColor,
  accentColor,
  backgroundColor,
  glowEffect = false,
  onChangeWeight,
  onChangeCap,
  onChangeStrokeColor,
  onChangeAccentColor,
  onChangeBackgroundColor,
  onChangeGlowEffect,
}) => {
  return (
    <div className="space-y-4">
      {/* Theme Quick Palettes */}
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Harmonic Color Palettes
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
          {THEME_PALETTES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onChangeStrokeColor(t.stroke);
                onChangeAccentColor(t.accent);
                onChangeBackgroundColor(t.bg);
              }}
              className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 transition-all text-left flex flex-col gap-1"
            >
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full border border-zinc-700" style={{ backgroundColor: t.stroke }} />
                <div className="w-2.5 h-2.5 rounded-full border border-zinc-700" style={{ backgroundColor: t.accent }} />
              </div>
              <span className="text-[10px] text-zinc-300 font-medium truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Slider
        label="Vector Line Weight"
        value={weight}
        min={0.5}
        max={8.0}
        step={0.1}
        onChange={onChangeWeight}
        unit="px"
        description="Base stroke thickness for primary geometric outlines."
      />

      <SegmentedControl
        label="Line Cap Style"
        value={cap}
        options={LINE_CAPS}
        onChange={onChangeCap}
        size="sm"
      />

      {/* Glow Aura Filter Toggle */}
      {onChangeGlowEffect && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-zinc-300 font-medium">Sacred Line Aura Glow</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={glowEffect}
              onChange={(e) => onChangeGlowEffect(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-zinc-950" />
          </label>
        </div>
      )}

      <div className="pt-3 border-t border-zinc-800/60 space-y-3.5">
        <ColorPicker
          label="Primary Geometry Stroke"
          value={strokeColor}
          onChange={onChangeStrokeColor}
        />

        <ColorPicker
          label="Accent & Bindu Color"
          value={accentColor}
          onChange={onChangeAccentColor}
        />

        <ColorPicker
          label="Canvas Background"
          value={backgroundColor}
          onChange={onChangeBackgroundColor}
          allowTransparent={true}
        />
      </div>
    </div>
  );
};
