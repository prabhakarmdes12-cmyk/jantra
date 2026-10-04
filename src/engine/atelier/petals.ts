/**
 * Petal corollas with internal filigree ribbing.
 *
 * A petal is never a single closed blob — it is a *built* object:
 *   · outline        the silhouette
 *   · midrib         the central spine
 *   · ribs           3-7 fine veins fanning from origin to apex
 *   · cusp           an inner echo contour
 *   · apex/base pts  anchor coordinates handed to the node layer
 */

import { Point } from "../../types/geometry";
import { PranaField } from "../prana";
import { C, L, M, Q, TWO_PI, clamp, closedPolyPath, lerp, polar } from "../geom";

export type PetalStyle = "lobe" | "pointed" | "double" | "leaf" | "flame" | "blade" | "diamond";

export interface PetalRingSpec {
  count: number;
  /** Inner (base) radius. */
  r0: number;
  /** Outer (apex) radius. */
  r1: number;
  /** Lateral fullness, 0.3 (narrow) → 1.4 (plump). */
  swell?: number;
  /** Fraction of the angular slot the petal occupies, 0.5 → 1. */
  spread?: number;
  style?: PetalStyle;
  /** Rotational offset in radians. */
  rotation?: number;
  /** Tier index — drives prana's weight ladder and breathing phase. */
  tier?: number;
  /** Number of internal veins. 0 disables ribbing. */
  ribs?: number;
  /** Emit the inner echo contour. */
  cusp?: boolean;
}

export interface PetalRingGeometry {
  outline: string;
  midrib: string;
  ribs: string;
  cusp: string;
  apexes: Point[];
  bases: Point[];
  shoulders: Point[];
}

