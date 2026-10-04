/**
 * JANTRA Recipe Schema v1.1
 * ---------------------------------------------------------------
 * A recipe is a *complete, portable, deterministic* description of a
 * composition. Given the same recipe the engine always emits byte-identical
 * SVG — on any machine, in any browser, forever.
 */

/** The 8 expressive visual grammar families. */
export type GrammarFamily =
  | "lotus"
  | "temple"
  | "mandala"
  | "yantra"
  | "organic"
  | "ornamental"
  | "minimal"
  | "experimental";

export type SymmetryMode = "radial" | "bilateral" | "grid" | "hybrid";
export type RingSpacing = "linear" | "exponential" | "harmonic" | "golden";
export type LineCap = "round" | "square" | "butt";
export type PrimaryMotif =
  | "petal"
  | "lotus_lobe"
  | "lotus_pointed"
  | "lotus_double"
  | "triangle"
  | "sri_yantra"
  | "star"
  | "chevron"
  | "diamond"
  | "kolam_knot";
export type SecondaryMotif = "circle" | "dot" | "triangle" | "cross" | "flame" | "teardrop" | "none";
export type BinduStyle = "solid" | "hollow" | "radiant" | "triple_aura";
export type ColorTheme =
  | "custom"
  | "saffron_gold"
  | "sacred_copper"
  | "midnight_cyan"
  | "kumkum_ruby"
  | "temple_bronze"
  | "pure_silver"
  | "monochrome";

/**
 * Fine-grain ornamental detail switches. These are what separate a
 * diagrammatic CAD plot from a plate of engraved filigree.
 */
export interface DetailFlags {
  /** Delicate radiating internal spine curves inside each petal lobe. */
  ribbing: boolean;
  /** 3 - 7 veins fanning from petal origin to apex. */
  ribCount: number;
  /** Dotted / dashed orbital bands interspersed between solid rings. */
  stipple: boolean;
  /** Luminous golden anchor dots at geometric intersections. */
  nodes: boolean;
  /** Faint cyan construction crosshairs, graduations, angle indicators. */
  construction: boolean;
  /** Jali lattice / guilloché woven micro-infill. */
  lattice: boolean;
}

export interface GrammarDescriptor {
  family: GrammarFamily;
  id: string;
  version: string;
}

export interface JantraRecipe {
  schemaVersion: "1.0" | "1.1";
  engineVersion: string;
  grammar: GrammarDescriptor;
  seed: string | number;
  canvas: {
    width: number; // default: 1600
    height: number; // default: 1600
    background: string; // "#09090b" | "transparent"
    margin: number; // normalized 0.0 - 0.2
    glowEffect?: boolean; // sacred neon/gold aura filter
  };
  parameters: {
    symmetry: {
      mode: SymmetryMode;
      segments: number; // 2 - 32
      /** Hybrid grammars expand the outer tiers to segments * this factor. */
      outerMultiplier?: number; // 1 | 2 | 3
      /** Controlled asymmetric rotational offset, in degrees. */
      asymmetry?: number; // 0 - 30
    };
    rings: {
      count: number; // 1 - 12
      spacing: RingSpacing;
      showGuideLines?: boolean;
    };
    recursion: {
      depth: number; // 0 - 6
      scale: number; // 0.2 - 0.9
    };
    density: number; // 0.05 - 1.0
    /**
     * PRANA — Computational Regularity <-> Living Variation. 0 to 100.
     *   0   Pure Geometry      · absolute CAD precision, uniform weights
     *   20  Micro-Tension      · alternating tier weights, Bézier tension
     *   50  Radial Breathing   · petal height oscillation, hand-inked rhythm
     *   80  Organic Vitality   · strong living variation inside the grammar
     *   100 Expressive Tension · structure pushed to the edge of chaos
     */
    prana: number;
    line: {
      weight: number; // 0.5 - 8.0
      dashPattern?: string;
      cap: LineCap;
      color: string;
    };
    motifs: {
      primary: PrimaryMotif;
      secondary: SecondaryMotif;
      bindu: {
        radius: number; // 2 - 40
        style: BinduStyle;
      };
      bhupura: {
        enabled: boolean;
        gates: number;
        steps: number; // 1 - 3
        finials?: boolean;
      };
    };
    detail?: DetailFlags;
    palette: {
      theme?: ColorTheme;
      stroke: string;
      secondaryStroke?: string;
      accent: string;
      /** Fine electric cyan construction lines. */
      construction?: string;
      fill: string;
      fillOpacity?: number;
    };
    visibility?: {
      bindu?: boolean;
      rings?: boolean;
      petals?: boolean;
      polygons?: boolean;
      bhupura?: boolean;
      ornaments?: boolean;
      guides?: boolean;
    };
  };
  provenance: {
    aiInterpreted: boolean;
    promptText?: string;
    parentSeed?: string;
    /** Genealogical address, e.g. "108", "108-B", "108-B-2". */
    lineageId?: string;
    /** 0 = root, 1 = child, 2 = grandchild … */
    generation?: number;
    /** Human readable name of the mutation operator that produced this node. */
    mutation?: string;
    createdAt: string;
  };
  checksum?: string;
}

