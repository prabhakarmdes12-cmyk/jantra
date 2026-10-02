import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { Point, SVGPathElementData } from "../../types/geometry";

export interface SriYantraOptions {
  radius: number;
  prana: number;
  stroke: string;
  fill?: string;
  accent: string;
  strokeWidth: number;
  strokeCap: "round" | "square" | "butt";
}

/**
 * Procedural mathematical generator for the 9 interlocking triangles of the Sri Yantra.
 * 4 Shiva triangles (pointing UP) and 5 Shakti triangles (pointing DOWN).
 */
export function generateSriYantraGeometry(
  options: SriYantraOptions,
  prng: PRNG
): SVGPathElementData[] {
  const { radius, prana, stroke, fill = "none", accent, strokeWidth, strokeCap } = options;
  const paths: SVGPathElementData[] = [];

  const R = radius;

  // Exact vertical coordinate anchors for the 9 triangles within the bounding radius R
  // 4 Upward Triangles (Shiva 1..4)
  // 5 Downward Triangles (Shakti 1..5)
  // Y-axis: -R is top, +R is bottom

  // Shiva 1: Large outermost upward
  const shiva1Apex: Point = [0, -R * 0.96];
  const shiva1BaseY = R * 0.62;
  const shiva1HalfWidth = R * 0.88;

  // Shiva 2: Upper mid upward
  const shiva2Apex: Point = [0, -R * 0.72];
  const shiva2BaseY = R * 0.42;
  const shiva2HalfWidth = R * 0.74;

  // Shiva 3: Center upward
  const shiva3Apex: Point = [0, -R * 0.48];
  const shiva3BaseY = R * 0.84;
  const shiva3HalfWidth = R * 0.62;

  // Shiva 4: Lower small upward
  const shiva4Apex: Point = [0, -R * 0.22];
  const shiva4BaseY = R * 0.28;
  const shiva4HalfWidth = R * 0.44;

  // Shakti 1: Large outermost downward
  const shakti1Apex: Point = [0, R * 0.96];
  const shakti1BaseY = -R * 0.62;
  const shakti1HalfWidth = R * 0.88;

  // Shakti 2: Lower mid downward
  const shakti2Apex: Point = [0, R * 0.76];
  const shakti2BaseY = -R * 0.42;
  const shakti2HalfWidth = R * 0.76;

  // Shakti 3: Center downward
  const shakti3Apex: Point = [0, R * 0.52];
  const shakti3BaseY = -R * 0.82;
  const shakti3HalfWidth = R * 0.65;

  // Shakti 4: Upper mid downward
  const shakti4Apex: Point = [0, R * 0.28];
  const shakti4BaseY = -R * 0.26;
  const shakti4HalfWidth = R * 0.48;

  // Shakti 5: Central innermost downward
  const shakti5Apex: Point = [0, R * 0.12];
  const shakti5BaseY = -R * 0.14;
  const shakti5HalfWidth = R * 0.28;

  const triangles: { apex: Point; baseY: number; halfW: number; isUp: boolean }[] = [
    { apex: shiva1Apex, baseY: shiva1BaseY, halfW: shiva1HalfWidth, isUp: true },
    { apex: shiva2Apex, baseY: shiva2BaseY, halfW: shiva2HalfWidth, isUp: true },
    { apex: shiva3Apex, baseY: shiva3BaseY, halfW: shiva3HalfWidth, isUp: true },
    { apex: shiva4Apex, baseY: shiva4BaseY, halfW: shiva4HalfWidth, isUp: true },
    { apex: shakti1Apex, baseY: shakti1BaseY, halfW: shakti1HalfWidth, isUp: false },
    { apex: shakti2Apex, baseY: shakti2BaseY, halfW: shakti2HalfWidth, isUp: false },
    { apex: shakti3Apex, baseY: shakti3BaseY, halfW: shakti3HalfWidth, isUp: false },
    { apex: shakti4Apex, baseY: shakti4BaseY, halfW: shakti4HalfWidth, isUp: false },
    { apex: shakti5Apex, baseY: shakti5BaseY, halfW: shakti5HalfWidth, isUp: false },
  ];

  let dTriangles = "";
  let dCenterTriangles = "";

  triangles.forEach((tri, index) => {
    const pApex = applyPrana(tri.apex[0], tri.apex[1], prana, prng, 3);
    const pLeft = applyPrana(-tri.halfW, tri.baseY, prana, prng, 3);
    const pRight = applyPrana(tri.halfW, tri.baseY, prana, prng, 3);

    const pathData = `M ${fmt(pApex[0])} ${fmt(pApex[1])} L ${fmt(pRight[0])} ${fmt(pRight[1])} L ${fmt(pLeft[0])} ${fmt(pLeft[1])} Z `;

    if (index === 8 || index === 3) {
      dCenterTriangles += pathData;
    } else {
      dTriangles += pathData;
    }
  });

  paths.push({
    id: "sri-yantra-9-triangles",
    d: dTriangles,
    stroke: stroke,
    strokeWidth: strokeWidth * 1.15,
    strokeLinecap: strokeCap,
    strokeLinejoin: "round",
    fill: fill,
  });

  if (dCenterTriangles.length > 0) {
    paths.push({
      id: "sri-yantra-innermost-triangles",
      d: dCenterTriangles,
      stroke: accent,
      strokeWidth: strokeWidth * 1.3,
      strokeLinecap: strokeCap,
      strokeLinejoin: "round",
      fill: fill,
    });
  }

  // Framing circle surrounding the 9 triangles before the lotus tiers
  paths.push({
    id: "sri-yantra-boundary-circle",
    d: `M 0 -${fmt(R)} A ${fmt(R)} ${fmt(R)} 0 1 0 0 ${fmt(R)} A ${fmt(R)} ${fmt(R)} 0 1 0 0 -${fmt(R)} Z`,
    stroke: stroke,
    strokeWidth: strokeWidth * 1.2,
    strokeDasharray: "none",
    fill: "none",
  });

  return paths;
}
