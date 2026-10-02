import { useState, useCallback, useEffect, useRef } from "react";
import { JantraRecipe } from "../types/recipe";
import { defaultRecipe } from "../presets/defaultPresets";
import { encodeRecipeToUrlHash, decodeRecipeFromUrlHash } from "../utils/url";
import { computeRecipeChecksum } from "../utils/checksum";

const MAX_HISTORY = 40;

export function useRecipe() {
  // Initialize from URL hash or default
  const [recipe, setRecipeState] = useState<JantraRecipe>(() => {
    if (typeof window !== "undefined") {
      const decoded = decodeRecipeFromUrlHash(window.location.hash);
      if (decoded) return decoded;
    }
    return defaultRecipe;
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<JantraRecipe[]>([recipe]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);

  // Sync to URL hash when recipe changes
  useEffect(() => {
    const hash = encodeRecipeToUrlHash(recipe);
    if (hash && typeof window !== "undefined") {
      window.history.replaceState(null, "", hash);
    }
  }, [recipe]);

  // Set new recipe with history recording
  const setRecipe = useCallback((newRecipeOrFn: JantraRecipe | ((prev: JantraRecipe) => JantraRecipe)) => {
    setRecipeState((prev) => {
      const next = typeof newRecipeOrFn === "function" ? newRecipeOrFn(prev) : newRecipeOrFn;
      
      // Compute checksum
      next.checksum = computeRecipeChecksum(next.parameters);

      if (!isUndoRedoAction.current) {
        setHistory((prevHist) => {
          const truncated = prevHist.slice(0, historyIndex + 1);
          const updated = [...truncated, next];
          if (updated.length > MAX_HISTORY) {
            return updated.slice(updated.length - MAX_HISTORY);
          }
          return updated;
        });
        setHistoryIndex((prevIdx) => Math.min(MAX_HISTORY - 1, prevIdx + 1));
      }

      return next;
    });
  }, [historyIndex]);

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevRecipe = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      setRecipeState(prevRecipe);
      setTimeout(() => {
        isUndoRedoAction.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextRecipe = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      setRecipeState(nextRecipe);
      setTimeout(() => {
        isUndoRedoAction.current = false;
      }, 0);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Parameter Updaters
  const updateSeed = useCallback((newSeed: string | number) => {
    setRecipe((prev) => ({
      ...prev,
      seed: newSeed,
      provenance: {
        ...prev.provenance,
        createdAt: new Date().toISOString(),
      },
    }));
  }, [setRecipe]);

  const randomizeSeed = useCallback(() => {
    const randomSeedVal = Math.floor(Math.random() * 90000 + 10000).toString();
    updateSeed(randomSeedVal);
  }, [updateSeed]);

  const updateSymmetry = useCallback((symmetry: Partial<JantraRecipe["parameters"]["symmetry"]>) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        symmetry: {
          ...prev.parameters.symmetry,
          ...symmetry,
        },
      },
    }));
  }, [setRecipe]);

  const updateRings = useCallback((rings: Partial<JantraRecipe["parameters"]["rings"]>) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        rings: {
          ...prev.parameters.rings,
          ...rings,
        },
      },
    }));
  }, [setRecipe]);

  const updateRecursion = useCallback((recursion: Partial<JantraRecipe["parameters"]["recursion"]>) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        recursion: {
          ...prev.parameters.recursion,
          ...recursion,
        },
      },
    }));
  }, [setRecipe]);

  const updateDensity = useCallback((density: number) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        density,
      },
    }));
  }, [setRecipe]);

  const updatePrana = useCallback((prana: number) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        prana,
      },
    }));
  }, [setRecipe]);

  const updateLine = useCallback((line: Partial<JantraRecipe["parameters"]["line"]>) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        line: {
          ...prev.parameters.line,
          ...line,
        },
      },
    }));
  }, [setRecipe]);

  const updateMotifs = useCallback((motifs: Partial<JantraRecipe["parameters"]["motifs"]>) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        motifs: {
          ...prev.parameters.motifs,
          ...motifs,
        },
      },
    }));
  }, [setRecipe]);

  const updatePalette = useCallback((palette: Partial<JantraRecipe["parameters"]["palette"]>) => {
    setRecipe((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        palette: {
          ...prev.parameters.palette,
          ...palette,
        },
      },
    }));
  }, [setRecipe]);

  const updateCanvas = useCallback((canvas: Partial<JantraRecipe["canvas"]>) => {
    setRecipe((prev) => ({
      ...prev,
      canvas: {
        ...prev.canvas,
        ...canvas,
      },
    }));
  }, [setRecipe]);

  const loadRecipe = useCallback((newRecipe: JantraRecipe) => {
    setRecipe(newRecipe);
  }, [setRecipe]);

  const resetToDefault = useCallback(() => {
    setRecipe(defaultRecipe);
  }, [setRecipe]);

  // Keyboard shortcut listener (Cmd+Z / Ctrl+Z / Cmd+Shift+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept when typing in inputs
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (!isMac && modKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    recipe,
    setRecipe,
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex,
    historyLength: history.length,
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
  };
}
