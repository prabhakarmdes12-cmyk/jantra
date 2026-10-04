import React, { useState } from "react";
import { SlidersHorizontal, Layers as LayersIcon, Code2, Maximize2, Minimize2 } from "lucide-react";
import { GeneratedScene } from "../../types/geometry";
import { JantraRecipe } from "../../types/recipe";
import { ParametersPanel } from "./ParametersPanel";
import { InspectTabs } from "./InspectTabs";
import { useRecipe } from "../../hooks/useRecipe";

type Controls = ReturnType<typeof useRecipe>;
export type RailTab = "parameters" | "layers" | "code";

interface RightRailProps {
  recipe: JantraRecipe;
  scene: GeneratedScene;
  controls: Controls;
  hiddenLayers: Set<string>;
  onToggleLayer: (id: string) => void;
  /** Inspect mode widens the rail and unlocks the deep technical tables. */
  inspect: boolean;
  onToggleInspect: () => void;
}

const TABS: Array<{ id: RailTab; label: string; icon: React.ElementType }> = [
  { id: "parameters", label: "Parameters", icon: SlidersHorizontal },
  { id: "layers", label: "Layers", icon: LayersIcon },
  { id: "code", label: "Code", icon: Code2 },
];

export const RightRail: React.FC<RightRailProps> = ({
  recipe,
  scene,
  controls,
  hiddenLayers,
  onToggleLayer,
  inspect,
  onToggleInspect,
}) => {
  const [tab, setTab] = useState<RailTab>("parameters");

  return (
    <aside
      className={`shrink-0 flex flex-col min-h-0 border-l border-zinc-800/70 bg-[#0a0a0c] transition-[width] duration-200 ${
        inspect ? "w-[440px]" : "w-[352px]"
      }`}
    >
      <div className="shrink-0 flex items-center gap-1 px-3 pt-2.5 border-b border-zinc-800/70">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative inline-flex items-center gap-1.5 px-3 pb-2.5 pt-1 text-[12.5px] font-medium transition-colors ${
                active ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {id === "code" ? (
                <Code2 className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${active ? "text-amber-500" : ""}`} />
              )}
              {label}
              {active && <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-amber-500" />}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onToggleInspect}
          title={inspect ? "Collapse inspect panel" : "Expand into Inspect mode"}
          className={`ml-auto mb-1.5 w-7 h-7 grid place-items-center rounded-lg transition-colors ${
            inspect ? "bg-amber-500/15 text-amber-400" : "text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800"
          }`}
        >
          {inspect ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === "parameters" ? (
          <ParametersPanel recipe={recipe} controls={controls} />
        ) : (
          <InspectTabs
            scene={scene}
            recipe={recipe}
            hiddenLayers={hiddenLayers}
            onToggleLayer={onToggleLayer}
            only={tab}
            showAdvanced={inspect}
          />
        )}
      </div>
    </aside>
  );
};
