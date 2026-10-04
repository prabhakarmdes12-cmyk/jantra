/**
 * Celestial intersection nodes.
 *
 * Luminous golden anchor dots that sit exactly where the construction
 * geometry *crosses* — petal apex on an orbit, radial axis on a ring,
 * gate centreline on a wall. They are what makes the drawing feel measured
 * rather than decorative.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext } from "../context";
import { TWO_PI, circlePath, polar } from "../geom";

export interface NodeSpec {
  points: Point[];
  /** Dot radius, in SVG units. */
  r?: number;
  /** Draw a faint concentric halo ring around each node. */
  halo?: boolean;
  color?: string;
  id: string;
  opacity?: number;
}

export function celestialNodes(spec: NodeSpec, ctx: BuildContext): SVGElementData[] {
  if (spec.points.length === 0) return [];
  const r = spec.r ?? 2.5;
  const color = spec.color ?? ctx.ink.accent;
  const out: SVGElementData[] = [];

  // Spec-exact: <circle r="2.5" fill="#f59e0b" /> — one per intersection.
  spec.points.forEach((p, i) => {
    out.push({
      id: `${spec.id}-${i}`,
      cx: round2(p[0]),
      cy: round2(p[1]),
      r: round2(r),
      fill: color,
      stroke: "none",
      opacity: spec.opacity,
    });
  });

  if (spec.halo && r >= 2) {
    let d = "";
    for (const p of spec.points) d += circlePath(r * 2.6, p[0], p[1]);
    out.push({
      id: `${spec.id}-halo`,
      d,
      fill: "none",
      stroke: color,
      strokeWidth: 0.5,
      strokeOpacity: 0.5,
    });
  }

  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Evenly spaced anchor points on a radius. */
export function ringNodes(r: number, count: number, rotation = 0): Point[] {
  const n = Math.max(1, Math.round(count));
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) pts.push(polar(r, rotation + (i / n) * TWO_PI));
  return pts;
}

/** Thin down a point list so dense compositions do not drown in dots. */
export function decimate<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const stride = Math.ceil(items.length / max);
  return items.filter((_, i) => i % stride === 0);
}
