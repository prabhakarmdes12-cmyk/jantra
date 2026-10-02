# JANTRA — Agent Build Specification & Master Prompt
> **A Comprehensive Specification for Autonomous & Online Coding Agents (Arena, Bolt.new, Lovable, v0, Devin, Cursor)**

---

## 1. Executive Summary & Prompt Framing

You are an expert creative technologist, computational designer, and principal frontend engineer.
Your mission is to build **JANTRA** — an open-source, browser-based computational design tool for **Generative Indian Visual Intelligence**.

### The North Star Thesis
> *"Can visual grammar be modeled as a computational system rather than copied as finished imagery?"*

JANTRA turns structural visual rules into a creative medium. A composition is not a flattened bitmap or an AI hallucination; it is a **reproducible, deterministic recipe** with geometry, symmetry, repetition, recursion, rhythm, and controlled imperfection (*Prana*), producing an **editable, standards-compliant vector (SVG)** suitable for professional design software (Figma, Adobe Illustrator, Inkscape, pen plotters, and web).

### What JANTRA Is NOT (Strict Guardrails)
- ❌ **NOT** a text-to-image wrapper (no DALL-E, Midjourney, or Stable Diffusion image generation).
- ❌ **NOT** a simulator that claims invented patterns are authentic sacred mandalas.
- ❌ **NOT** a gallery of static pre-rendered SVGs.
- ❌ **NOT** dependent on AI to work (100% of manual editing and vector generation must function completely offline in the browser without any AI API key).
- ❌ **NOT** an overloaded MVP with 3D worlds, marketplaces, or raster drawing tools.

---

## 2. Target Technology Stack

Build this application as a high-performance, single-page web app with zero backend setup required for core generation:

- **Framework**: React 18/19 + Vite + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v3/v4 (Dark mode default, minimalist studio aesthetic, monospace data readouts)
- **Icons**: `lucide-react`
- **Math & Randomness**: Pure TypeScript Seeded PRNG (`mulberry32` or `alea`) + Seeded Perlin/Simplex Noise
- **Rendering Engine**: SVG DOM + Canvas preview pipeline
- **State Management**: Zustand or React Context + useReducer (pure serializable JSON recipes, undo/redo history)
- **Animation**: CSS `stroke-dashoffset` / SVG Path Length or `requestAnimationFrame` growth sequence
- **Exporting**: Client-side SVG serializer & sanitizer, HTML5 Canvas to PNG blob converter (1x, 2x, 4x)
- **URL Sharing**: LZ-String or Base64 compressed hash encoding of the recipe

---

## 3. Canonical Architecture & File Tree

The agent should generate the project following this clean modular structure:

```
jantra/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   ├── recipe.ts             # Canonical Recipe & Parameter schema
    │   ├── geometry.ts           # Primitives (Point, Path, Ring, Shape)
    │   └── export.ts             # Export configuration & preflight diagnostics
    ├── engine/
    │   ├── prng.ts               # Deterministic seeded PRNG (mulberry32) & noise
    │   ├── primitives/
    │   │   ├── bindu.ts          # Central point / circle origin
    │   │   ├── rings.ts          # Concentric radial boundaries & rhythmic bands
    │   │   ├── petals.ts         # Parametric Bézier lobes & floral motifs
    │   │   ├── polygons.ts       # Regular & star polygons, interlocking triangles
    │   │   └── bhupura.ts        # Stepped sacred square perimeter / gates
    │   ├── transforms/
    │   │   ├── symmetry.ts       # N-fold radial repeat, bilateral mirroring
    │   │   ├── recursion.ts      # Recursive scale & subdivision
    │   │   └── prana.ts          # Seeded organic jitter & controlled imperfection
    │   ├── generator.ts          # Master composition builder (Recipe -> SVG Scene Tree)
    │   └── serializer.ts         # SVG string serializer, sanitizer & optimizer
    ├── ai/
    │   ├── schema.ts             # Strict LLM output validation (Zod)
    │   ├── intentParser.ts       # Natural language -> Recipe parameters (offline rule-based)
    │   └── llmAdapter.ts         # Optional external LLM adapter (OpenAI / WebLLM / Ollama)
    ├── hooks/
    │   ├── useRecipe.ts          # Active recipe, undo/redo, parameter setters
    │   ├── useGrowthAnimation.ts # Progressive drawing timeline controller
    │   └── usePanZoom.ts         # Infinite/bounded artboard canvas controls
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx        # Logo, Seed display, Quick actions, Export trigger
    │   │   └── Footer.tsx        # Status bar, element count, engine version
    │   ├── canvas/
    │   │   ├── Canvas.tsx        # Viewport with pan, zoom, grid, and SVG rendering
    │   │   ├── GrowthOverlay.tsx # Bindu initialization & progressive reveal
    │   │   └── ControlsOverlay.tsx # Zoom in/out, fit to screen, reset view
    │   ├── inspector/
    │   │   ├── Inspector.tsx     # Collapsible sidebar
    │   │   ├── SymmetryPanel.tsx # Radial segments (2–32), mode toggle
    │   │   ├── StructurePanel.tsx# Concentric rings, density, recursion depth
    │   │   ├── MotifsPanel.tsx   # Primary/secondary motif picker (petal, triangle, star)
    │   │   ├── PranaPanel.tsx    # Controlled imperfection slider & organic jitter
    │   │   └── StylePanel.tsx    # Line weight, stroke style, stroke color, background
    │   ├── intent/
    │   │   └── IntentBar.tsx     # Natural language input + interpretation preview card
    │   ├── export/
    │   │   ├── ExportModal.tsx   # SVG / PNG / JSON download sheet
    │   │   └── PreflightReport.tsx# Node count, viewBox, external dep check
    │   └── common/
    │       ├── Slider.tsx        # Accessible numeric slider with direct input
    │       ├── SeedInput.tsx     # Seed text field with randomize / lock button
    │       └── AboutModal.tsx    # Cultural integrity & computational thesis modal
    └── utils/
        ├── url.ts                # URL recipe compression & decompression
        └── download.ts           # Browser file download helper
```

---

## 4. The Canonical Recipe Data Model

The recipe is the single source of truth. The renderer must be a pure function: `render(recipe) -> SVG`.

```typescript
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
    background: string;      // default: "transparent" or "#0a0a0c"
    margin: number;          // normalized 0.0 - 0.2, default: 0.08
  };
  parameters: {
    symmetry: {
      mode: "radial" | "bilateral" | "grid" | "hybrid";
      segments: number;      // 2 - 32, default: 8
    };
    rings: {
      count: number;         // 1 - 12, default: 5
      spacing: "linear" | "exponential" | "harmonic";
      showGuideLines: boolean;
    };
    recursion: {
      depth: number;         // 0 - 6, default: 3
      scale: number;         // 0.2 - 0.9, default: 0.65
    };
    density: number;         // 0.05 - 1.0, default: 0.35
    prana: number;           // 0.0 - 0.35 (controlled organic imperfection), default: 0.06
    line: {
      weight: number;        // 0.5 - 8.0, default: 1.2
      dashPattern?: string;  // e.g. "none", "4 4", "1 3"
      cap: "round" | "square" | "butt";
      color: string;         // default: "#f5f5f7" or "#111111"
    };
    motifs: {
      primary: "petal" | "triangle" | "star" | "lotus_lobe" | "chevron" | "diamond";
      secondary: "circle" | "dot" | "triangle" | "cross" | "none";
      bindu: {
        radius: number;      // 2 - 40, default: 8
        style: "solid" | "hollow" | "radiant";
      };
      bhupura: {
        enabled: boolean;    // Outer stepped temple enclosure
        gates: number;       // 4 gates (cardinal directions)
        steps: number;       // 1 - 3 stepped terraces
      };
    };
    palette: {
      stroke: string;
      secondaryStroke: string;
      fill: string;
      accent: string;
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
```

---

## 5. Mathematical & Algorithmic Geometry Engine

### 5.1 Deterministic Pseudo-Random Number Generator (PRNG)
Never use `Math.random()`. All randomness must be seeded and reproducible:

