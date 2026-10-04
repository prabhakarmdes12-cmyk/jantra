/**
 * Yantra geometry — interlocking Shiva–Shakti triangles and stellations.
 *
 * The Sri Yantra archetype: four upward (Shiva) and five downward (Shakti)
 * triangles whose base vertices rest on a common circle, generating the
 * 43-triangle navayoni lattice around the bindu.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext } from "../context";
import { L, M, TWO_PI, closedPolyPath, polar } from "../geom";

/** Normalized triangle schedule: [apexY, baseY] with +Y pointing up. */
const SHIVA: Array<[number, number]> = [
  [0.97, -0.235],
  [0.78, -0.47],
  [0.58, -0.66],
  [0.33, -0.83],
];

const SHAKTI: Array<[number, number]> = [
  [-0.97, 0.235],
  [-0.82, 0.41],
  [-0.63, 0.58],
  [-0.42, 0.74],
  [-0.18, 0.88],
];

function chordHalfWidth(y: number, r: number, k = 1): number {
  const inner = Math.max(0, 1 - y * y);
  return Math.sqrt(inner) * r * k;
}

export interface SriYantraOptions {
  radius: number;
  /** Narrow the chords slightly so the lattice reads cleaner. */
  chordFactor?: number;
  tierOffset?: number;
}

export function buildSriYantra(opts: SriYantraOptions, ctx: BuildContext): SVGElementData[] {
  const { ink, field, weight, cap } = ctx;
  const r = opts.radius;
  const k = opts.chordFactor ?? 0.985;
  const tierOffset = opts.tierOffset ?? 20;

  let shiva = "";
  let shakti = "";

  SHIVA.forEach(([apexY, baseY], i) => {
    const hw = chordHalfWidth(baseY, r, k) * field.breathe(i * 0.7, tierOffset + i, 0.45);
    const apex: Point = [0, -apexY * r];
    const bl: Point = [-hw, -baseY * r];
    const br: Point = [hw, -baseY * r];
    shiva += closedPolyPath([apex, br, bl].map((p) => field.drift(p[0], p[1], tierOffset + i, 0.3) as Point));
  });

  SHAKTI.forEach(([apexY, baseY], i) => {
    const hw = chordHalfWidth(baseY, r, k) * field.breathe(i * 0.9 + 1.4, tierOffset + 10 + i, 0.45);
    const apex: Point = [0, -apexY * r];
    const bl: Point = [-hw, -baseY * r];
    const br: Point = [hw, -baseY * r];
    shakti += closedPolyPath([apex, br, bl].map((p) => field.drift(p[0], p[1], tierOffset + 10 + i, 0.3) as Point));
  });

  return [
    {
      id: "yantra-shiva-triangles",
      d: shiva,
      fill: "none",
      stroke: ink.primary,
      strokeWidth: field.weight(weight, tierOffset),
      strokeLinejoin: "miter",
      strokeLinecap: cap,
    },
    {
      id: "yantra-shakti-triangles",
      d: shakti,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: field.weight(weight, tierOffset + 1) * 0.92,
      strokeLinejoin: "miter",
      strokeLinecap: cap,
    },
  ];
}

/** Collect the base-vertex anchor points of the yantra for the node layer. */
export function sriYantraAnchors(radius: number, chordFactor = 0.985): Point[] {
  const pts: Point[] = [];
  for (const [apexY, baseY] of [...SHIVA, ...SHAKTI]) {
    const hw = chordHalfWidth(baseY, radius, chordFactor);
    pts.push([0, -apexY * radius]);
    pts.push([-hw, -baseY * radius]);
    pts.push([hw, -baseY * radius]);
  }
  return pts;
}

/** Stellated polygon — a star formed by two offset regular polygons. */
export function stellatedPolygon(
  sides: number,
  rOuter: number,
  rInner: number,
  rotation = -Math.PI / 2
): string {
  const n = Math.max(3, Math.round(sides));
  const pts: Point[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rotation + (i / (n * 2)) * TWO_PI;
    pts.push(polar(i % 2 === 0 ? rOuter : rInner, a));
  }
  return closedPolyPath(pts);
}

/** Interlocking rotated polygons forming a rosette. */
export function interlockedPolygons(
  sides: number,
  radius: number,
  layers: number,
  scale: number,
  rotation = -Math.PI / 2
): string {
  let d = "";
  for (let i = 0; i < layers; i++) {
    const r = radius * Math.pow(scale, i);
    const rot = rotation + (i * Math.PI) / sides;
    const pts: Point[] = [];
    for (let k = 0; k < sides; k++) pts.push(polar(r, rot + (k / sides) * TWO_PI));
    d += closedPolyPath(pts);
  }
  return d;
}

/** Sharp radial rays with alternating lengths — the yantra "flame" collar. */
export function radialRays(
  count: number,
  rInner: number,
  rOuter: number,
  rotation = 0,
  alternate = 0.62
): string {
  const n = Math.max(3, Math.round(count));
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = rotation + (i / n) * TWO_PI;
    const half = Math.PI / n;
    const tipR = i % 2 === 0 ? rOuter : rInner + (rOuter - rInner) * alternate;
    d += closedPolyPath([polar(rInner, a - half), polar(tipR, a), polar(rInner, a + half)]);
  }
  return d;
}

/** A simple grid of pillars between two radii — used by the temple grammar. */
export function pillarRing(
  count: number,
  rInner: number,
  rOuter: number,
  width: number,
  rotation = 0
): { shafts: string; capitals: string } {
  const n = Math.max(2, Math.round(count));
  let shafts = "";
  let capitals = "";
  for (let i = 0; i < n; i++) {
    const a = rotation + (i / n) * TWO_PI;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    const inner = polar(rInner, a);
    const outer = polar(rOuter, a);
    const corners: Point[] = [
      [inner[0] - nx * width, inner[1] - ny * width],
      [outer[0] - nx * width, outer[1] - ny * width],
      [outer[0] + nx * width, outer[1] + ny * width],
      [inner[0] + nx * width, inner[1] + ny * width],
    ];
    shafts += closedPolyPath(corners);
    // Capital + base slabs
    for (const [p, w] of [
      [inner, width * 1.9],
      [outer, width * 1.9],
    ] as Array<[Point, number]>) {
      shafts += M([p[0] - nx * w, p[1] - ny * w]) + L([p[0] + nx * w, p[1] + ny * w]);
    }
    const capR = rOuter + width * 1.1;
    const cap = polar(capR, a);
    capitals += closedPolyPath([
      [cap[0] - nx * width * 2.1, cap[1] - ny * width * 2.1],
      [cap[0] + nx * width * 2.1, cap[1] + ny * width * 2.1],
      [outer[0] + nx * width * 1.2, outer[1] + ny * width * 1.2],
      [outer[0] - nx * width * 1.2, outer[1] - ny * width * 1.2],
    ]);
  }
  return { shafts, capitals };
}
