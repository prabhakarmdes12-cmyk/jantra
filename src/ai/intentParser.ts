import { JantraRecipe } from "../types/recipe";
import { IntentParseResult } from "./schema";

export function parseIntentPrompt(prompt: string, currentRecipe: JantraRecipe): IntentParseResult {
  const text = prompt.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  const updatedParams = JSON.parse(JSON.stringify(currentRecipe.parameters)) as JantraRecipe["parameters"];
  const changesSummary: { label: string; from: string | number; to: string | number }[] = [];

  // 1. Specific Sacred Archetypes
  let hasSpecificArchetype = false;
  if (text.includes("sri yantra") || text.includes("shree yantra") || text.includes("navayoni")) {
    matchedKeywords.push("sri yantra 9-triangles archetype");
    changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "sri_yantra" });
    changesSummary.push({ label: "Bhupura", from: updatedParams.motifs.bhupura.enabled ? "Enabled" : "Disabled", to: "Enabled" });
    updatedParams.motifs.primary = "sri_yantra";
    updatedParams.motifs.bhupura.enabled = true;
    updatedParams.motifs.bhupura.steps = 3;
    updatedParams.rings.count = 6;
    hasSpecificArchetype = true;
  } else if (text.includes("sikku kolam") || text.includes("brahma mudi") || text.includes("knotwork")) {
    matchedKeywords.push("sikku kolam loop knotwork");
    changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "kolam_knot" });
    updatedParams.motifs.primary = "kolam_knot";
    updatedParams.prana = 0.14;
    updatedParams.motifs.bhupura.enabled = false;
    hasSpecificArchetype = true;
  }

  // 2. Fold / Symmetry detection
  const foldMatch = text.match(/(\d+)\s*[-_ ]*(fold|segment|petal|spoke|point|sided)/i);
  if (foldMatch) {
    const count = parseInt(foldMatch[1], 10);
    if (count >= 2 && count <= 32) {
      matchedKeywords.push(`${count}-fold symmetry`);
      changesSummary.push({
        label: "Symmetry Segments",
        from: updatedParams.symmetry.segments,
        to: count,
      });
      updatedParams.symmetry.segments = count;
      updatedParams.symmetry.mode = "radial";
    }
  } else if (text.includes("sahasrara") || text.includes("crown")) {
    matchedKeywords.push("32-fold sahasrara crown");
    changesSummary.push({ label: "Symmetry Segments", from: updatedParams.symmetry.segments, to: 32 });
    updatedParams.symmetry.segments = 32;
    if (!hasSpecificArchetype) updatedParams.motifs.primary = "lotus_pointed";
  } else if (text.includes("anahata") || text.includes("heart chakra")) {
    matchedKeywords.push("12-fold anahata chakra");
    changesSummary.push({ label: "Symmetry Segments", from: updatedParams.symmetry.segments, to: 12 });
    updatedParams.symmetry.segments = 12;
    if (!hasSpecificArchetype) updatedParams.motifs.primary = "lotus_lobe";
    updatedParams.palette.accent = "#10b981";
  } else if (text.includes("bilateral") || text.includes("mirror")) {
    matchedKeywords.push("bilateral symmetry");
    changesSummary.push({ label: "Symmetry Mode", from: updatedParams.symmetry.mode, to: "bilateral" });
    updatedParams.symmetry.mode = "bilateral";
  } else if (text.includes("grid") || text.includes("matrix")) {
    matchedKeywords.push("grid symmetry");
    changesSummary.push({ label: "Symmetry Mode", from: updatedParams.symmetry.mode, to: "grid" });
    updatedParams.symmetry.mode = "grid";
  } else if (text.includes("hybrid") || text.includes("multi-fold")) {
    matchedKeywords.push("hybrid symmetry");
    changesSummary.push({ label: "Symmetry Mode", from: updatedParams.symmetry.mode, to: "hybrid" });
    updatedParams.symmetry.mode = "hybrid";
  }

  // 3. Density & Complexity
  if (text.includes("minimal") || text.includes("sparse") || text.includes("quiet") || text.includes("calm") || text.includes("simple")) {
    matchedKeywords.push("minimalist density");
    changesSummary.push({ label: "Density", from: updatedParams.density, to: 0.15 });
    changesSummary.push({ label: "Rings Count", from: updatedParams.rings.count, to: 3 });
    changesSummary.push({ label: "Line Weight", from: updatedParams.line.weight, to: 0.9 });
    updatedParams.density = 0.15;
    updatedParams.rings.count = 3;
    updatedParams.recursion.depth = 1;
    updatedParams.line.weight = 0.9;
  } else if (text.includes("dense") || text.includes("intricate") || text.includes("complex") || text.includes("detailed") || text.includes("rich")) {
    matchedKeywords.push("intricate density");
    changesSummary.push({ label: "Density", from: updatedParams.density, to: 0.65 });
    changesSummary.push({ label: "Rings Count", from: updatedParams.rings.count, to: 7 });
    changesSummary.push({ label: "Recursion Depth", from: updatedParams.recursion.depth, to: 4 });
    updatedParams.density = 0.65;
    updatedParams.rings.count = Math.max(updatedParams.rings.count, 6);
    updatedParams.recursion.depth = 4;
  }

  // 4. Prana (Imperfection vs Crispness)
  if (text.includes("high prana") || text.includes("more prana") || text.includes("hand-drawn") || text.includes("imperfect") || text.includes("organic") || text.includes("kolam") || text.includes("vital") || text.includes("wabi-sabi") || text.includes("human")) {
    matchedKeywords.push("organic prana (imperfection)");
    changesSummary.push({ label: "Prana (Imperfection)", from: updatedParams.prana, to: 0.18 });
    changesSummary.push({ label: "Line Cap", from: updatedParams.line.cap, to: "round" });
    updatedParams.prana = 0.18;
    updatedParams.line.cap = "round";
  } else if (text.includes("prana") && !text.includes("zero prana") && !text.includes("no prana")) {
    matchedKeywords.push("living prana");
    changesSummary.push({ label: "Prana", from: updatedParams.prana, to: 0.14 });
    updatedParams.prana = 0.14;
  } else if (text.includes("zero prana") || text.includes("no prana") || text.includes("crisp") || text.includes("sharp") || text.includes("precise") || text.includes("architectural") || text.includes("clean") || text.includes("geometric")) {
    matchedKeywords.push("zero-prana geometric precision");
    changesSummary.push({ label: "Prana (Imperfection)", from: updatedParams.prana, to: 0.0 });
    changesSummary.push({ label: "Line Cap", from: updatedParams.line.cap, to: "square" });
    updatedParams.prana = 0.0;
    updatedParams.line.cap = "square";
  }

  // 5. Motifs (only if not already set by specific archetype)
  if (!hasSpecificArchetype) {
    if (text.includes("double lotus") || text.includes("two tier lotus")) {
      matchedKeywords.push("double layered lotus");
      updatedParams.motifs.primary = "lotus_double";
    } else if (text.includes("pointed lotus") || text.includes("sharp petal")) {
      matchedKeywords.push("pointed lotus lobe");
      updatedParams.motifs.primary = "lotus_pointed";
    } else if (text.includes("lotus") || text.includes("padma")) {
      matchedKeywords.push("lotus lobe motif");
      changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "lotus_lobe" });
      updatedParams.motifs.primary = "lotus_lobe";
    } else if (text.includes("petal") || text.includes("flower") || text.includes("bloom") || text.includes("floral")) {
      matchedKeywords.push("petal motif");
      changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "petal" });
      updatedParams.motifs.primary = "petal";
    } else if (text.includes("trikona") || text.includes("triangle") || text.includes("shatkona")) {
      matchedKeywords.push("interlocking triangles");
      changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "triangle" });
      updatedParams.motifs.primary = "triangle";
    } else if (text.includes("star") || text.includes("sun") || text.includes("solar") || text.includes("surya") || text.includes("stella")) {
      matchedKeywords.push("star polygon motif");
      changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "star" });
      updatedParams.motifs.primary = "star";
    } else if (text.includes("diamond") || text.includes("lozenge")) {
      matchedKeywords.push("diamond lozenge motif");
      changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "diamond" });
      updatedParams.motifs.primary = "diamond";
    } else if (text.includes("chevron") || text.includes("jali")) {
      matchedKeywords.push("chevron jali motif");
      changesSummary.push({ label: "Primary Motif", from: updatedParams.motifs.primary, to: "chevron" });
      updatedParams.motifs.primary = "chevron";
    }
  }

  // 6. Bhupura / Temple Enclosure
  if (text.includes("temple") || text.includes("gate") || text.includes("bhupura") || text.includes("citadel") || text.includes("sacred enclosure") || text.includes("earth frame")) {
    matchedKeywords.push("stepped bhupura temple frame");
    changesSummary.push({ label: "Bhupura Enclosure", from: updatedParams.motifs.bhupura.enabled ? "Enabled" : "Disabled", to: "Enabled" });
    updatedParams.motifs.bhupura.enabled = true;
    updatedParams.motifs.bhupura.steps = 3;
  } else if (text.includes("no border") || text.includes("no frame") || text.includes("frameless") || text.includes("no temple") || text.includes("borderless")) {
    matchedKeywords.push("disable bhupura frame");
    changesSummary.push({ label: "Bhupura Enclosure", from: updatedParams.motifs.bhupura.enabled ? "Enabled" : "Disabled", to: "Disabled" });
    updatedParams.motifs.bhupura.enabled = false;
  }

  // 7. Bindu Center Style
  if (text.includes("triple aura") || text.includes("triple bindu") || text.includes("3 aura")) {
    matchedKeywords.push("triple aura bindu center");
    changesSummary.push({ label: "Bindu Style", from: updatedParams.motifs.bindu.style, to: "triple_aura" });
    updatedParams.motifs.bindu.style = "triple_aura";
    updatedParams.motifs.bindu.radius = Math.max(10, updatedParams.motifs.bindu.radius);
  } else if (text.includes("radiant bindu") || text.includes("glowing center") || text.includes("solar center") || text.includes("sun center")) {
    matchedKeywords.push("radiant bindu center");
    changesSummary.push({ label: "Bindu Style", from: updatedParams.motifs.bindu.style, to: "radiant" });
    updatedParams.motifs.bindu.style = "radiant";
    updatedParams.motifs.bindu.radius = Math.max(8, updatedParams.motifs.bindu.radius);
  } else if (text.includes("hollow center") || text.includes("open center") || text.includes("ring center")) {
    matchedKeywords.push("hollow bindu center");
    changesSummary.push({ label: "Bindu Style", from: updatedParams.motifs.bindu.style, to: "hollow" });
    updatedParams.motifs.bindu.style = "hollow";
  } else if (text.includes("solid bindu") || text.includes("dot center") || text.includes("point center")) {
    matchedKeywords.push("solid bindu center");
    changesSummary.push({ label: "Bindu Style", from: updatedParams.motifs.bindu.style, to: "solid" });
    updatedParams.motifs.bindu.style = "solid";
  }

  // 8. Palette & Accent
  if (text.includes("gold") || text.includes("saffron") || text.includes("amber") || text.includes("yellow")) {
    matchedKeywords.push("gold/saffron palette");
    changesSummary.push({ label: "Accent Color", from: updatedParams.palette.accent, to: "#f59e0b" });
    updatedParams.palette.accent = "#f59e0b";
    updatedParams.palette.stroke = "#fef3c7";
  } else if (text.includes("kumkum") || text.includes("crimson") || text.includes("red") || text.includes("ruby") || text.includes("rose")) {
    matchedKeywords.push("kumkum crimson palette");
    changesSummary.push({ label: "Accent Color", from: updatedParams.palette.accent, to: "#f43f5e" });
    updatedParams.palette.accent = "#f43f5e";
    updatedParams.palette.stroke = "#ffe4e6";
  } else if (text.includes("cyan") || text.includes("sky") || text.includes("blue") || text.includes("azure") || text.includes("cosmic") || text.includes("indigo")) {
    matchedKeywords.push("cosmic azure palette");
    changesSummary.push({ label: "Accent Color", from: updatedParams.palette.accent, to: "#38bdf8" });
    updatedParams.palette.accent = "#38bdf8";
    updatedParams.palette.stroke = "#e0f2fe";
  } else if (text.includes("silver") || text.includes("white") || text.includes("monochrome") || text.includes("grayscale")) {
    matchedKeywords.push("monochrome silver palette");
    changesSummary.push({ label: "Accent Color", from: updatedParams.palette.accent, to: "#a1a1aa" });
    updatedParams.palette.accent = "#a1a1aa";
    updatedParams.palette.stroke = "#f4f4f5";
  }

  // Spacing mode
  if (text.includes("golden ratio") || text.includes("fibonacci") || text.includes("phi")) {
    matchedKeywords.push("golden ratio spacing");
    updatedParams.rings.spacing = "golden";
  } else if (text.includes("harmonic")) {
    matchedKeywords.push("harmonic ring spacing");
    updatedParams.rings.spacing = "harmonic";
  } else if (text.includes("exponential")) {
    matchedKeywords.push("exponential ring spacing");
    updatedParams.rings.spacing = "exponential";
  } else if (text.includes("linear")) {
    matchedKeywords.push("linear ring spacing");
    updatedParams.rings.spacing = "linear";
  }

  if (matchedKeywords.length === 0) {
    matchedKeywords.push("general harmony tuning");
    updatedParams.density = Math.round((0.25 + (prompt.length % 5) * 0.1) * 100) / 100;
    changesSummary.push({ label: "Density", from: currentRecipe.parameters.density, to: updatedParams.density });
  }

  const suggestedRecipe: JantraRecipe = {
    ...currentRecipe,
    parameters: updatedParams,
    provenance: {
      aiInterpreted: true,
      promptText: prompt,
      createdAt: new Date().toISOString(),
    },
  };

  const confidence = Math.min(1.0, 0.4 + matchedKeywords.length * 0.2);
  const explanation = matchedKeywords.length > 0
    ? `Interpreted intent from "${prompt}" into ${matchedKeywords.join(", ")}.`
    : `Adjusted recipe parameters based on compositional phrasing.`;

  return {
    rawPrompt: prompt,
    matchedKeywords,
    suggestedRecipe,
    changesSummary,
    explanation,
    confidence,
  };
}
