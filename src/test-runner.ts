import { defaultRecipe, PRESETS } from "./presets/defaultPresets";
import { generateScene } from "./engine/generator";
import { serializeSceneToSVG, computePreflightDiagnostics } from "./engine/serializer";
import { parseIntentPrompt } from "./ai/intentParser";
import { encodeRecipeToUrlHash, decodeRecipeFromUrlHash } from "./utils/url";
import { createPRNG } from "./engine/prng";
import { GRAMMAR_FAMILY_IDS, GrammarFamily } from "./types/recipe";
import { normalizeRecipe } from "./engine/normalize";
import { spawnDescendants, resolveLineage, ancestryOf, generationOf } from "./engine/genealogy";
import { createPranaField, PRANA_STAGES } from "./engine/prana";

console.log("=========================================");
console.log("   JANTRA EXPANDED VERIFICATION SUITE   ");
console.log("=========================================\n");

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

// TEST 1: PRNG Determinism
const prng1 = createPRNG("108");
const seq1 = [prng1.next(), prng1.next(), prng1.next()];
const prng2 = createPRNG("108");
const seq2 = [prng2.next(), prng2.next(), prng2.next()];
assert(
  JSON.stringify(seq1) === JSON.stringify(seq2),
  "PRNG produces 100% identical sequence for same seed '108'"
);

// TEST 2: Procedural Generator Determinism
const sceneA = generateScene(defaultRecipe);
const svgA = serializeSceneToSVG(sceneA, defaultRecipe);
const sceneB = generateScene(defaultRecipe);
const svgB = serializeSceneToSVG(sceneB, defaultRecipe);
assert(svgA === svgB, "Scene generator is 100% deterministic (svgA === svgB)");

// TEST 3: Distinct Seeds Produce Distinct Outputs
const recipeOther = { ...defaultRecipe, seed: "9999" };
const sceneOther = generateScene(recipeOther);
const svgOther = serializeSceneToSVG(sceneOther, recipeOther);
assert(svgA !== svgOther, "Different seeds produce different vector compositions");

// TEST 4: Semantic Layer Groups for Figma & Illustrator
const diagnostics = computePreflightDiagnostics(sceneA, svgA);
assert(diagnostics.layerGroups.length >= 3, "SVG contains semantic layer groups");
assert(diagnostics.hasForeignObjects === false, "0 foreignObject tags in output SVG");
assert(diagnostics.hasScripts === false, "0 script tags in output SVG");
assert(diagnostics.figmaCompatible === true, "Preflight flags Figma & Illustrator compatibility as verified");
assert(diagnostics.plotterReady === true, "Preflight flags Plotter / Laser / CNC readiness as verified");

// TEST 5: Animated & Plotter Serializers
const svgAnimated = serializeSceneToSVG(sceneA, defaultRecipe, { animated: true });
assert(svgAnimated.includes("@keyframes jantraDraw"), "Animated SVG contains pure CSS draw keyframes");

const svgPlotter = serializeSceneToSVG(sceneA, defaultRecipe, { plotterMode: true });
assert(svgPlotter.includes("stroke-width=\"0.3\""), "Plotter SVG exports single hairline vector paths");

// TEST 6: All 11+ Curated Presets Render Successfully
for (const p of PRESETS) {
  const sceneP = generateScene(p.recipe);
  const svgP = serializeSceneToSVG(sceneP, p.recipe);
  assert(sceneP.totalPaths > 0 && svgP.length > 500, `Preset '${p.name}' renders valid vector scene (${sceneP.totalPaths} paths)`);
}

// TEST 7: Natural Language Intent Parsing for Sacred Concepts
const intent1 = parseIntentPrompt("minimal 16-fold lotus with high prana", defaultRecipe);
assert(intent1.suggestedRecipe.parameters.symmetry.segments === 16, "Intent parser extracts 16-fold symmetry");
assert(intent1.suggestedRecipe.parameters.motifs.primary.includes("lotus") || intent1.suggestedRecipe.parameters.motifs.primary === "petal", "Intent parser extracts lotus motif");
assert(intent1.suggestedRecipe.parameters.prana >= 50, "Intent parser extracts high prana on the 0-100 scale");
assert(intent1.confidence > 0.5, "Intent parser confidence is high for explicit query");

const intentSriYantra = parseIntentPrompt("sacred sri yantra archetype with stepped temple gates", defaultRecipe);
assert(intentSriYantra.suggestedRecipe.parameters.motifs.primary === "sri_yantra", "Intent parser extracts Sri Yantra archetype");
assert(intentSriYantra.suggestedRecipe.parameters.motifs.bhupura.enabled === true, "Intent parser enables Bhupura stepped frame");

const intentKolam = parseIntentPrompt("brahma mudi sikku kolam continuous loop knotwork", defaultRecipe);
assert(intentKolam.suggestedRecipe.parameters.motifs.primary === "kolam_knot", "Intent parser extracts Sikku Kolam loop knotwork");

// TEST 8: Lossless URL Hash Compression Roundtrip
const encoded = encodeRecipeToUrlHash(defaultRecipe);
const decoded = decodeRecipeFromUrlHash(encoded);
assert(
  decoded !== null && decoded.seed === defaultRecipe.seed && decoded.parameters.symmetry.segments === defaultRecipe.parameters.symmetry.segments,
  "URL Hash encoding & decoding roundtrip is lossless"
);


/* ================================================================== */
/* TEST 9: Eight visual grammar families                              */
/* ================================================================== */
assert(GRAMMAR_FAMILY_IDS.length === 8, "Exactly 8 visual grammar families are registered");

