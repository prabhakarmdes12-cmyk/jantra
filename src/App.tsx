import { useCallback, useMemo, useState } from "react";
import { GrammarFamily, JantraRecipe } from "./types/recipe";
import { generateScene } from "./engine/generator";
import { useRecipe } from "./hooks/useRecipe";
import { useGrowthAnimation } from "./hooks/useGrowthAnimation";
import { TopBar, StudioMode } from "./components/layout/TopBar";
import { GrammarRail } from "./components/studio/GrammarRail";
import { Viewport } from "./components/studio/Viewport";
import { EvolutionGallery } from "./components/studio/EvolutionGallery";
import { InspectorRail } from "./components/inspector/InspectorRail";
import { PresetLibrary } from "./components/studio/PresetLibrary";

export default function App() {
  const controls = useRecipe();
  const { recipe } = controls;

  const [mode, setMode] = useState<StudioMode>("create");
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [showFrame, setShowFrame] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [sketchbook, setSketchbook] = useState<JantraRecipe[]>([]);

  const growth = useGrowthAnimation(String(recipe.seed));

  const scene = useMemo(() => generateScene(recipe), [recipe]);

  const toggleLayer = useCallback((id: string) => {
    setHiddenLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectFamily = useCallback((family: GrammarFamily) => controls.setFamily(family), [controls]);

  const applyRecipe = useCallback((next: JantraRecipe) => controls.loadRecipe(next), [controls]);

  const saveToSketchbook = useCallback(() => {
    setSketchbook((prev) => (prev.some((r) => String(r.seed) === String(recipe.seed)) ? prev : [recipe, ...prev].slice(0, 24)));
  }, [recipe]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-200 overflow-hidden antialiased">
      <TopBar
        recipe={recipe}
        mode={mode}
        onModeChange={setMode}
        onSeedChange={controls.updateSeed}
        onRandomSeed={controls.randomizeSeed}
        onUndo={controls.undo}
        onRedo={controls.redo}
        canUndo={controls.canUndo}
        canRedo={controls.canRedo}
        onOpenPresets={() => setPresetsOpen(true)}
      />

      <div className="flex-1 min-h-0 flex">
        {mode === "create" && (
          <GrammarRail
            active={recipe.grammar.family}
            recipe={recipe}
            onSelectFamily={selectFamily}
            onApplyRecipe={applyRecipe}
            onOpenPresets={() => setPresetsOpen(true)}
          />
        )}

        <main className="flex-1 min-w-0 flex flex-col">
          <Viewport
            scene={scene}
            recipe={recipe}
            growth={growth.progress}
            isGrowing={growth.isPlaying}
            onReplayGrowth={growth.replay}
            hiddenLayers={hiddenLayers}
            showFrame={showFrame}
            onToggleFrame={() => setShowFrame((v) => !v)}
          />
          <EvolutionGallery
            recipe={recipe}
            onSelect={applyRecipe}
            onNewSeed={controls.randomizeSeed}
            onSave={saveToSketchbook}
            savedCount={sketchbook.length}
          />
        </main>

        <InspectorRail
          mode={mode}
          recipe={recipe}
          scene={scene}
          controls={controls}
          hiddenLayers={hiddenLayers}
          onToggleLayer={toggleLayer}
        />
      </div>

      {presetsOpen && (
        <PresetLibrary
          current={recipe}
          sketchbook={sketchbook}
          onClose={() => setPresetsOpen(false)}
          onApply={(r) => {
            applyRecipe(r);
            setPresetsOpen(false);
          }}
        />
      )}
    </div>
  );
}
