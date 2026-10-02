# JANTRA

Product Requirements Document v1.0 — Generative Indian Visual Intelligence
Product thesis: A browser-based, open-source computational design tool that lets people create beautiful, reproducible vector compositions by manipulating visual grammar — geometry, symmetry, repetition, recursion, rhythm and controlled imperfection — directly or through natural-language intent.
Primary release goal: a small, extremely polished, portfolio-grade creative tool whose exported SVG is genuinely useful outside JANTRA.

| Field | Decision |
| --- | --- |
| Product type | Creative tool + computational-design research + portfolio proof + open-source engine |
| Primary user | Designer/artist who does not need to code |
| Core engine | Deterministic procedural vector engine; AI is optional and separate |
| MVP grammar | Culturally neutral geometric/radial grammar; Indian cultural grammars follow research |
| Rendering | SVG-first |
| Release strategy | 14-day portfolio release, then iterative expansion |
| Export promise | Editable, standards-compliant SVG suitable for Figma/Illustrator/Inkscape/web/print workflows |


## 1. Product vision

JANTRA asks a specific design question: can visual grammar be modeled as a computational system rather than copied as finished imagery? The product turns visual rules into a creative medium. A composition is not a flattened picture; it is a reproducible recipe with structure, parameters, seed, provenance and editable vector output.

### 1.1 North-star experience

A visitor opens JANTRA. A single bindu-like point appears. Geometry grows line by line into a composition. The user can regenerate it, manipulate a precise inspector, describe an intention in natural language, inspect the resulting parameters, save/share the seed and export a clean SVG that remains useful in professional design software.

### 1.2 What JANTRA is not

Not a text-to-image wrapper.
Not an authenticity simulator that labels invented patterns as traditional sacred art.
Not a gallery of pre-rendered assets.
Not dependent on AI to function.
Not an MVP overloaded with Gond, Rangoli, temple architecture, infinite worlds, marketplace and image recognition.

## 2. Product principles


| Principle | Requirement |
| --- | --- |
| Rules, not imitation | Model compositional primitives and transformations rather than copying completed cultural artworks. |
| Deterministic core | The same engine version + grammar + seed + parameter recipe must reproduce the same composition. |
| Human control | AI interprets intent; the procedural engine constructs; the user can inspect and override. |
| Useful output | The exported artifact must survive outside the product as a clean, editable vector. |
| Cultural honesty | Separate computational geometry, tradition-inspired grammar and documented traditional grammar. |
| Progressive depth | A first-time user can create immediately; experts can inspect parameters and recipes. |
| Visible craft | Growth, transitions, typography, interaction states and exports must be portfolio-grade. |
| Open system | Core grammar definitions and rendering logic are documented and open-source. |


## 3. Goals and success criteria


### 3.1 MVP goals

Generate visually strong radial/geometric vector compositions from deterministic seeds.
Allow direct manipulation through an inspector without requiring code.
Translate natural-language intent into a validated parameter object.
Animate construction so the user sees the system draw the work.
Export clean SVG and a portable JSON recipe.
Share a reproducible composition through a URL containing or resolving to its recipe/seed.
Document enough architecture, decisions and failed explorations to form a strong product-design case study.

### 3.2 Quantitative targets


| Metric | MVP target |
| --- | --- |
| Time to first artwork | < 5 seconds on a typical modern laptop after app load |
| First meaningful edit | < 60 seconds without tutorial |
| Seed reproducibility | 100% for same engine/grammar version |
| SVG export success | 100% of supported compositions |
| SVG editability | Opens as vectors in Figma, Illustrator and Inkscape test workflow |
| Export visual fidelity | No visually material difference from canvas at default export |
| Core interaction | 60 fps target during ordinary parameter manipulation where feasible |
| AI dependency | 0% — all manual creation/export works with AI disabled |
| MVP accessibility | Keyboard-accessible controls; visible focus; semantic labels; reduced-motion behavior |


## 4. Users and jobs to be done


| Persona | Primary job | Need |
| --- | --- | --- |
| Creative designer / artist | Create an original vector base quickly | Control without programming; editable export |
| Creative coder | Explore/reuse a grammar | Transparent recipe, seed, source and extensibility |
| Student / researcher | Understand procedural composition | Visible rules, provenance and repeatability |
| Portfolio/recruiter viewer | Understand the maker's judgment quickly | Clear product thesis, interaction quality and technical evidence |


### 4.1 Core JTBD

