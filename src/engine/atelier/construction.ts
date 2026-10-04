/**
 * Fine construction geometry — the draughtsman's under-drawing left visible.
 *
 * Faint electric-cyan crosshairs with coordinate tick marks, circle
 * graduation divisions and angle indicators. This is the layer that says
 * "an instrument made this", not a filter.
 */

import { SVGElementData, Point } from "../../types/geometry";
import { BuildContext } from "../context";
import { L, M, TWO_PI, arcPath, circlePath, diamondPath, fmt, polar } from "../geom";

export function constructionLayer(ctx: BuildContext, opts: { intensity?: number } = {}): SVGElementData[] {
  if (!ctx.detail.construction) return [];
  const intensity = opts.intensity ?? 1;
  const { R, ink, segments, outerSegments } = ctx;
  const out: SVGElementData[] = [];

  // ---- 1. Cardinal crosshairs with coordinate ticks --------------------
  let cross = "";
  const reach = R * 1.03;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TWO_PI;
    cross += M(polar(R * 0.06, a)) + L(polar(reach, a));
  }
  // Coordinate tick marks along each axis.
  const tickSteps = 10;
  for (let i = 1; i <= tickSteps; i++) {
    const rr = (R * i) / tickSteps;
    const len = i % 5 === 0 ? 9 : i % 2 === 0 ? 5.5 : 3;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TWO_PI;
      const n: Point = [-Math.sin(a), Math.cos(a)];
      const p = polar(rr, a);
      cross += `M ${fmt(p[0] - n[0] * len)} ${fmt(p[1] - n[1] * len)} L ${fmt(p[0] + n[0] * len)} ${fmt(p[1] + n[1] * len)} `;
    }
  }
  out.push({
    id: "construction-crosshair",
    d: cross,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.55,
    strokeOpacity: 0.42 * intensity,
    strokeLinecap: "butt",
  });

  // ---- 2. Diagonal symmetry axes --------------------------------------
  let axes = "";
  const axisCount = Math.min(24, Math.max(4, segments));
  for (let i = 0; i < axisCount; i++) {
    const a = (i / axisCount) * TWO_PI + Math.PI / axisCount;
    axes += M(polar(R * 0.12, a)) + L(polar(R * 0.99, a));
  }
  out.push({
    id: "construction-axes",
    d: axes,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.4,
    strokeDasharray: "2 7",
    strokeOpacity: 0.3 * intensity,
  });

  // ---- 3. Graduation collar: divisions of the circle -------------------
  const gradR = R * 1.012;
  let grad = "";
  const divisions = Math.max(72, outerSegments * 6);
  for (let i = 0; i < divisions; i++) {
    const a = (i / divisions) * TWO_PI;
    const major = i % Math.max(1, Math.round(divisions / outerSegments)) === 0;
    const len = major ? 10 : 4;
    grad += M(polar(gradR, a)) + L(polar(gradR + len, a));
  }
  out.push({
    id: "construction-graduations",
    d: grad,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.5,
    strokeOpacity: 0.38 * intensity,
    strokeLinecap: "butt",
  });
  out.push({
    id: "construction-collar",
    d: circlePath(gradR),
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.45,
    strokeOpacity: 0.3 * intensity,
  });

  // ---- 4. Angle indicator arcs ----------------------------------------
  const step = TWO_PI / Math.max(4, segments);
  let angles = "";
  for (let i = 0; i < Math.min(segments, 12); i += 2) {
    const r = R * (0.2 + 0.035 * i);
    angles += arcPath(r, i * step, i * step + step);
  }
  out.push({
    id: "construction-angle-indicators",
    d: angles,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.5,
    strokeOpacity: 0.34 * intensity,
    strokeDasharray: "4 4",
  });

  // ---- 5. Terminal registration diamonds on the cardinal axes ----------
  let marks = "";
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TWO_PI;
    marks += diamondPath(polar(R * 1.055, a), 4.2, Math.PI / 4);
  }
  out.push({
    id: "construction-axis-terminals",
    d: marks,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.6,
    strokeOpacity: 0.5 * intensity,
  });

  return out;
}

/** Corner registration brackets ┌ ┐ └ ┘ around a square frame. */
export function cornerBrackets(
  size: number,
  armLength: number,
  stroke: string,
  id: string,
  strokeWidth = 0.9,
  opacity = 0.75
): SVGElementData {
  const s = size;
  const a = armLength;
  const corners: Array<[number, number, number, number]> = [
    [-s, -s, 1, 1],
    [s, -s, -1, 1],
    [s, s, -1, -1],
    [-s, s, 1, -1],
  ];
  let d = "";
  for (const [x, y, sx, sy] of corners) {
    d += `M ${fmt(x + sx * a)} ${fmt(y)} L ${fmt(x)} ${fmt(y)} L ${fmt(x)} ${fmt(y + sy * a)} `;
  }
  return {
    id,
    d,
    fill: "none",
    stroke,
    strokeWidth,
    strokeOpacity: opacity,
    strokeLinecap: "butt",
  };
}

/** Extended axis guides terminating in diamond marks. */
export function axisGuides(
  rInner: number,
  rOuter: number,
  count: number,
  stroke: string,
  id: string,
  markerSize = 5
): SVGElementData[] {
  const n = Math.max(2, Math.round(count));
  let line = "";
  let marks = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TWO_PI;
    line += M(polar(rInner, a)) + L(polar(rOuter, a));
    marks += diamondPath(polar(rOuter + markerSize * 1.6, a), markerSize, Math.PI / 4);
  }
  return [
    {
      id: `${id}-lines`,
      d: line,
      fill: "none",
      stroke,
      strokeWidth: 0.6,
      strokeDasharray: "6 5",
      strokeOpacity: 0.55,
    },
    {
      id: `${id}-terminals`,
      d: marks,
      fill: "none",
      stroke,
      strokeWidth: 0.8,
      strokeOpacity: 0.8,
    },
  ];
}
