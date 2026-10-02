import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { RingSpacing } from "../../types/recipe";
import { SVGCircleElementData, SVGPathElementData } from "../../types/geometry";

export interface RingsOptions {
  count: number;
  spacing: RingSpacing;
  maxRadius: number;
  minRadius: number;
  density: number;
  prana: number;
  showGuideLines?: boolean;
  stroke: string;
  accent: string;
  strokeWidth: number;
  symmetrySegments: number;
}

export function computeRingRadii(
  count: number,
  spacing: RingSpacing,
  minRadius: number,
  maxRadius: number
): number[] {
  const n = Math.max(1, Math.min(12, count));
  const radii: number[] = [];
  const range = maxRadius - minRadius;
  const phi = 1.61803398875;

  for (let i = 1; i <= n; i++) {
    const t = i / n;
    let r = 0;
    if (spacing === "linear") {
      r = minRadius + range * t;
    } else if (spacing === "harmonic") {
      r = minRadius + range * Math.sqrt(t);
    } else if (spacing === "exponential") {
      r = minRadius + range * Math.pow(t, 1.6);
    } else if (spacing === "golden") {
      const phiFactor = (Math.pow(phi, i) - 1) / (Math.pow(phi, n) - 1);
      r = minRadius + range * phiFactor;
    }
    radii.push(r);
  }

  return radii;
}

export function generateRings(
  options: RingsOptions,
  prng: PRNG
): { rings: SVGCircleElementData[]; ornaments: SVGPathElementData[]; guideLines: SVGPathElementData[] } {
  const {
    count,
    spacing,
    maxRadius,
    minRadius,
    density,
    prana,
    showGuideLines = false,
    stroke,
    accent,
    strokeWidth,
    symmetrySegments,
  } = options;

  const rings: SVGCircleElementData[] = [];
  const ornaments: SVGPathElementData[] = [];
  const guideLines: SVGPathElementData[] = [];

  const radii = computeRingRadii(count, spacing, minRadius, maxRadius);

  // 1. Concentric baseline rings
  radii.forEach((r, idx) => {
    const isOuter = idx === radii.length - 1;
    const isAccent = idx % 2 === 1 && idx < radii.length - 1;

    rings.push({
      id: `ring-${idx + 1}`,
      cx: 0,
      cy: 0,
      r,
      fill: "none",
      stroke: isAccent ? accent : stroke,
      strokeWidth: isOuter ? strokeWidth * 1.3 : isAccent ? strokeWidth * 0.8 : strokeWidth,
      strokeDasharray: (idx % 3 === 2 && density > 0.4) ? "4 4" : undefined,
    });

    // Outer double-ring track
    if (isOuter && count > 2) {
      rings.push({
        id: `ring-outer-track`,
        cx: 0,
        cy: 0,
        r: r * 1.04,
        fill: "none",
        stroke: stroke,
        strokeWidth: strokeWidth * 0.75,
      });
    }
  });

  // 2. Guide lines (subtle radial spokes and dashed circles)
  if (showGuideLines) {
    const spokeCount = Math.max(4, symmetrySegments * 2);
    let dGuideSpokes = "";
    const outerR = maxRadius * 1.08;

    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * Math.PI * 2) / spokeCount;
      const x1 = Math.cos(angle) * (minRadius * 0.5);
      const y1 = Math.sin(angle) * (minRadius * 0.5);
      const x2 = Math.cos(angle) * outerR;
      const y2 = Math.sin(angle) * outerR;
      dGuideSpokes += `M ${fmt(x1)} ${fmt(y1)} L ${fmt(x2)} ${fmt(y2)} `;
    }

    guideLines.push({
      id: "guide-lines-spokes",
      d: dGuideSpokes,
      stroke: accent,
      strokeWidth: 0.6,
      strokeDasharray: "2 4",
      strokeLinecap: "round",
      className: "opacity-40",
    });
  }

  // 3. Ring ornaments (radial ticks, pearls/dots, or chevron bands on the outer rings if density is higher)
  if (density > 0.25 && radii.length >= 2) {
    const targetRingRadius = radii[radii.length - 1];
    const tickCount = symmetrySegments * (density > 0.6 ? 4 : 2);
    const tickLen = 6 + density * 8;
    let dTicks = "";

    for (let i = 0; i < tickCount; i++) {
      const angle = (i * Math.PI * 2) / tickCount;
      const [x1, y1] = applyPrana(
        Math.cos(angle) * (targetRingRadius - tickLen / 2),
        Math.sin(angle) * (targetRingRadius - tickLen / 2),
        prana,
        prng,
        4
      );
      const [x2, y2] = applyPrana(
        Math.cos(angle) * (targetRingRadius + tickLen / 2),
        Math.sin(angle) * (targetRingRadius + tickLen / 2),
        prana,
        prng,
        4
      );
      dTicks += `M ${fmt(x1)} ${fmt(y1)} L ${fmt(x2)} ${fmt(y2)} `;
    }

    ornaments.push({
      id: "ring-ornaments-ticks",
      d: dTicks,
      stroke: accent,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      strokeLinecap: "round",
    });

    // If density > 0.5, add a beaded dot circle or intermediate arc teeth
    if (density > 0.5 && radii.length >= 3) {
      const midRingRadius = radii[Math.floor(radii.length / 2)];
      const dotCount = symmetrySegments * 2;
      let dDots = "";

      for (let i = 0; i < dotCount; i++) {
        const angle = ((i + 0.5) * Math.PI * 2) / dotCount;
        const [dx, dy] = applyPrana(
          Math.cos(angle) * midRingRadius,
          Math.sin(angle) * midRingRadius,
          prana,
          prng,
          3
        );
        dDots += `M ${fmt(dx)} ${fmt(dy)} m -1.5, 0 a 1.5,1.5 0 1,0 3,0 a 1.5,1.5 0 1,0 -3,0 `;
      }

      ornaments.push({
        id: "ring-ornaments-beads",
        d: dDots,
        fill: stroke,
        stroke: "none",
      });
    }
  }

  return { rings, ornaments, guideLines };
}
