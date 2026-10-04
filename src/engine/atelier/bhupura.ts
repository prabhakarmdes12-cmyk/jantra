/**
 * BHUPURA — the earth citadel.
 *
 * Architectural temple-gateway enclosure drawn as a real wall section:
 *   · double-lined stepped wall profile (outer face + inner face)
 *   · layered lintel gates on the four cardinal axes
 *   · corner registration brackets ┌ ┐ └ ┘
 *   · extended axis guides with terminal diamond marks
 *   · optional kalasha finials crowning each gate
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext } from "../context";
import { PranaField } from "../prana";
import { L, M, Q, closedPolyPath, diamondPath, fmt, clamp } from "../geom";
import { cornerBrackets } from "./construction";

export interface BhupuraSpec {
  /** Half-width of the outermost wall. */
  size: number;
  steps: number;
  gates: number;
  finials?: boolean;
  /** Spacing between the two lines of each wall. */
  wallGap?: number;
  /** Depth of each terrace step as a fraction of `size`. */
  stepDepth?: number;
}

export function buildBhupura(spec: BhupuraSpec, ctx: BuildContext): SVGElementData[] {
  const { ink, field, weight, cap } = ctx;
  const out: SVGElementData[] = [];
  const steps = clamp(Math.round(spec.steps), 1, 4);
  const size = spec.size;
  const gap = spec.wallGap ?? Math.max(5, size * 0.016);
  const stepDepth = (spec.stepDepth ?? 0.052) * size;
  const gateCount = clamp(Math.round(spec.gates), 0, 4);
  const gateHalf = size * 0.1;

  // ---- Stepped wall rings (outer → inner), each a double line ---------
  for (let s = 0; s < steps; s++) {
    const r = size - s * stepDepth * 2;
    const w = field.weight(weight, 10 + s) * (s === 0 ? 1.35 : 1.0);
    const outerD = steppedSquare(r, gateHalf, stepDepth * 0.72, gateCount, field, 10 + s);
    const innerD = steppedSquare(r - gap, gateHalf * 0.92, stepDepth * 0.6, gateCount, field, 10.5 + s);

    out.push({
      id: `bhupura-wall-${s}-outer`,
      d: outerD,
      fill: "none",
      stroke: s === 0 ? ink.primary : ink.secondary,
      strokeWidth: w,
      strokeLinejoin: "miter",
      strokeLinecap: cap,
    });
    out.push({
      id: `bhupura-wall-${s}-inner`,
      d: innerD,
      fill: "none",
      stroke: s === 0 ? ink.primary : ink.secondary,
      strokeWidth: Math.max(0.45, w * 0.5),
      strokeLinejoin: "miter",
      strokeOpacity: 0.8,
    });

    // Hatched coursing between the two wall lines on the outer ring.
    if (s === 0) {
      out.push({
        id: "bhupura-wall-coursing",
        d: coursing(r, gap, Math.round(size / 26)),
        fill: "none",
        stroke: ink.secondary,
        strokeWidth: 0.5,
        strokeOpacity: 0.55,
      });
    }
  }

  // ---- Layered lintel gates -------------------------------------------
  const innerWall = size - (steps - 1) * stepDepth * 2 - gap;
  for (let g = 0; g < gateCount; g++) {
    const rot = (g * Math.PI) / 2;
    out.push(...gateAssembly(innerWall, size, gateHalf, rot, g, ctx, spec.finials ?? true));
  }

  // ---- Corner fan rosettes filling the diagonal reveals ---------------
  let fanArcs = "";
  let fanRays = "";
  let fanBuds = "";
  const fanSpan = Math.PI / 2;
  const fanInset = gap * 2.2;
  for (let c = 0; c < 4; c++) {
    const sx = c === 0 || c === 3 ? -1 : 1;
    const sy = c < 2 ? -1 : 1;
    const cx = sx * (size - fanInset);
    const cy = sy * (size - fanInset);
    const inward = Math.atan2(-sy, -sx);
    const a0 = inward - fanSpan / 2;

    for (let k = 1; k <= 5; k++) {
      const rr = size * (0.05 + k * 0.045);
      const steps = 16;
      for (let j = 0; j <= steps; j++) {
        const aa = a0 + (fanSpan * j) / steps;
        const x = cx + Math.cos(aa) * rr;
        const y = cy + Math.sin(aa) * rr;
        fanArcs += `${j === 0 ? "M" : "L"} ${fmt(x)} ${fmt(y)} `;
      }
    }

    const rays = 8;
    for (let k = 0; k <= rays; k++) {
      const aa = a0 + (fanSpan * k) / rays;
      const r0 = size * 0.048;
      const r1 = size * (k % 2 === 0 ? 0.282 : 0.2);
      fanRays +=
        `M ${fmt(cx + Math.cos(aa) * r0)} ${fmt(cy + Math.sin(aa) * r0)} ` +
        `L ${fmt(cx + Math.cos(aa) * r1)} ${fmt(cy + Math.sin(aa) * r1)} `;
    }

    fanBuds += diamondPath([cx, cy], size * 0.017, Math.PI / 4);
  }
  out.push({
    id: "bhupura-corner-fans",
    d: fanArcs,
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: Math.max(0.45, weight * 0.5),
    strokeOpacity: 0.8,
  });
  out.push({
    id: "bhupura-corner-fan-rays",
    d: fanRays,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.5,
    strokeOpacity: 0.55,
  });
  out.push({
    id: "bhupura-corner-buds",
    d: fanBuds,
    fill: ink.accent,
    fillOpacity: 0.85,
    stroke: "none",
  });

  // ---- Corner registration brackets ┌ ┐ └ ┘ ---------------------------
  out.push(
    cornerBrackets(size * 1.055, size * 0.1, ink.accent, "bhupura-corner-brackets", field.weight(weight, 12) * 0.8, 0.85)
  );
  out.push(
    cornerBrackets(size * 1.105, size * 0.055, ink.construction, "bhupura-corner-registration", 0.6, 0.55)
  );

  // ---- Extended axis guides with terminal diamonds --------------------
  let guides = "";
  let terminals = "";
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const dir: Point = [Math.cos(a), Math.sin(a)];
    const from: Point = [dir[0] * size * 1.02, dir[1] * size * 1.02];
    const to: Point = [dir[0] * size * 1.16, dir[1] * size * 1.16];
    guides += M(from) + L(to);
    terminals += diamondPath([dir[0] * size * 1.2, dir[1] * size * 1.2], size * 0.016, Math.PI / 4);
  }
  out.push({
    id: "bhupura-axis-guides",
    d: guides,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.8,
    strokeDasharray: "8 6",
    strokeOpacity: 0.6,
  });
  out.push({
    id: "bhupura-axis-terminals",
    d: terminals,
    fill: ink.accent,
    fillOpacity: 0.85,
    stroke: "none",
  });

  return out;
}

