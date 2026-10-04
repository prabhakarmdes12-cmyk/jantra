/**
 * Orbit registers — the concentric rhythm of the composition.
 *
 * Solid rings alone read as a CAD plot. The eye wants *texture rhythm*:
 * solid → stipple → bead → graduation → solid. These builders provide it.
 */

import { SVGElementData, SVGPathElementData, Point } from "../../types/geometry";
import { PranaField } from "../prana";
import { BuildContext } from "../context";
import { M, L, TWO_PI, dotPath, polar, ringPath, fmt } from "../geom";

/** Dash vocabularies used for the stippled orbital bands. */
export const STIPPLE_PATTERNS = ["1 8", "2 10", "1 5", "2 6", "1 12", "3 9"] as const;

export interface OrbitRegister {
  r: number;
  kind: "solid" | "stipple" | "bead" | "graduation" | "double" | "hairline";
}

/**
 * Deterministically assigns a texture to every structural radius so the
 * composition always alternates solid ↔ dotted bands.
 */
export function planOrbits(radii: number[], ctx: BuildContext, offset = 0): OrbitRegister[] {
  const stipple = ctx.detail.stipple;
  return radii.map((r, i) => {
    const slot = (i + offset) % 5;
    if (!stipple) {
      return { r, kind: i === radii.length - 1 ? "double" : "solid" };
    }
    if (i === radii.length - 1) return { r, kind: "double" };
    if (slot === 1) return { r, kind: "stipple" };
    if (slot === 3) return { r, kind: ctx.density > 0.45 ? "bead" : "stipple" };
    if (slot === 4) return { r, kind: "hairline" };
    return { r, kind: "solid" };
  });
}

export function renderOrbits(
  registers: OrbitRegister[],
  ctx: BuildContext,
  idPrefix = "orbit"
): SVGElementData[] {
  const out: SVGElementData[] = [];
  const { field, ink, weight, cap } = ctx;

  registers.forEach((reg, i) => {
    const tier = i + 1;
    const w = field.weight(weight, tier);
    const isAccent = i % 3 === 1;

    if (reg.kind === "bead") {
      const count = Math.max(12, Math.round(ctx.outerSegments * (ctx.density > 0.6 ? 4 : 3)));
      out.push({
        id: `${idPrefix}-bead-${tier}`,
        d: beadRing(reg.r, count, Math.max(0.8, w * 0.72), field, tier),
        fill: isAccent ? ink.accent : ink.primary,
        fillOpacity: 0.9,
        stroke: "none",
      });
      return;
    }

    if (reg.kind === "graduation") {
      out.push(graduationRing(reg.r, Math.max(24, ctx.outerSegments * 3), w * 0.7, ink.secondary, `${idPrefix}-grad-${tier}`));
      return;
    }

    const base: SVGPathElementData = {
      id: `${idPrefix}-${reg.kind}-${tier}`,
      d: ringPath(reg.r, field, tier),
      fill: "none",
      stroke: isAccent ? ink.accent : ink.primary,
      strokeWidth: w,
      strokeLinecap: cap,
    };

    if (reg.kind === "stipple") {
      base.strokeDasharray = STIPPLE_PATTERNS[(i * 2 + 1) % STIPPLE_PATTERNS.length];
      base.strokeWidth = Math.max(0.7, w * 0.9);
      base.strokeLinecap = "round";
      base.stroke = i % 2 === 0 ? ink.primary : ink.accent;
      base.strokeOpacity = 0.85;
    } else if (reg.kind === "hairline") {
      base.strokeWidth = Math.max(0.4, w * 0.45);
      base.stroke = ink.secondary;
      base.strokeOpacity = 0.85;
    } else if (reg.kind === "double") {
      base.strokeWidth = w * 1.25;
      out.push(base);
      out.push({
        id: `${idPrefix}-double-inner-${tier}`,
        d: ringPath(reg.r * 0.975, field, tier + 0.5),
        fill: "none",
        stroke: ink.primary,
        strokeWidth: Math.max(0.5, w * 0.5),
        strokeLinecap: cap,
        strokeOpacity: 0.75,
      });
      return;
    }

    out.push(base);
  });

  return out;
}

