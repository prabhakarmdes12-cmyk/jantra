import { PRNG } from "../prng";
import { applyPrana, fmt } from "../transforms/prana";
import { BinduStyle } from "../../types/recipe";
import { SVGPathElementData, SVGCircleElementData } from "../../types/geometry";

export interface BinduOptions {
  radius: number;
  style: BinduStyle;
  prana: number;
  stroke: string;
  fill: string;
  accent: string;
  strokeWidth: number;
}

export function generateBindu(
  options: BinduOptions,
  prng: PRNG
): (SVGPathElementData | SVGCircleElementData)[] {
  const { radius, style, prana, stroke, fill, accent, strokeWidth } = options;
  const elements: (SVGPathElementData | SVGCircleElementData)[] = [];
  
  const [cx, cy] = applyPrana(0, 0, prana, prng, 4);

  if (style === "solid") {
    elements.push({
      id: "bindu-core",
      cx,
      cy,
      r: Math.max(2, radius),
      fill: accent || "#f59e0b",
      stroke: stroke,
      strokeWidth: strokeWidth * 0.75,
    });

    if (radius > 5) {
      elements.push({
        id: "bindu-halo",
        cx,
        cy,
        r: radius * 1.8,
        fill: "none",
        stroke: accent,
        strokeWidth: Math.max(0.6, strokeWidth * 0.5),
        strokeDasharray: "2 2",
      });
    }
  } else if (style === "hollow") {
    elements.push({
      id: "bindu-ring-outer",
      cx,
      cy,
      r: Math.max(4, radius * 1.5),
      fill: fill || "none",
      stroke: stroke,
      strokeWidth: strokeWidth,
    });

    elements.push({
      id: "bindu-inner-dot",
      cx,
      cy,
      r: Math.max(1.5, radius * 0.35),
      fill: accent,
      stroke: "none",
    });

    if (radius > 8) {
      elements.push({
        id: "bindu-mid-ring",
        cx,
        cy,
        r: radius * 0.85,
        fill: "none",
        stroke: accent,
        strokeWidth: Math.max(0.5, strokeWidth * 0.4),
        strokeDasharray: "3 3",
      });
    }
  } else if (style === "radiant" || style === "triple_aura") {
    elements.push({
      id: "bindu-core-radiant",
      cx,
      cy,
      r: Math.max(2, radius * 0.5),
      fill: accent,
      stroke: "none",
    });

    const rayCount = style === "triple_aura" ? 16 : 12;
    const innerR = radius * 0.8;
    const outerR = radius * (style === "triple_aura" ? 2.8 : 2.2);
    let dRays = "";

    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI * 2) / rayCount;
      const [x1, y1] = applyPrana(
        cx + Math.cos(angle) * innerR,
        cy + Math.sin(angle) * innerR,
        prana,
        prng,
        3
      );
      const [x2, y2] = applyPrana(
        cx + Math.cos(angle) * outerR,
        cy + Math.sin(angle) * outerR,
        prana,
        prng,
        3
      );
      dRays += `M ${fmt(x1)} ${fmt(y1)} L ${fmt(x2)} ${fmt(y2)} `;
    }

    elements.push({
      id: "bindu-rays",
      d: dRays,
      stroke: accent,
      strokeWidth: Math.max(0.6, strokeWidth * 0.6),
      strokeLinecap: "round",
      fill: "none",
    });

    // Outer framing ring
    elements.push({
      id: "bindu-radiant-ring",
      cx,
      cy,
      r: outerR * 1.15,
      fill: "none",
      stroke: stroke,
      strokeWidth: Math.max(0.75, strokeWidth * 0.75),
    });

    if (style === "triple_aura") {
      elements.push({
        id: "bindu-aura-ring-1",
        cx,
        cy,
        r: outerR * 1.35,
        fill: "none",
        stroke: accent,
        strokeWidth: 0.6,
        strokeDasharray: "3 3",
      });
      elements.push({
        id: "bindu-aura-ring-2",
        cx,
        cy,
        r: outerR * 1.55,
        fill: "none",
        stroke: stroke,
        strokeWidth: 0.5,
        strokeDasharray: "1 3",
      });
    }
  }

  return elements;
}
