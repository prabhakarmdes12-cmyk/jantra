# JANTRA (यन्त्र)
### Generative Indian Visual Intelligence — Open-Source Computational Vector Design Tool

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![SVG Engine](https://img.shields.io/badge/Engine-Procedural%20SVG-FF6B6B?style=flat-square)](#)
[![Zero-AI Dependency](https://img.shields.io/badge/Core-100%25%20Offline%20Deterministic-brightgreen?style=flat-square)](#)

> **Can visual grammar be modeled as a computational system rather than copied as finished imagery?**

**JANTRA** is a browser-based, open-source computational design tool that lets creators generate beautiful, reproducible vector compositions by manipulating visual grammar — geometry, symmetry, repetition, recursion, rhythm, and controlled imperfection (*Prana*) — directly through an inspector or via natural-language intent.

---

## ✦ Core Principles

1. **Rules, Not Imitation**: Models foundational compositional primitives and spatial transformations rather than copying flattened cultural artworks.
2. **Deterministic Core**: Same engine version + seed + recipe = 100% identical vector output.
3. **Zero-AI Dependency for Core Generation**: All manual editing, parameter scrubbing, and SVG export functions 100% offline without any network or AI API key.
4. **Editable Vector Output**: Exports clean, standards-compliant, semantic SVG files organized into named layer groups (`<g id="jantra-petals">`, `<g id="jantra-rings">`) that import directly into **Figma, Adobe Illustrator, and Inkscape** as editable vector paths.
5. **Cultural Integrity**: Strictly separates universal computational geometry, tradition-inspired generative grammars, and documented historical sacred art.

---

## 📂 Repository Contents

| File | Description |
|---|---|
| [`PRD.md`](./PRD.md) | Full Product Requirements Document (PRD v1.0) detailing user personas, information architecture, functional requirements, and performance budgets. |
| [`ARENA_BUILD_INSTRUCTIONS.md`](./ARENA_BUILD_INSTRUCTIONS.md) | **Master Prompt & Technical Specification for Online Coding Agents** (Arena, Bolt.new, Lovable, v0, Devin, Cursor) to build the complete MVP from scratch. |
| [`JANTRA_PRD.docx`](./JANTRA_PRD.docx) | Original formatted Microsoft Word Product Requirements Document. |

---

## 🚀 Building JANTRA with an AI Coding Agent

If you are using an online AI coding platform (such as **Chatbot Arena**, **Bolt.new**, **Lovable.dev**, **v0.dev**, **Devin**, or **Cursor**), you can build the complete application in one prompt session:

1. Open [`ARENA_BUILD_INSTRUCTIONS.md`](./ARENA_BUILD_INSTRUCTIONS.md).
2. Copy the entire file content.
3. Paste it directly into the coding agent as the system prompt or primary task instruction.
4. The agent will initialize a Vite + React + TypeScript + Tailwind CSS project, construct the deterministic procedural geometry engine, interactive SVG canvas with pan/zoom and growth animation, inspector controls, offline natural-language interpreter, and Figma-ready SVG export modal.

---

## 🧬 Eight Visual Grammar Families

Rather than one monolithic generator, JANTRA runs eight distinct pipelines. Each owns its own
composition logic, register rhythm and ornament vocabulary.

| Family | Sanskrit | Character |
|---|---|---|
| **Lotus** | पद्म | Shingled, overlapping padma courses with pericarp seed rings and veined petals. |
| **Temple** | मन्दिर | Orthogonal sanctum plan — concentric prakara walls, pillar grids, stepped lintel gates. |
| **Mandala** | मण्डल | Rhythmic registers: corolla, bead, serration, comb and scallop bands over a density gradient. |
| **Yantra** | यन्त्र | The Sri Yantra archetype — 9 interlocking Shiva/Shakti triangles inside ashta- and shodasha-dala padma. |
| **Organic** | प्राण | Calligraphic tapering tendrils, phyllotactic leaflets and a breathing rhythm wave. |
| **Ornamental** | अलंकार | Counter-phase braided guilloché bands, jali lattice and engraved micro-registers. |
| **Minimal** | शून्य | Sparse poster geometry, generous negative space, one bold luminous bindu. |
| **Experimental** | प्रयोग | Hybrid symmetry stepping 8 → 16 → 24 outward, with controlled asymmetry. |

---

## 🫁 PRĀṆA — Controlled Life Inside a Deterministic System

Prāṇa runs **0 – 100**. It is never random noise: it is a seeded, continuous harmonic field, so the
same seed always breathes exactly the same way.

| Value | Stage | What changes |
|---|---|---|
| `0` | Pure Geometry | Absolute CAD precision. Uniform line weights, zero breathing, zero wobble. |
| `20` | Micro-Tension | Alternating tier line weights (≈1.0 / 1.4 / 0.8 px) and Bézier control-point tension. |
| `50` | Radial Breathing | Petal height oscillates; gentle curvature variation across symmetry axes. |
| `80` | Organic Vitality | Strong variation with the grammar rules intact — line wobble, asymmetric breathing. |
| `100` | Expressive Tension | The edge of chaos, still reproducible to the last control point. |

---

## 🌱 Deterministic Evolutionary Genealogy

Any seed spawns exactly six gen-1 descendants, each driven by a named mutation operator:

```
108 ──┬── 108-A   More Intricate    +density · +recursion
      ├── 108-B   Temple Gates      stepped lintels · architectural plan
      ├── 108-C   Organic Flow      +prāṇa · softer Béziers
      ├── 108-D   Minimal           sparse geometry · bold bindu
      ├── 108-E   Dense Ornamental  +stipples · concentric micro-bands
      └── 108-F   Asymmetric        hybrid symmetry · living rhythm
```

Selecting a child makes it active; evolving again yields `108-B-1 / -2 / -3` (Intensify, Counterpoint,
Diverge). The whole tree is reproducible from the root seed and a lineage id alone — no state is stored.

---

## 📐 Algorithmic Geometry Model

JANTRA generates compositions radially from the center outward:

- **Bindu (Origin Point)**: Multi-layered luminous core — micro-spokes, dual concentric ripples, soft aura.
- **Vritta (Rhythmic Concentric Rings)**: Linear, golden, harmonic or exponential registers, interleaving solid rings with stipple (`stroke-dasharray="1 8"`, `"2 10"`), bead orbits and graduation dials.
- **Padma (Parametric Petals & Lobes)**: Aspect-aware cubic Bézier lobes with internal filigree ribbing — 3–7 fine spine curves fanning origin → apex inside every petal.
- **Trikona & Yantras (Interlocking Geometry)**: Upward and downward interlocking regular and star polygons.
- **Bhupura (Sacred Outer Frame)**: Double-lined stepped earth enclosures, layered lintel gateways, corner registration brackets and corner fan rosettes.
- **Construction Geometry**: Faint cyan crosshairs, coordinate ticks, circle graduation divisions and angle indicators underneath the artwork.
- **Celestial Nodes**: Luminous golden anchor dots where petals meet outer rings and along the radial axes.
- **Prāṇa (Controlled Life)**: See above.

---

## 📦 Canonical Recipe Schema

Every composition in JANTRA is encoded as a portable, serializable JSON recipe:

```json
{
  "schemaVersion": "1.1",
  "engineVersion": "0.1.8",
  "grammar": { "family": "lotus", "id": "jantra-lotus", "version": "1.0.0" },
  "seed": "108",
  "canvas": { "width": 1600, "height": 1600, "background": "transparent" },
  "parameters": {
    "symmetry": { "mode": "radial", "segments": 8, "outerMultiplier": 1, "asymmetry": 0 },
    "rings": { "count": 6, "spacing": "golden" },
    "recursion": { "depth": 3, "scale": 0.72 },
    "density": 0.42,
    "prana": 22,
    "line": { "weight": 2.17, "cap": "round" },
    "motifs": {
      "primary": "lotus_lobe",
      "bindu": { "radius": 13, "style": "radiant" },
      "bhupura": { "enabled": true, "steps": 3, "gates": 4 }
    },
    "detail": { "ribbing": true, "ribCount": 5, "stipple": true, "nodes": true, "construction": true, "lattice": false },
    "palette": { "stroke": "#f4f4f5", "accent": "#f59e0b", "construction": "#06b6d4" }
  },
  "provenance": { "aiInterpreted": false, "lineageId": "108", "generation": 0 },
  "checksum": "a7f92b..."
}
```

---

## 🖥 Studio

Two modes share one deterministic engine:

- **CREATE** — grammar rail with the eight families and a natural-language prompt card; full-bleed
  viewport with a floating tool palette (Select · Pan · Zoom · Fit · Frame), zoom controls, a live
  `paths | nodes` counter; the Evolution Gallery strip along the bottom; and the Inspector on the
  right (Structure · Variation & Style · Motion & Evolution · Colour & Output · Export Card).
- **INSPECT** — widens the right rail into deep technical tabs: a **Layers** tree with per-layer
  visibility, a live **Code** viewer (SVG and JSON recipe), the exact **ring spacing progression**
  with deltas and ratios, and a **Vertices** table of real path coordinates in both cartesian and
  polar form.

```bash
npm install
npm run dev     # studio on http://localhost:5173
npm test        # 69 determinism / grammar / genealogy / export assertions
npm run build   # tsc + vite production build
```

---

## 🎨 SVG Export Guarantee

SVGs exported by JANTRA are tested for professional design workflows:
- **Figma**: Imports with individual selectable vector groups and editable stroke/fill properties.
- **Adobe Illustrator**: Scales infinitely without pixelation or clipped paths.
- **Inkscape**: Clean path data with standard XML namespaces.
- **Security**: 0 scripts, 0 external network fonts, 0 foreignObjects.

---

## 📜 Cultural Integrity Classification

To prevent cultural misrepresentation, JANTRA uses a 3-tier classification:
- **Computational Geometry**: Pure algorithmic systems using universal geometric operations (polygons, spirals, circles).
- **Tradition-Inspired Grammar**: Research-informed aesthetic abstractions, explicitly labeled as experimental.
- **Documented Traditional Grammar**: Historical rules supported by scholarly sources and living tradition practitioner review.

---

## 👤 Author

**Prabhakar Kumar**  
- GitHub: [@prabhakarmdes12-cmyk](https://github.com/prabhakarmdes12-cmyk)
- Project: [JANTRA](https://github.com/prabhakarmdes12-cmyk/jantra)
