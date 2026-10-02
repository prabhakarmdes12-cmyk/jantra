import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { SVGPathElementData } from "../../types/geometry";

export interface BhupuraOptions {
  enabled: boolean;
  gates: number; // 4 cardinal gates
  steps: number; // 1 to 3 terraces
  size: number; // half-width (e.g. 680)
  finials?: boolean;
  prana: number;
  stroke: string;
  fill?: string;
  accent: string;
  strokeWidth: number;
  strokeCap: "round" | "square" | "butt";
}

/**
 * Generate a stepped Bhupura path with T-shaped cardinal gate portals
 */
function generateSingleBhupuraTier(
  halfSize: number,
  gateDepth: number,
  gateWidth: number,
  prana: number,
  prng: PRNG
): string {
  const S = halfSize;
  const GW = gateWidth;
  const GD = gateDepth;
  const T = GW * 0.45; // T-bar wing extension

  const pts: [number, number][] = [];

  // 1. Top edge (North Gate)
  pts.push([-S, -S]);
  pts.push([-GW / 2, -S]);
  pts.push([-GW / 2, -S - GD]);
  pts.push([-GW / 2 - T, -S - GD]);
  pts.push([-GW / 2 - T, -S - GD - 14]);
  pts.push([GW / 2 + T, -S - GD - 14]);
  pts.push([GW / 2 + T, -S - GD]);
  pts.push([GW / 2, -S - GD]);
  pts.push([GW / 2, -S]);
  pts.push([S, -S]);

  // 2. Right edge (East Gate)
  pts.push([S, -GW / 2]);
  pts.push([S + GD, -GW / 2]);
  pts.push([S + GD, -GW / 2 - T]);
  pts.push([S + GD + 14, -GW / 2 - T]);
  pts.push([S + GD + 14, GW / 2 + T]);
  pts.push([S + GD, GW / 2 + T]);
  pts.push([S + GD, GW / 2]);
  pts.push([S, GW / 2]);
  pts.push([S, S]);

  // 3. Bottom edge (South Gate)
  pts.push([GW / 2, S]);
  pts.push([GW / 2, S + GD]);
  pts.push([GW / 2 + T, S + GD]);
  pts.push([GW / 2 + T, S + GD + 14]);
  pts.push([-GW / 2 - T, S + GD + 14]);
  pts.push([-GW / 2 - T, S + GD]);
  pts.push([-GW / 2, S + GD]);
  pts.push([-GW / 2, S]);
  pts.push([-S, S]);

  // 4. Left edge (West Gate)
  pts.push([-S, GW / 2]);
  pts.push([-S - GD, GW / 2]);
  pts.push([-S - GD, GW / 2 + T]);
  pts.push([-S - GD - 14, GW / 2 + T]);
  pts.push([-S - GD - 14, -GW / 2 - T]);
  pts.push([-S - GD, -GW / 2 - T]);
  pts.push([-S - GD, -GW / 2]);
  pts.push([-S, -GW / 2]);

  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const [px, py] = applyPrana(pts[i][0], pts[i][1], prana, prng, 3);
    if (i === 0) {
      d += `M ${fmt(px)} ${fmt(py)} `;
    } else {
      d += `L ${fmt(px)} ${fmt(py)} `;
    }
  }
  d += "Z ";
  return d;
}

export function generateBhupura(
  options: BhupuraOptions,
  prng: PRNG
): SVGPathElementData[] {
  const {
    enabled,
    steps,
    size,
    finials = true,
    prana,
    stroke,
    fill = "none",
    accent,
    strokeWidth,
    strokeCap,
  } = options;

  if (!enabled) return [];

  const paths: SVGPathElementData[] = [];
  const tierCount = Math.max(1, Math.min(3, steps));
  let dBhupura = "";
  let dCornerAccents = "";
  let dFinials = "";

  const baseSize = size;
  const stepOffset = 30;

  for (let s = 0; s < tierCount; s++) {
    const currentHalfSize = baseSize - (s * stepOffset);
    const gateDepth = 26 - (s * 5);
    const gateWidth = 145 - (s * 18);

    dBhupura += generateSingleBhupuraTier(currentHalfSize, gateDepth, gateWidth, prana, prng);

    // Corner stepped ornamentation & Kalasha Finials
    if (s === 0) {
      const cornerLen = 34;
      const c1 = currentHalfSize + 18;
      const corners = [
        [-c1, -c1],
        [c1, -c1],
        [c1, c1],
        [-c1, c1],
      ];
      corners.forEach(([cx, cy]) => {
        const [px, py] = applyPrana(cx, cy, prana, prng, 3);
        dCornerAccents += `M ${fmt(px - cornerLen / 2)} ${fmt(py)} L ${fmt(px + cornerLen / 2)} ${fmt(py)} ` +
          `M ${fmt(px)} ${fmt(py - cornerLen / 2)} L ${fmt(px)} ${fmt(py + cornerLen / 2)} `;
      });

      if (finials) {
        // Kalasha finials on the 4 cardinal gates
        const gateOuterDist = currentHalfSize + gateDepth + 20;
        const kalashaPoints: [number, number][] = [
          [0, -gateOuterDist], // North
          [gateOuterDist, 0],  // East
          [0, gateOuterDist],  // South
          [-gateOuterDist, 0], // West
        ];

        kalashaPoints.forEach(([kx, ky]) => {
          const [px, py] = applyPrana(kx, ky, prana, prng, 2);
          dFinials += `M ${fmt(px)} ${fmt(py)} m -4, 0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0 ` +
            `M ${fmt(px)} ${fmt(py - 4)} L ${fmt(px)} ${fmt(py - 9)} `;
        });
      }
    }
  }

  paths.push({
    id: "bhupura-stepped-frame",
    d: dBhupura,
    stroke: stroke,
    strokeWidth: strokeWidth * 1.15,
    strokeLinecap: strokeCap,
    strokeLinejoin: "miter",
    fill: fill,
  });

  if (dCornerAccents.length > 0) {
    paths.push({
      id: "bhupura-corner-accents",
      d: dCornerAccents,
      stroke: accent,
      strokeWidth: strokeWidth * 0.85,
      strokeLinecap: strokeCap,
      fill: "none",
    });
  }

  if (dFinials.length > 0) {
    paths.push({
      id: "bhupura-gate-finials",
      d: dFinials,
      stroke: accent,
      strokeWidth: strokeWidth * 0.9,
      strokeLinecap: "round",
      fill: accent,
      fillOpacity: 0.3,
    });
  }

  return paths;
}
