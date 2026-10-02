export interface ArtisanPalette {
  id: string;
  name: string;
  tradition: string;
  description: string;
  stroke: string;
  secondaryStroke: string;
  accent: string;
  background: string;
  paperTexture?: "dark_obsidian" | "handmade_wove" | "aged_palm_leaf" | "copper_plate" | "indigo_cotton" | "vintage_parchment";
}

export const ARTISAN_PALETTES: ArtisanPalette[] = [
  {
    id: "tanjore_gold",
    name: "Tanjore Gold & Emerald",
    tradition: "Thanjavur Sacred Painting",
    description: "22-karat burnished gold leaf outlines on deep emerald sanctum backdrop with ruby red accents.",
    stroke: "#fef08a",
    secondaryStroke: "#ca8a04",
    accent: "#10b981",
    background: "#06231a",
    paperTexture: "dark_obsidian",
  },
  {
    id: "pattachitra_mineral",
    name: "Pattachitra Natural Minerals",
    tradition: "Odisha Cloth Scroll Painting",
    description: "Traditional Hingula cinnabar, Haritala orpiment yellow, Shankha conch white, and Nil indigo.",
    stroke: "#fef3c7",
    secondaryStroke: "#f59e0b",
    accent: "#e11d48",
    background: "#1c140d",
    paperTexture: "aged_palm_leaf",
  },
  {
    id: "mughal_lapis",
    name: "Mughal Lapis & Pure Gold",
    tradition: "Imperial Miniature Manuscript",
    description: "Ground Afghan lapis lazuli ultramarine illuminated with liquid gold leaf accents.",
    stroke: "#fde68a",
    secondaryStroke: "#d97706",
    accent: "#38bdf8",
    background: "#0c1736",
    paperTexture: "indigo_cotton",
  },
  {
    id: "kalamkari_madder",
    name: "Kalamkari Vegetable Dyes",
    tradition: "Andhra Pen-Drawn Murals",
    description: "Natural madder root red, myrobalan seed yellow, and iron acetate black on unbleached cotton.",
    stroke: "#fee2e2",
    secondaryStroke: "#991b1b",
    accent: "#f97316",
    background: "#18080a",
    paperTexture: "vintage_parchment",
  },
  {
    id: "kerala_mural",
    name: "Kerala Temple Ochres",
    tradition: "Panchavarna 5-Color Murals",
    description: "Strict traditional 5 sacred mineral pigments: red ochre, yellow ochre, white, lamp black, and cyan.",
    stroke: "#fef9c3",
    secondaryStroke: "#ca8a04",
    accent: "#ea580c",
    background: "#19110b",
    paperTexture: "copper_plate",
  },
  {
    id: "copperplate_etching",
    name: "Copperplate Engraving",
    tradition: "Historical Manuscript Intaglio",
    description: "Inscribed copperplate lines with warm patina highlights on vintage wove paper.",
    stroke: "#fed7aa",
    secondaryStroke: "#c2410c",
    accent: "#fb923c",
    background: "#1c100b",
    paperTexture: "copper_plate",
  },
  {
    id: "monochrome_ink",
    name: "Zenith Sumi & Conch White",
    tradition: "Fine-Line Graphic Monochrome",
    description: "High-contrast ivory ink on pitch-black obsidian with neutral silver guides.",
    stroke: "#f4f4f5",
    secondaryStroke: "#71717a",
    accent: "#e4e4e7",
    background: "#09090b",
    paperTexture: "dark_obsidian",
  },
  {
    id: "coloring_clean",
    name: "Printable Coloring Sheet",
    tradition: "Meditative Coloring Paper",
    description: "High-contrast clean black outlines on pure white paper ready for watercolors and pencils.",
    stroke: "#18181b",
    secondaryStroke: "#71717a",
    accent: "#27272a",
    background: "#ffffff",
    paperTexture: "handmade_wove",
  },
];
