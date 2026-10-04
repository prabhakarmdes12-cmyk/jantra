import { GrammarFamily, JantraRecipe } from "../types/recipe";
import { IntentChange, IntentParseResult } from "./schema";
import { defaultDetailFor } from "../engine/normalize";

/**
 * Keyword → grammar family resolution, ordered most-specific first.
 * The first family whose cue appears in the prompt wins.
 */
const FAMILY_CUES: Array<{ family: GrammarFamily; cues: string[] }> = [
  { family: "yantra", cues: ["sri yantra", "shree yantra", "navayoni", "shatkona", "trikona", "yantra", "interlocking triangle"] },
  { family: "temple", cues: ["temple", "gopuram", "vastu", "gate", "lintel", "sanctum", "architectural plan", "floor plan"] },
  { family: "ornamental", cues: ["guilloche", "guilloché", "jali", "lattice", "woven", "weave", "engrav", "filigree", "banknote"] },
  { family: "organic", cues: ["organic", "tendril", "vine", "flowing", "flow", "living", "breath", "growth", "wabi"] },
  { family: "minimal", cues: ["minimal", "poster", "sparse", "quiet", "zen", "shunya", "empty", "restrained"] },
  { family: "experimental", cues: ["experimental", "hybrid", "asymmetr", "glitch", "chaos", "unstable", "mutant"] },
  { family: "mandala", cues: ["mandala", "chakra", "wheel", "coloring", "rings of"] },
  { family: "lotus", cues: ["lotus", "padma", "petal", "bloom", "flower", "floral", "dala"] },
];

const WORD_NUMBERS: Record<string, number> = {
  three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, sixteen: 16, eighteen: 18, twenty: 20, "twenty four": 24,
  "twenty-four": 24, thirty: 30, "thirty two": 32, "thirty-two": 32,
};

