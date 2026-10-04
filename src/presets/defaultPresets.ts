import { GrammarFamily, JantraRecipe, PresetRecipe } from "../types/recipe";
import { DEFAULT_INK } from "./inkPalettes";
import { defaultDetailLevelFor, ENGINE_VERSION } from "../engine/normalize";

const CREATED = "2026-10-04T00:00:00.000Z";

export function makeRecipe(
  family: GrammarFamily,
  seed: string,
  params: Partial<JantraRecipe["parameters"]>,
  canvas: Partial<JantraRecipe["canvas"]> = {},
  promptText = ""
): JantraRecipe {
  return {
    schemaVersion: "1.1",
    engineVersion: ENGINE_VERSION,
    grammar: { family, id: `jantra-${family}`, version: ENGINE_VERSION },
    seed,
    canvas: {
      width: 1600,
      height: 1600,
      background: "#09090b",
      margin: 0.08,
      ...canvas,
    },
    parameters: {
      symmetry: { mode: "radial", segments: 8, outerMultiplier: 1, asymmetry: 0 },
      rings: { count: 5, spacing: "harmonic", showGuideLines: false },
      recursion: { depth: 3, scale: 0.65 },
      density: 0.38,
      prana: 22,
      line: { weight: 2.17, cap: "round", color: DEFAULT_INK.stroke, dashPattern: "none" },
      motifs: {
        primary: "lotus_lobe",
        secondary: "dot",
        bindu: { radius: 13, style: "radiant" },
        bhupura: { enabled: true, gates: 4, steps: 2, finials: true },
      },
      detailLevel: defaultDetailLevelFor(family),
      evolution: { strength: 50, mutation: "structured" },
      palette: {
        stroke: DEFAULT_INK.stroke,
        secondaryStroke: DEFAULT_INK.secondaryStroke,
        accent: DEFAULT_INK.accent,
        construction: DEFAULT_INK.construction,
        fill: "none",
      },
      ...params,
    },
    provenance: {
      aiInterpreted: false,
      promptText,
      lineageId: seed,
      generation: 0,
      createdAt: CREATED,
    },
  };
}

/** The composition JANTRA opens with. */
export const defaultRecipe: JantraRecipe = makeRecipe(
  "lotus",
  "108",
  {
    symmetry: { mode: "radial", segments: 8, outerMultiplier: 2, asymmetry: 0 },
    rings: { count: 6, spacing: "harmonic", showGuideLines: false },
    recursion: { depth: 4, scale: 0.68 },
    density: 0.42,
    prana: 24,
    line: { weight: 2.02, cap: "round", color: "#f4f4f5", dashPattern: "none" },
    motifs: {
      primary: "lotus_lobe",
      secondary: "dot",
      bindu: { radius: 15, style: "radiant" },
      bhupura: { enabled: true, gates: 4, steps: 2, finials: true },
    },
    detailLevel: defaultDetailLevelFor("lotus"),
    detail: { ribCount: 5 },
  },
  {},
  "Eight-fold sacred lotus with filigree ribbing, stippled orbit bands and a stepped bhupura"
);

