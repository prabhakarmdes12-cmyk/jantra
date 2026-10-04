/**
 * YANTRA (यन्त्र) — geometric precision. Nine interlocking Shiva–Shakti
 * triangles (the Sri Yantra archetype), stellated polygons and sharp
 * radial rays.
 *
 * Layout follows the canonical plate: navayoni core → ashta-dala padma →
 * shodasha-dala padma → ray collar → bhupura.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { buildSriYantra, interlockedPolygons, radialRays, sriYantraAnchors, stellatedPolygon } from "../atelier/yantra";
import { buildPetalRing } from "../atelier/petals";
import { graduationRing, spokes } from "../atelier/orbits";
import { circlePath, clamp, fmt, ringPath } from "../geom";
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

export function buildYantra(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, artR, segments, detail, density } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 1.05);

  const coreR = artR * 0.54;
  const padma8 = [artR * 0.5, artR * 0.73] as const;
  const padma16 = [artR * 0.72, artR * 0.92] as const;
  const rayBand = [artR * 0.92, artR * 1.0] as const;

  emitOrbits(ctx, layers, [coreR * 0.42, coreR * 0.74, coreR, padma16[0], padma16[1]], 2);

  const polys: SVGElementData[] = [];
  const ornaments: SVGElementData[] = [];
  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];

  // --- The nine interlocking triangles --------------------------------
  polys.push(...buildSriYantra({ radius: coreR, chordFactor: 0.985 }, ctx));

  // --- Construction chords that generated them ------------------------
  if (detail.construction) {
    let chords = "";
    for (const p of sriYantraAnchors(coreR)) {
      if (Math.abs(p[0]) < 0.01) continue;
      chords += `M ${fmt(-Math.abs(p[0]))} ${fmt(p[1])} L ${fmt(Math.abs(p[0]))} ${fmt(p[1])} `;
    }
    ornaments.push({
      id: "yantra-construction-chords",
      d: chords,
      fill: "none",
      stroke: ink.construction,
      strokeWidth: 0.5,
      strokeDasharray: "3 6",
      strokeOpacity: 0.4,
    });
    ornaments.push({
      id: "yantra-generating-circle",
      d: circlePath(coreR),
      fill: "none",
      stroke: ink.construction,
      strokeWidth: 0.55,
      strokeOpacity: 0.5,
    });
  }

  // --- Ashta-dala & shodasha-dala padma tiers --------------------------
  const lotusTiers: Array<[number, number, number]> = [
    [8, padma8[0], padma8[1]],
    [16, padma16[0], padma16[1]],
  ];
  lotusTiers.forEach(([count, r0, r1], i) => {
    const geo = buildPetalRing(
      {
        count,
        r0,
        r1,
        swell: 0.95,
        spread: 0.96,
        style: i === 0 ? "pointed" : "lobe",
        rotation: (i === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / count) + ctx.asymmetry,
        tier: 6 + i,
        ribs: detail.ribbing ? (i === 0 ? 5 : 3) : 0,
      },
      field
    );
    outlines.push({
      id: `yantra-padma-${count}`,
      d: geo.outline,
      fill: ink.accent,
      fillOpacity: i === 0 ? 0.05 : 0.03,
      stroke: ink.primary,
      strokeWidth: field.weight(weight, 6 + i) * (i === 0 ? 0.95 : 0.8),
      strokeLinecap: cap,
      strokeLinejoin: "round",
    });
    ribbing.push({
      id: `yantra-padma-ribs-${count}`,
      d: geo.ribs,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.35, weight * 0.36),
      strokeOpacity: 0.58,
    });
    ribbing.push({
      id: `yantra-padma-midrib-${count}`,
      d: geo.midrib,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.4, weight * 0.42),
      strokeOpacity: 0.75,
    });
  });

  // --- Stellated collars -----------------------------------------------
  polys.push({
    id: "yantra-stellation",
    d: stellatedPolygon(segments * 2, rayBand[1], rayBand[0], -Math.PI / 2 + ctx.asymmetry),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 3) * 0.7,
    strokeLinejoin: "miter",
    strokeOpacity: 0.9,
  });

  if (ctx.recursionDepth > 1) {
    polys.push({
      id: "yantra-interlocked",
      d: interlockedPolygons(
        segments >= 6 ? segments : 6,
        coreR * 1.02,
        clamp(ctx.recursionDepth, 2, 5),
        ctx.recursionScale
      ),
      fill: "none",
      stroke: ink.secondary,
      strokeWidth: field.weight(weight, 4) * 0.5,
      strokeLinejoin: "miter",
      strokeOpacity: 0.7,
    });
  }

  // --- Sharp radial rays ------------------------------------------------
  polys.push({
    id: "yantra-radial-rays",
    d: radialRays(segments * 4, rayBand[0], rayBand[1], ctx.asymmetry),
    fill: ink.accent,
    fillOpacity: 0.09,
    stroke: ink.accent,
    strokeWidth: field.weight(weight, 5) * 0.6,
    strokeLinejoin: "miter",
  });

  // --- Precision dial ---------------------------------------------------
  ornaments.push(
    graduationRing(artR * 1.045, 360, artR * 0.013, ink.construction, "yantra-degree-dial", {
      major: 15,
      majorScale: 2.6,
    })
  );
  ornaments.push({
    id: "yantra-dial-ring",
    d: ringPath(artR * 1.045, field, 9),
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.55,
    strokeOpacity: 0.55,
  });
  ornaments.push({
    id: "yantra-axis-comb",
    d: spokes(segments * 2, padma16[1] * 1.01, rayBand[0] * 0.99, field, 10),
    fill: "none",
    stroke: ink.secondary,
    strokeWidth: 0.6,
    strokeOpacity: 0.7,
    strokeDasharray: "2 6",
  });
  if (detail.stipple || density > 0.4) {
    ornaments.push({
      id: "yantra-stipple-orbit",
      d: ringPath(padma8[0] * 0.98, field, 11),
      fill: "none",
      stroke: ink.accent,
      strokeWidth: 0.85,
      strokeDasharray: "1 8",
      strokeOpacity: 0.85,
    });
  }

  addPolygons(layers, polys);
  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);

  const nodes: Point[] = [
    ...sriYantraAnchors(coreR),
    ...anchorsOn(rayBand[1], segments * 2, -Math.PI / 2 + ctx.asymmetry),
    ...anchorsOn(padma8[1], 8, -Math.PI / 2),
  ];
  emitNodes(ctx, layers, nodes, "yantra-node", { r: Math.max(2, artR * 0.0042), halo: true, max: 90 });

  emitBhupura(ctx, layers, { steps: clamp(ctx.recipe.parameters.motifs.bhupura.steps, 2, 4) });
  emitBindu(ctx, layers);
}