/**
 * A square wall whose four sides step outward at the gate openings —
 * the classic bhupura silhouette.
 */
function steppedSquare(
  r: number,
  gateHalf: number,
  stepOut: number,
  gates: number,
  field: PranaField,
  tier: number
): string {
  const pts: Point[] = [];

  // Each side gets a local frame: `along` slides across the wall,
  // `out` pushes away from the centre.
  const sides: Array<{ along: Point; out: Point }> = [
    { along: [1, 0], out: [0, -1] }, // top
    { along: [0, 1], out: [1, 0] }, // right
    { along: [-1, 0], out: [0, 1] }, // bottom
    { along: [0, -1], out: [-1, 0] }, // left
  ];

  sides.forEach((side, idx) => {
    const hasGate = idx < gates;
    const toPoint = (t: number, o: number): Point => [
      side.along[0] * t + side.out[0] * (r + o),
      side.along[1] * t + side.out[1] * (r + o),
    ];

    pts.push(toPoint(-r, 0));
    if (hasGate) {
      pts.push(toPoint(-gateHalf - stepOut * 1.6, 0));
      pts.push(toPoint(-gateHalf - stepOut * 1.6, stepOut));
      pts.push(toPoint(-gateHalf - stepOut * 0.7, stepOut));
      pts.push(toPoint(-gateHalf - stepOut * 0.7, stepOut * 2));
      pts.push(toPoint(-gateHalf, stepOut * 2));
      pts.push(toPoint(-gateHalf, stepOut * 3));
      pts.push(toPoint(gateHalf, stepOut * 3));
      pts.push(toPoint(gateHalf, stepOut * 2));
      pts.push(toPoint(gateHalf + stepOut * 0.7, stepOut * 2));
      pts.push(toPoint(gateHalf + stepOut * 0.7, stepOut));
      pts.push(toPoint(gateHalf + stepOut * 1.6, stepOut));
      pts.push(toPoint(gateHalf + stepOut * 1.6, 0));
    }
    pts.push(toPoint(r, 0));
  });

  const drifted = pts.map((p) => field.drift(p[0], p[1], tier, 0.18) as Point);
  return closedPolyPath(drifted);
}

