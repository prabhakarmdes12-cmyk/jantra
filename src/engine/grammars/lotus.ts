/**
 * LOTUS (पद्म) — sacred geometry, balance, multi-tiered blooming petals
 * with delicate internal vein hatching, stippled orbit bands and a
 * stepped bhupura.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildPetalRing, PetalStyle, scallopBand } from "../atelier/petals";
import { beadRing, graduationRing } from "../atelier/orbits";
import { TWO_PI, circlePath, clamp, dotPath, polar, ringPath } from "../geom";
import {
  addOrnaments,
  addPetalLayers,
  anchorsOn,
  emitBackground,
  emitBhupura,
  emitBindu,
  emitConstruction,
  emitNodes,
  emitOrbits,
  tierCountFor,
} from "./shared";

/**
 * Overlapping petal tier layout, expressed as fractions of the artwork
 * radius. Overlapping is the whole point — a lotus blooms in shingled
 * courses, not in disjoint annuli.
 */
const TIER_PLANS: Record<number, Array<[number, number]>> = {
  2: [
    [0.46, 1.0],
    [0.08, 0.56],
  ],
  3: [
    [0.56, 1.0],
    [0.26, 0.72],
    [0.07, 0.36],
  ],
  4: [
    [0.62, 1.0],
    [0.34, 0.8],
    [0.17, 0.48],
    [0.06, 0.26],
  ],
};

export function buildLotus(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, artR, core, radii, segments, outerSegments, detail, density } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 0.8);
  emitOrbits(ctx, layers, radii, 0);

  const tiers = tierCountFor(ctx, 2, 4);
  const plan = TIER_PLANS[tiers] ?? TIER_PLANS[3];

  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  const nodePoints: Point[] = [];
  const ornaments: SVGElementData[] = [];

  // --- Shingled blooming petal courses, outermost first ---------------
  plan.forEach(([f0, f1], t) => {
    const r0 = Math.max(core * 0.8, artR * f0);
    const r1 = artR * f1;
    const even = t % 2 === 0;
    const count = even ? outerSegments : Math.max(4, segments);
    const style: PetalStyle = even ? "pointed" : "lobe";
    const tier = t + 1;

    const geo = buildPetalRing(
      {
        count,
        r0,
        r1,
        swell: 0.98 - t * 0.06,
        spread: 0.97,
        style,
        rotation: ctx.asymmetry + (even ? 0 : Math.PI / count),
        tier,
        ribs: detail.ribbing ? clamp(detail.ribCount - Math.floor(t / 2), 3, 7) : 0,
        cusp: true,
      },
      field
    );

    outlines.push({
      id: `lotus-petals-t${t}`,
      d: geo.outline,
      fill: even ? ink.accent : ink.primary,
      fillOpacity: even ? 0.045 : 0.025,
      stroke: ink.primary,
      strokeWidth: field.weight(weight, tier) * (t === 0 ? 1.15 : 0.92 - t * 0.04),
      strokeLinecap: cap,
      strokeLinejoin: "round",
    });

    outlines.push({
      id: `lotus-petal-echo-t${t}`,
      d: geo.cusp,
      fill: "none",
      stroke: ink.secondary,
      strokeWidth: Math.max(0.4, field.weight(weight, tier + 1) * 0.42),
      strokeDasharray: t % 2 === 0 ? "4 4" : undefined,
      strokeOpacity: 0.75,
    });

    ribbing.push({
      id: `lotus-ribs-t${t}`,
      d: geo.ribs,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.35, field.weight(weight, tier + 2) * 0.4),
      strokeOpacity: 0.58 - t * 0.05,
      strokeLinecap: "round",
    });
    ribbing.push({
      id: `lotus-midrib-t${t}`,
      d: geo.midrib,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.4, field.weight(weight, tier) * 0.5),
      strokeOpacity: 0.8,
      strokeLinecap: "round",
    });

    nodePoints.push(...geo.apexes);
  });

  // --- Pericarp: the seed pod ringing the bindu -----------------------
  const seedR = core * 1.75;
  const seedCount = Math.max(6, segments);
  let seeds = "";
  for (let i = 0; i < seedCount; i++) {
    const a = (i / seedCount) * TWO_PI + Math.PI / seedCount;
    seeds += dotPath(polar(seedR, a), Math.max(1.6, core * 0.11));
  }
  ornaments.push({
    id: "lotus-pericarp-seeds",
    d: seeds,
    fill: "none",
    stroke: ink.primary,
    strokeWidth: Math.max(0.5, weight * 0.55),
    strokeOpacity: 0.95,
  });
  ornaments.push({
    id: "lotus-pericarp-ring",
    d: circlePath(seedR * 1.3),
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: 0.6,
    strokeDasharray: "1 5",
    strokeOpacity: 0.8,
  });

  // --- Scalloped collar + graduation dial -----------------------------
  const collarR = artR * 1.035;
  ornaments.push({
    id: "lotus-scallop-collar",
    d: scallopBand(outerSegments * 2, collarR, artR * 0.022, Math.PI / (outerSegments * 2)),
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: Math.max(0.5, weight * 0.6),
    strokeOpacity: 0.9,
  });
  ornaments.push({
    id: "lotus-collar-ring",
    d: ringPath(collarR, field, 9),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 9) * 0.6,
    strokeOpacity: 0.9,
  });
  ornaments.push(
    graduationRing(collarR * 1.05, outerSegments * 4, artR * 0.016, ink.construction, "lotus-graduations", {
      major: 4,
      majorScale: 2.2,
    })
  );

  if (detail.stipple) {
    ornaments.push({
      id: "lotus-bead-orbit",
      d: beadRing(artR * 0.49, outerSegments * 3, Math.max(0.9, weight * 0.7), field, 6),
      fill: ink.accent,
      fillOpacity: 0.85,
      stroke: "none",
    });
    ornaments.push({
      id: "lotus-stipple-band",
      d: ringPath(artR * 0.78, field, 5),
      fill: "none",
      stroke: ink.primary,
      strokeWidth: 0.85,
      strokeDasharray: "2 10",
      strokeOpacity: 0.72,
    });
  }

  if (density > 0.5) {
    ornaments.push({
      id: "lotus-inner-stipple",
      d: ringPath(artR * 0.28, field, 4),
      fill: "none",
      stroke: ink.accent,
      strokeWidth: 0.75,
      strokeDasharray: "1 8",
      strokeOpacity: 0.8,
    });
  }

  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);

  // Celestial nodes: petal apexes + cardinal axis ∩ ring intersections
  const axisNodes: Point[] = [];
  for (const r of radii) axisNodes.push(...anchorsOn(r, 4));
  axisNodes.push(...anchorsOn(collarR, outerSegments, Math.PI / outerSegments));
  emitNodes(ctx, layers, [...nodePoints, ...axisNodes], "lotus-node", {
    r: Math.max(1.9, artR * 0.0045),
    halo: true,
    max: 96,
  });

  emitBhupura(ctx, layers);
  emitBindu(ctx, layers);
}