When I want a visually distinctive generative composition, I want to describe or manipulate its underlying structure rather than prompt for a finished image, so I can understand, control, reproduce and continue editing the result.

## 5. Scope


| MVP — must ship | V1/V2 — intentionally later |
| --- | --- |
| Geometric/radial grammar | Infinite spatial world / streaming generation |
| Seeded deterministic generation | Sketch-to-grammar recognition |
| Growth animation | Node-based grammar editor |
| Inspector | Multiple researched cultural grammar packs |
| Natural language → parameters | Accounts / cloud collections |
| SVG + JSON recipe export | Community gallery / remix lineage |
| PNG convenience export | Plotter mode / manufacturing presets |
| Shareable URL | Video export |
| History/undo-redo | Marketplace |
| Responsive desktop-first UI | Collaborative editing |


## 6. Information architecture

Landing / Canvas — artwork-first creation surface.
Inspector — structure, symmetry, recursion, density, precision/prana, motif and animation controls.
Intent bar — natural-language request, interpretation preview and apply action.
History — local session versions and undo/redo.
Export — SVG, PNG and JSON recipe; export diagnostics.
About / Method — product thesis, cultural classification and open-source link.
Grammar docs — primitive/rule definitions and engine/version metadata.

## 7. Primary user flows


### 7.1 First visit → useful SVG

Load app; a curated seed begins growing automatically.
User sees a complete artwork plus compact inspector.
User changes one obvious control such as symmetry or density.
Engine updates deterministically while preserving seed unless regeneration is requested.
User selects Export → SVG.
Export preflight validates dimensions, unsupported effects, clipping and metadata.
User downloads a clean SVG and can continue editing it in an external vector tool.

### 7.2 Intent → inspect → generate

User enters: “Quiet, sparse, eight-fold symmetry, slight human irregularity.”
AI adapter converts language to a strict parameter schema; it does not draw.
JANTRA shows an optional interpretation summary: symmetry 8, density .25, prana .08, etc.
User applies or edits the interpretation.
Deterministic engine renders/grows the composition.
Recipe records whether AI interpretation was used, but the artifact remains reproducible without the model.

### 7.3 Seed → remix

User opens a shared seed/recipe URL.
JANTRA verifies engine and grammar version.
Composition reconstructs exactly when the compatible engine is available.
User chooses Remix; a new branch retains parent provenance.
Changes create a new recipe/URL without modifying the source composition.

## 8. Functional requirements


| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 Seed generation | Generate numeric/string seeds; seeded PRNG must be isolated from non-deterministic runtime values. | P0 |
| FR-02 Grammar engine | Build composition from primitives + transformations + constraints. | P0 |
| FR-03 Inspector | Live edit supported parameters with keyboard-accessible controls. | P0 |
| FR-04 Growth animation | Reveal construction sequence; pause, replay, skip. | P0 |
| FR-05 Natural language | Map intent to validated parameter schema; graceful manual fallback. | P0 |
| FR-06 Interpretation | Optional readable mapping from phrases to parameter changes. | P1 |
| FR-07 Undo/redo | Session history for parameter and seed changes. | P0 |
| FR-08 Share | Encode compact recipe or persistent recipe ID in URL. | P0 |
| FR-09 SVG export | Export clean, editable, standalone SVG. | P0 |
| FR-10 JSON recipe | Export/import recipe including version, seed, grammar and parameters. | P0 |
| FR-11 PNG export | Raster convenience export at user-selected scale. | P1 |
| FR-12 Provenance | Embed JANTRA metadata without polluting visible artwork. | P0 |
| FR-13 Reduced motion | Respect prefers-reduced-motion and provide skip-animation control. | P0 |
| FR-14 Offline core | Manual engine and SVG export continue without AI/network after app assets load, where deployment permits. | P1 |


## 9. Generative grammar specification


### 9.1 Primitive vocabulary


| Primitive | Purpose |
| --- | --- |
| Point | Origin, anchor, attractor |
| Line / polyline | Structural connection and contour |
| Circle / arc | Radial boundary and rhythm |
| Triangle / polygon | Directional geometry and enclosure |
| Petal / lobe | Parametric radial organic form |
| Ring | Repeated radial band |
| Path | General compound vector structure |
| Group | Transformable semantic collection |


### 9.2 Core transformations

rotate(angle)
mirror(axis)
radialRepeat(n)
translate(x,y)
scale(factor)
recursiveScale(depth,factor)
subdivide(n)
offset(distance)
perturb(amount, seededNoise)
clip(boundary)
ornament(boundary, motifRule)

