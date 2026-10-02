import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { rotatePoint } from "../transforms/symmetry";
import { SVGPathElementData } from "../../types/geometry";

export interface KolamOptions {
  radius: number;
  segments: number;
  density: number;
  prana: number;
  stroke: string;
  fill?: string;
  accent: string;
  strokeWidth: number;
  strokeCap: "round" | "square" | "butt";
}

/**
 * Procedural continuous Sikku Kolam / Brahma Mudi interlacing loop generator.
 * Creates smooth cubic bezier knots weaving around concentric radial pulli (dots).
 */
export function generateKolamGeometry(
  options: KolamOptions,
  prng: PRNG
): SVGPathElementData[] {
  const { radius, segments, density, prana, stroke, accent, strokeWidth, strokeCap } = options;
  const paths: SVGPathElementData[] = [];

  const count = Math.max(4, segments);
  const angleStep = (Math.PI * 2) / count;
  const halfAngle = angleStep / 2;

  const rOuter = radius;
  const rMid = radius * 0.62;
  const rInner = radius * 0.32;

  let dMainLoops = "";
  let dInterlacedKnots = "";
  let dDots = "";

  for (let i = 0; i < count; i++) {
    const centerAngle = i * angleStep;

    // 1. Brahma Mudi / Sikku Loop: An infinity-shaped loop radiating outwards
    // Loop control points in local frame:
    const p1 = rotatePoint([rInner, -rInner * Math.tan(halfAngle * 0.6)], centerAngle);
    const cp1a = rotatePoint([rMid * 0.8, -rMid * 0.6], centerAngle);
    const cp1b = rotatePoint([rOuter * 0.95, -rOuter * 0.3], centerAngle);
    const pApex = rotatePoint([rOuter, 0], centerAngle);
    const cp2a = rotatePoint([rOuter * 0.95, rOuter * 0.3], centerAngle);
    const cp2b = rotatePoint([rMid * 0.8, rMid * 0.6], centerAngle);
    const p2 = rotatePoint([rInner, rInner * Math.tan(halfAngle * 0.6)], centerAngle);

    // Apply Prana
    const pp1 = applyPrana(p1[0], p1[1], prana, prng, 3);
    const pcp1a = applyPrana(cp1a[0], cp1a[1], prana, prng, 4);
    const pcp1b = applyPrana(cp1b[0], cp1b[1], prana, prng, 4);
    const ppApex = applyPrana(pApex[0], pApex[1], prana, prng, 4);
    const pcp2a = applyPrana(cp2a[0], cp2a[1], prana, prng, 4);
    const pcp2b = applyPrana(cp2b[0], cp2b[1], prana, prng, 4);
    const pp2 = applyPrana(p2[0], p2[1], prana, prng, 3);

    dMainLoops += `M ${fmt(pp1[0])} ${fmt(pp1[1])} ` +
      `C ${fmt(pcp1a[0])} ${fmt(pcp1a[1])}, ${fmt(pcp1b[0])} ${fmt(pcp1b[1])}, ${fmt(ppApex[0])} ${fmt(ppApex[1])} ` +
      `C ${fmt(pcp2a[0])} ${fmt(pcp2a[1])}, ${fmt(pcp2b[0])} ${fmt(pcp2b[1])}, ${fmt(pp2[0])} ${fmt(pp2[1])} `;

    // 2. Interlacing crossover arches between adjacent segments
    const nextAngle = centerAngle + angleStep;
    const bridgeStart = p2;
    const bridgeEnd = rotatePoint([rInner, -rInner * Math.tan(halfAngle * 0.6)], nextAngle);
    const bridgeApex = rotatePoint([rInner * 0.6, 0], centerAngle + halfAngle);

    const pbs = applyPrana(bridgeStart[0], bridgeStart[1], prana, prng, 3);
    const pbe = applyPrana(bridgeEnd[0], bridgeEnd[1], prana, prng, 3);
    const pba = applyPrana(bridgeApex[0], bridgeApex[1], prana, prng, 3);

    dInterlacedKnots += `M ${fmt(pbs[0])} ${fmt(pbs[1])} Q ${fmt(pba[0])} ${fmt(pba[1])}, ${fmt(pbe[0])} ${fmt(pbe[1])} `;

    // 3. Kolam Pulli (Sacred grid dots)
    const dotPoint = rotatePoint([rMid, 0], centerAngle);
    const pDot = applyPrana(dotPoint[0], dotPoint[1], prana, prng, 2);
    dDots += `M ${fmt(pDot[0])} ${fmt(pDot[1])} m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0 `;

    if (density > 0.4) {
      const dotOuter = rotatePoint([rOuter * 0.82, rOuter * 0.22], centerAngle);
      const pDotOut = applyPrana(dotOuter[0], dotOuter[1], prana, prng, 2);
      dDots += `M ${fmt(pDotOut[0])} ${fmt(pDotOut[1])} m -1.5, 0 a 1.5,1.5 0 1,0 3,0 a 1.5,1.5 0 1,0 -3,0 `;
    }
  }

  paths.push({
    id: "kolam-continuous-loops",
    d: dMainLoops,
    stroke: stroke,
    strokeWidth: strokeWidth * 1.3,
    strokeLinecap: strokeCap,
    strokeLinejoin: "round",
    fill: "none",
  });

  paths.push({
    id: "kolam-interlaced-bridges",
    d: dInterlacedKnots,
    stroke: stroke,
    strokeWidth: strokeWidth * 1.1,
    strokeLinecap: strokeCap,
    strokeLinejoin: "round",
    fill: "none",
  });

  if (dDots.length > 0) {
    paths.push({
      id: "kolam-pulli-dots",
      d: dDots,
      fill: accent,
      stroke: "none",
    });
  }

  return paths;
}
