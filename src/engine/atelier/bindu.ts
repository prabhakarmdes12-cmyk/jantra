/**
 * The Radiant Luminous Bindu.
 *
 * The origin point of the composition. Built in layers so it glows without
 * any raster filter: soft aura → dual concentric ripples → micro-spokes →
 * inner corona → solid core.
 */

import { SVGElementData } from "../../types/geometry";
import { BuildContext } from "../context";
import { BinduStyle } from "../../types/recipe";
import { L, M, TWO_PI, circlePath, polar } from "../geom";

export interface BinduSpec {
  radius: number;
  style: BinduStyle;
  /** Scale multiplier applied to the whole assembly. */
  scale?: number;
  /** Extra emphasis for poster-grade minimal compositions. */
  bold?: boolean;
}

export function buildBindu(spec: BinduSpec, ctx: BuildContext): SVGElementData[] {
  const { ink, field, weight, cap } = ctx;
  const scale = spec.scale ?? 1;
  const r = Math.max(2, spec.radius) * scale;
  const out: SVGElementData[] = [];
  const w = field.weight(weight, 0);

  const hollow = spec.style === "hollow";
  const aura = spec.style === "radiant" || spec.style === "triple_aura";
  const rippleCount = spec.style === "triple_aura" ? 3 : 2;

  // --- 0. Luminous bloom: stacked translucent discs fake a soft glow
  // without any raster filter, so the export stays pure editable vector.
  if (aura || spec.bold) {
    const bloomSteps = spec.bold ? 9 : 7;
    for (let i = bloomSteps; i >= 1; i--) {
      const t = i / bloomSteps;
      out.push({
        id: `bindu-bloom-${i}`,
        cx: 0,
        cy: 0,
        r: r * (1.1 + t * (spec.bold ? 7.5 : 5.4)),
        fill: ink.accent,
        fillOpacity: 0.055 * Math.pow(1 - t, 1.9) + 0.006,
        stroke: "none",
      });
    }
  }

  // --- 1. Soft aura: nested hairline rings at falling opacity -----------
  if (aura || spec.bold) {
    const auraRings = spec.bold ? 5 : 4;
    for (let i = 0; i < auraRings; i++) {
      const rr = r * (2.6 + i * 0.9);
      out.push({
        id: `bindu-aura-${i}`,
        d: circlePath(rr),
        fill: "none",
        stroke: ink.accent,
        strokeWidth: Math.max(0.3, w * (0.4 - i * 0.06)),
        strokeOpacity: 0.3 - i * 0.055,
      });
    }
  }

  // --- 2. Micro-spokes radiating from the core --------------------------
  if (!hollow) {
    const rays = spec.style === "triple_aura" ? 32 : spec.bold ? 24 : 16;
    let dMicro = "";
    let dLong = "";
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * TWO_PI;
      const long = i % 4 === 0;
      const r0 = r * 1.25;
      const r1 = r * (long ? 2.85 : 2.0);
      const segStr = M(polar(r0, a)) + L(polar(r1, a));
      if (long) dLong += segStr;
      else dMicro += segStr;
    }
    out.push({
      id: "bindu-microspokes",
      d: dMicro,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.35, w * 0.4),
      strokeOpacity: 0.72,
      strokeLinecap: cap,
    });
    out.push({
      id: "bindu-spokes-major",
      d: dLong,
      fill: "none",
      stroke: ink.accent,
      strokeWidth: Math.max(0.5, w * 0.62),
      strokeOpacity: 0.95,
      strokeLinecap: cap,
    });
  }

  // --- 3. Dual concentric ripples ---------------------------------------
  for (let i = 0; i < rippleCount; i++) {
    const rr = r * (1.55 + i * 0.62);
    out.push({
      id: `bindu-ripple-${i}`,
      d: circlePath(rr),
      fill: "none",
      stroke: i % 2 === 0 ? ink.primary : ink.accent,
      strokeWidth: Math.max(0.45, w * (i === 0 ? 0.8 : 0.55)),
      strokeDasharray: i === 1 ? "1 4" : undefined,
      strokeOpacity: i === 0 ? 0.95 : 0.7,
    });
  }

  // --- 4. Corona + core --------------------------------------------------
  out.push({
    id: "bindu-corona",
    cx: 0,
    cy: 0,
    r: round2(r * 1.18),
    fill: "none",
    stroke: ink.primary,
    strokeWidth: Math.max(0.6, w * 0.9),
  });

  if (hollow) {
    out.push({
      id: "bindu-core-hollow",
      cx: 0,
      cy: 0,
      r: round2(r * 0.42),
      fill: ink.accent,
      stroke: "none",
    });
  } else {
    out.push({
      id: "bindu-core",
      cx: 0,
      cy: 0,
      r: round2(r),
      fill: ink.accent,
      stroke: "none",
    });
    out.push({
      id: "bindu-core-highlight",
      cx: round2(-r * 0.22),
      cy: round2(-r * 0.22),
      r: round2(r * 0.34),
      fill: "#fffbeb",
      fillOpacity: 0.85,
      stroke: "none",
    });
  }

  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
