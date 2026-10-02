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

## 📐 Algorithmic Geometry Model

JANTRA generates compositions radially from the center outward:

- **Bindu (Origin Point)**: Central energetic attractor and origin circle.
- **Vritta (Rhythmic Concentric Rings)**: Linear, harmonic, or exponential concentric boundary rings.
- **Padma (Parametric Petals & Lobes)**: Cubic Bézier curves with dynamic swell, curvature, and radial repetition.
- **Trikona & Yantras (Interlocking Geometry)**: Upward (ascending) and downward (descending) interlocking regular and star polygons.
- **Bhupura (Sacred Outer Frame)**: Stepped earth enclosures with cardinal T-portal gateways.
- **Prana (Controlled Imperfection)**: Seeded continuous jitter applied to control points and lines to impart organic, hand-drawn vitality without compromising symmetry.

---

## 📦 Canonical Recipe Schema

Every composition in JANTRA is encoded as a portable, serializable JSON recipe:

```json
{
  "schemaVersion": "1.0",
  "engineVersion": "0.1.0",
  "grammar": { "id": "geometric-radial", "version": "0.1.0" },
  "seed": "108",
  "canvas": { "width": 1600, "height": 1600, "background": "transparent" },
  "parameters": {
    "symmetry": { "mode": "radial", "segments": 8 },
    "rings": 5,
    "recursion": { "depth": 4, "scale": 0.72 },
    "density": 0.31,
    "prana": 0.08,
    "line": { "weight": 0.7 },
    "motifs": { "primary": "petal", "secondary": "triangle" }
  },
  "provenance": { "aiInterpreted": false, "parentRecipe": null },
  "checksum": "a7f92b..."
}
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
