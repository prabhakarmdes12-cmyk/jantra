/**
 * EXPERIMENTAL (प्रयोग) — hybrid symmetries (an 8-fold core expanding into
 * 16/24-fold outer registers), controlled asymmetric shifts and
 * unexpected geometric forms.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildPetalRing, serratedBand } from "../atelier/petals";
import { beadRing, graduationRing, spokes } from "../atelier/orbits";
import { stellatedPolygon } from "../atelier/yantra";
import { L, M, TWO_PI, arcPath, clamp, polar, ringPath } from "../geom";
import {
  addOrnaments,
  addPetalLayers,
  addPolygons,
  anchorsOn,
  emitBackground,
  emitBhupura,
  emitBindu,
  emitConstruction,
  emitNodes,
  emitOrbits,
} from "./shared";

export function buildExperimental(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, R, radii, segments, detail, density } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 1.15);
  emitOrbits(ctx, layers, radii, 4);

  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  const ornaments: SVGElementData[] = [];
  const polys: SVGElementData[] = [];
  const nodePoints: Point[] = [];

  // --- Symmetry ladder: core → mid → outer ----------------------------
  const core = segments;
  const mid = segments * 2;
  const outerN = segments * 3;
  const ladder: Array<{ count: number; lo: number; hi: number; tier: number; shift: number }> = [
    { count: core, lo: radii[0] * 0.52, hi: radii[Math.min(1, radii.length - 1)], tier: 1, shift: 0 },
    {
      count: mid,
      lo: radii[Math.min(1, radii.length - 1)],
      hi: radii[Math.min(radii.length - 1, Math.max(2, radii.length - 2))],
      tier: 2,
      shift: Math.PI / mid + ctx.asymmetry,
    },
    {
      count: outerN,
      lo: radii[Math.max(0, radii.length - 2)],
      hi: radii[radii.length - 1],
      tier: 3,
      shift: ctx.asymmetry * 2,
    },
  ];

  ladder.forEach((reg, i) => {
    if (reg.hi - reg.lo < 12) return;
    const geo = buildPetalRing(
      {
        count: reg.count,
        r0: reg.lo,
        r1: reg.hi,
        swell: i === 1 ? 0.6 : 0.88,
        spread: i === 2 ? 0.86 : 0.95,
        style: i === 0 ? "flame" : i === 1 ? "blade" : "pointed",
        rotation: reg.shift,
        tier: reg.tier,
        ribs: detail.ribbing ? clamp(detail.ribCount - i, 3, 7) : 0,
      },
      field
    );
    outlines.push({
      id: `experimental-register-${i}`,
      d: geo.outline,
      fill: i === 0 ? ink.accent : "none",
      fillOpacity: i === 0 ? 0.06 : undefined,
      stroke: ink.primary,
      strokeWidth: field.weight(weight, reg.tier) * (i === 2 ? 0.72 : 0.95),
      strokeLinecap: cap,
      strokeLinejoin: "round",
    });
    ribbing.push({
      id: `experimental-ribs-${i}`,
      d: geo.ribs,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.32, weight * 0.36),
      strokeOpacity: 0.6,
    });
    nodePoints.push(...geo.apexes);
  });

  // --- Controlled asymmetry: interrupted arc registers ----------------
  const breaks = clamp(3 + Math.round(density * 5), 3, 9);
  let arcs = "";
  for (let i = 0; i < breaks; i++) {
    const r = radii[i % radii.length] * (1.02 + (i % 3) * 0.015);
    const a0 = ctx.asymmetry * 3 + (i / breaks) * TWO_PI;
    const sweep = (TWO_PI / breaks) * (0.42 + ((i * 7) % 5) * 0.09);
    arcs += arcPath(r, a0, a0 + sweep);
  }
  ornaments.push({
    id: "experimental-interrupted-arcs",
    d: arcs,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: field.weight(weight, 5) * 0.9,
    strokeLinecap: "round",
    strokeOpacity: 0.95,
  });

  // --- Off-axis satellite rosettes -------------------------------------
  const satellites = clamp(Math.round(segments / 2), 2, 6);
  let satD = "";
  let satCore = "";
  const satR = radii[radii.length - 1] * 0.52;
  const satSize = R * 0.055;
  for (let i = 0; i < satellites; i++) {
    const a = ctx.asymmetry + Math.PI / satellites + (i / satellites) * TWO_PI;
    const c = polar(satR, a);
    const n = 6 + (i % 3) * 2;
    for (let k = 0; k < n; k++) {
      const aa = (k / n) * TWO_PI + a;
      satD += M(c) + L([c[0] + Math.cos(aa) * satSize, c[1] + Math.sin(aa) * satSize]);
    }
    satCore += `M ${(c[0] - satSize * 0.34).toFixed(2)} ${c[1].toFixed(2)} a ${(satSize * 0.34).toFixed(2)} ${(
      satSize * 0.34
    ).toFixed(2)} 0 1 0 ${(satSize * 0.68).toFixed(2)} 0 a ${(satSize * 0.34).toFixed(2)} ${(satSize * 0.34).toFixed(
      2
    )} 0 1 0 ${(-satSize * 0.68).toFixed(2)} 0 `;
    nodePoints.push(c);
  }
  ornaments.push({
    id: "experimental-satellites",
    d: satD,
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: 0.6,
    strokeOpacity: 0.8,
    strokeLinecap: "round",
  });
  ornaments.push({
    id: "experimental-satellite-cores",
    d: satCore,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.8,
    strokeOpacity: 0.9,
  });

  // --- Hybrid stellation straddling two symmetries ---------------------
  polys.push({
    id: "experimental-stellation-core",
    d: stellatedPolygon(core, radii[Math.max(0, radii.length - 3)], radii[Math.max(0, radii.length - 3)] * 0.62, -Math.PI / 2),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 6) * 0.7,
    strokeLinejoin: "miter",
  });
  polys.push({
    id: "experimental-stellation-outer",
    d: stellatedPolygon(outerN, radii[radii.length - 1] * 1.02, radii[radii.length - 1] * 0.9, -Math.PI / 2 + ctx.asymmetry * 2),
    fill: "none",
    stroke: ink.accent,
    strokeWidth: field.weight(weight, 7) * 0.55,
    strokeLinejoin: "miter",
    strokeOpacity: 0.9,
  });

  ornaments.push({
    id: "experimental-serration",
    d: serratedBand(outerN * 2, radii[radii.length - 1] * 1.06, radii[radii.length - 1] * 1.1, field, 8, ctx.asymmetry),
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: 0.5,
    strokeOpacity: 0.75,
    strokeLinejoin: "miter",
  });
  ornaments.push({
    id: "experimental-drift-ring",
    d: ringPath(radii[radii.length - 1] * 1.13, field, 9, { amount: 1.8 }),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: 0.75,
    strokeDasharray: "2 10",
    strokeOpacity: 0.8,
  });
  ornaments.push({
    id: "experimental-comb",
    d: spokes(outerN * 2, radii[radii.length - 1] * 1.15, radii[radii.length - 1] * 1.19, field, 10, ctx.asymmetry),
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.5,
    strokeOpacity: 0.6,
  });
  if (detail.stipple) {
    ornaments.push({
      id: "experimental-bead-offset",
      d: beadRing(radii[Math.max(0, radii.length - 2)] * 1.04, outerN * 2, Math.max(0.8, weight * 0.55), field, 11, ctx.asymmetry),
      fill: ink.accent,
      fillOpacity: 0.85,
      stroke: "none",
    });
  }
  ornaments.push(
    graduationRing(R * 0.985, outerN * 6, R * 0.01, ink.construction, "experimental-dial", { major: 6, majorScale: 2.4 })
  );

  addPetalLayers(layers, outlines, ribbing);
  addPolygons(layers, polys);
  addOrnaments(layers, ornaments);

  const axis: Point[] = [...anchorsOn(radii[radii.length - 1], outerN, ctx.asymmetry * 2), ...anchorsOn(radii[0], core)];
  emitNodes(ctx, layers, [...nodePoints, ...axis], "experimental-node", {
    r: Math.max(1.7, R * 0.0033),
    halo: true,
    max: 120,
  });

  emitBhupura(ctx, layers);
  emitBindu(ctx, layers);
}
