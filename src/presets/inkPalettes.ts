/**
 * INK PALETTES
 * ---------------------------------------------------------------
 * The small, opinionated set of plate colourways offered as one-click
 * swatches in Colour & Output. Each is a complete four-ink system:
 * primary stroke, a recessive secondary, the luminous accent that carries
 * the bindu and celestial nodes, and the faint construction underlay.
 */

export interface InkPalette {
  id: string;
  name: string;
  note: string;
  stroke: string;
  secondaryStroke: string;
  accent: string;
  construction: string;
  /** Plate background this palette is designed to sit on. */
  background: string;
  /** Swatch ring colour in the UI. */
  swatch: string;
}

export const INK_PALETTES: InkPalette[] = [
  {
    id: "gold",
    name: "Temple Gold",
    note: "Warm burnished gold on near-black — the default plate.",
    stroke: "#f0c278",
    secondaryStroke: "#9a7334",
    construction: "#6f5222",
    accent: "#f59e0b",
    background: "#09090b",
    swatch: "#e8b96a",
  },
  {
    id: "technical",
    name: "Technical Ivory",
    note: "Ivory strokes with electric cyan construction lines. Precision studio.",
    stroke: "#f4f4f5",
    secondaryStroke: "#71717a",
    accent: "#f59e0b",
    construction: "#06b6d4",
    background: "#09090b",
    swatch: "#f4f4f5",
  },
  {
    id: "cyan",
    name: "Cosmic Azure",
    note: "Cool blueprint register — pale cyan over deep teal.",
    stroke: "#a5f3fc",
    secondaryStroke: "#0e7490",
    accent: "#22d3ee",
    construction: "#155e75",
    background: "#07131a",
    swatch: "#22d3ee",
  },
  {
    id: "kumkum",
    name: "Kumkum Crimson",
    note: "Vermilion and rose — the colour of ritual powder.",
    stroke: "#fecdd3",
    secondaryStroke: "#9f1239",
    accent: "#f43f5e",
    construction: "#7f1d2e",
    background: "#120508",
    swatch: "#f43f5e",
  },
  {
    id: "graphite",
    name: "Graphite",
    note: "Pure monochrome. Every value carried by line weight alone.",
    stroke: "#d4d4d8",
    secondaryStroke: "#52525b",
    accent: "#a1a1aa",
    construction: "#3f3f46",
    background: "#09090b",
    swatch: "#a1a1aa",
  },
  {
    id: "paper",
    name: "Ink on Paper",
    note: "Dark ink on warm handmade stock — print-ready positive.",
    stroke: "#1c1917",
    secondaryStroke: "#78716c",
    accent: "#b45309",
    construction: "#a8a29e",
    background: "#f3eee3",
    swatch: "#1c1917",
  },
];

export const DEFAULT_INK = INK_PALETTES[0];

/** Best-effort reverse lookup so the UI can highlight the active swatch. */
export function matchInkPalette(stroke: string, accent: string): InkPalette | undefined {
  return INK_PALETTES.find(
    (p) => p.stroke.toLowerCase() === stroke.toLowerCase() && p.accent.toLowerCase() === accent.toLowerCase()
  );
}