export function buildPetalRing(spec: PetalRingSpec, field: PranaField): PetalRingGeometry {
  const count = Math.max(2, Math.round(spec.count));
  const step = TWO_PI / count;
  const spread = clamp(spec.spread ?? 0.94, 0.3, 1);
  const half = (step / 2) * spread;
  const swell = clamp(spec.swell ?? 0.85, 0.2, 1.6);
  const style: PetalStyle = spec.style ?? "lobe";
  const rotation = spec.rotation ?? 0;
  const tier = spec.tier ?? 0;
  const ribCount = clamp(Math.round(spec.ribs ?? 0), 0, 9);

  let outline = "";
  let midrib = "";
  let ribs = "";
  let cusp = "";
  const apexes: Point[] = [];
  const bases: Point[] = [];
  const shoulders: Point[] = [];

  const tierSpin = field.tierRotation(tier);

  for (let i = 0; i < count; i++) {
    const a = rotation + tierSpin + i * step;

    // Living variation: apex height breathes, lateral swell counter-breathes.
    const breath = field.breathe(a * 1.0 + tier * 0.5, tier, 1);
    const tension = field.tension(a, tier);
    const r0 = spec.r0 * (1 + (breath - 1) * 0.25);
    const r1 = spec.r1 * breath;
    const span = r1 - r0;

    // Half the angular slot measured at the petal's widest point.
    const slotHalf = Math.sin(half) * (r0 + span * 0.55);
    // A petal in a thin annulus must narrow, or it flattens into a lens.
    const aspectDamp = clamp((span * 0.95) / Math.max(1e-6, slotHalf), 0.26, 1);
    const lateral = slotHalf * swell * aspectDamp;

    const baseL = polar(r0, a - half);
    const baseR = polar(r0, a + half);
    const apex = polar(r1, a);

    // Perpendicular offset basis at the petal mid-line.
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const at = (t: number, off: number): Point => {
      const rr = r0 + span * t;
      const base = polar(rr, a);
      return [base[0] + nx * off, base[1] + ny * off];
    };

    const dApex = field.drift(apex[0], apex[1], tier, 0.5);
    const dBaseL = field.drift(baseL[0], baseL[1], tier, 0.3);
    const dBaseR = field.drift(baseR[0], baseR[1], tier, 0.3);

    apexes.push(dApex);
    bases.push(polar(r0, a));
    shoulders.push(at(0.52, 0));

    if (style === "diamond" || style === "blade") {
      const w = lateral * (style === "blade" ? 0.55 : 0.92);
      const l = at(0.48, -w);
      const r = at(0.48, w);
      outline += closedPolyPath([polar(r0, a), l, dApex, r]);
    } else if (style === "pointed" || style === "double") {
      const c1a = at(0.3, -lateral * 1.32 * tension);
      const c2a = at(0.86, -lateral * 0.22);
      const c1b = at(0.86, lateral * 0.22);
      const c2b = at(0.3, lateral * 1.32 * tension);
      outline += M(dBaseL) + C(c1a, c2a, dApex) + C(c1b, c2b, dBaseR);
      if (style === "double") {
        const iTip = at(0.62, 0);
        cusp += M(dBaseL) + Q(at(0.3, -lateral * 0.56), iTip) + Q(at(0.3, lateral * 0.56), dBaseR);
      }
    } else if (style === "flame") {
      const c1a = at(0.26, -lateral * 1.5 * tension);
      const c2a = at(0.74, -lateral * 0.72);
      const c1b = at(0.74, lateral * 0.72);
      const c2b = at(0.26, lateral * 1.5 * tension);
      const tip: Point = [dApex[0] + nx * lateral * 0.22, dApex[1] + ny * lateral * 0.22];
      outline += M(dBaseL) + C(c1a, c2a, tip) + C(c1b, c2b, dBaseR);
    } else if (style === "leaf") {
      const c1a = at(0.34, -lateral * 1.12 * tension);
      const c2a = at(0.8, -lateral * 0.42);
      const c1b = at(0.8, lateral * 0.42);
      const c2b = at(0.34, lateral * 1.12 * tension);
      outline += M(dBaseL) + C(c1a, c2a, dApex) + C(c1b, c2b, dBaseR) + "Z ";
    } else {
      // "lobe" — the classic S-curved padma petal
      const c1a = at(0.33, -lateral * 1.28 * tension);
      const c2a = at(0.84, -lateral * 0.38);
      const c1b = at(0.84, lateral * 0.38);
      const c2b = at(0.33, lateral * 1.28 * tension);
      outline += M(dBaseL) + C(c1a, c2a, dApex) + C(c1b, c2b, dBaseR);
      if (spec.cusp) {
        const iTip = at(0.55, 0);
        cusp += M(dBaseL) + Q(at(0.26, -lateral * 0.5), iTip) + Q(at(0.26, lateral * 0.5), dBaseR);
      }
    }

    // --- Central spine ------------------------------------------------
    midrib += M(at(0.04, 0)) + Q(at(0.52, 0), at(0.9, 0));

    // --- Filigree ribbing: fine veins fanning origin → apex ------------
    // Veins only read on petals that are taller than they are wide.
    const aspect = span / Math.max(1e-6, lateral * 2);
    const ribsHere = aspect < 0.8 ? 0 : aspect < 1.25 ? Math.min(ribCount, 3) : ribCount;
    if (ribsHere > 0 && span > 18) {
      for (let k = 0; k < ribsHere; k++) {
        // Symmetric fan: u ∈ [-1, 1], skipping the exact centre when even.
        const u = ribsHere === 1 ? 0 : (k / (ribsHere - 1)) * 2 - 1;
        if (Math.abs(u) < 0.001 && ribsHere % 2 === 0) continue;
        const mag = Math.abs(u);
        const reach = lerp(0.92, 0.58, mag * mag);
        const bow = lateral * u * lerp(0.1, 0.78, mag);
        const start = at(0.06, lateral * u * 0.06);
        const ctrl = at(reach * 0.46, bow);
        const end = at(reach, lateral * u * 0.1);
        ribs += M(start) + Q(ctrl, end);
      }
    }
  }

  return { outline, midrib, ribs, cusp, apexes, bases, shoulders };
}

/** Sharp serrated corolla — the saw-toothed band used in dense mandalas. */
export function serratedBand(
  count: number,
  rInner: number,
  rOuter: number,
  field: PranaField,
  tier = 0,
  rotation = 0
): string {
  const n = Math.max(3, Math.round(count));
  const step = TWO_PI / n;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = rotation + i * step;
    const b = field.breathe(a, tier, 0.8);
    pts.push(polar(rInner, a - step / 2));
    pts.push(polar(rOuter * b, a));
  }
  let d = M(pts[0]);
  for (let i = 1; i < pts.length; i++) d += L(pts[i]);
  return d + "Z ";
}

/** Scalloped arc band — overlapping shallow arcs, like fish scales. */
export function scallopBand(count: number, r: number, depth: number, rotation = 0): string {
  const n = Math.max(3, Math.round(count));
  const step = TWO_PI / n;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = rotation + i * step;
    const a1 = a0 + step;
    const p0 = polar(r, a0);
    const p1 = polar(r, a1);
    const mid = polar(r + depth, a0 + step / 2);
    d += M(p0) + Q(mid, p1);
  }
  return d;
}
