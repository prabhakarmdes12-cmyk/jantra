import { PRNG } from "../prng";
import { Point } from "../../types/geometry";

/**
 * Applies controlled seeded organic imperfection (Prana) to a point.
 */
export function applyPrana(
  x: number,
  y: number,
  pranaAmount: number,
  prng: PRNG,
  scale = 24
): Point {
  if (pranaAmount <= 0.0001) return [x, y];
  
  // Angle and distance derived from seeded generator
  const angle = prng.range(0, Math.PI * 2);
  const distance = prng.next() * pranaAmount * scale;
  
  return [
    x + Math.cos(angle) * distance,
    y + Math.sin(angle) * distance,
  ];
}

/**
 * Applies prana to a radius with a subtle percentage drift.
 */
export function applyPranaRadius(
  radius: number,
  pranaAmount: number,
  prng: PRNG
): number {
  if (pranaAmount <= 0.0001) return radius;
  const drift = (prng.next() - 0.5) * 2 * pranaAmount * 0.15 * radius;
  return Math.max(1, radius + drift);
}

/**
 * Format number to 2 decimal places to keep SVG clean and concise
 */
export function fmt(num: number): string {
  return Number(num.toFixed(2)).toString();
}
