/**
 * PRANA — Computational Regularity ↔ Living Variation
 * ======================================================================
 * Prana is not jitter. Jitter is noise; prana is *controlled life inside a
 * deterministic system*.
 *
 * The field below is a sum of seeded harmonics evaluated continuously over
 * the composition's angular and radial domain. Because it is continuous and
 * periodic, neighbouring geometry breathes *together* — the way an inked
 * hand drifts across a page — instead of each vertex twitching independently.
 *
 * Five legible stages, mapped 0 → 100:
 *
 *   0    PURE GEOMETRY      Absolute mathematical precision. Rigid CAD
 *                           symmetry. Perfectly uniform line weights.
 *   20   MICRO-TENSION      Subtle alternating line weights across tiers
 *                           (1.0px · 1.4px · 0.8px), micro-tension in the
 *                           Bézier control points.
 *   50   RADIAL BREATHING   Petal height oscillates like a hand-drawn brush;
 *                           gentle radial curvature varies per axis.
 *   80   ORGANIC VITALITY   Strong living variation while strictly obeying
 *                           the grammar; line wobble, asymmetric breathing.
 *   100  EXPRESSIVE TENSION Structure pushed to its limit — barely holding
 *                           the composition together before chaos.
 */

import { hashSeed } from "./prng";
import { Point } from "../types/geometry";

const TWO_PI = Math.PI * 2;

export interface PranaStage {
  at: number;
  key: string;
  label: string;
  note: string;
}

export const PRANA_STAGES: PranaStage[] = [
  {
    at: 0,
    key: "pure",
    label: "Pure Geometry",
    note: "Absolute mathematical precision. Rigid CAD symmetry, perfectly uniform line weights.",
  },
  {
    at: 20,
    key: "micro",
    label: "Micro-Tension",
    note: "Alternating line weights across concentric tiers and micro-tension in the Bézier control points.",
  },
  {
    at: 50,
    key: "breathing",
    label: "Radial Breathing",
    note: "Petal height oscillates like hand-drawn brush ink; gentle radial curvature varies across symmetry axes.",
  },
  {
    at: 80,
    key: "vitality",
    label: "Organic Vitality",
    note: "Strong living variation while strictly maintaining the grammar rules; line wobble and asymmetric breathing.",
  },
  {
    at: 100,
    key: "tension",
    label: "Expressive Tension",
    note: "Structure is pushed to its limit, barely holding the composition together before chaos.",
  },
];

