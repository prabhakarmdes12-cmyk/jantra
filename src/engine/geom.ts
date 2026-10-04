/**
 * Shared geometric path construction utilities.
 * Every emitted number is clamped to 2 decimals so the SVG stays compact,
 * diffable and byte-stable.
 */

import { Point } from "../types/geometry";
import { PranaField } from "./prana";

export const TWO_PI = Math.PI * 2;
export const PHI = 1.618033988749895;

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

export function polar(r: number, a: number): Point {
  return [r * Math.cos(a), r * Math.sin(a)];
}

export function P(p: Point): string {
  return `${fmt(p[0])} ${fmt(p[1])}`;
}

export function M(p: Point): string {
  return `M ${P(p)} `;
}

export function L(p: Point): string {
  return `L ${P(p)} `;
}

export function Q(c: Point, p: Point): string {
  return `Q ${P(c)}, ${P(p)} `;
}

export function C(c1: Point, c2: Point, p: Point): string {
  return `C ${P(c1)}, ${P(c2)}, ${P(p)} `;
}

export function seg(a: Point, b: Point): string {
  return `${M(a)}${L(b)}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPt(a: Point, b: Point, t: number): Point {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

export function rotate(p: Point, a: number): Point {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Circular arc between two angles at a fixed radius, using SVG `A` commands. */
export function arcPath(r: number, a0: number, a1: number, move = true): string {
  const start = polar(r, a0);
  const end = polar(r, a1);
  const delta = a1 - a0;
  const large = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweep = delta > 0 ? 1 : 0;
  return `${move ? M(start) : ""}A ${fmt(r)} ${fmt(r)} 0 ${large} ${sweep} ${P(end)} `;
}

/** Exact closed circle expressed as a path (two arcs). */
export function circlePath(r: number, cx = 0, cy = 0): string {
  return (
    `M ${fmt(cx - r)} ${fmt(cy)} ` +
    `a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(r * 2)} 0 ` +
    `a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-r * 2)} 0 `
  );
}

/**
 * A closed loop passing smoothly through sampled polar radii.
 * Uses a Catmull-Rom → cubic Bézier conversion so the curve is C1 continuous.
 */
export function closedSmoothPath(points: Point[], tensionScale = 1): string {
  const n = points.length;
  if (n < 3) return "";
  let d = M(points[0]);
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const k = (tensionScale * 1) / 6;
    const c1: Point = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += C(c1, c2, p2);
  }
  return d + "Z ";
}

/**
 * The canonical "ring" of the engine.
 * At prana 0 this is a mathematically perfect circle; as prana rises the ring
 * begins to breathe — an ellipse-free, continuous, hand-inked wobble.
 */
export function ringPath(
  r: number,
  field: PranaField,
  tier: number,
  opts: { samples?: number; amount?: number } = {}
): string {
  if (field.isPure) return circlePath(r);
  const samples = opts.samples ?? clamp(Math.round(r / 6), 36, 160);
  const pts: Point[] = [];
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * TWO_PI;
    const rr = r * field.breathe(a, tier, (opts.amount ?? 1) * 0.55);
    const base = polar(rr, a);
    pts.push(field.drift(base[0], base[1], tier, 0.25));
  }
  return closedSmoothPath(pts);
}

/** Open smooth path through sampled points (Catmull-Rom → cubic Bézier). */
export function openSmoothPath(points: Point[], tensionScale = 1): string {
  const n = points.length;
  if (n < 2) return "";
  if (n === 2) return M(points[0]) + L(points[1]);
  let d = M(points[0]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];
    const k = tensionScale / 6;
    const c1: Point = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += C(c1, c2, p2);
  }
  return d;
}

/**
 * A calligraphic brush stroke: the centre line is offset perpendicular by a
 * width that tapers from `w0` at the root to `w1` at the tip, then closed.
 * This is what turns a scratchy polyline into an ink stroke.
 */
export function taperedStroke(points: Point[], w0: number, w1: number, profile = 1.4): string {
  const n = points.length;
  if (n < 3) return "";
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(n - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const t = i / (n - 1);
    // Leaf-shaped taper: swells just past the root, narrows to a point.
    const swell = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.75);
    const w = lerp(w0, w1, Math.pow(t, profile)) * (0.35 + 0.65 * swell);
    left.push([points[i][0] + nx * w, points[i][1] + ny * w]);
    right.push([points[i][0] - nx * w, points[i][1] - ny * w]);
  }
  const forward = openSmoothPath(left);
  const back = openSmoothPath(right.reverse()).replace(/^M/, "L");
  return `${forward}${back}Z `;
}

/** Regular polygon vertices. */
export function polygonPoints(sides: number, r: number, rotation = -Math.PI / 2): Point[] {
  const pts: Point[] = [];
  const n = Math.max(3, Math.round(sides));
  for (let i = 0; i < n; i++) pts.push(polar(r, rotation + (i / n) * TWO_PI));
  return pts;
}

export function closedPolyPath(pts: Point[]): string {
  if (pts.length === 0) return "";
  let d = M(pts[0]);
  for (let i = 1; i < pts.length; i++) d += L(pts[i]);
  return d + "Z ";
}

export function openPolyPath(pts: Point[]): string {
  if (pts.length === 0) return "";
  let d = M(pts[0]);
  for (let i = 1; i < pts.length; i++) d += L(pts[i]);
  return d;
}

/** Tiny filled dot expressed as a sub-path so many dots share one `<path>`. */
export function dotPath(p: Point, r: number): string {
  return (
    `M ${fmt(p[0] - r)} ${fmt(p[1])} ` +
    `a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(r * 2)} 0 ` +
    `a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-r * 2)} 0 `
  );
}

/** Diamond / rhombus marker used on axis terminals and registration ticks. */
export function diamondPath(p: Point, r: number, rotation = 0): string {
  const v = [polar(r, rotation), polar(r, rotation + Math.PI / 2), polar(r, rotation + Math.PI), polar(r, rotation + (3 * Math.PI) / 2)];
  return closedPolyPath(v.map((q) => [p[0] + q[0], p[1] + q[1]] as Point));
}

/** Normalized 0→1 progression curve for a spacing mode. */
export function spacingCurve(t: number, spacing: string, n = 6): number {
  if (spacing === "harmonic") return Math.sqrt(t);
  if (spacing === "exponential") return Math.pow(t, 1.7);
  if (spacing === "golden") {
    const k = Math.max(2, n);
    const i = t * k;
    return (Math.pow(PHI, i) - 1) / (Math.pow(PHI, k) - 1);
  }
  return t;
}

/**
 * Concentric radii spanning [minRadius, maxRadius] *inclusive at both ends*,
 * so the innermost register always hugs the bindu and the outermost always
 * meets the frame. `count` radii are returned.
 */
export function ringRadii(count: number, spacing: string, minRadius: number, maxRadius: number): number[] {
  const n = clamp(Math.round(count), 1, 18);
  if (n === 1) return [maxRadius];
  const radii: number[] = [];
  const range = maxRadius - minRadius;
  for (let i = 0; i < n; i++) {
    radii.push(minRadius + range * spacingCurve(i / (n - 1), spacing, n));
  }
  return radii;
}

export interface Band {
  r0: number;
  r1: number;
  /** Band index, 0 = innermost. */
  i: number;
  /** Normalized centre position, 0 at the bindu → 1 at the frame. */
  t: number;
}

/** Split [inner, outer] into `count` concentric bands. */
export function bands(count: number, spacing: string, inner: number, outer: number): Band[] {
  const edges = ringRadii(count + 1, spacing, inner, outer);
  const out: Band[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    out.push({ r0: edges[i], r1: edges[i + 1], i, t: (i + 0.5) / count });
  }
  return out;
}
