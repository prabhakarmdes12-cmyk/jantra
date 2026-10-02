import { JantraRecipe } from "../types/recipe";
import { GeneratedScene, SVGGElementData, SVGPathElementData, SVGCircleElementData, SVGPolygonElementData } from "../types/geometry";
import { createPRNG } from "./prng";
import { generateBindu } from "./primitives/bindu";
import { generateRings, computeRingRadii } from "./primitives/rings";
import { generatePetalsLayer } from "./primitives/petals";
import { generatePolygonsLayer } from "./primitives/polygons";
import { generateSriYantraGeometry } from "./primitives/sriYantra";
import { generateKolamGeometry } from "./primitives/kolam";
import { generateBhupura } from "./primitives/bhupura";
import { generateSecondaryOrnaments } from "./primitives/ornaments";

function estimatePathLength(d: string): number {
  if (!d) return 0;
  const segments = d.trim().split(/(?=[MLCQZ])/i);
  let len = 0;
  for (const seg of segments) {
    const cmd = seg[0];
    if (cmd === "L" || cmd === "M") {
      len += 30;
    } else if (cmd === "C" || cmd === "Q") {
      len += 75;
    } else if (cmd === "Z") {
      len += 20;
    }
  }
  return Math.max(50, len);
}

export function generateScene(recipe: JantraRecipe): GeneratedScene {
  const prng = createPRNG(recipe.seed);
  const { width, height, background, margin } = recipe.canvas;
  const p = recipe.parameters;
  const vis = p.visibility || {};

  const halfW = width / 2;
  const halfH = height / 2;
  const viewBox = `-${halfW} -${halfH} ${width} ${height}`;

  const maxSafeRadius = Math.min(halfW, halfH) * (1 - margin);
  const bhupuraSize = maxSafeRadius * 0.94;
  const outerRingRadius = p.motifs.bhupura.enabled ? maxSafeRadius * 0.76 : maxSafeRadius * 0.88;
  const minBinduRadius = Math.max(12, p.motifs.bindu.radius * 2);

  const groups: SVGGElementData[] = [];

  // 1. Background Group
  if (vis.bhupura !== false) {
    const bgElements: SVGPathElementData[] = [];
    if (background && background !== "transparent") {
      bgElements.push({
        id: "bg-rect",
        d: `M -${halfW} -${halfH} L ${halfW} -${halfH} L ${halfW} ${halfH} L -${halfW} ${halfH} Z`,
        fill: background,
        stroke: "none",
      });
    }
    if (bgElements.length > 0) {
      groups.push({
        id: "jantra-background",
        name: "Background",
        label: "Canvas Background Layer",
        order: 0,
        elements: bgElements,
      });
    }
  }

  // 2. Bhupura Enclosure Group
  if (p.motifs.bhupura.enabled && vis.bhupura !== false) {
    const bhupuraPaths = generateBhupura(
      {
        enabled: true,
        gates: p.motifs.bhupura.gates,
        steps: p.motifs.bhupura.steps,
        size: bhupuraSize,
        finials: p.motifs.bhupura.finials ?? true,
        prana: p.prana,
        stroke: p.palette.stroke,
        fill: p.palette.fill,
        accent: p.palette.accent,
        strokeWidth: p.line.weight * 1.1,
        strokeCap: p.line.cap,
      },
      prng.fork(101)
    );

    if (bhupuraPaths.length > 0) {
      groups.push({
        id: "jantra-bhupura-enclosure",
        name: "Bhupura Enclosure",
        label: "Sacred Stepped Outer Temple Enclosure (Earth Citadel)",
        order: 1,
        elements: bhupuraPaths,
      });
    }
  }

  // 3. Concentric Rings Group
  const ringsData = generateRings(
    {
      count: p.rings.count,
      spacing: p.rings.spacing,
      maxRadius: outerRingRadius,
      minRadius: minBinduRadius * 1.5,
      density: p.density,
      prana: p.prana,
      showGuideLines: p.rings.showGuideLines,
      stroke: p.palette.stroke,
      accent: p.palette.accent,
      strokeWidth: p.line.weight,
      symmetrySegments: p.symmetry.segments,
    },
    prng.fork(202)
  );

  if (ringsData.guideLines.length > 0 && vis.guides !== false) {
    groups.push({
      id: "jantra-guide-lines",
      name: "Guide Lines",
      label: "Construction Radial Guidelines & Spoke Axes",
      order: 2,
      elements: ringsData.guideLines,
    });
  }

  if (ringsData.rings.length > 0 && vis.rings !== false) {
    groups.push({
      id: "jantra-outer-rings",
      name: "Concentric Rings",
      label: "Concentric Rhythmic Boundary Rings (Vritta)",
      order: 3,
      elements: ringsData.rings,
    });
  }

  const radii = computeRingRadii(
    p.rings.count,
    p.rings.spacing,
    minBinduRadius * 1.5,
    outerRingRadius
  );

  // 4. Primary Motifs: Petals / Lotus Lobes / Diamonds / Chevrons
  const isPetalLike = ["petal", "lotus_lobe", "lotus_pointed", "lotus_double", "chevron", "diamond"].includes(p.motifs.primary);
  if (isPetalLike && vis.petals !== false) {
    const petalElements: SVGPathElementData[] = [];
    const tierCount = Math.max(1, Math.min(3, Math.floor(p.recursion.depth / 2) + 1));

    for (let t = 0; t < tierCount; t++) {
      const outerR = radii.length > 0 ? (radii[radii.length - 1 - t] || outerRingRadius * 0.9) : outerRingRadius * 0.9;
      const innerR = radii.length > 1 ? (radii[Math.max(0, radii.length - 2 - t)] || outerR * 0.5) : outerR * 0.45;
      const tierSegments = (t % 2 === 1 && p.symmetry.mode === "hybrid") ? p.symmetry.segments * 2 : p.symmetry.segments;

      const tierPaths = generatePetalsLayer(
        {
          motifType: p.motifs.primary,
          segments: tierSegments,
          baseRadius: innerR,
          tipRadius: outerR,
          swellRatio: 0.7 + (t * 0.15),
          prana: p.prana,
          stroke: p.palette.stroke,
          fill: p.palette.fill,
          accent: p.palette.accent,
          strokeWidth: p.line.weight * (t === 0 ? 1.0 : 0.8),
          strokeCap: p.line.cap,
          innerTier: t > 0,
          depthTierIndex: t,
        },
        prng.fork(303 + t)
      );

      petalElements.push(...tierPaths);
    }

    if (petalElements.length > 0) {
      groups.push({
        id: "jantra-petals-layer",
        name: "Petals & Lotus Lobes",
        label: "Parametric Petals & Lotus Lobes (Padma)",
        order: 4,
        elements: petalElements,
      });
    }
  }

  // 5. Sri Yantra Specific Generator
  if (p.motifs.primary === "sri_yantra" && vis.polygons !== false) {
    const sriYantraPaths = generateSriYantraGeometry(
      {
        radius: outerRingRadius * 0.78,
        prana: p.prana,
        stroke: p.palette.stroke,
        fill: p.palette.fill,
        accent: p.palette.accent,
        strokeWidth: p.line.weight,
        strokeCap: p.line.cap,
      },
      prng.fork(404)
    );

    // Also add the outer 8 & 16 petal lotus rings characteristic of Sri Yantra
    const innerLotus = generatePetalsLayer(
      {
        motifType: "lotus_pointed",
        segments: 8,
        baseRadius: outerRingRadius * 0.78,
        tipRadius: outerRingRadius * 0.89,
        swellRatio: 0.65,
        prana: p.prana,
        stroke: p.palette.stroke,
        accent: p.palette.accent,
        strokeWidth: p.line.weight * 0.9,
        strokeCap: p.line.cap,
        depthTierIndex: 0,
      },
      prng.fork(405)
    );

    const outerLotus = generatePetalsLayer(
      {
        motifType: "lotus_lobe",
        segments: 16,
        baseRadius: outerRingRadius * 0.89,
        tipRadius: outerRingRadius * 0.98,
        swellRatio: 0.55,
        prana: p.prana,
        stroke: p.palette.stroke,
        accent: p.palette.accent,
        strokeWidth: p.line.weight * 0.8,
        strokeCap: p.line.cap,
        depthTierIndex: 1,
      },
      prng.fork(406)
    );

    groups.push({
      id: "jantra-polygons-layer",
      name: "Sri Yantra 9-Triangles & Padma",
      label: "Interlocking Sacred Shiva-Shakti Triangles (Navayoni) & Lotus Tiers",
      order: 5,
      elements: [...sriYantraPaths, ...innerLotus, ...outerLotus],
    });
  }

  // 6. Kolam Knotwork Generator
  if (p.motifs.primary === "kolam_knot" && vis.polygons !== false) {
    const kolamPaths = generateKolamGeometry(
      {
        radius: outerRingRadius * 0.9,
        segments: p.symmetry.segments,
        density: p.density,
        prana: p.prana,
        stroke: p.palette.stroke,
        accent: p.palette.accent,
        strokeWidth: p.line.weight,
        strokeCap: p.line.cap,
      },
      prng.fork(407)
    );

    groups.push({
      id: "jantra-polygons-layer",
      name: "Sikku Kolam Knotwork",
      label: "Continuous Interlaced Sacred Threshold Loops (Brahma Mudi)",
      order: 5,
      elements: kolamPaths,
    });
  }

  // 7. Polygons & Interlocking Triangles
  const isPolygonLike = ["triangle", "star"].includes(p.motifs.primary);
  if (isPolygonLike && vis.polygons !== false) {
    const polyPaths = generatePolygonsLayer(
      {
        motifType: p.motifs.primary as "triangle" | "star",
        radius: outerRingRadius * 0.82,
        segments: p.symmetry.segments,
        recursionDepth: p.recursion.depth,
        recursionScale: p.recursion.scale,
        prana: p.prana,
        stroke: p.palette.stroke,
        fill: p.palette.fill,
        accent: p.palette.accent,
        strokeWidth: p.line.weight,
        strokeCap: p.line.cap,
      },
      prng.fork(408)
    );

    if (polyPaths.length > 0) {
      groups.push({
        id: "jantra-polygons-layer",
        name: "Polygons & Interlocking Geometry",
        label: "Interlocking Sacred Triangles & Stellated Stars (Trikona)",
        order: 5,
        elements: polyPaths,
      });
    }
  }

  // 8. Secondary Ornaments & Ring Ticks
  if (vis.ornaments !== false) {
    const secondaryOrnaments = generateSecondaryOrnaments(
      {
        motif: p.motifs.secondary,
        radius: radii.length >= 2 ? radii[radii.length - 2] : outerRingRadius * 0.7,
        segments: p.symmetry.segments,
        density: p.density,
        prana: p.prana,
        stroke: p.palette.stroke,
        accent: p.palette.accent,
        strokeWidth: p.line.weight,
      },
      prng.fork(505)
    );

    const combinedOrnaments = [...ringsData.ornaments, ...secondaryOrnaments];
    if (combinedOrnaments.length > 0) {
      groups.push({
        id: "jantra-ornaments",
        name: "Ornaments & Accents",
        label: "Secondary Ornaments, Radiant Ticks & Beads",
        order: 6,
        elements: combinedOrnaments,
      });
    }
  }

  // 9. Bindu Center Group
  if (vis.bindu !== false) {
    const binduElements = generateBindu(
      {
        radius: p.motifs.bindu.radius,
        style: p.motifs.bindu.style,
        prana: p.prana,
        stroke: p.palette.stroke,
        fill: p.palette.fill,
        accent: p.palette.accent,
        strokeWidth: p.line.weight,
      },
      prng.fork(606)
    );

    if (binduElements.length > 0) {
      groups.push({
        id: "jantra-bindu-center",
        name: "Bindu (Center Origin)",
        label: "Central Bindu Point of Origin & Radiance",
        order: 7,
        elements: binduElements,
      });
    }
  }

  groups.sort((a, b) => a.order - b.order);

  let totalPaths = 0;
  let totalVertices = 0;
  let computedLength = 0;

  groups.forEach((g) => {
    g.elements.forEach((el) => {
      totalPaths++;
      if ("d" in el && el.d) {
        computedLength += estimatePathLength(el.d);
        totalVertices += (el.d.match(/[MLCQZ]/gi) || []).length * 2;
      } else if ("r" in el) {
        computedLength += 2 * Math.PI * (el as SVGCircleElementData).r;
        totalVertices += 32;
      } else if ("points" in el) {
        totalVertices += ((el as SVGPolygonElementData).points.split(" ").length || 3);
        computedLength += 100;
      }
    });
  });

  return {
    viewBox,
    width,
    height,
    background,
    groups,
    totalPaths,
    totalVertices: Math.max(10, totalVertices),
    computedLength: Math.max(100, computedLength),
  };
}
