import { JantraRecipe } from "../types/recipe";

export interface SymbolismReport {
  title: string;
  sanskritTerm: string;
  cosmologySummary: string;
  elements: {
    category: string;
    symbol: string;
    meaning: string;
  }[];
  geometricBalance: {
    symmetryMeaning: string;
    ringsCosmology: string;
    pranaInterpretation: string;
    archetypeLineage: string;
  };
}

export function analyzeSymbolism(recipe: JantraRecipe): SymbolismReport {
  const p = recipe.parameters;
  const segments = p.symmetry.segments;

  let symmetryMeaning = "";
  if (segments === 4) {
    symmetryMeaning = "Chatur-Vyuha / 4 Cardinal Directions & 4 Vedas (Rig, Sama, Yajur, Atharva). Earthly stability.";
  } else if (segments === 6) {
    symmetryMeaning = "Shatkona / Hexagram — The geometric union of Shiva (ascending triangle) and Shakti (descending triangle).";
  } else if (segments === 8) {
    symmetryMeaning = "Ashta-Dala (8-Fold) — Sacred to Ashta Lakshmi and the 8 guardians of space (Ashta Dikpalas). The classic mandala lotus.";
  } else if (segments === 9) {
    symmetryMeaning = "Navagraha / Navayoni — The 9 cosmic spheres and the 9 interlocking primordial triangles.";
  } else if (segments === 10) {
    symmetryMeaning = "Dasha Mahavidya / Manipura Solar Plexus — The 10 wisdom aspects and radiant energetic center.";
  } else if (segments === 12) {
    symmetryMeaning = "Dvadasha Surya & Anahata — The 12 solar manifestations of the sun and the unstruck heart sound.";
  } else if (segments === 16) {
    symmetryMeaning = "Shodasha Nitya & Kala — The 16 lunar phases (tithis) and the fullness of divine creative manifestation.";
  } else if (segments === 24) {
    symmetryMeaning = "Chaturvimshati Tattvas & Gayatri — The 24 foundational cosmological principles of cosmic manifestation.";
  } else if (segments === 32) {
    symmetryMeaning = "Sahasrara Sub-harmonics — Radiating crown lotus petal frequencies representing expansive transcendental awareness.";
  } else {
    symmetryMeaning = `${segments}-Fold Rotational Resonance — Harmonic radial division of the 360° circle into ${(360 / segments).toFixed(1)}° sectors.`;
  }

  let ringsCosmology = "";
  if (p.rings.spacing === "golden") {
    ringsCosmology = "Golden Ratio (φ = 1.618) Harmonic Progression — Echoes the logarithmic spiral found in Vedic cosmic proportions and nature.";
  } else if (p.rings.spacing === "harmonic") {
    ringsCosmology = "Harmonic Square-Root Progression — Rings expand with accelerating density inward, mimicking gravitational attractor orbits.";
  } else if (p.rings.spacing === "exponential") {
    ringsCosmology = "Exponential Growth Curve — Expansive outward radiation from singularity to perimeter.";
  } else {
    ringsCosmology = "Linear Metric Rhythm — Equal spatial distance intervals representing balance and measure (Taala).";
  }

  let pranaInterpretation = "";
  if (p.prana <= 0.01) {
    pranaInterpretation = "Pure Pristine CAD Precision (Shunya Prana) — Crystal-clear Euclidean mathematical truth.";
  } else if (p.prana <= 0.08) {
    pranaInterpretation = "Subtle Hand-Engraved Copper Warmth — The breathing human quality of classical temple copperplate inscriptions.";
  } else if (p.prana <= 0.20) {
    pranaInterpretation = "Vital Rice-Powder Kolam Rhythm — The living, sacred threshold art created daily at dawn with unbroken hand flow.";
  } else {
    pranaInterpretation = "Manuscript Organic Vitality — Living micro-variations reminiscent of palm-leaf stylus engravings.";
  }

  let archetypeLineage = "";
  if (p.motifs.primary === "sri_yantra") {
    archetypeLineage = "Sri Vidya Navayoni Lineage — 9 interlocking triangles generating the 43 chakras of the cosmos.";
  } else if (p.motifs.primary === "kolam_knot") {
    archetypeLineage = "Brahma Mudi (Infinite Knot) Tradition — South Indian threshold continuous line geometry.";
  } else if (p.motifs.primary.includes("lotus")) {
    archetypeLineage = "Padma Mandala (Lotus of Unfolding Consciousness) — Purity rising from origin to periphery.";
  } else if (p.motifs.primary === "triangle") {
    archetypeLineage = "Trikona Yantra — Primary cosmic trinity (Creation, Preservation, Dissolution).";
  } else {
    archetypeLineage = "Universal Geometric Architecture — Polyhedral symmetry and concentric orbital lattices.";
  }

  const elements = [
    {
      category: "Origin Singular Point",
      symbol: "Bindu (बिन्दु)",
      meaning: "The dimensionless seed from which all manifested forms, space, and energy uncoil.",
    },
    {
      category: "Concentric Bounds",
      symbol: `Vritta (${p.rings.count} Concentric Rings)`,
      meaning: "The cosmic time cycles and concentric concentric layers of reality (Lokas).",
    },
    {
      category: "Primary Motif",
      symbol: p.motifs.primary.replace("_", " ").toUpperCase(),
      meaning: archetypeLineage,
    },
  ];

  if (p.motifs.bhupura.enabled) {
    elements.push({
      category: "Outer Earth Citadel",
      symbol: `Bhupura (${p.motifs.bhupura.steps} Terraces, 4 Gates)`,
      meaning: "The sacred boundary separating sacred internal space from mundane chaos, with 4 cardinal gateways (Chaturdvara) oriented North, South, East, and West.",
    });
  }

  return {
    title: "Sacred Geometric Anatomy & Provenance",
    sanskritTerm: "यन्त्र विन्यास विवरण",
    cosmologySummary: `${segments}-fold ${p.motifs.primary} geometry structured across ${p.rings.count} orbital vritta rings with ${p.rings.spacing} progression.`,
    elements,
    geometricBalance: {
      symmetryMeaning,
      ringsCosmology,
      pranaInterpretation,
      archetypeLineage,
    },
  };
}
