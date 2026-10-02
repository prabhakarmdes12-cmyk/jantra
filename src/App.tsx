import { useMemo, useState, useEffect } from "react";
import { useRecipe } from "./hooks/useRecipe";
import { usePanZoom } from "./hooks/usePanZoom";
import { useGrowthAnimation } from "./hooks/useGrowthAnimation";
import { generateScene } from "./engine/generator";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Canvas } from "./components/canvas/Canvas";
import { GrowthOverlay } from "./components/canvas/GrowthOverlay";
import { ControlsOverlay } from "./components/canvas/ControlsOverlay";
import { IntentBar } from "./components/intent/IntentBar";
import { Inspector } from "./components/inspector/Inspector";
import { ExportModal } from "./components/export/ExportModal";
import { PresetsModal } from "./components/inspector/PresetsModal";
import { AboutModal } from "./components/common/AboutModal";
import { KeyboardShortcutsModal } from "./components/common/KeyboardShortcutsModal";

export function App() {
  const {
    recipe,
    undo,
    redo,
    canUndo,
    canRedo,
    updateSeed,
    randomizeSeed,
    updateSymmetry,
    updateRings,
    updateRecursion,
    updateDensity,
    updatePrana,
    updateLine,
    updateMotifs,
    updatePalette,
    updateCanvas,
    loadRecipe,
    resetToDefault,
  } = useRecipe();

  const {
    zoom,
    pan,
    isDragging,
    showGrid,
    showGuides,
    containerRef,
    handlers,
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    toggleGrid,
    toggleGuides,
  } = usePanZoom();

  const {
    progress: growthProgress,
    isPlaying: isGrowthPlaying,
    speed: growthSpeed,
    prefersReducedMotion,
    play: playGrowth,
    pause: pauseGrowth,
    replay: replayGrowth,
    skipToEnd: skipGrowthToEnd,
    scrub: scrubGrowth,
    setSpeed: setGrowthSpeed,
  } = useGrowthAnimation(recipe.seed);

  // Modals state
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync guide lines state with panZoom toggle
  useEffect(() => {
    if (recipe.parameters.rings.showGuideLines !== showGuides) {
      updateRings({ showGuideLines: showGuides });
    }
  }, [showGuides, recipe.parameters.rings.showGuideLines, updateRings]);

  // Procedurally generate the SVG scene
  const scene = useMemo(() => {
    return generateScene(recipe);
  }, [recipe]);

  // Global hotkeys (R: randomize, G: toggle grid, F: fit)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "r" || e.key === "R") {
        randomizeSeed();
      } else if (e.key === "g" || e.key === "G") {
        toggleGrid();
      } else if (e.key === "f" || e.key === "F") {
        fitToScreen();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [randomizeSeed, toggleGrid, fitToScreen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#09090b] text-zinc-100 font-sans">
      {/* Top Header */}
      <Header
        recipe={recipe}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onRandomizeSeed={randomizeSeed}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((open) => !open)}
      />

      {/* Main Studio Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* SVG Canvas Artboard */}
        <Canvas
          scene={scene}
          zoom={zoom}
          pan={pan}
          isDragging={isDragging}
          showGrid={showGrid}
          growthProgress={growthProgress}
          glowEffect={recipe.canvas.glowEffect}
          handlers={handlers}
          containerRef={containerRef}
        />

        {/* Growth Animation Timeline Overlay (Top-Center) */}
        <GrowthOverlay
          progress={growthProgress}
          isPlaying={isGrowthPlaying}
          speed={growthSpeed}
          prefersReducedMotion={prefersReducedMotion}
          onPlay={playGrowth}
          onPause={pauseGrowth}
          onReplay={replayGrowth}
          onSkipToEnd={skipGrowthToEnd}
          onScrub={scrubGrowth}
          onSpeedChange={setGrowthSpeed}
        />

        {/* Viewport Pan/Zoom Controls Overlay (Bottom-Left) */}
        <ControlsOverlay
          zoom={zoom}
          showGrid={showGrid}
          showGuides={showGuides}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitToScreen={fitToScreen}
          onResetView={resetView}
          onToggleGrid={toggleGrid}
          onToggleGuides={toggleGuides}
        />

        {/* Natural Language Intent Bar (Bottom-Center) */}
        <div className="absolute bottom-4 left-0 right-0 z-20 pointer-events-auto">
          <IntentBar
            currentRecipe={recipe}
            onApplyRecipe={loadRecipe}
          />
        </div>

        {/* Visual Grammar Inspector (Floating Right Sidebar) */}
        <Inspector
          recipe={recipe}
          isOpen={isInspectorOpen}
          onToggleOpen={() => setIsInspectorOpen((open) => !open)}
          onUpdateSeed={updateSeed}
          onRandomizeSeed={randomizeSeed}
          onUpdateSymmetry={updateSymmetry}
          onUpdateRings={updateRings}
          onUpdateRecursion={updateRecursion}
          onUpdateDensity={updateDensity}
          onUpdatePrana={updatePrana}
          onUpdateLine={updateLine}
          onUpdateMotifs={updateMotifs}
          onUpdatePalette={updatePalette}
          onUpdateCanvas={updateCanvas}
          onResetToDefault={resetToDefault}
          onOpenPresets={() => setIsPresetsOpen(true)}
        />
      </main>

      {/* Bottom Status Bar */}
      <Footer scene={scene} recipe={recipe} />

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        recipe={recipe}
        scene={scene}
        onClose={() => setIsExportOpen(false)}
        onImportRecipe={loadRecipe}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        activeSeed={recipe.seed}
        onSelectPreset={loadRecipe}
        onClose={() => setIsPresetsOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
