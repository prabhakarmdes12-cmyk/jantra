import { GrammarFamily, JantraRecipe } from "../types/recipe";
import { GeneratedScene, SVGCircleElementData, SVGPolygonElementData } from "../types/geometry";
import { createContext, LayerBuilder } from "./context";
import { resolvePipeline } from "./grammars";
import { normalizeRecipe } from "./normalize";

/** Rough stroke-length estimate used by the growth animation + diagnostics. */
function estimatePathLength(d: string): number {
  if (!d) return 0;
  let len = 0;
  const cmds = d.match(/[MLCQAZ]/gi);
  if (!cmds) return 0;
  for (const cmd of cmds) {
    const c = cmd.toUpperCase();
    if (c === "L") len += 30;
    else if (c === "M") len += 2;
    else if (c === "C") len += 75;
    else if (c === "Q") len += 55;
    else if (c === "A") len += 90;
    else if (c === "Z") len += 20;
  }
  return len;
}

function countNodes(d: string): number {
  const cmds = d.match(/[MLCQAZ]/gi);
  if (!cmds) return 0;
  let n = 0;
  for (const cmd of cmds) {
    const c = cmd.toUpperCase();
    if (c === "C") n += 3;
    else if (c === "Q") n += 2;
    else if (c === "A") n += 2;
    else if (c === "Z") n += 0;
    else n += 1;
  }
  return n;
}

export function generateScene(inputRecipe: JantraRecipe): GeneratedScene {
  const recipe = normalizeRecipe(inputRecipe);
  const width = recipe.canvas.width || 1600;
  const height = recipe.canvas.height || 1600;
  const viewBox = `${-width / 2} ${-height / 2} ${width} ${height}`;
  const background = recipe.canvas.background || "transparent";

  const ctx = createContext(recipe);
  const layers = new LayerBuilder();

  const pipeline = resolvePipeline(recipe.grammar.family as GrammarFamily);
  pipeline(ctx, layers);

  const groups = layers.build();

  let totalPaths = 0;
  let totalVertices = 0;
  let computedLength = 0;

  for (const g of groups) {
    for (const el of g.elements) {
      totalPaths++;
      if ("d" in el && el.d) {
        computedLength += estimatePathLength(el.d);
        totalVertices += countNodes(el.d);
      } else if ("r" in el) {
        const c = el as SVGCircleElementData;
        computedLength += 2 * Math.PI * c.r;
        totalVertices += 4;
      } else if ("points" in el) {
        const p = el as SVGPolygonElementData;
        totalVertices += p.points.trim().split(/\s+/).length;
        computedLength += 100;
      }
    }
  }

  return {
    viewBox,
    width,
    height,
    background,
    groups,
    totalPaths,
    totalVertices: Math.max(1, totalVertices),
    computedLength: Math.max(100, computedLength),
  };
}