```typescript
// Mulberry32 seeded generator
export function createPRNG(seedString: string | number) {
  let h = 0;
  const str = String(seedString);
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  
  let s = h >>> 0;
  return function next(): number {
    s |= 0;
    s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

### 5.2 Prana (Controlled Imperfection)
Prana injects the living, human quality found in traditional Indian yantras and kolams without breaking structural geometry:

```typescript
export function applyPrana(
  x: number, 
  y: number, 
  pranaAmount: number, 
  prng: () => number, 
  scale: number = 10
): [number, number] {
  if (pranaAmount <= 0) return [x, y];
  // Seeded continuous jitter
  const angle = prng() * Math.PI * 2;
  const distance = prng() * pranaAmount * scale;
  return [
    x + Math.cos(angle) * distance,
    y + Math.sin(angle) * distance
  ];
}
```

### 5.3 Geometric Primitives Specification
The generator works from the center outward:

1. **Bindu (Point of Origin)**:
   - Centered at `(0, 0)`.
   - Rendered as `<circle cx="0" cy="0" r="{radius}" />` with optional concentric aura rings.

2. **Concentric Rhythmic Rings (Vritta)**:
   - Radii generated based on `rings.count` and `rings.spacing`.
   - Harmonic spacing: \( R_i = R_{max} \cdot \left(\frac{i}{N}\right)^k \) where \( k = 1 \) for linear, \( 1.5 \) for exponential.
   - Each ring layer can host radial subdivision ornaments.

3. **Parametric Petals & Lobes (Padma / Lotus)**:
   - Generated using cubic Bézier curves:
     - Origin: Base radius \( r_0 \) at angle \( -\theta/2 \)
     - Control Point 1: Swell radius \( r_{mid} \) at angle \( -\theta/4 \)
     - Apex: Tip radius \( r_{tip} \) at angle \( 0 \)
     - Control Point 2: Swell radius \( r_{mid} \) at angle \( +\theta/4 \)
     - End: Base radius \( r_0 \) at angle \( +\theta/2 \)
   - Rotated across \( N \) symmetry segments: \( \alpha_k = k \cdot \frac{2\pi}{N} \).

4. **Interlocking Triangles & Star Polygons (Trikona & Yantra Geometries)**:
   - Upward pointing triangles (Purusha / Shiva / ascending force)
   - Downward pointing triangles (Prakriti / Shakti / descending grace)
   - Exact vertex trigonometry: \( V_j = (R \cos(\theta_j), R \sin(\theta_j)) \) with intersecting anchor lines.

5. **Bhupura (Sacred Outer Earth Enclosure)**:
   - 4-sided square perimeter with 3 stepped tiers (triloka) and 4 stepped T-shaped portal projections (chaturdvara) oriented to the 4 cardinal directions.

---

## 6. Growth Animation System

When a user loads the app or clicks **Regenerate**, the geometry must grow line by line:

1. **Ordering of Construction**:
   - Step 1: Bindu pulses and expands.
   - Step 2: Primary concentric baseline circles radiate outward.
   - Step 3: Central motif (interlocking polygons/inner lotus) unfolds.
   - Step 4: Recursive intermediate rings and petals draw along their path length.
   - Step 5: Outer framing borders (Bhupura) snap into completion.
2. **Animation Implementation**:
   - Compute total path length for each SVG path (`path.getTotalLength()`).
   - Set `strokeDasharray = length` and animate `strokeDashoffset` from `length` to `0` using CSS transitions or a RAF ticker.
   - **Controls**: Play, Pause, Replay, Speed Slider (0.25x to 4x), and "Skip to Final" button.
   - **Reduced Motion Support**: If `window.matchMedia('(prefers-reduced-motion: reduce)')` is true, immediately render the final composition at `offset = 0` without animation.

---

## 7. Natural Language Intent Interpreter

Provide an offline-first intent bar that maps creative english descriptions into valid parameters:

### Offline Rule-Based Matcher (Instant, No API Key Required)
Map keywords to parameter deltas:
- **"Quiet", "minimal", "sparse", "calm"** -> `density: 0.15`, `rings.count: 3`, `recursion.depth: 1`, `line.weight: 0.8`
- **"Dense", "intricate", "complex", "sacred"** -> `density: 0.75`, `rings.count: 8`, `recursion.depth: 4`, `symmetry.segments: 16`
- **"Hand-drawn", "imperfect", "organic", "vital"** -> `prana: 0.18`, `line.cap: "round"`
- **"Sharp", "architectural", "crisp", "geometric"** -> `prana: 0.0`, `motifs.primary: "triangle"`, `line.cap: "square"`
- **"Lotus", "floral", "bloom"** -> `motifs.primary: "petal"`, `symmetry.segments: 8` or `12`
- **"Twelve-fold", "8-fold", "16-fold"** -> Extracts number -> `symmetry.segments: N`

### Interpretation Card
Before applying, show a small preview chip:
```
Interpreted Intent: "minimal lotus with human imperfection"
↳ Symmetry: 8-fold | Density: 0.20 | Prana: 0.14 | Primary: Petal
[ Apply Recipe ]   [ Discard ]
```

---

## 8. SVG Export — Product-Critical Specification

The exported SVG **must open cleanly in Figma, Adobe Illustrator, and Inkscape** as editable vector groups, not flattened pixels or one gigantic uneditable compound path.

### SVG Output Requirements:
1. **Root Attributes**:
   ```xml
   <svg 
     xmlns="http://www.w3.org/2000/svg" 
     viewBox="-800 -800 1600 1600" 
     width="1600" 
     height="1600" 
     data-jantra-version="0.1.0"
     data-jantra-seed="108"
   >
   ```
2. **Layer Grouping**:
   ```xml
   <g id="jantra-background">...</g>
   <g id="jantra-bhupura-enclosure">...</g>
   <g id="jantra-outer-rings">...</g>
   <g id="jantra-petals-layer">...</g>
   <g id="jantra-polygons-layer">...</g>
   <g id="jantra-inner-geometry">...</g>
   <g id="jantra-bindu-center">...</g>
   ```
3. **No Garbage**:
   - Zero `<script>` tags.
   - Zero `<foreignObject>` tags.
   - Zero external web fonts or embedded images.
   - Clean hex/CSS colors.
4. **Preflight Checks in Export Modal**:
   - Display Path Count (e.g. 142 paths)
   - Total Vertex/Node Estimate
   - File Size Estimate (~48 KB)
   - Figma Compatibility: **Verified (Pure Vectors)**
   - Download Options:
     - `SVG (Editable / Grouped)`
     - `SVG (Minified Web)`
     - `PNG (1x, 2x, 4x)`
     - `Recipe (JSON)`

---

## 9. Visual Style & UI Design System

Adopt a **refined, dark-mode computational laboratory** aesthetic:
- **Background**: `#09090b` (Zinc-950) with subtle radial dot grid (`#27272a`).
- **Canvas Artboard**: `#0e0e11` square artboard with subtle drop-shadow and border (`#27272a`).
- **Accent Color**: Saffron/Amber glow (`#f59e0b` or `#fbbf24`) used sparingly for active states, bindu accents, and primary actions.
- **Panels**: Glassmorphic zinc cards (`bg-zinc-900/80 backdrop-blur-md border border-zinc-800`).
- **Typography**:
  - UI labels: Sans-serif (Inter / Geist / system-ui), clean and tracked.
  - Parameter numbers & seeds: Monospace (JetBrains Mono / Fira Code / monospace).
