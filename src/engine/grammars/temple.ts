/**
 * TEMPLE (मन्दिर) — architectural nested enclosures, sanctum sanctorum
 * plans, mandapa grid pillars, layered stepped gateways and corner
 * alignment brackets.
 */

import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder } from "../context";
import { cornerBrackets } from "../atelier/construction";
import { pillarRing } from "../atelier/yantra";
import { buildPetalRing } from "../atelier/petals";
import { graduationRing } from "../atelier/orbits";
import { L, M, closedPolyPath, clamp, fmt, polar, TWO_PI } from "../geom";
import {
  addArchitecture,
  addOrnaments,
  addPetalLayers,
  emitBackground,
  emitBhupura,
  emitBindu,
  emitConstruction,
  emitNodes,
} from "./shared";

/** Square ring with chamfered / stepped corners. */
function enclosure(half: number, step: number, chamfer: number): string {
  const c = chamfer;
  const h = half;
  const pts: Point[] = [
    [-h + c, -h],
    [h - c, -h],
    [h, -h + c],
    [h, h - c],
    [h - c, h],
    [-h + c, h],
    [-h, h - c],
    [-h, -h + c],
  ];
  void step;
  return closedPolyPath(pts);
}

export function buildTemple(ctx: BuildContext, layers: LayerBuilder): void {
  const { ink, field, weight, cap, R, segments, density, detail } = ctx;

  emitBackground(ctx, layers);
  emitConstruction(ctx, layers, 1);

  const arch: SVGElementData[] = [];
  const ornaments: SVGElementData[] = [];
  const nodePoints: Point[] = [];

  // --- Nested prakara enclosure walls, alternating orthogonal / 45° ---
  const wallCount = clamp(3 + ctx.recursionDepth, 3, 7);
  for (let i = 0; i < wallCount; i++) {
    const t = i / wallCount;
    const half = R * (0.82 - t * 0.62);
    if (half < R * 0.08) break;
    const rotated = i % 2 === 1;
    const chamfer = half * (rotated ? 0.3 : 0.14);
    const w = field.weight(weight, 20 + i);

    const d = enclosure(half, 0, chamfer);
    arch.push({
      id: `temple-prakara-${i}`,
      d,
      fill: "none",
      stroke: i === 0 ? ink.primary : ink.secondary,
      strokeWidth: w * (i === 0 ? 1.2 : 0.85),
      strokeLinejoin: "miter",
      strokeLinecap: "butt",
      ...(rotated ? {} : {}),
    });
    // Inner face of the same wall — the double line
    arch.push({
      id: `temple-prakara-${i}-inner`,
      d: enclosure(half - Math.max(4, half * 0.028), 0, chamfer * 0.92),
      fill: "none",
      stroke: ink.secondary,
      strokeWidth: Math.max(0.4, w * 0.42),
      strokeLinejoin: "miter",
      strokeOpacity: 0.85,
    });

    nodePoints.push([half, 0], [-half, 0], [0, half], [0, -half]);
  }

  // --- Mandapa pillar grid rings --------------------------------------
  const pillarRings = clamp(1 + Math.round(density * 3), 1, 3);
  for (let p = 0; p < pillarRings; p++) {
    const rInner = R * (0.34 + p * 0.16);
    const rOuter = rInner + R * 0.085;
    const count = segments * (p === 0 ? 2 : 1) + p * 4;
    const { shafts, capitals } = pillarRing(count, rInner, rOuter, Math.max(2.2, R * 0.0075), (p * Math.PI) / count);
    arch.push({
      id: `temple-pillars-${p}`,
      d: shafts,
      fill: ink.accent,
      fillOpacity: 0.07,
      stroke: ink.primary,
      strokeWidth: field.weight(weight, 25 + p) * 0.6,
      strokeLinejoin: "miter",
    });
    arch.push({
      id: `temple-pillar-capitals-${p}`,
      d: capitals,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: field.weight(weight, 26 + p) * 0.5,
      strokeOpacity: 0.85,
    });
    for (let i = 0; i < count; i++) nodePoints.push(polar(rOuter, (p * Math.PI) / count + (i / count) * TWO_PI));
  }

  // --- Garbhagriha: the sanctum plan ----------------------------------
  const sanctum = R * 0.2;
  arch.push({
    id: "temple-garbhagriha",
    d: enclosure(sanctum, 0, sanctum * 0.22) + enclosure(sanctum * 0.72, 0, sanctum * 0.16),
    fill: ink.accent,
    fillOpacity: 0.05,
    stroke: ink.primary,
    strokeWidth: field.weight(weight, 30) * 1.1,
    strokeLinejoin: "miter",
  });

  // Sanctum threshold stepping on the four approaches
  let thresholds = "";
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    for (let k = 1; k <= 3; k++) {
      const rr = sanctum * (1 + k * 0.14);
      const hw = sanctum * (0.46 - k * 0.1);
      thresholds += M([c * rr - s * -hw, s * rr + c * -hw]) + L([c * rr - s * hw, s * rr + c * hw]);
    }
  }
  arch.push({
    id: "temple-thresholds",
    d: thresholds,
    fill: "none",
    stroke: ink.accent,
    strokeWidth: field.weight(weight, 31) * 0.7,
    strokeLinecap: "butt",
  });

  // --- Stepped vimana shikhara profile hinted as concentric steps -----
  let shikhara = "";
  const stepCount = clamp(4 + ctx.recursionDepth, 4, 9);
  for (let i = 0; i < stepCount; i++) {
    const half = sanctum * (1.9 + i * 0.34);
    const notch = half * 0.1;
    shikhara +=
      `M ${fmt(-half)} ${fmt(-half + notch)} L ${fmt(-half + notch)} ${fmt(-half + notch)} ` +
      `L ${fmt(-half + notch)} ${fmt(-half)} `;
    shikhara +=
      `M ${fmt(half)} ${fmt(-half + notch)} L ${fmt(half - notch)} ${fmt(-half + notch)} ` +
      `L ${fmt(half - notch)} ${fmt(-half)} `;
    shikhara +=
      `M ${fmt(half)} ${fmt(half - notch)} L ${fmt(half - notch)} ${fmt(half - notch)} ` +
      `L ${fmt(half - notch)} ${fmt(half)} `;
    shikhara +=
      `M ${fmt(-half)} ${fmt(half - notch)} L ${fmt(-half + notch)} ${fmt(half - notch)} ` +
      `L ${fmt(-half + notch)} ${fmt(half)} `;
  }
  ornaments.push({
    id: "temple-shikhara-steps",
    d: shikhara,
    fill: "none",
    stroke: ink.construction,
    strokeWidth: 0.6,
    strokeOpacity: 0.5,
    strokeLinecap: "butt",
  });

  // --- Corner alignment brackets at three scales ----------------------
  ornaments.push(cornerBrackets(R * 0.88, R * 0.09, ink.accent, "temple-brackets-outer", weight * 0.9, 0.9));
  ornaments.push(cornerBrackets(R * 0.56, R * 0.06, ink.construction, "temple-brackets-mid", 0.7, 0.6));
  ornaments.push(cornerBrackets(sanctum * 1.42, sanctum * 0.3, ink.accent, "temple-brackets-sanctum", 0.8, 0.75));

  // --- A single restrained lotus register softens the architecture ----
  const petalR0 = R * 0.6;
  const petalR1 = R * 0.78;
  const outlines: SVGElementData[] = [];
  const ribbing: SVGElementData[] = [];
  if (petalR1 - petalR0 > 16) {
    const geo = buildPetalRing(
      {
        count: segments * 2,
        r0: petalR0,
        r1: petalR1,
        swell: 0.9,
        spread: 0.94,
        style: "pointed",
        rotation: Math.PI / (segments * 2),
        tier: 2,
        ribs: detail.ribbing ? 3 : 0,
      },
      field
    );
    outlines.push({
      id: "temple-lotus-register",
      d: geo.outline,
      fill: ink.accent,
      fillOpacity: 0.04,
      stroke: ink.primary,
      strokeWidth: field.weight(weight, 2) * 0.85,
      strokeLinecap: cap,
      strokeLinejoin: "round",
    });
    ribbing.push({
      id: "temple-lotus-ribs",
      d: geo.ribs,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.4, weight * 0.38),
      strokeOpacity: 0.6,
    });
    ribbing.push({
      id: "temple-lotus-midrib",
      d: geo.midrib,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.42, weight * 0.44),
      strokeOpacity: 0.75,
    });
    nodePoints.push(...geo.apexes);
  }

  ornaments.push(
    graduationRing(R * 0.93, segments * 8, R * 0.012, ink.construction, "temple-graduations", { major: 8, majorScale: 2 })
  );

  addArchitecture(layers, arch);
  addPetalLayers(layers, outlines, ribbing);
  addOrnaments(layers, ornaments);
  emitNodes(ctx, layers, nodePoints, "temple-node", { r: Math.max(1.8, R * 0.0032), halo: true, max: 80 });

  emitBhupura(ctx, layers, { steps: clamp(ctx.recipe.parameters.motifs.bhupura.steps + 1, 2, 4) });
  emitBindu(ctx, layers, { scale: 0.85 });
}
