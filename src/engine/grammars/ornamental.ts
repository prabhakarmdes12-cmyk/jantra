/**
 * ORNAMENTAL (अलंकार) — intricate high-frequency composition. Guilloché-like
 * concentric woven bands, micro-infilling and jali lattice textures.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildPetalRing, scallopBand, serratedBand } from "../atelier/petals";
import { beadRing, graduationRing, guillocheBand, jaliLattice, spokes } from "../atelier/orbits";
import { ringRadii, clamp, ringPath } from "../geom";
import {
  addLattice,
  addOrnaments,
  addPetalLayers,
  anchorsOn,
  emitBackground,
  emitBhupura,
  emitBindu,
  emitConstruction,
  emitNodes,
  emitOrbits,
} from "./shared";

export function buildOrnamental(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, R, segments, outerSegments, density, detail } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 0.7);

  const registerCount = clamp(ctx.recipe.parameters.rings.count + 5 + Math.round(density * 5), 8, 16);
  const inner = ctx.core;
  const outer = ctx.artR;
  const radii = ringRadii(registerCount, ctx.recipe.parameters.rings.spacing, inner, outer);

  emitOrbits(ctx, layers, radii, 0);

  const lattice: SVGElementData[] = [];
  const ornaments: SVGElementData[] = [];
  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  const nodePoints: Point[] = [];

  // --- Guilloché woven bands ------------------------------------------
  const bandCount = clamp(2 + Math.round(density * 3), 2, 5);
  for (let b = 0; b < bandCount; b++) {
    const idx = Math.min(radii.length - 2, 1 + b * 2);
    const r0 = radii[idx];
    const r1 = radii[Math.min(radii.length - 1, idx + 1)];
    if (r1 - r0 < 10) continue;
    const lobes = outerSegments * (b + 2);
    lattice.push({
      id: `ornamental-guilloche-${b}`,
      d: guillocheBand(r0, r1, lobes, 1, Math.min(640, Math.max(300, lobes * 7))),
      fill: "none",
      stroke: b % 2 === 0 ? ink.primary : ink.accent,
      strokeWidth: Math.max(0.35, field.weight(weight, 10 + b) * 0.4),
      strokeOpacity: 0.78,
      strokeLinejoin: "round",
    });
    // Counter-rotated second pass gives the woven moiré
    lattice.push({
      id: `ornamental-guilloche-${b}-counter`,
      d: guillocheBand(r0, r1, lobes + Math.max(2, Math.round(lobes * 0.12)), 1, Math.min(640, Math.max(300, lobes * 7))),
      fill: "none",
      stroke: ink.secondary,
      strokeWidth: Math.max(0.3, field.weight(weight, 11 + b) * 0.32),
      strokeOpacity: 0.55,
    });
  }

  // --- Jali pierced screen --------------------------------------------
  if (detail.lattice || density > 0.4) {
    const jIdx = Math.max(0, radii.length - 4);
    lattice.push({
      id: "ornamental-jali",
      d: jaliLattice(radii[jIdx], radii[radii.length - 2], outerSegments * 2, 2, Math.PI / (outerSegments * 2)),
      fill: "none",
      stroke: ink.secondary,
      strokeWidth: Math.max(0.3, weight * 0.34),
      strokeOpacity: 0.65,
    });
  }

  // --- Dense alternating micro registers ------------------------------
  for (let i = 0; i < radii.length - 1; i++) {
    const r0 = radii[i];
    const r1 = radii[i + 1];
    const band = r1 - r0;
    if (band < 6) continue;
    const tier = i + 2;
    const slot = i % 5;
    const count = outerSegments * (i < 3 ? 2 : 3);

    if (slot === 0) {
      ornaments.push({
        id: `ornamental-serration-${i}`,
        d: serratedBand(count * 2, r0 + band * 0.25, r1 - band * 0.12, field, tier, (i * Math.PI) / count),
        fill: "none",
        stroke: ink.secondary,
        strokeWidth: Math.max(0.32, field.weight(weight, tier) * 0.4),
        strokeLinejoin: "miter",
        strokeOpacity: 0.8,
      });
    } else if (slot === 2) {
      ornaments.push({
        id: `ornamental-scallop-${i}`,
        d: scallopBand(count, r0 + band * 0.45, band * 0.4, Math.PI / count),
        fill: "none",
        stroke: ink.primary,
        strokeWidth: Math.max(0.32, field.weight(weight, tier) * 0.42),
        strokeOpacity: 0.85,
      });
    } else if (slot === 3) {
      ornaments.push({
        id: `ornamental-beads-${i}`,
        d: beadRing(r0 + band * 0.5, count * 2, Math.max(0.65, weight * 0.5), field, tier),
        fill: i % 3 === 0 ? ink.accent : ink.primary,
        fillOpacity: 0.8,
        stroke: "none",
      });
    } else if (slot === 4) {
      ornaments.push({
        id: `ornamental-comb-${i}`,
        d: spokes(count * 3, r0 + band * 0.3, r1 - band * 0.3, field, tier, Math.PI / (count * 3)),
        fill: "none",
        stroke: ink.secondary,
        strokeWidth: 0.35,
        strokeOpacity: 0.7,
      });
    }
  }

  // --- A fine petal register to keep it legible ------------------------
  const pIdx = radii.length - 2;
  const geo = buildPetalRing(
    {
      count: outerSegments * 2,
      r0: radii[pIdx - 1] ?? radii[0],
      r1: radii[pIdx],
      swell: 0.62,
      spread: 0.92,
      style: "pointed",
      tier: 4,
      ribs: detail.ribbing ? 3 : 0,
    },
    field
  );
  outlines.push({
    id: "ornamental-petal-register",
    d: geo.outline,
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 4) * 0.68,
    strokeLinecap: cap,
  });
  ribbing.push({
    id: "ornamental-petal-ribs",
    d: geo.ribs,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.32,
    strokeOpacity: 0.5,
  });
  nodePoints.push(...geo.apexes);

  // --- Dial + micro stipple --------------------------------------------
  ornaments.push(
    graduationRing(radii[radii.length - 1] * 1.025, outerSegments * 8, R * 0.009, ink.construction, "ornamental-dial", {
      major: 8,
      majorScale: 2.2,
    })
  );
  ornaments.push({
    id: "ornamental-micro-stipple",
    d: ringPath(radii[radii.length - 1] * 1.055, field, 12),
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.8,
    strokeDasharray: "1 5",
    strokeOpacity: 0.85,
  });

  addLattice(layers, lattice);
  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);

  const axis: Point[] = [];
  for (let i = 0; i < radii.length; i += 2) axis.push(...anchorsOn(radii[i], segments));
  emitNodes(ctx, layers, [...nodePoints, ...axis], "ornamental-node", {
    r: Math.max(1.5, R * 0.0028),
    halo: false,
    max: 160,
  });

  emitBhupura(ctx, layers);
  emitBindu(ctx, layers);
}