export function parseIntentPrompt(prompt: string, currentRecipe: JantraRecipe): IntentParseResult {
  const text = prompt.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  const changesSummary: IntentChange[] = [];
  const params = JSON.parse(JSON.stringify(currentRecipe.parameters)) as JantraRecipe["parameters"];

  const note = (label: string, from: string | number, to: string | number) => {
    if (String(from) !== String(to)) changesSummary.push({ label, from, to });
  };

  /* ---------- 1. Grammar family ---------- */
  let matchedFamily: GrammarFamily | undefined;
  for (const entry of FAMILY_CUES) {
    if (entry.cues.some((cue) => text.includes(cue))) {
      matchedFamily = entry.family;
      matchedKeywords.push(`${entry.family} grammar`);
      note("Grammar Family", currentRecipe.grammar.family, entry.family);
      break;
    }
  }

  /* ---------- 2. Archetypes that also pin motifs ---------- */
  let archetype = false;
  if (text.includes("sri yantra") || text.includes("shree yantra") || text.includes("navayoni")) {
    matchedKeywords.push("sri yantra 9-triangle archetype");
    note("Primary Motif", params.motifs.primary, "sri_yantra");
    params.motifs.primary = "sri_yantra";
    params.motifs.bhupura.enabled = true;
    params.motifs.bhupura.steps = 3;
    params.rings.count = Math.max(params.rings.count, 6);
    archetype = true;
  } else if (text.includes("sikku kolam") || text.includes("brahma mudi") || text.includes("knotwork") || text.includes("kolam")) {
    matchedKeywords.push("sikku kolam loop knotwork");
    note("Primary Motif", params.motifs.primary, "kolam_knot");
    params.motifs.primary = "kolam_knot";
    params.motifs.bhupura.enabled = false;
    params.prana = 62;
    archetype = true;
  }

  /* ---------- 3. Symmetry fold count ---------- */
  const foldMatch = text.match(/(\d+)\s*[-_ ]*(fold|segment|petal|spoke|point|sided|dala)/i);
  const wordFold = Object.keys(WORD_NUMBERS).find((w) =>
    new RegExp(`\\b${w}\\s*[-_ ]*(fold|petal|point|sided|dala|spoke)`).test(text)
  );
  const foldCount = foldMatch ? parseInt(foldMatch[1], 10) : wordFold ? WORD_NUMBERS[wordFold] : undefined;
  if (foldCount && foldCount >= 3 && foldCount <= 36) {
    matchedKeywords.push(`${foldCount}-fold symmetry`);
    note("Symmetry Segments", params.symmetry.segments, foldCount);
    params.symmetry.segments = foldCount;
  } else if (text.includes("sahasrara") || text.includes("crown")) {
    matchedKeywords.push("32-fold sahasrara crown");
    note("Symmetry Segments", params.symmetry.segments, 32);
    params.symmetry.segments = 32;
  } else if (text.includes("anahata") || text.includes("heart chakra")) {
    matchedKeywords.push("12-fold anahata chakra");
    note("Symmetry Segments", params.symmetry.segments, 12);
    params.symmetry.segments = 12;
    params.palette.accent = "#10b981";
  }

  if (text.includes("bilateral") || text.includes("mirror")) {
    note("Symmetry Mode", params.symmetry.mode, "bilateral");
    params.symmetry.mode = "bilateral";
    matchedKeywords.push("bilateral symmetry");
  } else if (text.includes("grid") && !text.includes("lotus grid")) {
    note("Symmetry Mode", params.symmetry.mode, "grid");
    params.symmetry.mode = "grid";
    matchedKeywords.push("grid symmetry");
  } else if (text.includes("hybrid") || text.includes("multi-fold") || text.includes("nested symmetry")) {
    note("Symmetry Mode", params.symmetry.mode, "hybrid");
    params.symmetry.mode = "hybrid";
    params.symmetry.outerMultiplier = 2;
    matchedKeywords.push("hybrid nested symmetry");
  }

  if (text.includes("asymmetr") || text.includes("off-axis") || text.includes("skew")) {
    note("Asymmetry", params.symmetry.asymmetry ?? 0, 9);
    params.symmetry.asymmetry = 9;
    matchedKeywords.push("controlled asymmetry");
  }

  /* ---------- 4. Density & complexity ---------- */
  if (/\b(minimal|sparse|quiet|calm|simple|restrained|zen|empty)\b/.test(text)) {
    matchedKeywords.push("minimal density");
    note("Density", params.density, 0.16);
    params.density = 0.16;
    params.rings.count = 3;
    params.recursion.depth = 1;
    params.detail = { ...defaultDetailFor("minimal") };
  } else if (/\b(dense|intricate|complex|detailed|rich|ornate|maximal|baroque)\b/.test(text)) {
    matchedKeywords.push("intricate density");
    note("Density", params.density, 0.72);
    params.density = 0.72;
    params.rings.count = Math.max(params.rings.count, 8);
    params.recursion.depth = Math.max(params.recursion.depth, 4);
    params.detail = {
      ribbing: true,
      ribCount: 7,
      stipple: true,
      nodes: true,
      construction: params.detail?.construction ?? true,
      lattice: true,
    };
  }

  /* ---------- 5. Prana, now a 0–100 life scale ---------- */
  const pranaNum = text.match(/prana\s*(?:of|=|:)?\s*(\d{1,3})/);
  if (pranaNum) {
    const v = Math.max(0, Math.min(100, parseInt(pranaNum[1], 10)));
    matchedKeywords.push(`prana ${v}`);
    note("Prana", params.prana, v);
    params.prana = v;
  } else if (/\b(chaos|wild|edge of chaos|expressive|turbulent|feverish)\b/.test(text)) {
    matchedKeywords.push("expressive tension (prana 100)");
    note("Prana", params.prana, 100);
    params.prana = 100;
    params.line.cap = "round";
  } else if (/\b(high prana|more prana|vital|alive|hand-drawn|handmade|imperfect|wabi)\b/.test(text)) {
    matchedKeywords.push("organic vitality (prana 80)");
    note("Prana", params.prana, 80);
    params.prana = 80;
    params.line.cap = "round";
  } else if (/\b(breathing|living|gentle|flowing|soft)\b/.test(text)) {
    matchedKeywords.push("radial breathing (prana 50)");
    note("Prana", params.prana, 50);
    params.prana = 50;
  } else if (/\b(zero prana|no prana|crisp|sharp|precise|cad|architectural|clean|mechanical|exact)\b/.test(text)) {
    matchedKeywords.push("pure geometry (prana 0)");
    note("Prana", params.prana, 0);
    params.prana = 0;
    params.line.cap = "butt";
  } else if (text.includes("prana")) {
    matchedKeywords.push("micro-tension (prana 20)");
    note("Prana", params.prana, 20);
    params.prana = 20;
  }

  /* ---------- 6. Motifs ---------- */
  if (!archetype) {
    const motifMap: Array<[RegExp, JantraRecipe["parameters"]["motifs"]["primary"]]> = [
      [/double lotus|two[- ]tier lotus|layered lotus/, "lotus_double"],
      [/pointed lotus|sharp petal|lance petal/, "lotus_pointed"],
      [/lotus|padma|dala/, "lotus_lobe"],
      [/petal|flower|bloom|floral/, "petal"],
      [/trikona|triangle|shatkona/, "triangle"],
      [/star|sun|solar|surya|stella/, "star"],
      [/diamond|lozenge/, "diamond"],
      [/chevron|jali|lattice/, "chevron"],
    ];
    for (const [re, motif] of motifMap) {
      if (re.test(text)) {
        matchedKeywords.push(`${motif} motif`);
        note("Primary Motif", params.motifs.primary, motif);
        params.motifs.primary = motif;
        break;
      }
    }
  }

  /* ---------- 7. Enclosure ---------- */
  if (/\b(temple|gate|bhupura|citadel|sacred enclosure|earth frame|gopuram|lintel)\b/.test(text)) {
    matchedKeywords.push("stepped bhupura enclosure");
    note("Bhupura", params.motifs.bhupura.enabled ? "On" : "Off", "On");
    params.motifs.bhupura.enabled = true;
    params.motifs.bhupura.steps = Math.max(params.motifs.bhupura.steps, 3);
    params.motifs.bhupura.gates = 4;
  } else if (/\b(no border|no frame|frameless|no temple|borderless|open field)\b/.test(text)) {
    matchedKeywords.push("no enclosure");
    note("Bhupura", params.motifs.bhupura.enabled ? "On" : "Off", "Off");
    params.motifs.bhupura.enabled = false;
  }

  /* ---------- 8. Bindu ---------- */
  if (/triple aura|triple bindu|3 aura/.test(text)) {
    note("Bindu Style", params.motifs.bindu.style, "triple_aura");
    params.motifs.bindu.style = "triple_aura";
    params.motifs.bindu.radius = Math.max(12, params.motifs.bindu.radius);
    matchedKeywords.push("triple-aura bindu");
  } else if (/radiant bindu|glowing cent|luminous cent|solar cent|bold bindu/.test(text)) {
    note("Bindu Style", params.motifs.bindu.style, "radiant");
    params.motifs.bindu.style = "radiant";
    params.motifs.bindu.radius = Math.max(14, params.motifs.bindu.radius);
    matchedKeywords.push("radiant bindu");
  } else if (/hollow cent|open cent|ring cent/.test(text)) {
    note("Bindu Style", params.motifs.bindu.style, "hollow");
    params.motifs.bindu.style = "hollow";
    matchedKeywords.push("hollow bindu");
  } else if (/solid bindu|dot cent|point cent/.test(text)) {
    note("Bindu Style", params.motifs.bindu.style, "solid");
    params.motifs.bindu.style = "solid";
    matchedKeywords.push("solid bindu");
  }

  /* ---------- 9. Palette ---------- */
  if (/\b(gold|saffron|amber|yellow|brass)\b/.test(text)) {
    note("Accent", params.palette.accent, "#f59e0b");
    params.palette.accent = "#f59e0b";
    params.palette.stroke = "#fef3c7";
    matchedKeywords.push("gold / saffron palette");
  } else if (/\b(kumkum|crimson|red|ruby|rose|vermilion)\b/.test(text)) {
    note("Accent", params.palette.accent, "#f43f5e");
    params.palette.accent = "#f43f5e";
    params.palette.stroke = "#ffe4e6";
    matchedKeywords.push("kumkum palette");
  } else if (/\b(cyan|sky|blue|azure|cosmic|indigo|teal)\b/.test(text)) {
    note("Accent", params.palette.accent, "#38bdf8");
    params.palette.accent = "#38bdf8";
    params.palette.stroke = "#e0f2fe";
    matchedKeywords.push("cosmic azure palette");
  } else if (/\b(silver|white|monochrome|grayscale|greyscale|ivory)\b/.test(text)) {
    note("Accent", params.palette.accent, "#a1a1aa");
    params.palette.accent = "#a1a1aa";
    params.palette.stroke = "#f4f4f5";
    matchedKeywords.push("monochrome palette");
  }

  /* ---------- 10. Ring spacing ---------- */
  if (/golden ratio|fibonacci|\bphi\b/.test(text)) {
    params.rings.spacing = "golden";
    matchedKeywords.push("golden-ratio ring spacing");
  } else if (text.includes("harmonic")) {
    params.rings.spacing = "harmonic";
    matchedKeywords.push("harmonic ring spacing");
  } else if (text.includes("exponential")) {
    params.rings.spacing = "exponential";
    matchedKeywords.push("exponential ring spacing");
  } else if (text.includes("linear") || text.includes("even")) {
    params.rings.spacing = "linear";
    matchedKeywords.push("linear ring spacing");
  }

  /* ---------- 11. Detail flags ---------- */
  if (/\b(vein|rib|hatch|filigree)\b/.test(text)) {
    params.detail = { ...(params.detail ?? defaultDetailFor(matchedFamily ?? currentRecipe.grammar.family)), ribbing: true, ribCount: 7 };
    matchedKeywords.push("petal ribbing");
  }
  if (/\b(stipple|bead|dotted|dashed)\b/.test(text)) {
    params.detail = { ...(params.detail ?? defaultDetailFor(matchedFamily ?? currentRecipe.grammar.family)), stipple: true };
    matchedKeywords.push("stipple orbits");
  }
  if (/\b(no construction|hide guides|no guides)\b/.test(text)) {
    params.detail = { ...(params.detail ?? defaultDetailFor(matchedFamily ?? currentRecipe.grammar.family)), construction: false };
    matchedKeywords.push("construction geometry off");
  }

  if (matchedKeywords.length === 0) {
    matchedKeywords.push("general harmony tuning");
    const nudged = Math.round((0.25 + (prompt.length % 5) * 0.1) * 100) / 100;
    note("Density", params.density, nudged);
    params.density = nudged;
  }

  const family = matchedFamily ?? currentRecipe.grammar.family;
  const suggestedRecipe: JantraRecipe = {
    ...currentRecipe,
    grammar: matchedFamily
      ? { family: matchedFamily, id: `jantra-${matchedFamily}`, version: currentRecipe.grammar.version }
      : currentRecipe.grammar,
    parameters: params,
    provenance: {
      ...currentRecipe.provenance,
      aiInterpreted: true,
      promptText: prompt,
      createdAt: new Date().toISOString(),
    },
  };

  const confidence = Math.min(1, 0.35 + matchedKeywords.length * 0.14);
  const explanation = `Interpreted “${prompt}” as ${family} grammar with ${matchedKeywords.join(", ")}.`;
  const summary = `${family} · ${matchedKeywords.slice(0, 3).join(" · ")}`;

  return { rawPrompt: prompt, matchedKeywords, suggestedRecipe, changesSummary, matchedFamily, explanation, summary, confidence };
}