/** Parallel coursing lines between the two wall faces. */
function coursing(r: number, gap: number, perSide: number): string {
  const n = Math.max(4, perSide);
  let d = "";
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i <= n; i++) {
      const t = -r + (2 * r * i) / n;
      let a: Point;
      let b: Point;
      if (side === 0) {
        a = [t, -r];
        b = [t, -r + gap];
      } else if (side === 1) {
        a = [r, t];
        b = [r - gap, t];
      } else if (side === 2) {
        a = [t, r];
        b = [t, r - gap];
      } else {
        a = [-r, t];
        b = [-r + gap, t];
      }
      d += `M ${fmt(a[0])} ${fmt(a[1])} L ${fmt(b[0])} ${fmt(b[1])} `;
    }
  }
  return d;
}

/** One cardinal gopuram: jamb posts, triple lintel, threshold, finial. */
function gateAssembly(
  innerR: number,
  outerR: number,
  halfWidth: number,
  rotation: number,
  index: number,
  ctx: BuildContext,
  finial: boolean
): SVGElementData[] {
  const { ink, field, weight } = ctx;
  const out: SVGElementData[] = [];
  const rot = (p: Point): Point => {
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
  };
  const depth = outerR - innerR;
  const w = field.weight(weight, 13 + index);

  // Jamb posts
  let jambs = "";
  for (const sign of [-1, 1]) {
    jambs += M(rot([innerR - depth * 0.1, sign * halfWidth])) + L(rot([outerR + depth * 0.45, sign * halfWidth]));
    jambs +=
      M(rot([innerR - depth * 0.1, sign * halfWidth * 0.62])) +
      L(rot([outerR + depth * 0.3, sign * halfWidth * 0.62]));
  }
  out.push({
    id: `bhupura-gate-${index}-jambs`,
    d: jambs,
    fill: "none",
    stroke: ink.primary,
    strokeWidth: w * 0.75,
    strokeLinecap: "butt",
  });

  // Triple layered lintels, each wider than the last
  let lintels = "";
  for (let i = 0; i < 3; i++) {
    const rr = outerR + depth * (0.5 + i * 0.26);
    const hw = halfWidth * (1 + i * 0.26);
    lintels += M(rot([rr, -hw])) + L(rot([rr, hw]));
    lintels += M(rot([rr, -hw])) + L(rot([rr - depth * 0.12, -hw * 0.9]));
    lintels += M(rot([rr, hw])) + L(rot([rr - depth * 0.12, hw * 0.9]));
  }
  out.push({
    id: `bhupura-gate-${index}-lintels`,
    d: lintels,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: w * 0.85,
    strokeLinecap: "butt",
    strokeOpacity: 0.95,
  });

  // Threshold bar + sill shadow
  out.push({
    id: `bhupura-gate-${index}-threshold`,
    d:
      M(rot([innerR, -halfWidth * 0.86])) +
      L(rot([innerR, halfWidth * 0.86])) +
      M(rot([innerR - depth * 0.16, -halfWidth * 0.66])) +
      L(rot([innerR - depth * 0.16, halfWidth * 0.66])),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: w * 0.6,
    strokeOpacity: 0.8,
  });

  // Kalasha finial — a tapering vase crowning the gate
  if (finial) {
    const base = outerR + depth * 1.32;
    const h = depth * 0.62;
    const bw = halfWidth * 0.3;
    const tip: Point = rot([base + h, 0]);
    const d =
      M(rot([base, -bw])) +
      Q(rot([base + h * 0.42, -bw * 1.5]), rot([base + h * 0.72, -bw * 0.34])) +
      Q(rot([base + h * 0.9, -bw * 0.12]), tip) +
      Q(rot([base + h * 0.9, bw * 0.12]), rot([base + h * 0.72, bw * 0.34])) +
      Q(rot([base + h * 0.42, bw * 1.5]), rot([base, bw])) +
      "Z ";
    out.push({
      id: `bhupura-gate-${index}-finial`,
      d,
      fill: ink.accent,
      fillOpacity: 0.16,
      stroke: ink.accent,
      strokeWidth: w * 0.7,
      strokeLinejoin: "round",
    });
  }

  return out;
}
