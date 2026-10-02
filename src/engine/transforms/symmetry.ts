import { Point } from "../../types/geometry";
import { SymmetryMode } from "../../types/recipe";

/**
 * Rotate a 2D point [x, y] around origin [cx, cy] by angle in radians
 */
export function rotatePoint(p: Point, angleRad: number, center: Point = [0, 0]): Point {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p[0] - center[0];
  const dy = p[1] - center[1];
  return [
    center[0] + dx * cos - dy * sin,
    center[1] + dx * sin + dy * cos,
  ];
}

/**
 * Mirror a 2D point across vertical axis (x -> -x) or horizontal axis (y -> -y)
 */
export function mirrorPoint(p: Point, axis: "x" | "y" = "x", center: Point = [0, 0]): Point {
  if (axis === "x") {
    return [2 * center[0] - p[0], p[1]];
  } else {
    return [p[0], 2 * center[1] - p[1]];
  }
}

/**
 * Generate angles for symmetry repetition
 */
export function getSymmetryAngles(mode: SymmetryMode, segments: number): number[] {
  const count = Math.max(2, Math.min(32, segments));
  const angles: number[] = [];

  if (mode === "radial" || mode === "hybrid") {
    const step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      angles.push(i * step);
    }
  } else if (mode === "bilateral") {
    // 2-fold or 4-fold mirroring
    angles.push(0);
    angles.push(Math.PI);
    if (count >= 4) {
      angles.push(Math.PI / 2);
      angles.push((3 * Math.PI) / 2);
    }
  } else if (mode === "grid") {
    // 4 cardinal angles
    for (let i = 0; i < 4; i++) {
      angles.push((i * Math.PI) / 2);
    }
  }

  return angles;
}