export const PRESETS: PresetRecipe[] = [
  {
    id: "ashta-padma",
    name: "Ashta Padma",
    sanskritName: "अष्टदल पद्म",
    description:
      "Eight-fold blooming lotus: three petal tiers with fanned internal veins, alternating stipple orbits and a two-step earth citadel.",
    category: "floral",
    recipe: defaultRecipe,
  },
  {
    id: "sri-yantra",
    name: "Sri Yantra Mahameru",
    sanskritName: "श्री यन्त्र",
    description:
      "Nine interlocking Shiva–Shakti triangles generating the navayoni lattice, ringed by 8 and 16 petal padma tiers and a degree dial.",
    category: "sacred",
    recipe: makeRecipe(
      "yantra",
      "9",
      {
        symmetry: { mode: "radial", segments: 8, outerMultiplier: 1, asymmetry: 0 },
        rings: { count: 5, spacing: "harmonic", showGuideLines: false },
        recursion: { depth: 3, scale: 0.72 },
        density: 0.46,
        prana: 8,
        line: { weight: 2.02, cap: "butt", color: "#fef3c7" },
        motifs: {
          primary: "sri_yantra",
          secondary: "dot",
          bindu: { radius: 11, style: "triple_aura" },
          bhupura: { enabled: true, gates: 4, steps: 3, finials: true },
        },
        detailLevel: defaultDetailLevelFor("yantra"),
        palette: {
          stroke: "#f2cd87",
          secondaryStroke: "#8a6228",
          accent: "#f59e0b",
          construction: "#7a5a24",
          fill: "none",
        },
      },
      {},
      "Sri Yantra Mahameru archetype"
    ),
  },
  {
    id: "temple-gate",
    name: "Temple Gate Plan",
    sanskritName: "गोपुरम्",
    description:
      "Nested prakara enclosures, a mandapa pillar grid and the garbhagriha sanctum, framed by triple-stepped gopuram gateways.",
    category: "architectural",
    recipe: makeRecipe(
      "temple",
      "432",
      {
        symmetry: { mode: "grid", segments: 8, outerMultiplier: 1, asymmetry: 0 },
        rings: { count: 5, spacing: "linear", showGuideLines: false },
        recursion: { depth: 3, scale: 0.7 },
        density: 0.44,
        prana: 10,
        line: { weight: 2.33, cap: "butt", color: "#fde68a" },
        motifs: {
          primary: "chevron",
          secondary: "cross",
          bindu: { radius: 12, style: "solid" },
          bhupura: { enabled: true, gates: 4, steps: 3, finials: true },
        },
        detailLevel: defaultDetailLevelFor("temple"),
        palette: {
          stroke: "#e8b96a",
          secondaryStroke: "#92400e",
          accent: "#f59e0b",
          construction: "#7a5a24",
          fill: "none",
        },
      },
      {},
      "Dravidian temple plan with layered gopuram gates"
    ),
  },
  {
    id: "mandala-24",
    name: "Chakra Mandala",
    sanskritName: "चक्र मण्डल",
    description:
      "Twelve alternating registers — corolla, serration, scallop, comb — pinned by a hundred celestial intersection nodes.",
    category: "sacred",
    recipe: makeRecipe(
      "mandala",
      "1008",
      {
        symmetry: { mode: "radial", segments: 12, outerMultiplier: 2, asymmetry: 0 },
        rings: { count: 8, spacing: "harmonic", showGuideLines: false },
        recursion: { depth: 4, scale: 0.68 },
        density: 0.58,
        prana: 30,
        line: { weight: 1.71, cap: "round", color: "#f4f4f5" },
        motifs: {
          primary: "lotus_pointed",
          secondary: "dot",
          bindu: { radius: 13, style: "triple_aura" },
          bhupura: { enabled: true, gates: 4, steps: 2, finials: true },
        },
        detailLevel: defaultDetailLevelFor("mandala"),
      },
      {},
      "Dense twelve-fold chakra mandala"
    ),
  },
  {
    id: "prana-bloom",
    name: "Prana Bloom",
    sanskritName: "प्राण पुष्प",
    description:
      "Logarithmic tendrils sweeping out of the bindu with branching leaflets — prana held at 78, organic vitality.",
    category: "floral",
    recipe: makeRecipe(
      "organic",
      "555",
      {
        symmetry: { mode: "radial", segments: 7, outerMultiplier: 1, asymmetry: 4 },
        rings: { count: 4, spacing: "golden", showGuideLines: false },
        recursion: { depth: 2, scale: 0.7 },
        density: 0.5,
        prana: 78,
        line: { weight: 2.33, cap: "round", color: "#fff7ed" },
        motifs: {
          primary: "petal",
          secondary: "teardrop",
          bindu: { radius: 16, style: "radiant" },
          bhupura: { enabled: false, gates: 4, steps: 1, finials: false },
        },
        detailLevel: defaultDetailLevelFor("organic"),
        palette: {
          stroke: "#f6d9b0",
          secondaryStroke: "#9a6a3a",
          accent: "#fb923c",
          construction: "#7a5a24",
          fill: "none",
        },
      },
      {},
      "Seven-armed organic bloom at high prana"
    ),
  },
  {
    id: "guilloche-jali",
    name: "Guilloché Jali",
    sanskritName: "जाली अलंकार",
    description:
      "Woven hypotrochoid bands, a pierced jali screen and micro-serrations — the highest line-frequency composition in the library.",
    category: "kolam",
    recipe: makeRecipe(
      "ornamental",
      "2048",
      {
        symmetry: { mode: "radial", segments: 16, outerMultiplier: 2, asymmetry: 0 },
        rings: { count: 9, spacing: "linear", showGuideLines: false },
        recursion: { depth: 4, scale: 0.72 },
        density: 0.78,
        prana: 14,
        line: { weight: 1.32, cap: "round", color: "#e4e4e7" },
        motifs: {
          primary: "lotus_pointed",
          secondary: "dot",
          bindu: { radius: 11, style: "radiant" },
          bhupura: { enabled: true, gates: 4, steps: 2, finials: true },
        },
        detailLevel: defaultDetailLevelFor("ornamental"),
      },
      {},
      "Maximum-density guilloché and jali weave"
    ),
  },
  {
    id: "shunya",
    name: "Shunya Poster",
    sanskritName: "शून्य",
    description:
      "Two decisive rings, five petals and one luminous bindu. Everything else is negative space doing the work.",
    category: "minimal",
    recipe: makeRecipe(
      "minimal",
      "1",
      {
        symmetry: { mode: "radial", segments: 5, outerMultiplier: 1, asymmetry: 0 },
        rings: { count: 2, spacing: "harmonic", showGuideLines: false },
        recursion: { depth: 0, scale: 0.65 },
        density: 0.1,
        prana: 6,
        line: { weight: 3.72, cap: "round", color: "#fafafa" },
        motifs: {
          primary: "lotus_pointed",
          secondary: "none",
          bindu: { radius: 24, style: "radiant" },
          bhupura: { enabled: false, gates: 4, steps: 1, finials: false },
        },
        detailLevel: defaultDetailLevelFor("minimal"),
      },
      {},
      "Poster-grade minimal composition"
    ),
  },
  {
    id: "hybrid-24",
    name: "Hybrid Drift",
    sanskritName: "प्रयोग",
    description:
      "An 8-fold core expanding to a 24-fold outer register, with interrupted arcs, off-axis satellite rosettes and a 9° drift.",
    category: "archetype",
    recipe: makeRecipe(
      "experimental",
      "73",
      {
        symmetry: { mode: "hybrid", segments: 8, outerMultiplier: 3, asymmetry: 9 },
        rings: { count: 6, spacing: "golden", showGuideLines: false },
        recursion: { depth: 3, scale: 0.66 },
        density: 0.55,
        prana: 56,
        line: { weight: 1.86, cap: "round", color: "#e0f2fe" },
        motifs: {
          primary: "star",
          secondary: "triangle",
          bindu: { radius: 13, style: "triple_aura" },
          bhupura: { enabled: true, gates: 4, steps: 2, finials: true },
        },
        detailLevel: defaultDetailLevelFor("experimental"),
        palette: {
          stroke: "#a5f3fc",
          secondaryStroke: "#0e7490",
          accent: "#22d3ee",
          construction: "#155e75",
          fill: "none",
        },
      },
      {},
      "Hybrid 8 → 24 fold experimental drift"
    ),
  },
  {
    id: "kumkum-padma",
    name: "Kumkum Padma",
    sanskritName: "कुंकुम पद्म",
    description:
      "Sixteen-petal lotus in vermillion and bone white with deep ruby construction lines — a festival alpana.",
    category: "floral",
    recipe: makeRecipe(
      "lotus",
      "16",
      {
        symmetry: { mode: "radial", segments: 16, outerMultiplier: 1, asymmetry: 0 },
        rings: { count: 7, spacing: "golden", showGuideLines: false },
        recursion: { depth: 5, scale: 0.7 },
        density: 0.52,
        prana: 44,
        line: { weight: 1.78, cap: "round", color: "#fff1f2" },
        motifs: {
          primary: "lotus_double",
          secondary: "flame",
          bindu: { radius: 14, style: "triple_aura" },
          bhupura: { enabled: true, gates: 4, steps: 3, finials: true },
        },
        detailLevel: defaultDetailLevelFor("lotus"),
        detail: { ribCount: 7 },
        palette: {
          stroke: "#fecdd3",
          secondaryStroke: "#9f1239",
          accent: "#f43f5e",
          construction: "#7f1d2e",
          fill: "none",
        },
      },
      {},
      "Sixteen-fold kumkum lotus"
    ),
  },
  {
    id: "navagraha",
    name: "Navagraha Dial",
    sanskritName: "नवग्रह",
    description:
      "A nine-fold instrument plate: degree graduations, angle indicators and stellated planetary registers on an obsidian ground.",
    category: "archetype",
    recipe: makeRecipe(
      "yantra",
      "27",
      {
        symmetry: { mode: "radial", segments: 9, outerMultiplier: 2, asymmetry: 0 },
        rings: { count: 7, spacing: "linear", showGuideLines: true },
        recursion: { depth: 4, scale: 0.74 },
        density: 0.6,
        prana: 18,
        line: { weight: 1.63, cap: "butt", color: "#f8fafc" },
        motifs: {
          primary: "star",
          secondary: "dot",
          bindu: { radius: 12, style: "radiant" },
          bhupura: { enabled: true, gates: 4, steps: 2, finials: false },
        },
        detailLevel: defaultDetailLevelFor("yantra"),
        detail: { ribCount: 6 },
        palette: {
          stroke: "#f4f4f5",
          secondaryStroke: "#71717a",
          accent: "#f59e0b",
          construction: "#06b6d4",
          fill: "none",
        },
      },
      {},
      "Nine-fold navagraha instrument dial"
    ),
  },
  {
    id: "sanctum-grid",
    name: "Sanctum Grid",
    sanskritName: "गर्भगृह",
    description:
      "A measured vastu plan: orthogonal prakara walls alternating with 45° enclosures and three pillar colonnades.",
    category: "architectural",
    recipe: makeRecipe(
      "temple",
      "64",
      {
        symmetry: { mode: "grid", segments: 12, outerMultiplier: 1, asymmetry: 0 },
        rings: { count: 6, spacing: "linear", showGuideLines: true },
        recursion: { depth: 4, scale: 0.72 },
        density: 0.68,
        prana: 4,
        line: { weight: 1.94, cap: "butt", color: "#e2e8f0" },
        motifs: {
          primary: "diamond",
          secondary: "cross",
          bindu: { radius: 11, style: "hollow" },
          bhupura: { enabled: true, gates: 4, steps: 3, finials: true },
        },
        detailLevel: defaultDetailLevelFor("temple"),
        detail: { ribCount: 3 },
        palette: {
          stroke: "#e8b96a",
          secondaryStroke: "#8a6228",
          accent: "#f59e0b",
          construction: "#7a5a24",
          fill: "none",
        },
      },
      {},
      "Vastu purusha sanctum grid"
    ),
  },
  {
    id: "coloring-sheet",
    name: "Coloring Plate",
    sanskritName: "रंग पत्र",
    description:
      "High-contrast black line work on pure white — ready to print, colour by hand, or hand to a pen plotter.",
    category: "minimal",
    recipe: makeRecipe(
      "mandala",
      "777",
      {
        symmetry: { mode: "radial", segments: 10, outerMultiplier: 1, asymmetry: 0 },
        rings: { count: 6, spacing: "harmonic", showGuideLines: false },
        recursion: { depth: 3, scale: 0.68 },
        density: 0.4,
        prana: 12,
        line: { weight: 2.79, cap: "round", color: "#18181b" },
        motifs: {
          primary: "lotus_lobe",
          secondary: "dot",
          bindu: { radius: 14, style: "hollow" },
          bhupura: { enabled: true, gates: 4, steps: 2, finials: true },
        },
        detailLevel: defaultDetailLevelFor("mandala"),
        detail: { construction: false, ribCount: 4 },
        palette: {
          stroke: "#18181b",
          secondaryStroke: "#52525b",
          accent: "#a16207",
          construction: "#94a3b8",
          fill: "none",
        },
      },
      { background: "#ffffff" },
      "Printable coloring plate"
    ),
  },
];

/** Quick prompt chips surfaced on the left sidebar. */
export const PROMPT_CHIPS: Array<{ label: string; prompt: string; presetId?: string }> = [
  { label: "Sri Yantra", prompt: "sri yantra nine interlocking triangles with stepped bhupura", presetId: "sri-yantra" },
  { label: "Temple Gate", prompt: "architectural temple gate plan with layered stepped lintels", presetId: "temple-gate" },
  { label: "Lotus Grid", prompt: "sixteen fold lotus grid with fine internal veins", presetId: "kumkum-padma" },
  { label: "Minimal Poster", prompt: "minimal poster geometry with a bold luminous bindu", presetId: "shunya" },
  { label: "Jali Weave", prompt: "dense ornamental guilloche jali weave", presetId: "guilloche-jali" },
];