export interface PresetRecipe {
  id: string;
  name: string;
  sanskritName?: string;
  description: string;
  category: "archetype" | "floral" | "sacred" | "minimal" | "architectural" | "kolam";
  recipe: JantraRecipe;
}

/* ------------------------------------------------------------------ */
/* Grammar family metadata (drives the left sidebar cards)             */
/* ------------------------------------------------------------------ */

export interface GrammarFamilyMeta {
  id: GrammarFamily;
  name: string;
  sanskrit: string;
  tagline: string;
  description: string;
  /** Short glyph path drawn in the sidebar card preview (viewBox -50 -50 100 100). */
  glyph: string;
}

export const GRAMMAR_FAMILIES: GrammarFamilyMeta[] = [
  {
    id: "lotus",
    name: "Lotus",
    sanskrit: "पद्म",
    tagline: "Sacred geometry · balance",
    description:
      "Multi-tiered blooming petals with delicate internal vein hatching, stippled orbit bands and a stepped bhupura.",
    glyph:
      "M0,-40 C14,-22 14,-8 0,0 C-14,-8 -14,-22 0,-40 M40,0 C22,14 8,14 0,0 C8,-14 22,-14 40,0 M0,40 C-14,22 -14,8 0,0 C14,8 14,22 0,40 M-40,0 C-22,-14 -8,-14 0,0 C-8,14 -22,14 -40,0",
  },
  {
    id: "temple",
    name: "Temple",
    sanskrit: "मन्दिर",
    tagline: "Architectural enclosures",
    description:
      "Nested sanctum plans, mandapa pillar grids, layered stepped gateways and corner alignment brackets.",
    glyph:
      "M-42,42 L-42,-12 L-28,-12 L-28,-26 L-14,-26 L-14,-40 L14,-40 L14,-26 L28,-26 L28,-12 L42,-12 L42,42 Z M-18,42 L-18,6 L18,6 L18,42",
  },
  {
    id: "mandala",
    name: "Mandala",
    sanskrit: "मण्डल",
    tagline: "Radial harmony",
    description:
      "Dense concentric rings of alternating geometric serrations, lotus corollas and celestial intersection nodes.",
    glyph:
      "M0,-42 A42,42 0 1,1 0,42 A42,42 0 1,1 0,-42 M0,-26 A26,26 0 1,1 0,26 A26,26 0 1,1 0,-26 M0,-42 L0,42 M-42,0 L42,0 M-30,-30 L30,30 M30,-30 L-30,30",
  },
  {
    id: "yantra",
    name: "Yantra",
    sanskrit: "यन्त्र",
    tagline: "Geometric precision",
    description:
      "Nine interlocking Shiva–Shakti triangles of the Sri Yantra archetype, stellated polygons and sharp radial rays.",
    glyph:
      "M0,-42 L36,22 L-36,22 Z M0,42 L36,-22 L-36,-22 Z M0,-24 L20,12 L-20,12 Z M0,24 L20,-12 L-20,-12 Z",
  },
  {
    id: "organic",
    name: "Organic",
    sanskrit: "प्राण",
    tagline: "Flowing tendrils",
    description:
      "Rhythmic curves, petal branching and high-prana living variation that breathes across every symmetry axis.",
    glyph:
      "M0,0 C16,-14 34,-18 40,-38 M0,0 C-16,-14 -34,-18 -40,-38 M0,0 C16,14 34,18 40,38 M0,0 C-16,14 -34,18 -40,38 M0,0 C22,-6 34,4 42,0 M0,0 C-22,6 -34,-4 -42,0",
  },
  {
    id: "ornamental",
    name: "Ornamental",
    sanskrit: "अलंकार",
    tagline: "Intricate high frequency",
    description:
      "Guilloché-like woven concentric bands, micro-infilling and jali lattice textures at maximum line density.",
    glyph:
      "M0,-40 A40,40 0 1,1 0,40 A40,40 0 1,1 0,-40 M0,-30 A30,30 0 1,1 0,30 A30,30 0 1,1 0,-30 M0,-20 A20,20 0 1,1 0,20 A20,20 0 1,1 0,-20 M0,-10 A10,10 0 1,1 0,10 A10,10 0 1,1 0,-10",
  },
  {
    id: "minimal",
    name: "Minimal",
    sanskrit: "शून्य",
    tagline: "Poster clarity",
    description:
      "Extremely sparse, bold focal bindu, stark high-contrast lines and generous harmonic negative space.",
    glyph: "M0,-40 A40,40 0 1,1 0,40 A40,40 0 1,1 0,-40 M-40,0 L40,0 M0,-9 A9,9 0 1,1 0,9 A9,9 0 1,1 0,-9",
  },
  {
    id: "experimental",
    name: "Experimental",
    sanskrit: "प्रयोग",
    tagline: "Hybrid symmetries",
    description:
      "An 8-fold core expanding into 16/24-fold outer registers, controlled asymmetric shifts and unexpected forms.",
    glyph:
      "M0,-42 L42,0 L0,42 L-42,0 Z M0,-28 L24,-12 L16,20 L-16,20 L-24,-12 Z M-6,-12 L18,2 L2,22 Z",
  },
];

export const GRAMMAR_FAMILY_IDS = GRAMMAR_FAMILIES.map((f) => f.id);
