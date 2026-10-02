export type SymmetryMode = "radial" | "bilateral" | "grid" | "hybrid";
export type RingSpacing = "linear" | "exponential" | "harmonic" | "golden";
export type LineCap = "round" | "square" | "butt";
export type PrimaryMotif = "petal" | "lotus_lobe" | "lotus_pointed" | "lotus_double" | "triangle" | "sri_yantra" | "star" | "chevron" | "diamond" | "kolam_knot";
export type SecondaryMotif = "circle" | "dot" | "triangle" | "cross" | "flame" | "teardrop" | "none";
export type BinduStyle = "solid" | "hollow" | "radiant" | "triple_aura";
export type ColorTheme = "custom" | "saffron_gold" | "sacred_copper" | "midnight_cyan" | "kumkum_ruby" | "temple_bronze" | "pure_silver" | "monochrome";

export interface JantraRecipe {
  schemaVersion: "1.0";
  engineVersion: "0.1.0";
  grammar: {
    id: "geometric-radial";
    version: "0.1.0";
  };
  seed: string | number;
  canvas: {
    width: number;           // default: 1600
    height: number;          // default: 1600
    background: string;      // default: "#09090b" or "transparent"
    margin: number;          // normalized 0.0 - 0.2, default: 0.08
    glowEffect?: boolean;    // subtle sacred neon/gold aura glow filter
  };
  parameters: {
    symmetry: {
      mode: SymmetryMode;
      segments: number;      // 2 - 32, default: 8
    };
    rings: {
      count: number;         // 1 - 12, default: 5
      spacing: RingSpacing;
      showGuideLines?: boolean;
    };
    recursion: {
      depth: number;         // 0 - 6, default: 3
      scale: number;         // 0.2 - 0.9, default: 0.65
    };
    density: number;         // 0.05 - 1.0, default: 0.35
    prana: number;           // 0.0 - 0.35 (controlled human imperfection/jitter), default: 0.06
    line: {
      weight: number;        // 0.5 - 8.0, default: 1.2
      dashPattern?: string;  // e.g. "none", "4 4", "1 3"
      cap: LineCap;
      color: string;         // default: "#f5f5f7" or "#111111"
    };
    motifs: {
      primary: PrimaryMotif;
      secondary: SecondaryMotif;
      bindu: {
        radius: number;      // 2 - 40, default: 8
        style: BinduStyle;
      };
      bhupura: {
        enabled: boolean;    // Outer stepped temple enclosure
        gates: number;       // 4 gates (cardinal directions)
        steps: number;       // 1 - 3 stepped terraces
        finials?: boolean;   // Traditional kalasha finials on gates
      };
    };
    palette: {
      theme?: ColorTheme;
      stroke: string;
      secondaryStroke?: string;
      accent: string;
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