- **Control Sliders**: Custom sleek sliders with real-time numerical badges.
- **Responsiveness**:
  - Desktop: Canvas centered, collapsible floating Inspector on the right, top header, bottom intent bar.
  - Mobile: Fullscreen canvas with expandable bottom sheet for key sliders and export.

---

## 10. Step-by-Step Build Order for the Agent

To execute this build flawlessly without breaking context or encountering errors, follow this phased progression:

### Phase 1: Foundation & PRNG
- Initialize Vite + React + TypeScript + Tailwind CSS.
- Create `src/engine/prng.ts` (Mulberry32 PRNG + Seeded 2D Simplex/Perlin Noise).
- Create `src/types/recipe.ts` with the canonical recipe definition and default presets.

### Phase 2: Procedural Geometry Engines
- Implement `src/engine/primitives/bindu.ts`, `rings.ts`, `petals.ts`, `polygons.ts`, `bhupura.ts`.
- Implement `src/engine/transforms/symmetry.ts` and `prana.ts`.
- Implement `src/engine/generator.ts` which takes any `JantraRecipe` and returns an array of SVG elements/paths with semantic layer IDs.

### Phase 3: Interactive Canvas & Viewport
- Build `src/components/canvas/Canvas.tsx` supporting:
  - SVG viewport centered at `(0, 0)`.
  - Smooth pan (drag) and zoom (mouse wheel + touch pinch).
  - Center/Reset view button.
  - Subtle background coordinate grid.