### 9.3 MVP parameter schema


| Parameter | Example | Constraint |
| --- | --- | --- |
| seed | 108 | string or integer |
| symmetry.mode | radial | radial \| bilateral \| grid \| hybrid |
| symmetry.segments | 8 | 2–32 |
| rings | 5 | 1–12 |
| recursion.depth | 4 | 0–8 |
| recursion.scale | 0.72 | 0.2–0.95 |
| density | 0.31 | 0–1 |
| prana | 0.08 | 0–0.35; seeded controlled imperfection |
| line.weight | 0.7 | 0.1–6 logical units |
| motif.primary | petal | registered motif ID |
| motif.secondary | triangle | registered motif ID or null |
| animation.speed | 1.0 | 0.1–4 |
| canvas.aspect | 1:1 | preset or custom |
| margin | 0.08 | 0–0.3 normalized |


## 10. AI architecture

AI is an adapter around the deterministic engine, not part of the renderer. The renderer must accept the same validated recipe whether it came from a human, preset, URL or model.
Intent → LLM/intent parser → strict JSON candidate → schema validator → constraint normalizer → optional interpretation preview → deterministic engine → SVG DOM.

### 10.1 AI rules

Never return raw executable code into the renderer.
Only emit registered parameters/motifs from the current grammar schema.
Unknown intent must degrade to suggestions, not fabricated controls.
User can see/edit the resulting parameter values.
Model failure must not block manual generation or export.
Do not claim cultural authenticity from an AI-generated interpretation.

## 11. SVG export — product-critical specification

The export is not a screenshot of the tool. It is a first-class design artifact. A user should be able to export from JANTRA, open the SVG in a professional vector editor, recolor/rearrange/scale it, use it in a website, print it, or continue illustrating from it.

### 11.1 SVG quality requirements

Standards-compliant standalone SVG with explicit width, height and viewBox.
Geometry remains vector paths/shapes; never rasterize ordinary JANTRA artwork into the SVG.
Use logical groups (<g>) for major structural layers when this preserves editability.
Avoid unnecessary nested groups, invisible nodes and editor-specific garbage.
No external font dependency for artwork; text used as artwork must be converted to paths or omitted by default.
No external images, scripts, network references or unsafe foreignObject in exported artwork.
Stroke scaling behavior must be predictable. Export dialog provides 'scale strokes with artwork' behavior/preset.
Clip paths/masks allowed only when verified across target editors; prefer explicit geometry when practical.
All randomness is resolved before export; SVG contains final geometry, not runtime random functions.
Optional metadata includes seed, engine version, grammar version and recipe checksum.
Metadata must not expose user prompt text unless user explicitly opts in.
Background defaults to transparent; optional background can be included as a separate named group.
Color values use portable CSS/SVG representations.
File must remain visually correct when opened without JANTRA.

### 11.2 Export presets


| Preset | Purpose | Behavior |
| --- | --- | --- |
| Editable SVG | Figma/Illustrator/Inkscape | Semantic groups; clean paths; transparent background |
| Web SVG | Web/product use | Optimized/minified; safe attributes; no editor metadata |
| Print SVG | Print/plot preparation | Physical dimensions; explicit units; simplified effects |
| PNG 1x/2x/4x | Quick sharing | Rasterized from same vector scene |
| Recipe JSON | Reconstruction/remix | Seed + grammar + parameters + versions + checksum |


### 11.3 Export preflight

Before download, JANTRA runs a preflight and reports: artboard size, node/path count, clipping/mask usage, unsupported effects, estimated file size, external dependencies (must be zero for standard export), and whether the composition can be reconstructed from the attached recipe.

### 11.4 Acceptance tests for usefulness

Open exported Editable SVG in Figma: artwork imports as editable vectors/groups, not one raster image.
Open in Adobe Illustrator: scale to 400% with no pixelation and no missing artwork.
Open in Inkscape: edit stroke/fill on a selected structural group.
Embed Web SVG in a plain HTML page with no JANTRA runtime and verify rendering.
Print/PDF workflow test at A4 and A3 sizes with expected line weight.
Round-trip: export recipe JSON, clear session, import recipe and reproduce the composition.
Determinism test: same version + recipe produces a matching geometry checksum.
Security test: exported SVG contains no script, remote URL, foreignObject or hidden prompt data by default.

## 12. Interaction and screen specification


