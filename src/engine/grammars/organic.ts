/**
 * ORGANIC (प्राण) — flowing tendrils, rhythmic curves, petal branching
 * and high-prana living variation.
 *
 * Every stroke here is a *calligraphic* stroke: a tapering closed ribbon
 * rather than a constant-width line, so the composition reads as ink laid
 * down by a hand rather than plotted by a machine.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildPetalRing, scallopBand } from "../atelier/petals";
import { beadRing } from "../atelier/orbits";
import { TWO_PI, clamp, closedSmoothPath, lerp, openSmoothPath, polar, ringPath, taperedStroke } from "../geom";
import {
  addOrnaments,
  addPetalLayers,
  emitBackground,
  emitBhupura,
  emitBindu,
  emitConstruction,
  emitNodes,
  emitOrbits,
} from "./shared";

/** Logarithmic tendril centre line sweeping outward with a seeded curl. */
function tendrilPoints(
  a0: number,
  rStart: number,
  rEnd: number,
  curl: number,
  samples: number,
  breathe: (a: number) => number
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const r = lerp(rStart, rEnd, Math.pow(t, 0.84));
    const a = a0 + curl * Math.pow(t, 1.3);
    pts.push(polar(r * breathe(a), a));
  }
  return pts;
}

export function buildOrganic(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, artR, core, radii, segments, density, detail } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 0.45);
  emitOrbits(ctx, layers, radii.slice(0, Math.max(2, radii.length - 1)), 3);

  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  const ornaments: SVGElementData[] = [];
  const nodePoints: Point[] = [];

  const breathe = (a: number) => field.breathe(a, 2, 1.3);
  const armCount = segments;
  const curl = (0.3 + density * 0.42) * (ctx.recipe.parameters.symmetry.mode === "hybrid" ? 1.25 : 1);
  const rootW = Math.max(3.2, weight * 3.4);

  // --- Primary calligraphic tendrils sweeping out of the bindu --------
  let mainD = "";
  let counterD = "";
  let veinD = "";
  for (let i = 0; i < armCount; i++) {
    const a0 = ctx.asymmetry + (i / armCount) * TWO_PI;

    const main = tendrilPoints(a0, core * 0.9, artR * 0.99, curl, 30, breathe);
    mainD += taperedStroke(main, rootW, rootW * 0.08, 1.25);
    veinD += openSmoothPath(main.filter((_, k) => k % 2 === 0));
    nodePoints.push(main[main.length - 1]);

    const counter = tendrilPoints(a0 + Math.PI / armCount, core * 1.1, artR * 0.76, -curl * 0.62, 26, breathe);
    counterD += taperedStroke(counter, rootW * 0.5, rootW * 0.04, 1.3);
    nodePoints.push(counter[counter.length - 1]);
  }

  outlines.push({
    id: "organic-tendrils-major",
    d: mainD,
    fill: ink.primary,
    fillOpacity: 0.07,
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 1) * 0.72,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  });
  outlines.push({
    id: "organic-tendrils-counter",
    d: counterD,
    fill: ink.accent,
    fillOpacity: 0.06,
    stroke: ink.secondary,
    strokeWidth: field.weight(weight, 2) * 0.6,
    strokeLinejoin: "round",
    strokeOpacity: 0.95,
  });
  ribbing.push({
    id: "organic-tendril-veins",
    d: veinD,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: Math.max(0.35, weight * 0.3),
    strokeOpacity: 0.45,
  });

  // --- Branching leaflets along each tendril ---------------------------
  if (detail.ribbing) {
    let leaf = "";
    const branches = clamp(2 + Math.round(density * 2), 2, 4);
    for (let i = 0; i < armCount; i++) {
      const a0 = ctx.asymmetry + (i / armCount) * TWO_PI;
      for (let b = 1; b <= branches; b++) {
        // Alternate sides as we climb the stem, the way real phyllotaxis does.
        const t = 0.3 + (0.62 * b) / (branches + 0.4);
        const sign = b % 2 === 0 ? 1 : -1;
        const r = lerp(core * 0.9, artR * 0.99, Math.pow(t, 0.84));
        const a = a0 + curl * Math.pow(t, 1.3);
        const rb = r * breathe(a);
        const len = artR * 0.17 * (1 - t * 0.42);
        const pts: Point[] = [];
        for (let k = 0; k <= 10; k++) {
          const u = k / 10;
          const aa = a + sign * (0.1 + u * 0.52);
          const rr = rb + len * u * 1.15 - len * 0.1 * u * u;
          pts.push(polar(rr, aa));
        }
        leaf += taperedStroke(pts, Math.max(1.6, weight * 1.5), 0.25, 1.05);
      }
    }
    ribbing.push({
      id: "organic-leaflets",
      d: leaf,
      fill: ink.accent,
      fillOpacity: 0.1,
      stroke: ink.accent,
      strokeWidth: Math.max(0.4, weight * 0.4),
      strokeOpacity: 0.8,
      strokeLinejoin: "round",
    });
  }

  // --- A soft petal corolla breathing at the heart --------------------
  const corolla = buildPetalRing(
    {
      count: segments,
      r0: core * 0.8,
      r1: artR * 0.44,
      swell: 1.05,
      spread: 0.98,
      style: "flame",
      rotation: Math.PI / segments + ctx.asymmetry,
      tier: 3,
      ribs: detail.ribbing ? clamp(detail.ribCount, 3, 7) : 0,
    },
    field
  );
  outlines.push({
    id: "organic-corolla",
    d: corolla.outline,
    fill: ink.accent,
    fillOpacity: 0.06,
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 3) * 0.95,
    strokeLinecap: cap,
    strokeLinejoin: "round",
  });
  ribbing.push({
    id: "organic-corolla-ribs",
    d: corolla.ribs,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: Math.max(0.35, weight * 0.38),
    strokeOpacity: 0.6,
  });
  nodePoints.push(...corolla.apexes);

  // --- Rhythmic outer wave ---------------------------------------------
  const waveR = artR * 1.02;
  const wavePts: Point[] = [];
  const lobes = Math.max(3, segments * 2);
  const samples = Math.max(120, lobes * 12);
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * TWO_PI;
    const r = waveR * (1 + 0.04 * Math.sin(lobes * a + field.signal(a) * 0.6)) * field.breathe(a, 4, 0.7);
    wavePts.push(polar(r, a));
  }
  ornaments.push({
    id: "organic-rhythm-wave",
    d: closedSmoothPath(wavePts),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 5) * 0.8,
    strokeLinejoin: "round",
  });
  ornaments.push({
    id: "organic-scallop",
    d: scallopBand(lobes, artR * 0.9, artR * 0.03, Math.PI / lobes),
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: Math.max(0.5, weight * 0.5),
    strokeOpacity: 0.8,
  });
  ornaments.push({
    id: "organic-breath-ring",
    d: ringPath(artR * 1.1, field, 6, { amount: 1.6 }),
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.9,
    strokeDasharray: "2 10",
    strokeOpacity: 0.8,
  });
  if (detail.stipple) {
    ornaments.push({
      id: "organic-seed-beads",
      d: beadRing(core * 1.9, segments * 3, Math.max(1, weight * 0.6), field, 7, Math.PI / (segments * 3)),
      fill: ink.accent,
      fillOpacity: 0.85,
      stroke: "none",
    });
  }

  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);
  emitNodes(ctx, layers, nodePoints, "organic-node", { r: Math.max(2, artR * 0.004), halo: true, max: 72 });

  emitBhupura(ctx, layers);
  emitBindu(ctx, layers);
}
