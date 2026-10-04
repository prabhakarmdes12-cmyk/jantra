import { useState, useCallback, useEffect, useRef } from "react";
import { GrammarFamily, JantraRecipe } from "../types/recipe";
import { defaultRecipe } from "../presets/defaultPresets";
import { encodeRecipeToUrlHash, decodeRecipeFromUrlHash } from "../utils/url";
import { computeRecipeChecksum } from "../utils/checksum";
import { normalizeRecipe, defaultDetailLevelFor } from "../engine/normalize";
import { InkPalette } from "../presets/inkPalettes";

const MAX_HISTORY = 60;

export function useRecipe() {
  const [recipe, setRecipeState] = useState<JantraRecipe>(() => {
    if (typeof window !== "undefined") {
      const decoded = decodeRecipeFromUrlHash(window.location.hash);
      if (decoded) return normalizeRecipe(decoded);
    }
    return normalizeRecipe(defaultRecipe);
  });

  const [history, setHistory] = useState<JantraRecipe[]>([recipe]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);

  useEffect(() => {
    const hash = encodeRecipeToUrlHash(recipe);
    if (hash && typeof window !== "undefined") {
      window.history.replaceState(null, "", hash);
    }
  }, [recipe]);

  const setRecipe = useCallback(
    (newRecipeOrFn: JantraRecipe | ((prev: JantraRecipe) => JantraRecipe)) => {
      setRecipeState((prev) => {
        const raw = typeof newRecipeOrFn === "function" ? newRecipeOrFn(prev) : newRecipeOrFn;
        const next = normalizeRecipe(raw);
        next.checksum = computeRecipeChecksum(next.parameters);

        if (!isUndoRedoAction.current) {
          setHistory((prevHist) => {
            const truncated = prevHist.slice(0, historyIndex + 1);
            const updated = [...truncated, next];
            return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
          });
          setHistoryIndex((prevIdx) => Math.min(MAX_HISTORY - 1, prevIdx + 1));
        }

        return next;
      });
    },
    [historyIndex]
  );

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

  /* ---------------- parameter updaters ---------------- */

  const updateSeed = useCallback(
    (newSeed: string | number) => {
      setRecipe((prev) => ({
        ...prev,
        seed: newSeed,
        provenance: {
          ...prev.provenance,
          lineageId: String(newSeed),
          generation: String(newSeed).split("-").length - 1,
          parentSeed: undefined,
          createdAt: new Date().toISOString(),
        },
      }));
    },
    [setRecipe]
  );

  const randomizeSeed = useCallback(() => {
    updateSeed(Math.floor(Math.random() * 90000 + 10000).toString());
  }, [updateSeed]);

  const setFamily = useCallback(
    (family: GrammarFamily) => {
      setRecipe((prev) => ({
        ...prev,
        grammar: { family, id: `jantra-${family}`, version: prev.grammar.version },
        parameters: {
          ...prev.parameters,
          // Carry the user's deviation from the old family's default dial
          // position across to the new family's default.
          detailLevel: Math.max(
            0,
            Math.min(
              100,
              (prev.parameters.detailLevel ?? defaultDetailLevelFor(prev.grammar.family)) -
                defaultDetailLevelFor(prev.grammar.family) +
                defaultDetailLevelFor(family)
            )
          ),
        },
      }));
    },
    [setRecipe]
  );

  const patch = useCallback(
    <K extends keyof JantraRecipe["parameters"]>(key: K, value: Partial<JantraRecipe["parameters"][K]>) => {
      setRecipe((prev) => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [key]: typeof value === "object" && value !== null && !Array.isArray(value)
            ? { ...(prev.parameters[key] as object), ...(value as object) }
            : value,
        },
      }));
    },
    [setRecipe]
  );

  const updateSymmetry = useCallback(
    (v: Partial<JantraRecipe["parameters"]["symmetry"]>) => patch("symmetry", v),
    [patch]
  );
  const updateRings = useCallback((v: Partial<JantraRecipe["parameters"]["rings"]>) => patch("rings", v), [patch]);
  const updateRecursion = useCallback(
    (v: Partial<JantraRecipe["parameters"]["recursion"]>) => patch("recursion", v),
    [patch]
  );
  const updateLine = useCallback((v: Partial<JantraRecipe["parameters"]["line"]>) => patch("line", v), [patch]);
  const updateMotifs = useCallback((v: Partial<JantraRecipe["parameters"]["motifs"]>) => patch("motifs", v), [patch]);
  const updatePalette = useCallback(
    (v: Partial<JantraRecipe["parameters"]["palette"]>) => patch("palette", v),
    [patch]
  );
  const updateDetail = useCallback(
    (v: Partial<NonNullable<JantraRecipe["parameters"]["detail"]>>) => patch("detail", v),
    [patch]
  );
  const updateEvolution = useCallback(
    (v: Partial<NonNullable<JantraRecipe["parameters"]["evolution"]>>) => patch("evolution", v),
    [patch]
  );

  /** Moving the Detail Level dial clears the per-layer overrides it governs. */
  const updateDetailLevel = useCallback(
    (detailLevel: number) =>
      setRecipe((prev) => ({
        ...prev,
        parameters: { ...prev.parameters, detailLevel, detail: {} },
      })),
    [setRecipe]
  );

  /** Apply a complete four-ink colourway, and its plate background with it. */
  const applyInk = useCallback(
    (ink: InkPalette) =>
      setRecipe((prev) => ({
        ...prev,
        canvas: {
          ...prev.canvas,
          background: prev.canvas.background === "transparent" ? "transparent" : ink.background,
        },
        parameters: {
          ...prev.parameters,
          line: { ...prev.parameters.line, color: ink.stroke },
          palette: {
            ...prev.parameters.palette,
            stroke: ink.stroke,
            secondaryStroke: ink.secondaryStroke,
            accent: ink.accent,
            construction: ink.construction,
          },
        },
      })),
    [setRecipe]
  );

  const updateDensity = useCallback(
    (density: number) => setRecipe((p) => ({ ...p, parameters: { ...p.parameters, density } })),
    [setRecipe]
  );
  const updatePrana = useCallback(
    (prana: number) => setRecipe((p) => ({ ...p, parameters: { ...p.parameters, prana } })),
    [setRecipe]
  );

  const updateCanvas = useCallback(
    (canvas: Partial<JantraRecipe["canvas"]>) => setRecipe((p) => ({ ...p, canvas: { ...p.canvas, ...canvas } })),
    [setRecipe]
  );

  const loadRecipe = useCallback((newRecipe: JantraRecipe) => setRecipe(newRecipe), [setRecipe]);
  const resetToDefault = useCallback(() => setRecipe(defaultRecipe), [setRecipe]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
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
    setFamily,
    updateSymmetry,
    updateRings,
    updateRecursion,
    updateDensity,
    updatePrana,
    updateLine,
    updateMotifs,
    updatePalette,
    updateDetail,
    updateDetailLevel,
    updateEvolution,
    applyInk,
    updateCanvas,
    loadRecipe,
    resetToDefault,
  };
}