| Screen/region | Required behavior |
| --- | --- |
| Canvas | Pan/zoom within bounded MVP artboard; center/reset; artwork selection is optional in MVP. |
| Top bar | JANTRA identity, seed, regenerate, undo/redo, share, export. |
| Inspector | Collapsible sections: Structure, Symmetry, Recursion, Density, Prana, Motifs, Line, Animation, Canvas. |
| Intent bar | Prompt field, examples, generate/interpret, status, interpretation preview. |
| Seed control | Editable seed, randomize, copy link. |
| Export sheet | Preset, dimensions, background, metadata/privacy, preflight, download. |
| Help | Short explanation of deterministic generation and parameter glossary. |


## 13. States and failure handling


| State | Behavior |
| --- | --- |
| Initial load | Show lightweight bindu/loader; do not fake generated artwork before engine is ready. |
| Generating | Progressive drawing; controls can be temporarily throttled, not frozen. |
| Invalid parameter | Clamp when safe; otherwise explain and preserve previous valid state. |
| AI unavailable | Inline message: manual controls remain fully available. |
| Prompt ambiguous | Offer interpretation with editable assumptions. |
| Heavy geometry | Warn at threshold; offer simplify/lower density before export. |
| Export failure | Preserve composition; show actionable reason; never lose recipe. |
| Version mismatch | Attempt compatible renderer; otherwise state that exact reconstruction needs original engine version. |
| Reduced motion | Render final composition without growth animation. |


## 14. Cultural integrity framework


| Classification | Meaning | UI label |
| --- | --- | --- |
| Computational geometry | Original algorithmic system using universal geometric operations | Computational |
| Tradition-inspired grammar | Research-informed abstraction, not claimed as authentic practice | Inspired / Experimental |
| Documented traditional grammar | Rules supported by sources and, where appropriate, practitioner/scholar review | Documented |

Sacred diagrams are not casually randomized and presented as authentic Yantras.
Each future cultural grammar includes source notes, scope, limitations and attribution.
Collaborators/practitioners are credited prominently when their knowledge shapes a grammar.
The project distinguishes visual similarity from cultural meaning.
Training/reference imagery is not silently repackaged as generated vector assets.

## 15. Accessibility and responsive behavior

All inspector controls have programmatic labels, keyboard access and visible focus.
Never communicate parameter state only by color.
Contrast meets WCAG AA for tool UI wherever applicable.
Respect reduced motion; animation is pausable/skippable.
Desktop is primary creation environment. Tablet receives full creation where feasible. Mobile v0.1 prioritizes viewing, seed changes, simple controls and export/share.
Touch targets are at least approximately 44×44 CSS px on touch layouts.
Artwork itself may be visually complex; UI chrome remains readable and restrained.

## 16. Technical architecture


| Layer | Recommendation |
| --- | --- |
| App | React + TypeScript (or equivalent typed web stack) |
| Renderer | SVG DOM / generated SVG tree |
| State | Serializable recipe state; no renderer-only hidden state |
| Randomness | Seeded PRNG |
| Grammar | Versioned declarative definitions + typed transformation functions |
| AI adapter | Server/API boundary returning strict schema; optional local/mock adapter for development |
| Persistence MVP | URL + localStorage/session history; no account required |
| Export | Client-side SVG serialization + sanitizer + optimizer; PNG from same vector scene |
| Testing | Unit tests for grammar/seed determinism; visual snapshots; cross-editor export matrix |
| Open source | Core engine, grammar spec, examples and architecture docs |


## 17. Data model

Canonical recipe object:
{  "schemaVersion": "1.0",  "engineVersion": "0.1.0",  "grammar": {"id": "geometric-radial", "version": "0.1.0"},  "seed": "108",  "canvas": {"width": 1600, "height": 1600, "background": "transparent"},  "parameters": {    "symmetry": {"mode": "radial", "segments": 8},    "rings": 5,    "recursion": {"depth": 4, "scale": 0.72},    "density": 0.31,    "prana": 0.08,    "line": {"weight": 0.7},    "motifs": {"primary": "petal", "secondary": "triangle"}  },  "provenance": {"aiInterpreted": false, "parentRecipe": null},  "checksum": "..."}

## 18. Analytics and learning


| Event | Why |
| --- | --- |
| composition_generated | Understand creation frequency and seed/preset entry |
| parameter_changed | Which controls matter |
| intent_submitted | Adoption of AI interaction; prompt text should not be logged by default |
| interpretation_applied | Whether AI mapping is useful |
| export_opened | Intent to take work outside product |
| export_completed | Core value completion |
| export_preset_selected | External workflow demand |
| share_created | Reproducibility/social value |
| recipe_imported | Reuse/remix value |
| generation_slow_warning | Performance tuning |

