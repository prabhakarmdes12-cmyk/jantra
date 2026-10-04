import { useCallback, useMemo, useState } from "react";
import { GrammarFamily, JantraRecipe } from "./types/recipe";
import { generateScene } from "./engine/generator";
import { useRecipe } from "./hooks/useRecipe";
import { useGrowthAnimation } from "./hooks/useGrowthAnimation";
import { TopBar, StudioView } from "./components/layout/TopBar";
import { GrammarRail } from "./components/studio/GrammarRail";
import { Viewport } from "./components/studio/Viewport";
import { EvolutionGallery } from "./components/studio/EvolutionGallery";
import { ExportPanel } from "./components/studio/ExportPanel";
import { EvolveView } from "./components/studio/EvolveView";
import { LibraryView } from "./components/studio/LibraryView";
import { ExportView } from "./components/studio/ExportView";
import { RightRail } from "./components/inspector/RightRail";

export default function App() {
  const controls = useRecipe();
  const { recipe } = controls;

  const [view, setView] = useState<StudioView>("create");
  const [inspect, setInspect] = useState(false);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [showFrame, setShowFrame] = useState(false);
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
  const applyRecipe = useCallback(
    (next: JantraRecipe) => {
      controls.loadRecipe(next);
      setView("create");
    },
    [controls]
  );

  const saveToSketchbook = useCallback(() => {
    setSketchbook((prev) =>
      prev.some((r) => String(r.seed) === String(recipe.seed) && r.grammar.family === recipe.grammar.family)
        ? prev
        : [recipe, ...prev].slice(0, 60)
    );
  }, [recipe]);

  const removeFromSketchbook = useCallback((seed: string) => {
    setSketchbook((prev) => prev.filter((r) => String(r.seed) !== seed));
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-200 overflow-hidden antialiased">
      <TopBar
        recipe={recipe}
        view={view}
        onViewChange={setView}
        onSeedChange={controls.updateSeed}
        onGenerate={controls.randomizeSeed}
        onUndo={controls.undo}
        onRedo={controls.redo}
        canUndo={controls.canUndo}
        canRedo={controls.canRedo}
        sketchbookCount={sketchbook.length}
      />

      <div className="flex-1 min-h-0 flex">
        {view === "create" && (
          <GrammarRail
            active={recipe.grammar.family}
            recipe={recipe}
            onSelectFamily={selectFamily}
            onApplyRecipe={controls.loadRecipe}
            onOpenPresets={() => setView("sketchbook")}
          />
        )}

        <main className="flex-1 min-w-0 flex flex-col">
          {view === "create" && (
            <>
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
              <div className="shrink-0 flex border-t border-zinc-800/70">
                <EvolutionGallery
                  recipe={recipe}
                  onSelect={controls.loadRecipe}
                  onNewSeed={controls.randomizeSeed}
                  onSave={saveToSketchbook}
                  savedCount={sketchbook.length}
                />
                <div className="hidden xl:block shrink-0 w-[330px] border-l border-zinc-800/70 bg-[#0a0a0c]">
                  <ExportPanel scene={scene} recipe={recipe} />
                </div>
              </div>
            </>
          )}

          {view === "evolve" && <EvolveView recipe={recipe} onSelect={applyRecipe} />}
          {view === "sketchbook" && (
            <LibraryView
              current={recipe}
              sketchbook={sketchbook}
              onApply={applyRecipe}
              onRemove={removeFromSketchbook}
            />
          )}
          {view === "export" && <ExportView scene={scene} recipe={recipe} />}
        </main>

        {view === "create" && (
          <RightRail
            recipe={recipe}
            scene={scene}
            controls={controls}
            hiddenLayers={hiddenLayers}
            onToggleLayer={toggleLayer}
            inspect={inspect}
            onToggleInspect={() => setInspect((v) => !v)}
          />
        )}
      </div>
    </div>
  );
}
