/**
 * DETERMINISTIC EVOLUTIONARY GENEALOGY
 * ======================================================================
 * "Evolve" is not a randomizer. It is a *genealogy engine*.
 *
 *   108            →  108-A … 108-F   (six named mutation operators)
 *   108-B          →  108-B-1 … -3    (three refinement operators)
 *   108-B-2        →  108-B-2-1 … -3  (and so on, forever)
 *
 * Every node's geometry is seeded by its own lineage address, so the whole
 * tree is reproducible from the root seed alone — share "108-B-2" and the
 * recipient gets byte-identical art.
 */

import { GrammarFamily, JantraRecipe, MutationMode } from "../types/recipe";
import { createPRNG, PRNG } from "./prng";
import { normalizeRecipe, defaultDetailLevelFor } from "./normalize";
import { clamp } from "./geom";

export interface MutationOperator {
  key: string;
  /** Suffix appended to the parent lineage id. */
  suffix: string;
  name: string;
  summary: string;
  apply: (recipe: JantraRecipe, prng: PRNG) => JantraRecipe;
}

export interface EvolutionNode {
  lineageId: string;
  parentLineageId: string;
  generation: number;
  operator: MutationOperator;
  recipe: JantraRecipe;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function withParams(
  r: JantraRecipe,
  patch: Partial<JantraRecipe["parameters"]>,
  canvasPatch: Partial<JantraRecipe["canvas"]> = {}
): JantraRecipe {
  return {
    ...r,
    canvas: { ...r.canvas, ...canvasPatch },
    parameters: { ...r.parameters, ...patch },
  };
}

function setFamily(r: JantraRecipe, family: GrammarFamily): JantraRecipe {
  return {
    ...r,
    grammar: { family, id: `jantra-${family}`, version: r.grammar.version },
    parameters: {
      ...r.parameters,
      // Re-seat the detail dial on the incoming family's default position,
      // keeping the parent's deviation from its own default.
      detailLevel: clamp(
        (r.parameters.detailLevel ?? defaultDetailLevelFor(r.grammar.family)) -
          defaultDetailLevelFor(r.grammar.family) +
          defaultDetailLevelFor(family),
        0,
        100
      ),
      detail: r.parameters.detail,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Evolution strength — how far a child actually travels                */
/* ------------------------------------------------------------------ */

const lerpNum = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Discrete swaps only take effect once the child has travelled far enough. */
const DISCRETE_GATE = 0.25;
const FAMILY_GATE = 0.3;

/**
 * Every operator writes its *full stride*. Evolution Strength then decides how
 * much of that stride the child actually takes, by interpolating back toward
 * the parent. The direction of travel is untouched, so the tree stays exactly
 * as reproducible at strength 20 as it is at 100.
 */
function applyStrength(
  parent: JantraRecipe,
  child: JantraRecipe,
  strength: number,
  mode: MutationMode,
  prng: PRNG
): JantraRecipe {
  const base = clamp(strength, 0, 100) / 100;
  // Wild runs hot and overshoots; balanced adds a little seeded play.
  const t = mode === "wild" ? clamp(base * 1.25, 0, 1.25) : base;
  const jitter = mode === "structured" ? 0 : mode === "balanced" ? 0.12 : 0.3;
  const play = (span: number) => (jitter === 0 ? 0 : prng.range(-1, 1) * jitter * span);

  const pp = parent.parameters;
  const cp = child.parameters;

  const num = (a: number, b: number, span = Math.abs(b - a)) => lerpNum(a, b, t) + play(span);
  const int = (a: number, b: number, lo: number, hi: number) => clamp(Math.round(num(a, b)), lo, hi);

  const takeDiscrete = t >= DISCRETE_GATE;
  const takeFamily = t >= FAMILY_GATE;

  return {
    ...child,
    grammar: takeFamily ? child.grammar : parent.grammar,
    canvas: child.canvas,
    parameters: {
      ...cp,
      symmetry: {
        mode: takeDiscrete ? cp.symmetry.mode : pp.symmetry.mode,
        segments: int(pp.symmetry.segments, cp.symmetry.segments, 3, 36),
        outerMultiplier: int(pp.symmetry.outerMultiplier ?? 1, cp.symmetry.outerMultiplier ?? 1, 1, 3),
        asymmetry: clamp(num(pp.symmetry.asymmetry ?? 0, cp.symmetry.asymmetry ?? 0), 0, 30),
      },
      rings: {
        ...cp.rings,
        count: int(pp.rings.count, cp.rings.count, 1, 14),
        spacing: takeDiscrete ? cp.rings.spacing : pp.rings.spacing,
      },
      recursion: {
        depth: int(pp.recursion.depth, cp.recursion.depth, 1, 6),
        scale: clamp(num(pp.recursion.scale, cp.recursion.scale), 0.2, 0.95),
      },
      density: clamp(num(pp.density, cp.density, 0.3), 0.05, 1),
      prana: clamp(Math.round(num(pp.prana, cp.prana, 18)), 0, 100),
      detailLevel: clamp(Math.round(num(pp.detailLevel ?? 60, cp.detailLevel ?? 60, 16)), 0, 100),
      line: {
        ...cp.line,
        weight: clamp(num(pp.line.weight, cp.line.weight, 0.6), 0.3, 8),
        cap: takeDiscrete ? cp.line.cap : pp.line.cap,
      },
      motifs: {
        ...cp.motifs,
        primary: takeDiscrete ? cp.motifs.primary : pp.motifs.primary,
        bindu: {
          radius: clamp(Math.round(num(pp.motifs.bindu.radius, cp.motifs.bindu.radius, 4)), 2, 48),
          style: takeDiscrete ? cp.motifs.bindu.style : pp.motifs.bindu.style,
        },
        bhupura: {
          ...cp.motifs.bhupura,
          enabled: takeDiscrete ? cp.motifs.bhupura.enabled : pp.motifs.bhupura.enabled,
          steps: int(pp.motifs.bhupura.steps, cp.motifs.bhupura.steps, 1, 4),
          gates: int(pp.motifs.bhupura.gates, cp.motifs.bhupura.gates, 0, 4),
        },
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* Generation 1 — the six canonical descendants                        */
/* ------------------------------------------------------------------ */

export const GEN1_OPERATORS: MutationOperator[] = [
  {
    key: "intricate",
    suffix: "A",
    name: "More Intricate",
    summary: "+density · +recursion · finer registers",
    apply: (r, prng) => {
      const p = r.parameters;
      return withParams(r, {
        density: clamp(p.density + 0.26 + prng.range(0, 0.08), 0.1, 1),
        recursion: {
          depth: clamp(p.recursion.depth + 2, 0, 6),
          scale: clamp(p.recursion.scale + 0.06, 0.2, 0.92),
        },
        rings: { ...p.rings, count: clamp(p.rings.count + 3, 1, 12) },
        symmetry: { ...p.symmetry, segments: clamp(p.symmetry.segments + 4, 2, 32) },
        line: { ...p.line, weight: clamp(p.line.weight * 0.84, 0.4, 8) },
        detailLevel: clamp((p.detailLevel ?? defaultDetailLevelFor("lotus")) + 22, 0, 100),
      });
    },
  },
  {
    key: "temple",
    suffix: "B",
    name: "Temple Gates",
    summary: "architectural emphasis · stepped lintels",
    apply: (r, prng) => {
      const next = setFamily(r, "temple");
      const p = next.parameters;
      return withParams(next, {
        symmetry: { ...p.symmetry, mode: "grid", segments: clamp(roundEven(p.symmetry.segments), 4, 16) },
        rings: { ...p.rings, spacing: "linear", count: clamp(p.rings.count + 1, 3, 12) },
        recursion: { depth: clamp(p.recursion.depth + 1, 1, 6), scale: p.recursion.scale },
        density: clamp(p.density + 0.1 + prng.range(0, 0.05), 0.1, 1),
        line: { ...p.line, cap: "butt", weight: clamp(p.line.weight * 1.12, 0.5, 8) },
        motifs: {
          ...p.motifs,
          primary: "chevron",
          bhupura: { enabled: true, gates: 4, steps: 3, finials: true },
        },
      });
    },
  },
  {
    key: "organic",
    suffix: "C",
    name: "Organic Flow",
    summary: "+prana · softer Bézier curvature",
    apply: (r, prng) => {
      const next = setFamily(r, "organic");
      const p = next.parameters;
      return withParams(next, {
        prana: clamp(Math.max(62, p.prana + 36) + prng.range(0, 6), 0, 100),
        symmetry: { ...p.symmetry, mode: "radial", segments: clamp(p.symmetry.segments, 5, 14) },
        density: clamp(p.density + 0.08, 0.1, 1),
        line: { ...p.line, cap: "round", weight: clamp(p.line.weight * 1.05, 0.5, 8) },
        rings: { ...p.rings, spacing: "golden" },
      });
    },
  },
  {
    key: "minimal",
    suffix: "D",
    name: "Minimal",
    summary: "sparse · bold bindu · poster clarity",
    apply: (r) => {
      const next = setFamily(r, "minimal");
      const p = next.parameters;
      return withParams(next, {
        density: 0.1,
        prana: clamp(p.prana * 0.35, 0, 30),
        rings: { ...p.rings, count: 2, spacing: "harmonic" },
        recursion: { depth: 0, scale: p.recursion.scale },
        symmetry: { ...p.symmetry, segments: clamp(roundEven(p.symmetry.segments / 2), 3, 8), asymmetry: 0 },
        line: { ...p.line, weight: clamp(p.line.weight * 1.5, 1, 8) },
        motifs: {
          ...p.motifs,
          bindu: { radius: clamp(p.motifs.bindu.radius * 2.2, 10, 40), style: "radiant" },
          bhupura: { ...p.motifs.bhupura, enabled: false },
        },
      });
    },
  },
  {
    key: "ornamental",
    suffix: "E",
    name: "Dense Ornamental",
    summary: "+stipples · concentric micro-bands",
    apply: (r, prng) => {
      const next = setFamily(r, "ornamental");
      const p = next.parameters;
      return withParams(next, {
        density: clamp(p.density + 0.26 + prng.range(0, 0.06), 0.3, 0.78),
        rings: { ...p.rings, count: clamp(p.rings.count + 3, 6, 10) },
        symmetry: { ...p.symmetry, segments: clamp(p.symmetry.segments + 4, 8, 24), outerMultiplier: 2 },
        line: { ...p.line, weight: clamp(p.line.weight * 0.72, 0.4, 4) },
        detailLevel: clamp((p.detailLevel ?? defaultDetailLevelFor("ornamental")) + 18, 55, 100),
      });
    },
  },
  {
    key: "asymmetric",
    suffix: "F",
    name: "Asymmetric",
    summary: "hybrid symmetry · living rhythm",
    apply: (r, prng) => {
      const next = setFamily(r, "experimental");
      const p = next.parameters;
      return withParams(next, {
        symmetry: {
          mode: "hybrid",
          segments: clamp(p.symmetry.segments, 5, 12),
          outerMultiplier: prng.bool(0.5) ? 2 : 3,
          asymmetry: 6 + prng.range(0, 12),
        },
        prana: clamp(Math.max(48, p.prana + 22), 0, 100),
        density: clamp(p.density + 0.14, 0.1, 1),
        rings: { ...p.rings, spacing: prng.bool() ? "golden" : "exponential" },
      });
    },
  },
];

/* ------------------------------------------------------------------ */
/* Generation 2+ — three refinement operators                          */
/* ------------------------------------------------------------------ */

export const GENN_OPERATORS: MutationOperator[] = [
  {
    key: "intensify",
    suffix: "1",
    name: "Intensify",
    summary: "push the parent's idea harder",
    apply: (r, prng) => {
      const p = r.parameters;
      return withParams(r, {
        density: clamp(p.density * 1.3 + 0.05, 0.05, 1),
        recursion: { depth: clamp(p.recursion.depth + 1, 0, 6), scale: p.recursion.scale },
        rings: { ...p.rings, count: clamp(p.rings.count + 2, 1, 12) },
        symmetry: { ...p.symmetry, segments: clamp(p.symmetry.segments + 2, 2, 32) },
        line: { ...p.line, weight: clamp(p.line.weight * 0.9, 0.4, 8) },
        prana: clamp(p.prana + prng.range(2, 10), 0, 100),
      });
    },
  },
  {
    key: "counterpoint",
    suffix: "2",
    name: "Counterpoint",
    summary: "invert the rhythm, keep the skeleton",
    apply: (r, prng) => {
      const p = r.parameters;
      const spacings = ["linear", "harmonic", "exponential", "golden"] as const;
      const nextSpacing = spacings[(spacings.indexOf(p.rings.spacing) + 2) % spacings.length];
      return withParams(r, {
        rings: { ...p.rings, spacing: nextSpacing },
        density: clamp(1.05 - p.density, 0.08, 1),
        prana: clamp(100 - p.prana * 0.75, 0, 100),
        symmetry: {
          ...p.symmetry,
          segments: clamp(p.symmetry.segments % 2 === 0 ? p.symmetry.segments + 1 : p.symmetry.segments - 1, 3, 32),
        },
        motifs: {
          ...p.motifs,
          bindu: {
            radius: clamp(p.motifs.bindu.radius * (prng.bool() ? 1.7 : 0.6), 3, 40),
            style: p.motifs.bindu.style === "radiant" ? "triple_aura" : "radiant",
          },
        },
      });
    },
  },
  {
    key: "diverge",
    suffix: "3",
    name: "Diverge",
    summary: "cross the parent with a neighbouring grammar",
    apply: (r, prng) => {
      const order: GrammarFamily[] = [
        "lotus",
        "temple",
        "mandala",
        "yantra",
        "organic",
        "ornamental",
        "minimal",
        "experimental",
      ];
      const current = r.grammar.family as GrammarFamily;
      const idx = Math.max(0, order.indexOf(current));
      const next = order[(idx + (prng.bool() ? 3 : 5)) % order.length];
      const moved = setFamily(r, next);
      const p = moved.parameters;
      return withParams(moved, {
        symmetry: { ...p.symmetry, asymmetry: prng.range(0, 10) },
        density: clamp(p.density + prng.range(-0.12, 0.2), 0.06, 1),
        prana: clamp(p.prana + prng.range(-18, 24), 0, 100),
      });
    },
  },
];

function roundEven(n: number): number {
  return Math.max(2, Math.round(n / 2) * 2);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function lineageIdOf(recipe: JantraRecipe): string {
  return recipe.provenance?.lineageId || String(recipe.seed);
}

export function generationOf(lineageId: string): number {
  const parts = String(lineageId).split("-");
  return Math.max(0, parts.length - 1);
}

export function rootOf(lineageId: string): string {
  return String(lineageId).split("-")[0];
}

export function operatorsForGeneration(generation: number): MutationOperator[] {
  return generation === 0 ? GEN1_OPERATORS : GENN_OPERATORS;
}

/**
 * Deterministically spawn the descendants of a recipe.
 * Called twice with the same parent, it returns identical children.
 */
export function spawnDescendants(parent: JantraRecipe): EvolutionNode[] {
  const base = normalizeRecipe(parent);
  const parentLineage = lineageIdOf(base);
  const generation = generationOf(parentLineage);
  const operators = operatorsForGeneration(generation);

  return operators.map((op) => {
    const lineageId = `${parentLineage}-${op.suffix}`;
    // Seeded by the lineage address itself → reproducible forever.
    const prng = createPRNG(`jantra::evolve::${lineageId}::${op.key}`);
    const stride = op.apply(base, prng);
    const mutated = applyStrength(
      base,
      stride,
      base.parameters.evolution?.strength ?? 50,
      base.parameters.evolution?.mutation ?? "structured",
      prng
    );

    const child: JantraRecipe = normalizeRecipe({
      ...mutated,
      seed: lineageId,
      provenance: {
        ...base.provenance,
        aiInterpreted: false,
        parentSeed: String(base.seed),
        lineageId,
        generation: generation + 1,
        mutation: op.name,
        promptText: op.summary,
        createdAt: base.provenance.createdAt,
      },
    });

    return {
      lineageId,
      parentLineageId: parentLineage,
      generation: generation + 1,
      operator: op,
      recipe: child,
    };
  });
}

/** Rebuild the full ancestor chain of a lineage address. */
export function ancestryOf(lineageId: string): string[] {
  const parts = String(lineageId).split("-");
  const chain: string[] = [];
  for (let i = 1; i <= parts.length; i++) chain.push(parts.slice(0, i).join("-"));
  return chain;
}

/**
 * Resolve any lineage address back into its recipe by replaying the
 * deterministic mutation chain from a root recipe.
 */
export function resolveLineage(root: JantraRecipe, lineageId: string): JantraRecipe {
  const chain = ancestryOf(lineageId);
  let current = normalizeRecipe({
    ...root,
    seed: chain[0],
    provenance: { ...root.provenance, lineageId: chain[0], generation: 0 },
  });
  for (let i = 1; i < chain.length; i++) {
    const children = spawnDescendants(current);
    const match = children.find((c) => c.lineageId === chain[i]);
    if (!match) break;
    current = match.recipe;
  }
  return current;
}