Privacy principle: collect event metadata conservatively. Do not store natural-language prompts or exported artwork by default.

## 19. Performance and quality budgets

Keep ordinary MVP compositions comfortably interactive; establish path/node thresholds through profiling rather than guessing.
Parameter updates should debounce/throttle only when necessary and visually preserve direct manipulation.
Long-running generation must be cancellable.
Export must not mutate the live recipe.
Use deterministic geometry snapshots in CI for representative seeds.
Maintain a golden export set across Figma, Illustrator, Inkscape and browser embedding.
No console errors in normal creation/export flow.

## 20. 14-day build plan


| Day | Deliverable |
| --- | --- |
| 1 | Lock visual thesis, repo, typed recipe schema, seeded PRNG, first primitive tests. |
| 2 | SVG renderer: point/line/circle/polygon/group; transforms. |
| 3 | Radial repeat, rings, recursion; produce first 20 candidate outputs. |
| 4 | Curate visual rules; introduce controlled imperfection/Prana; remove ugly failure modes. |
| 5 | Build canvas shell + seed control + regenerate. |
| 6 | Inspector and live parameter editing; undo/redo. |
| 7 | Growth animation + replay/skip + reduced motion. |
| 8 | SVG serializer, sanitizer and Editable SVG export. |
| 9 | Cross-editor export QA; JSON recipe import/export; share URL. |
| 10 | Natural-language adapter + schema validation + interpretation preview. |
| 11 | Responsive states, accessibility pass, empty/error/AI-offline states. |
| 12 | Polish typography, transitions, onboarding and export preflight. |
| 13 | Open-source README, architecture/grammar docs, capture failed explorations and decisions. |
| 14 | Regression/export matrix, launch build, portfolio case-study capture, demo video. |


## 21. Portfolio evidence capture plan

Do not reconstruct the case study later. Capture evidence while building.
Initial hypothesis and why a procedural engine was chosen over image generation.
20 early outputs including failures; annotate what looked mechanical or incoherent.
Grammar map: primitive → rule → parameter → composition.
Three alternative interaction models and why the final inspector/intent model won.
AI boundary diagram: intent interpretation vs deterministic rendering.
Export problem: examples of dirty/uneditable SVG vs final clean export.
Cross-editor screenshots showing the same exported vector being edited.
Performance trade-offs and geometry simplification decisions.
Accessibility/reduced-motion decisions.
Final live demo + GitHub + Figma explorations + concise metrics/learning.

## 22. Release acceptance criteria

Given a seed and recipe, JANTRA produces the same composition on repeated runs of the same engine/grammar version.
A non-coder can create and materially alter a composition using the inspector.
Natural-language input can be converted to valid, editable parameters; failure does not block manual use.
Growth animation can be replayed or skipped and respects reduced-motion preference.
Editable SVG export opens successfully as vectors in Figma, Illustrator and Inkscape.
Exported SVG has no external network dependencies or scripts and preserves expected appearance.
Recipe JSON can reconstruct the composition after a fresh session.
Share URL reconstructs the intended composition or clearly reports version incompatibility.
Tool UI works at desktop width and provides a usable mobile viewing/basic-edit experience.
README explains engine architecture, deterministic seed model, grammar system, cultural classification and export guarantees.

## 23. Post-MVP roadmap


| Phase | Direction |
| --- | --- |
| V0.2 | Infinite pan/zoom experiments, larger scene tiling, plotter-ready export. |
| V0.3 | Sketch → grammar analysis; user draws a motif and JANTRA detects repetition/symmetry. |
| V0.4 | First researched tradition-inspired grammar with sources and collaborator review. |
| V0.5 | Fork/remix lineage and local/cloud collections if usage justifies accounts. |
| V1 | Multiple grammar packs, node editor for advanced users, richer provenance and educational mode. |
| Exploration | Physical pen plotting + hand finishing; exhibitions/prints only if artistic practice naturally develops. |


## 24. Final product test

JANTRA succeeds when a user can create something visually compelling, understand enough of the system to intentionally change it, export a clean vector that remains useful in another tool, and reproduce or remix the work later from its recipe.
The portfolio succeeds when the project demonstrates that Prabhakar can define an original 0→1 product, model a complex system, design AI interaction with appropriate boundaries, exercise visual judgment, prototype/build beyond Figma, and ship a useful artifact rather than a concept.