const familySignatures = new Map<GrammarFamily, string>();
for (const family of GRAMMAR_FAMILY_IDS) {
  const recipe = normalizeRecipe({
    ...defaultRecipe,
    grammar: { family, id: `jantra-${family}`, version: "1.0.0" },
  });
  const scene = generateScene(recipe);
  const svg = serializeSceneToSVG(scene, recipe);
  assert(scene.totalPaths > 0 && scene.totalVertices > 0, `Grammar '${family}' produces a non-empty vector scene`);
  assert(svg === serializeSceneToSVG(generateScene(recipe), recipe), `Grammar '${family}' is deterministic`);
  familySignatures.set(family, svg);
}
assert(
  new Set(familySignatures.values()).size === 8,
  "All 8 grammar families produce visually distinct output"
);

/* ================================================================== */
/* TEST 10: Prana as a 0-100 scale of controlled life                 */
/* ================================================================== */
assert(
  PRANA_STAGES.map((s) => s.at).join(",") === "0,20,50,80,100",
  "Prana stages are defined at 0 / 20 / 50 / 80 / 100"
);

const pureField = createPranaField(0, "108");
assert(pureField.isPure, "Prana 0 reports pure CAD geometry");
assert(
  pureField.breathe(1.1, 2) === 1 &&
    pureField.wobble(0.4, 300, 2)[0] === 0 &&
    pureField.wobble(0.4, 300, 2)[1] === 0 &&
    pureField.tension(0.4, 2) === 1 &&
    pureField.weight(2, 1) === 2,
  "Prana 0 applies zero breathing, zero wobble and uniform line weights"
);

const microField = createPranaField(20, "108");
const microWeights = [0, 1, 2].map((tier) => microField.weight(1, tier));
assert(
  new Set(microWeights.map((w) => w.toFixed(4))).size > 1,
  "Prana 20 introduces alternating line weights across tiers"
);

const tensionField = createPranaField(100, "108");
assert(
  Math.abs(tensionField.breathe(1.1, 2) - 1) > Math.abs(createPranaField(50, "108").breathe(1.1, 2) - 1),
  "Prana 100 breathes harder than prana 50"
);

const pranaSignatures = [0, 20, 50, 80, 100].map((prana) => {
  const recipe = normalizeRecipe({ ...defaultRecipe, parameters: { ...defaultRecipe.parameters, prana } });
  return serializeSceneToSVG(generateScene(recipe), recipe);
});
assert(new Set(pranaSignatures).size === 5, "Each prana stage yields a distinct composition");

/* ================================================================== */
/* TEST 11: Deterministic evolutionary genealogy                      */
/* ================================================================== */
const root = normalizeRecipe({ ...defaultRecipe, seed: "108" });
const gen1 = spawnDescendants(root);
assert(gen1.length === 6, "Seed 108 spawns exactly 6 descendants");
assert(
  gen1.map((n) => n.lineageId).join(",") === "108-A,108-B,108-C,108-D,108-E,108-F",
  "Gen-1 descendants are named 108-A through 108-F"
);
assert(
  gen1.every((n) => n.generation === 1 && n.parentLineageId === "108"),
  "Gen-1 descendants carry the correct generation and parent"
);
assert(
  gen1.map((n) => serializeSceneToSVG(generateScene(n.recipe), n.recipe)).join("|") ===
    spawnDescendants(root).map((n) => serializeSceneToSVG(generateScene(n.recipe), n.recipe)).join("|"),
  "Evolution is 100% reproducible across runs"
);
assert(
  new Set(gen1.map((n) => serializeSceneToSVG(generateScene(n.recipe), n.recipe))).size === 6,
  "All 6 descendants are visually distinct from each other"
);

const templeChild = gen1.find((n) => n.lineageId === "108-B")!;
assert(
  templeChild.recipe.grammar.family === "temple" && templeChild.recipe.parameters.motifs.bhupura.enabled,
  "Descendant 108-B applies the temple-gate operator"
);
assert(gen1.find((n) => n.lineageId === "108-D")!.recipe.grammar.family === "minimal", "Descendant 108-D is minimal");
assert(
  gen1.find((n) => n.lineageId === "108-C")!.recipe.parameters.prana > root.parameters.prana,
  "Descendant 108-C raises prana for organic flow"
);

const gen2 = spawnDescendants(templeChild.recipe);
assert(
  gen2.map((n) => n.lineageId).join(",") === "108-B-1,108-B-2,108-B-3",
  "Evolving 108-B yields 108-B-1 / -2 / -3"
);
assert(generationOf("108-B-2") === 2, "Generation depth is read from the lineage id");
assert(
  ancestryOf("108-B-2").join(" > ") === "108 > 108-B > 108-B-2",
  "Ancestry resolves the full path back to the root"
);
assert(
  serializeSceneToSVG(generateScene(resolveLineage(root, "108-B-2")), resolveLineage(root, "108-B-2")) ===
    serializeSceneToSVG(generateScene(gen2[1].recipe), gen2[1].recipe),
  "A lineage id alone reproduces its exact descendant from the root"
);

/* ================================================================== */
/* TEST 12: Export guarantees                                         */
/* ================================================================== */
const exportScene = generateScene(root);
const exportSvg = serializeSceneToSVG(exportScene, root);
assert(!/\b(image|use)\s+[^>]*href=/.test(exportSvg), "Export SVG has no external dependencies");
assert(exportSvg.includes('data-jantra-seed="108"'), "Export SVG embeds its reproducible seed");
assert(
  (exportSvg.match(/<path/g) ?? []).length + (exportSvg.match(/<circle/g) ?? []).length > 0,
  "Export SVG is made of editable vector primitives"
);

console.log(`\n=========================================`);
console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
console.log(`=========================================\n`);

if (passed !== total) {
  process.exit(1);
}
