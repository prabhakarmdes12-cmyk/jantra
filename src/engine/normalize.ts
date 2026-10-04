import { DetailFlags, GrammarFamily, JantraRecipe, PrimaryMotif } from "../types/recipe";
import { normalizePrana } from "./context";

const clamp100 = (v: number): number => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 50));

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
  return deriveDetail(defaultDetailLevelFor(family), family);
}

/**
 * Where each family's DETAIL LEVEL dial sits out of the box. These are the
 * positions that reproduce each grammar's intended default plate.
 */
export function defaultDetailLevelFor(family: GrammarFamily): number {
  switch (family) {
    case "minimal":
      return 34;
    case "ornamental":
      return 88;
    case "organic":
      return 56;
    case "temple":
      return 58;
    case "yantra":
      return 62;
    case "lotus":
      return 64;
    default:
      return 68;
  }
}

/**
 * The level at which each ornamental stratum switches on, per family. A
 * minimal plate earns its veins early and its construction grid late; an
 * ornamental plate wants everything on almost immediately.
 */
type Thresholds = { construction: number; stipple: number; ribbing: number; nodes: number; lattice: number };

const DETAIL_THRESHOLDS: Record<GrammarFamily, Thresholds> = {
  lotus: { construction: 12, stipple: 28, ribbing: 40, nodes: 56, lattice: 78 },
  temple: { construction: 10, stipple: 26, ribbing: 44, nodes: 50, lattice: 88 },
  mandala: { construction: 12, stipple: 22, ribbing: 38, nodes: 54, lattice: 80 },
  yantra: { construction: 10, stipple: 26, ribbing: 42, nodes: 52, lattice: 84 },
  organic: { construction: 72, stipple: 26, ribbing: 30, nodes: 42, lattice: 101 },
  ornamental: { construction: 8, stipple: 16, ribbing: 24, nodes: 34, lattice: 46 },
  minimal: { construction: 70, stipple: 85, ribbing: 20, nodes: 30, lattice: 101 },
  experimental: { construction: 14, stipple: 24, ribbing: 36, nodes: 50, lattice: 72 },
};

/** Turn the single 0 - 100 dial into concrete layer switches. */
export function deriveDetail(level: number, family: GrammarFamily): DetailFlags {
  const v = Math.max(0, Math.min(100, Number.isFinite(level) ? level : 60));
  const t = DETAIL_THRESHOLDS[family] ?? DETAIL_THRESHOLDS.lotus;
  return {
    construction: v >= t.construction,
    stipple: v >= t.stipple,
    ribbing: v >= t.ribbing,
    nodes: v >= t.nodes,
    lattice: v >= t.lattice,
    ribCount: Math.max(3, Math.min(7, 3 + Math.round(v / 25))),
  };
}

/** Effective flags: the dial, with any sparse per-layer overrides on top. */
export function effectiveDetail(recipe: JantraRecipe): DetailFlags {
  const family = inferFamily(recipe);
  const level = recipe.parameters.detailLevel ?? defaultDetailLevelFor(family);
  return { ...deriveDetail(level, family), ...(recipe.parameters.detail ?? {}) };
}

/**
 * Legacy recipes carry a full DetailFlags object and no dial. Recover the
 * dial position that best explains those flags so the slider stays live.
 */
function inferDetailLevel(flags: Partial<DetailFlags>, family: GrammarFamily): number {
  let best = defaultDetailLevelFor(family);
  let bestScore = -1;
  for (let v = 0; v <= 100; v += 2) {
    const derived = deriveDetail(v, family);
    let score = 0;
    for (const key of ["construction", "stipple", "ribbing", "nodes", "lattice"] as const) {
      if (flags[key] === undefined || flags[key] === derived[key]) score++;
    }
    if (flags.ribCount !== undefined && flags.ribCount === derived.ribCount) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }
  return best;
}

/**
 * Bring any recipe — v1.0 or v1.1, hand-written or URL-decoded — up to the
 * shape the current engine expects. Pure: never mutates the input.
 */
export function normalizeRecipe(input: JantraRecipe): JantraRecipe {
  const family = inferFamily(input);
  const p = input.parameters;

  // Resolve the detail dial, then keep only the overrides that genuinely
  // disagree with it. Presets keep their look and the slider stays useful.
  const detailLevel =
    p.detailLevel ?? (p.detail ? inferDetailLevel(p.detail, family) : defaultDetailLevelFor(family));
  const derived = deriveDetail(detailLevel, family);
  const detail: Partial<DetailFlags> = {};
  for (const [key, value] of Object.entries(p.detail ?? {}) as Array<[keyof DetailFlags, never]>) {
    if (value !== undefined && value !== derived[key]) detail[key] = value;
  }

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
      detailLevel,
      detail,
      evolution: {
        strength: clamp100(p.evolution?.strength ?? 50),
        mutation: p.evolution?.mutation ?? "structured",
      },
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
