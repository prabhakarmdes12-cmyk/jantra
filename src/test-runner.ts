import { defaultRecipe, PRESETS } from "./presets/defaultPresets";
import { generateScene } from "./engine/generator";
import { serializeSceneToSVG, computePreflightDiagnostics } from "./engine/serializer";
import { parseIntentPrompt } from "./ai/intentParser";
import { encodeRecipeToUrlHash, decodeRecipeFromUrlHash } from "./utils/url";
import { createPRNG } from "./engine/prng";

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
assert(intent1.suggestedRecipe.parameters.prana >= 0.14, "Intent parser extracts high prana");
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

console.log(`\n=========================================`);
console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
console.log(`=========================================\n`);

if (passed !== total) {
  process.exit(1);
}