/** A ring of evenly spaced filled dots. */
export function beadRing(r: number, count: number, dotR: number, field: PranaField, tier = 0, rotation = 0): string {
  const n = Math.max(4, Math.round(count));
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = rotation + (i / n) * TWO_PI;
    const rr = r * field.breathe(a, tier, 0.4);
    const p = field.drift(...polar(rr, a), tier, 0.2) as Point;
    const rad = dotR * (0.8 + 0.4 * field.shimmer(i, tier, 0.6));
    d += dotPath(p, rad);
  }
  return d;
}

/** Graduated tick marks straddling a radius, like a dial. */
export function graduationRing(
  r: number,
  count: number,
  len: number,
  stroke: string,
  id: string,
  opts: { major?: number; majorScale?: number; inward?: boolean } = {}
): SVGPathElementData {
  const n = Math.max(4, Math.round(count));
  const major = opts.major ?? 0;
  const majorScale = opts.majorScale ?? 2.1;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TWO_PI;
    const isMajor = major > 0 && i % major === 0;
    const l = isMajor ? len * majorScale : len;
    const inner = opts.inward ? r - l : r - l / 2;
    const outer = opts.inward ? r : r + l / 2;
    d += M(polar(inner, a)) + L(polar(outer, a));
  }
  return {
    id,
    d,
    fill: "none",
    stroke,
    strokeWidth: 0.7,
    strokeLinecap: "butt",
    strokeOpacity: 0.8,
  };
}

/** Radial spokes between two radii. */
export function spokes(
  count: number,
  rInner: number,
  rOuter: number,
  field: PranaField,
  tier = 0,
  rotation = 0
): string {
  const n = Math.max(2, Math.round(count));
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = rotation + (i / n) * TWO_PI;
    const a0 = field.drift(...polar(rInner, a), tier, 0.2) as Point;
    const a1 = field.drift(...polar(rOuter * field.breathe(a, tier, 0.5), a), tier, 0.35) as Point;
    d += M(a0) + L(a1);
  }
  return d;
}

/**
 * Guilloché band — the woven rosette engraved on banknotes.
 * A hypotrochoid traced between two radii.
 */
export function guillocheBand(
  rInner: number,
  rOuter: number,
  lobes: number,
  turns: number,
  samples = 720
): string {
  const amp = (rOuter - rInner) / 2;
  const mid = rInner + amp;
  let d = "";
  // Two counter-phase waves braid into the classic engraved rope.
  for (const phase of [0, Math.PI]) {
    const pts: Point[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * TWO_PI * turns;
      const r = mid + amp * Math.sin(lobes * t + phase);
      pts.push(polar(r, t));
    }
    d += M(pts[0]);
    for (let i = 1; i < pts.length; i++) d += L(pts[i]);
  }
  return d;
}

/** Jali lattice — interlaced arcs filling an annulus like a pierced screen. */
export function jaliLattice(
  rInner: number,
  rOuter: number,
  divisions: number,
  rows: number,
  rotation = 0
): string {
  const n = Math.max(4, Math.round(divisions));
  const m = Math.max(1, Math.round(rows));
  const step = TWO_PI / n;
  let d = "";
  for (let row = 0; row < m; row++) {
    const r0 = rInner + ((rOuter - rInner) * row) / m;
    const r1 = rInner + ((rOuter - rInner) * (row + 1)) / m;
    const skew = (row % 2) * (step / 2);
    for (let i = 0; i < n; i++) {
      const a = rotation + skew + i * step;
      const p0 = polar(r0, a);
      const p1 = polar(r1, a + step / 2);
      const p2 = polar(r0, a + step);
      d += `M ${fmt(p0[0])} ${fmt(p0[1])} Q ${fmt(p1[0])} ${fmt(p1[1])}, ${fmt(p2[0])} ${fmt(p2[1])} `;
      const q0 = polar(r1, a);
      const q1 = polar(r0, a + step / 2);
      const q2 = polar(r1, a + step);
      d += `M ${fmt(q0[0])} ${fmt(q0[1])} Q ${fmt(q1[0])} ${fmt(q1[1])}, ${fmt(q2[0])} ${fmt(q2[1])} `;
    }
  }
  return d;
}
