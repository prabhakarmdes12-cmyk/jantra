/**
 * MANDALA (मण्डल) — radial harmony. Dense concentric rings of alternating
 * geometric serrations, lotus corollas and celestial intersection nodes.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildPetalRing, PetalStyle, scallopBand, serratedBand } from "../atelier/petals";
import { beadRing, graduationRing, spokes } from "../atelier/orbits";
import { clamp, ringPath } from "../geom";
import {
  addOrnaments,
  addPetalLayers,
  anchorsOn,
  countForRadius,
  emitBackground,
  emitBhupura,
  emitBindu,
  emitConstruction,
  emitNodes,
  emitOrbits,
} from "./shared";

type Treatment = "corolla" | "serration" | "scallop" | "comb" | "bead";

/** Repeating rhythm of register treatments, inner → outer. */
const RHYTHM: Treatment[] = ["corolla", "bead", "serration", "corolla", "comb", "scallop", "corolla", "serration"];

export function buildMandala(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, artR, segments, outerSegments, density, detail } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 0.9);

  // A mandala wants more registers than the generic ring count.
  const registerCount = clamp(ctx.recipe.parameters.rings.count + 2 + Math.round(density * 4), 5, 12);
  const stack = ctx.bands(registerCount);
  emitOrbits(ctx, layers, [...stack.map((b) => b.r0).slice(1), artR], 1);

  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  const ornaments: SVGElementData[] = [];
  const nodePoints: Point[] = [];

  stack.forEach((band) => {
    const { r0, r1, i } = band;
    const span = r1 - r0;
    if (span < 6) return;
    const tier = i + 2;
    const treatment = RHYTHM[i % RHYTHM.length];
    const count = countForRadius(ctx, (r0 + r1) / 2, segments);

    if (treatment === "corolla") {
      const style: PetalStyle = i % 4 === 0 ? "lobe" : i % 4 === 2 ? "pointed" : "leaf";
      const geo = buildPetalRing(
        {
          count,
          r0: r0 + span * 0.02,
          r1: r1 - span * 0.02,
          swell: 0.95,
          spread: 0.97,
          style,
          rotation: (i % 2 === 0 ? 0 : Math.PI / count) + ctx.asymmetry,
          tier,
          ribs: detail.ribbing ? clamp(detail.ribCount - Math.floor(i / 3), 3, 7) : 0,
        },
        field
      );
      outlines.push({
        id: `mandala-corolla-${i}`,
        d: geo.outline,
        fill: i % 4 === 0 ? ink.accent : ink.primary,
        fillOpacity: i % 4 === 0 ? 0.04 : 0.02,
        stroke: ink.primary,
        strokeWidth: field.weight(weight, tier) * 0.9,
        strokeLinecap: cap,
        strokeLinejoin: "round",
      });
      ribbing.push({
        id: `mandala-corolla-ribs-${i}`,
        d: geo.ribs,
        fill: "none",
        stroke: ink.accent,
        strokeWidth: Math.max(0.33, weight * 0.36),
        strokeOpacity: 0.55,
      });
      ribbing.push({
        id: `mandala-corolla-midrib-${i}`,
        d: geo.midrib,
        fill: "none",
        stroke: ink.accent,
        strokeWidth: Math.max(0.35, weight * 0.42),
        strokeOpacity: 0.7,
      });
      nodePoints.push(...geo.apexes);
    } else if (treatment === "serration") {
      ornaments.push({
        id: `mandala-serration-${i}`,
        d: serratedBand(count * 2, r0 + span * 0.2, r1 - span * 0.08, field, tier, Math.PI / (count * 2)),
        fill: ink.primary,
        fillOpacity: 0.02,
        stroke: ink.secondary,
        strokeWidth: field.weight(weight, tier) * 0.6,
        strokeLinejoin: "miter",
      });
      ornaments.push({
        id: `mandala-serration-inner-${i}`,
        d: serratedBand(count * 2, r0 + span * 0.34, r1 - span * 0.26, field, tier + 0.4, Math.PI / (count * 2)),
        fill: "none",
        stroke: ink.accent,
        strokeWidth: Math.max(0.35, weight * 0.38),
        strokeLinejoin: "miter",
        strokeOpacity: 0.7,
      });
    } else if (treatment === "scallop") {
      ornaments.push({
        id: `mandala-scallop-${i}`,
        d: scallopBand(count * 2, r0 + span * 0.3, span * 0.52, Math.PI / (count * 2)),
        fill: "none",
        stroke: ink.primary,
        strokeWidth: field.weight(weight, tier) * 0.62,
        strokeOpacity: 0.92,
      });
      ornaments.push({
        id: `mandala-scallop-echo-${i}`,
        d: scallopBand(count * 2, r0 + span * 0.52, span * 0.34, Math.PI / (count * 2)),
        fill: "none",
        stroke: ink.secondary,
        strokeWidth: 0.5,
        strokeOpacity: 0.7,
      });
    } else if (treatment === "bead") {
      ornaments.push({
        id: `mandala-bead-${i}`,
        d: beadRing(r0 + span * 0.5, count * 3, Math.min(Math.max(0.9, span * 0.09), artR * 0.011), field, tier),
        fill: i % 3 === 0 ? ink.accent : ink.primary,
        fillOpacity: 0.9,
        stroke: "none",
      });
      ornaments.push({
        id: `mandala-bead-track-${i}`,
        d: ringPath(r0 + span * 0.5, field, tier),
        fill: "none",
        stroke: ink.secondary,
        strokeWidth: 0.45,
        strokeOpacity: 0.6,
      });
    } else {
      ornaments.push({
        id: `mandala-comb-${i}`,
        d: spokes(count * 3, r0 + span * 0.16, r1 - span * 0.16, field, tier, Math.PI / (count * 3)),
        fill: "none",
        stroke: ink.secondary,
        strokeWidth: Math.max(0.4, field.weight(weight, tier) * 0.45),
        strokeLinecap: cap,
        strokeOpacity: 0.9,
      });
      ornaments.push({
        id: `mandala-comb-major-${i}`,
        d: spokes(count, r0 + span * 0.08, r1 - span * 0.08, field, tier, ctx.asymmetry),
        fill: "none",
        stroke: ink.accent,
        strokeWidth: Math.max(0.5, field.weight(weight, tier) * 0.55),
        strokeLinecap: cap,
        strokeOpacity: 0.85,
      });
    }
  });

  // --- Outer collar ----------------------------------------------------
  ornaments.push({
    id: "mandala-micro-stipple",
    d: ringPath(artR * 1.04, field, 14),
    fill: "none",
    stroke: ink.accent,
    strokeWidth: 0.9,
    strokeDasharray: "1 8",
    strokeOpacity: 0.85,
  });
  ornaments.push(
    graduationRing(artR * 1.07, outerSegments * 6, artR * 0.016, ink.construction, "mandala-graduations", {
      major: 6,
      majorScale: 2.4,
    })
  );

  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);

  // --- Celestial intersections ----------------------------------------
  const axis: Point[] = [];
  for (const band of stack) axis.push(...anchorsOn(band.r0, segments, ctx.asymmetry));
  emitNodes(ctx, layers, [...nodePoints, ...axis], "mandala-node", {
    r: Math.max(1.7, artR * 0.004),
    halo: true,
    max: 150,
  });

  emitBhupura(ctx, layers);
  emitBindu(ctx, layers);
}
