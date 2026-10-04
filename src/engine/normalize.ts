import { DetailFlags, GrammarFamily, JantraRecipe, PrimaryMotif } from "../types/recipe";
import { normalizePrana, DEFAULT_DETAIL } from "./context";

export const ENGINE_VERSION = "0.1.8";
export const SCHEMA_VERSION = "1.1" as const;

/** Guess a grammar family for legacy recipes that predate the 8 families. */
export function inferFamily(recipe: JantraRecipe): GrammarFamily {
  const declared = (recipe.grammar as { family?: string })?.family;
  if (declared && isFamily(declared)) return declared;

  const primary: PrimaryMotif = recipe.parameters?.motifs?.primary ?? "lotus_lobe";
  const density = recipe.parameters?.density ?? 0.35;
  const rings = recipe.parameters?.rings?.count ?? 5;

  if (primary === "sri_yantra" || primary === "triangle" || primary === "star") return "yantra";
  if (primary === "kolam_knot") return "ornamental";
  if (primary === "chevron" || primary === "diamond") return "temple";
  if (density <= 0.18 && rings <= 3) return "minimal";
  if (density >= 0.7 || rings >= 9) return "ornamental";
  if (primary.startsWith("lotus") || primary === "petal") return "lotus";
  return "lotus";
}

function isFamily(v: string): v is GrammarFamily {
  return [
    "lotus",
    "temple",
    "mandala",
    "yantra",
    "organic",
    "ornamental",
    "minimal",
    "experimental",
  ].includes(v);
}

/** Detail defaults tuned per family. */
export function defaultDetailFor(family: GrammarFamily): DetailFlags {
  switch (family) {
    case "minimal":
      return { ribbing: true, ribCount: 3, stipple: false, nodes: true, construction: false, lattice: false };
    case "ornamental":
      return { ribbing: true, ribCount: 7, stipple: true, nodes: true, construction: true, lattice: true };
    case "temple":
      return { ribbing: true, ribCount: 3, stipple: true, nodes: true, construction: true, lattice: false };
    case "organic":
      return { ribbing: true, ribCount: 5, stipple: true, nodes: true, construction: false, lattice: false };
    case "yantra":
      return { ribbing: true, ribCount: 5, stipple: true, nodes: true, construction: true, lattice: false };
    case "mandala":
      return { ribbing: true, ribCount: 6, stipple: true, nodes: true, construction: true, lattice: false };
    case "experimental":
      return { ribbing: true, ribCount: 5, stipple: true, nodes: true, construction: true, lattice: false };
    default:
      return { ...DEFAULT_DETAIL };
  }
}

/**
 * Bring any recipe — v1.0 or v1.1, hand-written or URL-decoded — up to the
 * shape the current engine expects. Pure: never mutates the input.
 */
export function normalizeRecipe(input: JantraRecipe): JantraRecipe {
  const family = inferFamily(input);
  const p = input.parameters;

  const detail: DetailFlags = {
    ...defaultDetailFor(family),
    ...(p.detail || {}),
  };

  return {
    ...input,
    schemaVersion: SCHEMA_VERSION,
    engineVersion: ENGINE_VERSION,
    grammar: {
      family,
      id: input.grammar?.id && input.grammar.id !== "geometric-radial" ? input.grammar.id : `jantra-${family}`,
      version: ENGINE_VERSION,
    },
    canvas: {
      width: input.canvas?.width || 1600,
      height: input.canvas?.height || 1600,
      background: input.canvas?.background ?? "#09090b",
      margin: input.canvas?.margin ?? 0.08,
      glowEffect: input.canvas?.glowEffect,
    },
    parameters: {
      ...p,
      symmetry: {
        mode: p.symmetry?.mode ?? "radial",
        segments: p.symmetry?.segments ?? 8,
        outerMultiplier: p.symmetry?.outerMultiplier ?? (p.symmetry?.mode === "hybrid" ? 2 : 1),
        asymmetry: p.symmetry?.asymmetry ?? 0,
      },
      prana: normalizePrana(p.prana),
      detail,
      palette: {
        ...p.palette,
        construction: p.palette?.construction ?? "#06b6d4",
        secondaryStroke: p.palette?.secondaryStroke ?? "#71717a",
      },
    },
    provenance: {
      ...input.provenance,
      lineageId: input.provenance?.lineageId ?? String(input.seed),
      generation: input.provenance?.generation ?? 0,
    },
  };
}
