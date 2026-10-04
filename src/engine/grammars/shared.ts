import { Point, SVGElementData } from "../../types/geometry";
import { BuildContext, LayerBuilder, LAYER_ORDER } from "../context";
import { constructionLayer } from "../atelier/construction";
import { buildBhupura } from "../atelier/bhupura";
import { buildBindu } from "../atelier/bindu";
import { celestialNodes, decimate } from "../atelier/nodes";
import { planOrbits, renderOrbits } from "../atelier/orbits";
import { TWO_PI, clamp, polar } from "../geom";

export function emitBackground(ctx: BuildContext, layers: LayerBuilder): void {
  const bg = ctx.recipe.canvas.background;
  if (!bg || bg === "transparent") return;
  const w = ctx.recipe.canvas.width / 2;
  const h = ctx.recipe.canvas.height / 2;
  layers.add("jantra-background", "Background", "Canvas Background Plate", LAYER_ORDER.background, [
    {
      id: "bg-plate",
      d: `M ${-w} ${-h} L ${w} ${-h} L ${w} ${h} L ${-w} ${h} Z`,
      fill: bg,
      stroke: "none",
    },
  ]);
}

export function emitConstruction(ctx: BuildContext, layers: LayerBuilder, intensity = 1): void {
  const els = constructionLayer(ctx, { intensity });
  layers.add(
    "jantra-construction",
    "Construction Geometry",
    "Draughting Crosshairs, Graduations & Angle Indicators",
    LAYER_ORDER.construction,
    els
  );
}

export function emitOrbits(
  ctx: BuildContext,
  layers: LayerBuilder,
  radii: number[],
  offset = 0,
  idPrefix = "orbit"
): void {
  const regs = planOrbits(radii, ctx, offset);
  layers.add(
    "jantra-orbits",
    "Orbit Registers",
    "Concentric Solid, Stippled & Beaded Orbital Bands",
    LAYER_ORDER.orbits,
    renderOrbits(regs, ctx, idPrefix)
  );
}

export function emitNodes(
  ctx: BuildContext,
  layers: LayerBuilder,
  points: Point[],
  id: string,
  opts: { r?: number; halo?: boolean; color?: string; max?: number } = {}
): void {
  if (!ctx.detail.nodes || points.length === 0) return;
  const pts = decimate(points, opts.max ?? 120);
  layers.add(
    "jantra-nodes",
    "Celestial Nodes",
    "Luminous Anchor Points at Geometric Intersections",
    LAYER_ORDER.nodes,
    celestialNodes({ points: pts, id, r: opts.r, halo: opts.halo, color: opts.color }, ctx)
  );
}

export function emitBhupura(
  ctx: BuildContext,
  layers: LayerBuilder,
  opts: { sizeFactor?: number; steps?: number } = {}
): void {
  const b = ctx.recipe.parameters.motifs.bhupura;
  if (!b.enabled) return;
  const size = ctx.R * (opts.sizeFactor ?? 0.955);
  const els = buildBhupura(
    { size, steps: opts.steps ?? b.steps, gates: b.gates, finials: b.finials ?? true },
    ctx
  );
  layers.add(
    "jantra-bhupura",
    "Bhupura Enclosure",
    "Double-Lined Stepped Temple Gateway Enclosure",
    LAYER_ORDER.bhupura,
    els
  );
}

export function emitBindu(
  ctx: BuildContext,
  layers: LayerBuilder,
  opts: { scale?: number; bold?: boolean } = {}
): void {
  const bindu = ctx.recipe.parameters.motifs.bindu;
  const els = buildBindu(
    { radius: ctx.binduRadius, style: bindu.style, scale: opts.scale, bold: opts.bold },
    ctx
  );
  layers.add("jantra-bindu", "Bindu", "Radiant Luminous Point of Origin", LAYER_ORDER.bindu, els);
}

export function addPetalLayers(
  layers: LayerBuilder,
  outline: SVGElementData[],
  ribbing: SVGElementData[]
): void {
  layers.add(
    "jantra-petals",
    "Petal Corollas",
    "Multi-Tiered Parametric Petal Corollas (Padma)",
    LAYER_ORDER.petals,
    outline
  );
  layers.add(
    "jantra-ribbing",
    "Filigree Ribbing",
    "Internal Petal Veins & Spine Hatching",
    LAYER_ORDER.ribbing,
    ribbing
  );
}

export function addOrnaments(layers: LayerBuilder, els: SVGElementData[]): void {
  layers.add(
    "jantra-ornaments",
    "Ornaments",
    "Secondary Ornaments, Serrations & Micro-Details",
    LAYER_ORDER.ornaments,
    els
  );
}

export function addArchitecture(layers: LayerBuilder, els: SVGElementData[]): void {
  layers.add(
    "jantra-architecture",
    "Architecture",
    "Nested Enclosures, Sanctum Plans & Mandapa Pillars",
    LAYER_ORDER.architecture,
    els
  );
}

export function addPolygons(layers: LayerBuilder, els: SVGElementData[]): void {
  layers.add(
    "jantra-polygons",
    "Sacred Polygons",
    "Interlocking Triangles, Stellations & Radial Rays",
    LAYER_ORDER.polygons,
    els
  );
}

export function addLattice(layers: LayerBuilder, els: SVGElementData[]): void {
  layers.add(
    "jantra-lattice",
    "Jali Lattice",
    "Guilloché Weave & Pierced Screen Micro-Texture",
    LAYER_ORDER.lattice,
    els
  );
}

/** Evenly spaced anchor points around a radius. */
export function anchorsOn(r: number, count: number, rotation = 0): Point[] {
  const n = clamp(Math.round(count), 1, 96);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) pts.push(polar(r, rotation + (i / n) * TWO_PI));
  return pts;
}

/**
 * Radial density gradient: outer registers carry more repeats than inner
 * ones, which is how real mandalas keep a constant arc-length rhythm.
 */
export function countForRadius(ctx: BuildContext, r: number, base = ctx.segments): number {
  const t = clamp(r / Math.max(1, ctx.artR), 0, 1.2);
  const mul = clamp(Math.round(1 + t * 2.6), 1, 4);
  return clamp(Math.round(base * mul), 3, 128);
}

/** Number of petal tiers implied by the recursion depth. */
export function tierCountFor(ctx: BuildContext, min = 2, max = 4): number {
  return clamp(min + Math.floor(ctx.recursionDepth / 2), min, max);
}
