/**
 * Dev utility: render every grammar family (and every preset) to an SVG file
 * in .preview/ so the artwork can be eyeballed outside the browser.
 *   npx tsx scripts/render-preview.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { generateScene } from "../src/engine/generator";
import { serializeSceneToSVG } from "../src/engine/serializer";
import { defaultRecipe, PRESETS } from "../src/presets/defaultPresets";
import { GRAMMAR_FAMILIES, GrammarFamily } from "../src/types/recipe";
import { spawnDescendants } from "../src/engine/genealogy";

const OUT = ".preview";
mkdirSync(OUT, { recursive: true });

function emit(name: string, recipe: Parameters<typeof generateScene>[0]) {
  const scene = generateScene(recipe);
  const svg = serializeSceneToSVG(scene, recipe, { includeMetadata: false });
  writeFileSync(`${OUT}/${name}.svg`, svg);
  console.log(`${name.padEnd(26)} ${String(scene.totalPaths).padStart(4)} paths  ${String(scene.totalVertices).padStart(6)} nodes  ${(svg.length / 1024).toFixed(1)}kb`);
}

for (const f of GRAMMAR_FAMILIES) {
  emit(`family-${f.id}`, {
    ...defaultRecipe,
    seed: "108",
    grammar: { family: f.id as GrammarFamily, id: `jantra-${f.id}`, version: "0.1.8" },
  });
}

for (const p of PRESETS) emit(`preset-${p.id}`, p.recipe);

for (const child of spawnDescendants(defaultRecipe)) emit(`evolve-${child.lineageId}`, child.recipe);

for (const prana of [0, 20, 50, 80, 100]) {
  emit(`prana-${prana}`, { ...defaultRecipe, parameters: { ...defaultRecipe.parameters, prana } });
}
