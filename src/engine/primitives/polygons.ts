import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { Point, SVGPathElementData } from "../../types/geometry";

export interface PolygonsOptions {
  motifType: "triangle" | "star";
  radius: number;
  segments: number;
  recursionDepth: number;
  recursionScale: number;
  prana: number;
  stroke: string;
  fill?: string;
  accent: string;
  strokeWidth: number;
  strokeCap: "round" | "square" | "butt";
}

/**
 * Generate regular polygon path string
 */
export function generateRegularPolygonPath(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  startAngle: number,
  prana: number,
  prng: PRNG
): string {
  if (sides < 3) return "";
  const angleStep = (Math.PI * 2) / sides;
  let d = "";

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const [px, py] = applyPrana(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      prana,
      prng,
      3
    );

    if (i === 0) {
      d += `M ${fmt(px)} ${fmt(py)} `;
    } else {
      d += `L ${fmt(px)} ${fmt(py)} `;
    }
  }

  d += "Z ";
  return d;
}

/**
 * Generate star polygon / stellated path
 */
export function generateStarPolygonPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  startAngle: number,
  prana: number,
  prng: PRNG
): string {
  const totalVertices = points * 2;
  const angleStep = Math.PI / points;
  let d = "";

  for (let i = 0; i < totalVertices; i++) {
    const angle = startAngle + i * angleStep;
    const r = (i % 2 === 0) ? outerRadius : innerRadius;
    const [px, py] = applyPrana(
      cx + Math.cos(angle) * r,
      cy + Math.sin(angle) * r,
      prana,
      prng,
      3
    );

    if (i === 0) {
      d += `M ${fmt(px)} ${fmt(py)} `;
    } else {
      d += `L ${fmt(px)} ${fmt(py)} `;
    }
  }

  d += "Z ";
  return d;
}

/**
 * Generate interlocking sacred triangles (Trikona / Shiva-Shakti Sri Yantra geometry)
 */
export function generateInterlockingTriangles(
  radius: number,
  depth: number,
  prana: number,
  prng: PRNG
): string {
  let d = "";
  // In traditional yantras, 4 upward (Shiva) and 5 downward (Shakti) or 3 up and 3 down
  const triangleCount = Math.max(2, Math.min(6, depth + 2));

  for (let i = 0; i < triangleCount; i++) {
    const isUpward = i % 2 === 0;
    const scaleFactor = 1.0 - (i * 0.13);
    const r = radius * scaleFactor;
    const offsetAngle = isUpward ? -Math.PI / 2 : Math.PI / 2;

    const v1: Point = [r * Math.cos(offsetAngle), r * Math.sin(offsetAngle)];
    const v2: Point = [r * Math.cos(offsetAngle + (2 * Math.PI) / 3), r * Math.sin(offsetAngle + (2 * Math.PI) / 3)];
    const v3: Point = [r * Math.cos(offsetAngle + (4 * Math.PI) / 3), r * Math.sin(offsetAngle + (4 * Math.PI) / 3)];

    const pv1 = applyPrana(v1[0], v1[1], prana, prng, 3);
    const pv2 = applyPrana(v2[0], v2[1], prana, prng, 3);
    const pv3 = applyPrana(v3[0], v3[1], prana, prng, 3);

    d += `M ${fmt(pv1[0])} ${fmt(pv1[1])} L ${fmt(pv2[0])} ${fmt(pv2[1])} L ${fmt(pv3[0])} ${fmt(pv3[1])} Z `;
  }

  return d;
}

export function generatePolygonsLayer(
  options: PolygonsOptions,
  prng: PRNG
): SVGPathElementData[] {
  const {
    motifType,
    radius,
    segments,
    recursionDepth,
    recursionScale,
    prana,
    stroke,
    fill = "none",
    accent,
    strokeWidth,
    strokeCap,
  } = options;

  const paths: SVGPathElementData[] = [];

  if (motifType === "triangle") {
    // Interlocking Shiva-Shakti triangles
    const dTriangles = generateInterlockingTriangles(radius, recursionDepth, prana, prng);

    paths.push({
      id: "polygons-triangles-interlocking",
      d: dTriangles,
      stroke: stroke,
      strokeWidth: strokeWidth,
      strokeLinecap: strokeCap,
      strokeLinejoin: "round",
      fill: fill,
    });

    // If segments > 4, add a radial polygonal ring
    if (segments >= 4) {
      const dOuterPoly = generateRegularPolygonPath(
        0,
        0,
        radius * 1.15,
        segments,
        -Math.PI / 2,
        prana,
        prng
      );
      paths.push({
        id: "polygons-outer-ngon",
        d: dOuterPoly,
        stroke: accent,
        strokeWidth: Math.max(0.6, strokeWidth * 0.75),
        strokeLinecap: strokeCap,
        strokeDasharray: "4 3",
        fill: "none",
      });
    }

  } else if (motifType === "star") {
    // Star polygons with recursive nesting
    let dStars = "";
    let currentR = radius;

    for (let d = 0; d <= Math.min(4, recursionDepth); d++) {
      const innerRatio = 0.45 + (d % 2) * 0.1;
      const angleOffset = (d * Math.PI) / segments;
      dStars += generateStarPolygonPath(
        0,
        0,
        currentR,
        currentR * innerRatio,
        Math.max(3, segments),
        -Math.PI / 2 + angleOffset,
        prana,
        prng
      );
      currentR *= recursionScale;
    }

    paths.push({
      id: "polygons-star-nested",
      d: dStars,
      stroke: stroke,
      strokeWidth: strokeWidth,
      strokeLinecap: strokeCap,
      strokeLinejoin: "round",
      fill: fill,
    });
  }

  return paths;
}
