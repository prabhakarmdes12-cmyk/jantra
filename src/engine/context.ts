import { effectiveDetail } from "./normalize";
import { DetailFlags, JantraRecipe, LineCap } from "../types/recipe";
import { SVGElementData, SVGGElementData } from "../types/geometry";
import { PRNG, createPRNG } from "./prng";
import { PranaField, createPranaField } from "./prana";
import { Band, bands, ringRadii, clamp } from "./geom";

/** The four inks every grammar draws with. */
export interface Ink {
  /** Primary line — the drawing itself. */
  primary: string;
  /** Muted secondary line — recessive structure. */
  secondary: string;
  /** Warm amber accent — nodes, bindu, gates. */
  accent: string;
  /** Fine electric cyan — construction geometry only. */
  construction: string;
  fill: string;
  fillOpacity: number;
}

export const DEFAULT_DETAIL: DetailFlags = {
  ribbing: true,
  ribCount: 5,
  stipple: true,
  nodes: true,
  construction: true,
  lattice: false,
};

export interface BuildContext {
  recipe: JantraRecipe;
  prng: PRNG;
  field: PranaField;
  ink: Ink;
  /** Outer usable radius, inside the canvas margin. */
  R: number;
  /** Radius available to the circular artwork, inside the bhupura wall. */
  artR: number;
  /** Clearance radius reserved for the bindu assembly. */
  core: number;
  /** Bindu radius scaled to the canvas so compositions stay resolution-independent. */
  binduRadius: number;
  /** Half the smallest canvas dimension. */
  half: number;
  /** Concentric structural radii, inner → outer (core … artR inclusive). */
  radii: number[];
  /** Split the artwork annulus into `count` concentric bands. */
  bands: (count: number, spacing?: string) => Band[];
  /** Base rotational symmetry of the core registers. */
  segments: number;
  /** Symmetry of the outer registers (hybrid grammars expand this). */
  outerSegments: number;
  density: number;
  /** Base stroke weight before prana's tier hierarchy. */
  weight: number;
  cap: LineCap;
  detail: DetailFlags;
  /** Controlled asymmetric rotational shift, in radians. */
  asymmetry: number;
  recursionDepth: number;
  recursionScale: number;
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const a = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${h}${a}`;
}

export { withAlpha };

export function createContext(recipe: JantraRecipe): BuildContext {
  const p = recipe.parameters;
  const width = recipe.canvas.width || 1600;
  const height = recipe.canvas.height || 1600;
  const half = Math.min(width, height) / 2;
  const margin = clamp(recipe.canvas.margin ?? 0.08, 0, 0.25);
  const R = half * (1 - margin);

  const prng = createPRNG(recipe.seed);
  const field = createPranaField(normalizePrana(p.prana), recipe.seed);

  const segments = clamp(Math.round(p.symmetry.segments || 8), 2, 32);
  const outerMul = clamp(Math.round(p.symmetry.outerMultiplier ?? 1), 1, 3);
  const outerSegments = clamp(segments * outerMul, 2, 96);

  // The DETAIL LEVEL dial derives the layer switches; sparse per-layer
  // overrides from the Layers panel sit on top of it.
  const detail: DetailFlags = { ...effectiveDetail(recipe) };
  detail.ribCount = clamp(Math.round(detail.ribCount), 0, 9);

  const ink: Ink = {
    primary: p.palette.stroke || "#f4f4f5",
    secondary: p.palette.secondaryStroke || withAlpha(p.palette.stroke || "#f4f4f5", 0.42),
    accent: p.palette.accent || "#f59e0b",
    construction: p.palette.construction || "#06b6d4",
    fill: p.palette.fill || "none",
    fillOpacity: p.palette.fillOpacity ?? 1,
  };

  const scaleRef = R / 736;
  const binduRadius = Math.max(3, p.motifs.bindu.radius) * scaleRef;
  const core = clamp(binduRadius * 3.4, R * 0.05, R * 0.2);
  const artR = R * (p.motifs.bhupura.enabled ? 0.805 : 0.95);
  const radii = ringRadii(clamp(p.rings.count, 1, 14), p.rings.spacing, core, artR);

  return {
    recipe,
    prng,
    field,
    ink,
    R,
    artR,
    core,
    binduRadius,
    half,
    radii,
    bands: (count: number, spacing?: string) =>
      bands(clamp(Math.round(count), 1, 20), spacing ?? p.rings.spacing, core, artR),
    segments,
    outerSegments,
    density: clamp(p.density, 0.02, 1),
    weight: clamp(p.line.weight, 0.2, 10) * scaleRef,
    cap: p.line.cap || "round",
    detail,
    asymmetry: ((p.symmetry.asymmetry ?? 0) * Math.PI) / 180,
    recursionDepth: clamp(Math.round(p.recursion.depth), 0, 6),
    recursionScale: clamp(p.recursion.scale, 0.2, 0.92),
  };
}

/** v1.0 recipes stored prana as 0.0 - 0.35. v1.1 stores 0 - 100. */
export function normalizePrana(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 1.0001) return clamp((value / 0.35) * 100, 0, 100);
  return clamp(value, 0, 100);
}

/** Ordered accumulator for the semantic layer tree. */
export class LayerBuilder {
  private groups: SVGGElementData[] = [];

  add(id: string, name: string, label: string, order: number, elements: SVGElementData[]): void {
    const clean = elements.filter((el) => {
      if ("d" in el) return typeof el.d === "string" && el.d.trim().length > 0;
      return true;
    });
    if (clean.length === 0) return;
    const existing = this.groups.find((g) => g.id === id);
    if (existing) {
      existing.elements.push(...clean);
      return;
    }
    this.groups.push({ id, name, label, order, elements: clean });
  }

  build(): SVGGElementData[] {
    return [...this.groups].sort((a, b) => a.order - b.order);
  }
}

/** Canonical z-order of the semantic layers. */
export const LAYER_ORDER = {
  background: 0,
  construction: 1,
  bhupura: 2,
  orbits: 3,
  lattice: 4,
  architecture: 5,
  petals: 6,
  ribbing: 7,
  polygons: 8,
  ornaments: 9,
  nodes: 10,
  bindu: 11,
} as const;
