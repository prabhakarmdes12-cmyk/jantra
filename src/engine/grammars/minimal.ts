/**
 * MINIMAL (शून्य) — extremely sparse, poster-quality geometry. Bold focal
 * bindu, stark high-contrast lines, generous harmonic negative space.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildPetalRing } from "../atelier/petals";
import { M, L, TWO_PI, circlePath, clamp, polar, ringPath, diamondPath } from "../geom";
import {
  addOrnaments,
  addPetalLayers,
  emitBackground,
  emitBindu,
  emitNodes,
} from "./shared";

export function buildMinimal(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, R, segments, detail } = ctx;

  emitBackground(ctx, layers);

  const ornaments: SVGElementData[] = [];
  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  const nodes: Point[] = [];

  const heavy = Math.max(1.6, weight * 2.1);
  const r1 = R * 0.9;
  const r2 = R * 0.62;
  const r3 = R * 0.3;

  // --- Two decisive rings, one hairline --------------------------------
  ornaments.push({
    id: "minimal-ring-outer",
    d: ringPath(r1, field, 1),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(heavy, 1),
    strokeLinecap: cap,
  });
  ornaments.push({
    id: "minimal-ring-hairline",
    d: circlePath(r1 * 1.035),
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: 0.6,
    strokeOpacity: 0.7,
  });
  ornaments.push({
    id: "minimal-ring-mid",
    d: ringPath(r2, field, 2),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(heavy, 2) * 0.55,
    strokeDasharray: "2 10",
    strokeLinecap: "round",
  });

  // --- One restrained petal register -----------------------------------
  const petalCount = clamp(segments, 3, 12);
  const geo = buildPetalRing(
    {
      count: petalCount,
      r0: r3,
      r1: r2 * 0.97,
      swell: 0.74,
      spread: 0.9,
      style: "pointed",
      rotation: -Math.PI / 2 + ctx.asymmetry,
      tier: 1,
      ribs: detail.ribbing ? 3 : 0,
    },
    field
  );
  outlines.push({
    id: "minimal-petals",
    d: geo.outline,
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(heavy, 1) * 0.72,
    strokeLinecap: cap,
    strokeLinejoin: "round",
  });
  if (detail.ribbing) {
    ribbing.push({
      id: "minimal-ribs",
      d: geo.ribs,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: 0.55,
      strokeOpacity: 0.55,
    });
  }
  nodes.push(...geo.apexes);

  // --- Single horizon axis + terminal diamonds -------------------------
  let axis = "";
  let marks = "";
  for (let i = 0; i < 2; i++) {
    const a = (i * Math.PI) / 2;
    axis += M(polar(r1 * 1.08, a)) + L(polar(r1 * 1.08, a + Math.PI));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TWO_PI;
    marks += diamondPath(polar(r1 * 1.14, a), R * 0.012, Math.PI / 4);
  }
  ornaments.push({
    id: "minimal-axis",
    d: axis,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.6,
    strokeOpacity: 0.45,
  });
  ornaments.push({
    id: "minimal-axis-terminals",
    d: marks,
    fill: ink.accent,
    fillOpacity: 0.9,
    stroke: "none",
  });

  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);
  emitNodes(ctx, layers, nodes, "minimal-node", { r: Math.max(2.4, R * 0.0045), halo: true, max: 16 });

  // --- The bindu carries the whole poster ------------------------------
  emitBindu(ctx, layers, { scale: 2.3, bold: true });
}