export function pranaStageFor(value: number): PranaStage {
  const v = clamp(value, 0, 100);
  let found = PRANA_STAGES[0];
  for (const stage of PRANA_STAGES) {
    if (v >= stage.at - 0.0001) found = stage;
  }
  // Nearest-stage labelling reads better than strict floor at the midpoints.
  let best = found;
  let bestDist = Infinity;
  for (const stage of PRANA_STAGES) {
    const d = Math.abs(stage.at - v);
    if (d < bestDist) {
      bestDist = d;
      best = stage;
    }
  }
  return best;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Smooth 0→1 ramp between `a` and `b`. */
function ramp(v: number, a: number, b: number): number {
  if (v <= a) return 0;
  if (v >= b) return 1;
  const t = (v - a) / (b - a);
  return t * t * (3 - 2 * t);
}

export interface PranaField {
  /** Raw slider value, 0 - 100. */
  value: number;
  /** Normalized 0 - 1. */
  t: number;
  stage: PranaStage;

  /** True when the field is in absolute-precision mode. */
  readonly isPure: boolean;

  /** Tier-aware stroke weight hierarchy. */
  weight(base: number, tier: number): number;
  /** Radial breathing multiplier around 1.0 for a point on a tier. */
  breathe(angle: number, tier: number, amount?: number): number;
  /** Bézier control-point tension multiplier around 1.0. */
  tension(angle: number, tier: number): number;
  /** Continuous positional wobble, in SVG units. */
  wobble(angle: number, radius: number, tier: number, scale?: number): Point;
  /** Applies wobble to an absolute cartesian point. */
  drift(x: number, y: number, tier: number, scale?: number): Point;
  /** Per-index opacity shimmer in [min, 1]. */
  shimmer(index: number, tier: number, min?: number): number;
  /** Controlled angular offset (radians) applied to a whole tier. */
  tierRotation(tier: number): number;
  /** A deterministic signed value in [-1, 1] for arbitrary discrete choices. */
  signal(a: number, b?: number): number;
}

interface Harmonic {
  k: number;
  amp: number;
  phase: number;
}

function buildHarmonics(seed: number, count: number, baseK: number): Harmonic[] {
  const out: Harmonic[] = [];
  let s = seed >>> 0;
  const nextUnit = () => {
    s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const k = baseK + i * (1 + (i % 2));
    out.push({
      k,
      amp: 1 / (i + 1.35),
      phase: nextUnit() * TWO_PI,
    });
  }
  const norm = out.reduce((acc, h) => acc + h.amp, 0);
  return out.map((h) => ({ ...h, amp: h.amp / norm }));
}

function evaluate(harmonics: Harmonic[], x: number): number {
  let sum = 0;
  for (const h of harmonics) sum += h.amp * Math.sin(h.k * x + h.phase);
  return sum;
}

/**
 * Build the prana field for a composition.
 * @param value  0 - 100 slider position
 * @param seed   composition seed — the field is fully reproducible from it
 */
export function createPranaField(value: number, seed: string | number): PranaField {
  const v = clamp(Number.isFinite(value) ? value : 0, 0, 100);
  const t = v / 100;
  const h = hashSeed(`prana::${seed}`);

  // Independent harmonic banks keep each channel decorrelated yet smooth.
  const breathBank = buildHarmonics(h, 3, 2);
  const tensionBank = buildHarmonics(h ^ 0x9e3779b9, 3, 3);
  const wobbleBankA = buildHarmonics(h ^ 0x85ebca6b, 4, 5);
  const wobbleBankB = buildHarmonics(h ^ 0xc2b2ae35, 4, 7);
  const tierBank = buildHarmonics(h ^ 0x27d4eb2f, 2, 1);

  // Stage ramps — each expressive behaviour fades in at its own threshold.
  const microAmt = ramp(v, 4, 26); // alternating weights + bézier tension
  const breathAmt = ramp(v, 22, 62); // radial breathing
  const wobbleAmt = ramp(v, 55, 92); // line wobble
  const chaosAmt = ramp(v, 82, 100); // expressive tension

  const stage = pranaStageFor(v);

  // A canonical stepped weight ladder: 1.0 · 1.4 · 0.8 · 1.2 · 0.9 …
  const WEIGHT_LADDER = [1.0, 1.4, 0.8, 1.2, 0.9, 1.3, 0.85];

  const field: PranaField = {
    value: v,
    t,
    stage,
    isPure: v < 0.5,

    weight(base: number, tier: number): number {
      if (v < 0.5) return base;
      const ladder = WEIGHT_LADDER[Math.abs(Math.round(tier)) % WEIGHT_LADDER.length];
      const stepped = 1 + (ladder - 1) * microAmt;
      const living = 1 + evaluate(tierBank, tier * 1.7) * 0.22 * breathAmt;
      const edge = 1 + evaluate(tensionBank, tier * 3.1) * 0.3 * chaosAmt;
      return Math.max(0.15, base * stepped * living * edge);
    },

    breathe(angle: number, tier: number, amount = 1): number {
      if (v < 0.5) return 1;
      const a = angle + tier * 0.618;
      const osc = evaluate(breathBank, a);
      const fine = evaluate(wobbleBankA, a * 2.3 + tier) * 0.35;
      const amplitude = (0.055 * breathAmt + 0.085 * chaosAmt) * amount;
      return 1 + (osc + fine) * amplitude;
    },

    tension(angle: number, tier: number): number {
      if (v < 0.5) return 1;
      const osc = evaluate(tensionBank, angle * 1.37 + tier * 0.91);
      const amplitude = 0.1 * microAmt + 0.18 * breathAmt + 0.24 * chaosAmt;
      return 1 + osc * amplitude;
    },

    wobble(angle: number, radius: number, tier: number, scale = 1): Point {
      if (v < 0.5 || wobbleAmt <= 0) return [0, 0];
      const u = angle * 1.9 + tier * 2.3 + radius * 0.0045;
      const dx = evaluate(wobbleBankA, u);
      const dy = evaluate(wobbleBankB, u + 1.9);
      const mag = (2.4 * wobbleAmt + 5.2 * chaosAmt) * scale;
      return [dx * mag, dy * mag];
    },

    drift(x: number, y: number, tier: number, scale = 1): Point {
      if (v < 0.5 || wobbleAmt <= 0) return [x, y];
      const angle = Math.atan2(y, x);
      const radius = Math.hypot(x, y);
      const [dx, dy] = field.wobble(angle, radius, tier, scale);
      return [x + dx, y + dy];
    },

    shimmer(index: number, tier: number, min = 0.55): number {
      if (v < 0.5) return 1;
      const osc = evaluate(wobbleBankB, index * 0.77 + tier * 1.31);
      const amplitude = (1 - min) * (0.4 * breathAmt + 0.6 * chaosAmt);
      return clamp(1 - Math.abs(osc) * amplitude, min, 1);
    },

    tierRotation(tier: number): number {
      if (v < 0.5) return 0;
      const osc = evaluate(tierBank, tier * 2.11 + 0.4);
      return osc * (0.012 * breathAmt + 0.045 * chaosAmt);
    },

    signal(a: number, b = 0): number {
      return evaluate(wobbleBankA, a * 1.13 + b * 0.57);
    },
  };

  return field;
}
