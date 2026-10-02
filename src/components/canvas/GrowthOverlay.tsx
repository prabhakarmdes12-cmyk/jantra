import React from "react";
import { Play, Pause, RotateCcw, FastForward, Sparkles } from "lucide-react";

interface GrowthOverlayProps {
  progress: number;
  isPlaying: boolean;
  speed: number;
  prefersReducedMotion: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onSkipToEnd: () => void;
  onScrub: (val: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export const GrowthOverlay: React.FC<GrowthOverlayProps> = ({
  progress,
  isPlaying,
  speed,
  prefersReducedMotion,
  onPlay,
  onPause,
  onReplay,
  onSkipToEnd,
  onScrub,
  onSpeedChange,
}) => {
  if (prefersReducedMotion) return null;

  const pct = Math.round(progress * 100);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-zinc-900/85 backdrop-blur-md px-3.5 py-2 rounded-full border border-zinc-800/90 shadow-xl shadow-black/40 text-zinc-200">
      <div className="flex items-center gap-1.5 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-[11px] font-semibold text-zinc-300 tracking-wide uppercase">Growth</span>
      </div>

      {/* Play / Pause Toggle */}
      <button
        type="button"
        onClick={isPlaying ? onPause : onPlay}
        className="p-1.5 rounded-full hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition-colors"
        title={isPlaying ? "Pause construction" : "Play progressive construction"}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-amber-400" />}
      </button>

      {/* Replay */}
      <button
        type="button"
        onClick={onReplay}
        className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        title="Replay growth from Bindu origin"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Progress Slider */}
      <div className="flex items-center gap-2 w-28 sm:w-36">
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={progress}
          onChange={(e) => onScrub(parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <span className="font-mono text-[10px] text-zinc-400 w-7 text-right">{pct}%</span>
      </div>

      {/* Speed Multiplier */}
      <div className="flex items-center gap-0.5 ml-1 bg-zinc-950 px-1 py-0.5 rounded-md border border-zinc-800">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
              speed === s
                ? "bg-amber-500 text-zinc-950 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Skip Button */}
      {progress < 0.99 && (
        <button
          type="button"
          onClick={onSkipToEnd}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors ml-0.5"
          title="Skip to final complete composition"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
