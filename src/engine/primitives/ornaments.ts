import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { SecondaryMotif } from "../../types/recipe";
import { SVGPathElementData, SVGCircleElementData } from "../../types/geometry";

export interface OrnamentsOptions {
  motif: SecondaryMotif;
  radius: number;
  segments: number;
  density: number;
  prana: number;
  stroke: string;
  accent: string;
  strokeWidth: number;
}

export function generateSecondaryOrnaments(
  options: OrnamentsOptions,
  prng: PRNG
): (SVGPathElementData | SVGCircleElementData)[] {
  const { motif, radius, segments, density, prana, stroke, accent, strokeWidth } = options;
  if (motif === "none" || density < 0.1) return [];

  const elements: (SVGPathElementData | SVGCircleElementData)[] = [];
  const count = segments * (density > 0.5 ? 2 : 1);
  const angleStep = (Math.PI * 2) / count;

  if (motif === "circle") {
    const dotR = 3.5 + density * 3;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const [px, py] = applyPrana(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        prana,
        prng,
        3
      );
      elements.push({
        id: `secondary-circle-${i}`,
        cx: px,
        cy: py,
        r: dotR,
        stroke: accent,
        strokeWidth: Math.max(0.6, strokeWidth * 0.6),
        fill: "none",
      });
    }
  } else if (motif === "dot") {
    const dotR = 2.5 + density * 2.5;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const [px, py] = applyPrana(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        prana,
        prng,
        3
      );
      elements.push({
        id: `secondary-dot-${i}`,
        cx: px,
        cy: py,
        r: dotR,
        fill: accent,
        stroke: "none",
      });
    }
  } else if (motif === "flame") {
    let dFlames = "";
    const fLen = 8 + density * 10;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const [px, py] = applyPrana(Math.cos(angle) * radius, Math.sin(angle) * radius, prana, prng, 3);
      const [tx, ty] = applyPrana(Math.cos(angle) * (radius + fLen), Math.sin(angle) * (radius + fLen), prana, prng, 3);
      const [lx, ly] = applyPrana(Math.cos(angle - 0.15) * (radius + fLen * 0.4), Math.sin(angle - 0.15) * (radius + fLen * 0.4), prana, prng, 2);
      const [rx, ry] = applyPrana(Math.cos(angle + 0.15) * (radius + fLen * 0.4), Math.sin(angle + 0.15) * (radius + fLen * 0.4), prana, prng, 2);

      dFlames += `M ${fmt(px)} ${fmt(py)} Q ${fmt(lx)} ${fmt(ly)}, ${fmt(tx)} ${fmt(ty)} Q ${fmt(rx)} ${fmt(ry)}, ${fmt(px)} ${fmt(py)} `;
    }
    elements.push({
      id: "secondary-flames",
      d: dFlames,
      stroke: accent,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      fill: accent,
      fillOpacity: 0.35,
    });
  } else if (motif === "teardrop") {
    let dDrops = "";
    const dLen = 7 + density * 8;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const [px, py] = applyPrana(Math.cos(angle) * radius, Math.sin(angle) * radius, prana, prng, 3);
      const [tx, ty] = applyPrana(Math.cos(angle) * (radius + dLen), Math.sin(angle) * (radius + dLen), prana, prng, 3);
      const [lx, ly] = applyPrana(Math.cos(angle - 0.2) * (radius + dLen * 0.5), Math.sin(angle - 0.2) * (radius + dLen * 0.5), prana, prng, 2);
      const [rx, ry] = applyPrana(Math.cos(angle + 0.2) * (radius + dLen * 0.5), Math.sin(angle + 0.2) * (radius + dLen * 0.5), prana, prng, 2);

      dDrops += `M ${fmt(px)} ${fmt(py)} C ${fmt(lx)} ${fmt(ly)}, ${fmt(rx)} ${fmt(ry)}, ${fmt(tx)} ${fmt(ty)} `;
    }
    elements.push({
      id: "secondary-teardrops",
      d: dDrops,
      stroke: accent,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      fill: "none",
    });
  } else if (motif === "cross") {
    let dCross = "";
    const arm = 6 + density * 6;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const [px, py] = applyPrana(Math.cos(angle) * radius, Math.sin(angle) * radius, prana, prng, 3);
      dCross += `M ${fmt(px - arm)} ${fmt(py)} L ${fmt(px + arm)} ${fmt(py)} ` +
        `M ${fmt(px)} ${fmt(py - arm)} L ${fmt(px)} ${fmt(py + arm)} `;
    }
    elements.push({
      id: "secondary-crosses",
      d: dCross,
      stroke: accent,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      strokeLinecap: "round",
      fill: "none",
    });
  } else if (motif === "triangle") {
    let dTriangles = "";
    const triSize = 6 + density * 6;
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const [px, py] = applyPrana(Math.cos(angle) * radius, Math.sin(angle) * radius, prana, prng, 3);
      const apexAngle = angle;
      const pApex = [px + Math.cos(apexAngle) * triSize, py + Math.sin(apexAngle) * triSize];
      const pLeft = [px + Math.cos(apexAngle + 2.3) * (triSize * 0.8), py + Math.sin(apexAngle + 2.3) * (triSize * 0.8)];
      const pRight = [px + Math.cos(apexAngle - 2.3) * (triSize * 0.8), py + Math.sin(apexAngle - 2.3) * (triSize * 0.8)];

      dTriangles += `M ${fmt(pApex[0])} ${fmt(pApex[1])} L ${fmt(pLeft[0])} ${fmt(pLeft[1])} L ${fmt(pRight[0])} ${fmt(pRight[1])} Z `;
    }
    elements.push({
      id: "secondary-triangles",
      d: dTriangles,
      stroke: stroke,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      strokeLinecap: "round",
      strokeLinejoin: "round",
      fill: accent,
      fillOpacity: 0.3,
    });
  }

  return elements;
}