### Phase 4: Inspector & Live Controls
- Build the Collapsible Inspector panel (`src/components/inspector/`):
  - **Symmetry Section**: Mode buttons, Segment count slider (2 to 32).
  - **Structure Section**: Concentric rings count slider, spacing mode, recursion depth.
  - **Motifs Section**: Primary motif picker, Bhupura outer frame toggle.
  - **Prana Section**: Organic imperfection slider (0.00 to 0.35) with live visual feedback.
  - **Line & Style Section**: Stroke width slider, stroke color, background color.
  - Seed Bar with "Randomize" (die icon), editable seed text, and "Regenerate".
  - Undo/Redo stack hooks (`Cmd+Z`, `Cmd+Shift+Z`).

### Phase 5: Growth Animation & Timeline
- Implement `src/hooks/useGrowthAnimation.ts`.
- Add play, pause, replay, and speed controls directly on the canvas floating overlay.
- Handle `prefers-reduced-motion`.

### Phase 6: Natural Language Intent Bar
- Implement `src/components/intent/IntentBar.tsx`.
- Connect `src/ai/intentParser.ts` for instant offline keyword interpretation.
- Add preset prompts ("Intricate 12-fold sacred temple", "Minimalist meditative bindu", "Organic imperfect lotus").

### Phase 7: Export Modal & Diagnostics Preflight
- Build `src/components/export/ExportModal.tsx`.
- Calculate preflight diagnostics (paths, nodes, size).
- Implement clean SVG serialization (Figma-ready grouped SVG download).
- Implement Canvas-based PNG export at 1x, 2x, 4x.
- Implement JSON recipe export and import.
- Implement URL hash sharing (`#recipe=...`).

### Phase 8: Polish, Cultural Integrity Modal & Verification
- Add the "About / Cultural Integrity" modal explaining the distinction between computational geometry, tradition-inspired grammars, and documented sacred art.
- Verify 100% determinism (same seed = identical SVG paths).
- Test keyboard navigation and ARIA labels.

---

## 11. Acceptance Criteria Checklist

An agent building JANTRA has succeeded when:
- [x] **Instant First Render**: An exquisite generative radial vector composition renders on initial page load in < 2 seconds.
- [x] **Zero AI Dependency**: Complete manual creation, tweaking, randomization, and export works 100% offline without any API key.
- [x] **Deterministic Seed**: Entering seed `"108"` always produces the exact same geometry.
- [x] **Fluid Inspector**: Scrubbing sliders updates the canvas smoothly without stutter.
- [x] **Organic Prana**: Increasing the Prana slider creates subtle human imperfection without corrupting the geometric structure.
- [x] **Growth Reveal**: Animation draws paths from center outwards with play/pause/replay and reduced-motion support.
- [x] **Figma-Clean SVG**: Exported SVG file imports into Figma with distinct named vector groups (`#jantra-petals`, `#jantra-rings`, etc.).
- [x] **Portable Recipe**: Exported JSON recipe can be dropped back in to reconstruct the exact composition.
- [x] **Intent Parsing**: Typing "minimalist 8-fold lotus" suggests and applies appropriate parameter changes.
