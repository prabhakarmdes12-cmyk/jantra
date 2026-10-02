import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { rotatePoint } from "../transforms/symmetry";
import { Point, SVGPathElementData } from "../../types/geometry";
import { PrimaryMotif } from "../../types/recipe";

export interface PetalLayerOptions {
  motifType: PrimaryMotif;
  segments: number;
  baseRadius: number;
  tipRadius: number;
  swellRatio?: number; // 0.2 to 1.5
  prana: number;
  stroke: string;
  fill?: string;
  accent?: string;
  strokeWidth: number;
  strokeCap: "round" | "square" | "butt";
  innerTier?: boolean;
  depthTierIndex?: number;
}

export function generatePetalsLayer(
  options: PetalLayerOptions,
  prng: PRNG
): SVGPathElementData[] {
  const {
    motifType,
    segments,
    baseRadius,
    tipRadius,
    swellRatio = 0.8,
    prana,
    stroke,
    fill = "none",
    accent,
    strokeWidth,
    strokeCap,
    innerTier = false,
    depthTierIndex = 0,
  } = options;

  const paths: SVGPathElementData[] = [];
  const count = Math.max(2, Math.min(32, segments));
  const angleStep = (Math.PI * 2) / count;
  const halfAngle = angleStep / 2;

  let dPetals = "";
  let dSpines = "";
  let dInnerCusps = "";

  const r0 = baseRadius;
  const rTip = tipRadius;
  const rMid = r0 + (rTip - r0) * 0.55;
  const swellDist = Math.sin(halfAngle) * rMid * swellRatio;

  for (let i = 0; i < count; i++) {
    const centerAngle = i * angleStep;

    const baseLeft: Point = [r0 * Math.cos(-halfAngle), r0 * Math.sin(-halfAngle)];
    const baseRight: Point = [r0 * Math.cos(halfAngle), r0 * Math.sin(halfAngle)];
    const tip: Point = [rTip, 0];

    if (motifType === "lotus_pointed" || motifType === "lotus_double") {
      // Pointed sacred lotus petal with sharp apex cusp and inner layered ring
      const cp1a: Point = [r0 + (rTip - r0) * 0.35, -swellDist * 1.4];
      const cp2a: Point = [r0 + (rTip - r0) * 0.85, -swellDist * 0.25];
      const cp1b: Point = [r0 + (rTip - r0) * 0.85, swellDist * 0.25];
      const cp2b: Point = [r0 + (rTip - r0) * 0.35, swellDist * 1.4];

      const rotBaseL = rotatePoint(baseLeft, centerAngle);
      const rotCp1a = rotatePoint(cp1a, centerAngle);
      const rotCp2a = rotatePoint(cp2a, centerAngle);
      const rotTip = rotatePoint(tip, centerAngle);
      const rotCp1b = rotatePoint(cp1b, centerAngle);
      const rotCp2b = rotatePoint(cp2b, centerAngle);
      const rotBaseR = rotatePoint(baseRight, centerAngle);

      const pBaseL = applyPrana(rotBaseL[0], rotBaseL[1], prana, prng, 3);
      const pCp1a = applyPrana(rotCp1a[0], rotCp1a[1], prana, prng, 4);
      const pCp2a = applyPrana(rotCp2a[0], rotCp2a[1], prana, prng, 4);
      const pTip = applyPrana(rotTip[0], rotTip[1], prana, prng, 4);
      const pCp1b = applyPrana(rotCp1b[0], rotCp1b[1], prana, prng, 4);
      const pCp2b = applyPrana(rotCp2b[0], rotCp2b[1], prana, prng, 4);
      const pBaseR = applyPrana(rotBaseR[0], rotBaseR[1], prana, prng, 3);

      dPetals += `M ${fmt(pBaseL[0])} ${fmt(pBaseL[1])} ` +
        `C ${fmt(pCp1a[0])} ${fmt(pCp1a[1])}, ${fmt(pCp2a[0])} ${fmt(pCp2a[1])}, ${fmt(pTip[0])} ${fmt(pTip[1])} ` +
        `C ${fmt(pCp1b[0])} ${fmt(pCp1b[1])}, ${fmt(pCp2b[0])} ${fmt(pCp2b[1])}, ${fmt(pBaseR[0])} ${fmt(pBaseR[1])} `;

      // Central spine vein
      const pSpineBase = applyPrana(Math.cos(centerAngle) * r0, Math.sin(centerAngle) * r0, prana, prng, 2);
      const pSpineTip = applyPrana(Math.cos(centerAngle) * (rTip * 0.9), Math.sin(centerAngle) * (rTip * 0.9), prana, prng, 2);
      dSpines += `M ${fmt(pSpineBase[0])} ${fmt(pSpineBase[1])} L ${fmt(pSpineTip[0])} ${fmt(pSpineTip[1])} `;

      if (motifType === "lotus_double") {
        // Inner layered sub-petal
        const innerTipR = r0 + (rTip - r0) * 0.65;
        const innerSwell = swellDist * 0.55;
        const innerCp1: Point = rotatePoint([r0 + (innerTipR - r0) * 0.45, -innerSwell], centerAngle);
        const innerTip: Point = rotatePoint([innerTipR, 0], centerAngle);
        const innerCp2: Point = rotatePoint([r0 + (innerTipR - r0) * 0.45, innerSwell], centerAngle);

        const piCp1 = applyPrana(innerCp1[0], innerCp1[1], prana, prng, 2);
        const piTip = applyPrana(innerTip[0], innerTip[1], prana, prng, 2);
        const piCp2 = applyPrana(innerCp2[0], innerCp2[1], prana, prng, 2);

        dInnerCusps += `M ${fmt(pBaseL[0])} ${fmt(pBaseL[1])} ` +
          `Q ${fmt(piCp1[0])} ${fmt(piCp1[1])}, ${fmt(piTip[0])} ${fmt(piTip[1])} ` +
          `Q ${fmt(piCp2[0])} ${fmt(piCp2[1])}, ${fmt(pBaseR[0])} ${fmt(pBaseR[1])} `;
      }

    } else if (motifType === "lotus_lobe") {
      // S-curved traditional lotus petal
      const cp1a: Point = [r0 + (rTip - r0) * 0.35, -swellDist * 1.35];
      const cp2a: Point = [r0 + (rTip - r0) * 0.82, -swellDist * 0.4];
      const cp1b: Point = [r0 + (rTip - r0) * 0.82, swellDist * 0.4];
      const cp2b: Point = [r0 + (rTip - r0) * 0.35, swellDist * 1.35];

      const rotBaseL = rotatePoint(baseLeft, centerAngle);
      const rotCp1a = rotatePoint(cp1a, centerAngle);
      const rotCp2a = rotatePoint(cp2a, centerAngle);
      const rotTip = rotatePoint(tip, centerAngle);
      const rotCp1b = rotatePoint(cp1b, centerAngle);
      const rotCp2b = rotatePoint(cp2b, centerAngle);
      const rotBaseR = rotatePoint(baseRight, centerAngle);

      const pBaseL = applyPrana(rotBaseL[0], rotBaseL[1], prana, prng, 3);
      const pCp1a = applyPrana(rotCp1a[0], rotCp1a[1], prana, prng, 4);
      const pCp2a = applyPrana(rotCp2a[0], rotCp2a[1], prana, prng, 4);
      const pTip = applyPrana(rotTip[0], rotTip[1], prana, prng, 4);
      const pCp1b = applyPrana(rotCp1b[0], rotCp1b[1], prana, prng, 4);
      const pCp2b = applyPrana(rotCp2b[0], rotCp2b[1], prana, prng, 4);
      const pBaseR = applyPrana(rotBaseR[0], rotBaseR[1], prana, prng, 3);

      dPetals += `M ${fmt(pBaseL[0])} ${fmt(pBaseL[1])} ` +
        `C ${fmt(pCp1a[0])} ${fmt(pCp1a[1])}, ${fmt(pCp2a[0])} ${fmt(pCp2a[1])}, ${fmt(pTip[0])} ${fmt(pTip[1])} ` +
        `C ${fmt(pCp1b[0])} ${fmt(pCp1b[1])}, ${fmt(pCp2b[0])} ${fmt(pCp2b[1])}, ${fmt(pBaseR[0])} ${fmt(pBaseR[1])} `;

      const pSpineBase = applyPrana(Math.cos(centerAngle) * r0, Math.sin(centerAngle) * r0, prana, prng, 2);
      const pSpineTip = applyPrana(Math.cos(centerAngle) * (rTip * 0.88), Math.sin(centerAngle) * (rTip * 0.88), prana, prng, 2);
      dSpines += `M ${fmt(pSpineBase[0])} ${fmt(pSpineBase[1])} L ${fmt(pSpineTip[0])} ${fmt(pSpineTip[1])} `;

    } else if (motifType === "chevron") {
      const rotBaseL = rotatePoint(baseLeft, centerAngle);
      const rotTip = rotatePoint(tip, centerAngle);
      const rotBaseR = rotatePoint(baseRight, centerAngle);
      const midInner: Point = rotatePoint([r0 * 1.15, 0], centerAngle);

      const pBaseL = applyPrana(rotBaseL[0], rotBaseL[1], prana, prng, 3);
      const pTip = applyPrana(rotTip[0], rotTip[1], prana, prng, 3);
      const pBaseR = applyPrana(rotBaseR[0], rotBaseR[1], prana, prng, 3);
      const pMidInner = applyPrana(midInner[0], midInner[1], prana, prng, 3);

      dPetals += `M ${fmt(pBaseL[0])} ${fmt(pBaseL[1])} L ${fmt(pTip[0])} ${fmt(pTip[1])} L ${fmt(pBaseR[0])} ${fmt(pBaseR[1])} L ${fmt(pMidInner[0])} ${fmt(pMidInner[1])} Z `;

    } else if (motifType === "diamond") {
      const rMidPoint = r0 + (rTip - r0) * 0.5;
      const dLeft: Point = rotatePoint([rMidPoint, -swellDist * 0.9], centerAngle);
      const dRight: Point = rotatePoint([rMidPoint, swellDist * 0.9], centerAngle);
      const dBase: Point = rotatePoint([r0, 0], centerAngle);
      const dTip: Point = rotatePoint([rTip, 0], centerAngle);

      const pBase = applyPrana(dBase[0], dBase[1], prana, prng, 3);
      const pLeft = applyPrana(dLeft[0], dLeft[1], prana, prng, 3);
      const pTip = applyPrana(dTip[0], dTip[1], prana, prng, 3);
      const pRight = applyPrana(dRight[0], dRight[1], prana, prng, 3);

      dPetals += `M ${fmt(pBase[0])} ${fmt(pBase[1])} L ${fmt(pLeft[0])} ${fmt(pLeft[1])} L ${fmt(pTip[0])} ${fmt(pTip[1])} L ${fmt(pRight[0])} ${fmt(pRight[1])} Z `;

    } else {
      // Classic smooth petal
      const cp1: Point = [rMid, -swellDist];
      const cp2: Point = [rMid, swellDist];

      const rotBaseL = rotatePoint(baseLeft, centerAngle);
      const rotCp1 = rotatePoint(cp1, centerAngle);
      const rotTip = rotatePoint(tip, centerAngle);
      const rotCp2 = rotatePoint(cp2, centerAngle);
      const rotBaseR = rotatePoint(baseRight, centerAngle);

      const pBaseL = applyPrana(rotBaseL[0], rotBaseL[1], prana, prng, 3);
      const pCp1 = applyPrana(rotCp1[0], rotCp1[1], prana, prng, 4);
      const pTip = applyPrana(rotTip[0], rotTip[1], prana, prng, 4);
      const pCp2 = applyPrana(rotCp2[0], rotCp2[1], prana, prng, 4);
      const pBaseR = applyPrana(rotBaseR[0], rotBaseR[1], prana, prng, 3);

      dPetals += `M ${fmt(pBaseL[0])} ${fmt(pBaseL[1])} ` +
        `Q ${fmt(pCp1[0])} ${fmt(pCp1[1])}, ${fmt(pTip[0])} ${fmt(pTip[1])} ` +
        `Q ${fmt(pCp2[0])} ${fmt(pCp2[1])}, ${fmt(pBaseR[0])} ${fmt(pBaseR[1])} `;

      if (rTip - r0 > 80) {
        const cuspTip: Point = rotatePoint([r0 + (rTip - r0) * 0.5, 0], centerAngle);
        const cuspCp1: Point = rotatePoint([r0 + (rTip - r0) * 0.25, -swellDist * 0.45], centerAngle);
        const cuspCp2: Point = rotatePoint([r0 + (rTip - r0) * 0.25, swellDist * 0.45], centerAngle);

        const pCuspTip = applyPrana(cuspTip[0], cuspTip[1], prana, prng, 2);
        const pCuspCp1 = applyPrana(cuspCp1[0], cuspCp1[1], prana, prng, 2);
        const pCuspCp2 = applyPrana(cuspCp2[0], cuspCp2[1], prana, prng, 2);

        dInnerCusps += `M ${fmt(pBaseL[0])} ${fmt(pBaseL[1])} ` +
          `Q ${fmt(pCuspCp1[0])} ${fmt(pCuspCp1[1])}, ${fmt(pCuspTip[0])} ${fmt(pCuspTip[1])} ` +
          `Q ${fmt(pCuspCp2[0])} ${fmt(pCuspCp2[1])}, ${fmt(pBaseR[0])} ${fmt(pBaseR[1])} `;
      }
    }
  }

  paths.push({
    id: `petals-tier-${depthTierIndex}${innerTier ? "-inner" : ""}`,
    d: dPetals,
    stroke: stroke,
    strokeWidth: strokeWidth,
    strokeLinecap: strokeCap,
    strokeLinejoin: "round",
    fill: fill,
  });

  if (dSpines.length > 0 && accent) {
    paths.push({
      id: `petals-spines-${depthTierIndex}`,
      d: dSpines,
      stroke: accent,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      strokeLinecap: strokeCap,
      fill: "none",
    });
  }

  if (dInnerCusps.length > 0 && accent) {
    paths.push({
      id: `petals-cusps-${depthTierIndex}`,
      d: dInnerCusps,
      stroke: accent,
      strokeWidth: Math.max(0.5, strokeWidth * 0.5),
      strokeDasharray: "2 2",
      fill: "none",
    });
  }

  return paths;
}
