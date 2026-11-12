# ZeroLeak AI Cinematic Landing Page — Technical Reference Specification

## 1. Executive Summary
This document specifies the reverse-engineered visual mechanics, interaction behaviors, scroll architecture, and 3D rendering pipeline for the cinematic, scroll-driven landing page of **ZEROLEAK AI** (an on-premises, DPDP-ready enterprise LLM privacy gateway).

---

## 2. Technical Findings & Visual Pipeline

### 2.1 Visual Rendering Technique (Real-Time WebGL vs. Video)
- **Architecture**: Real-time WebGL rendered via Three.js (React Three Fiber in our codebase).
- **Network Inspection**: Network analysis confirms that scenes are not streaming MP4/WebM video files. The canvas is drawn in real time via WebGL contexts with:
  - Procedural runtime textures (canvas-based emissive mosaic textures).
  - Custom vertex and fragment shaders for water plane ripple and light streams.
  - Instanced rendering (`InstancedMesh`) for fields of glowing cubes/nodes.
  - Post-processing pipeline utilizing Bloom and Fog.
- **Framerate & Performance**: Native 60fps desktop rendering, capped at DPR 1.5 with frustum culling and geometry disposal to prevent memory leaks.

---

## 3. Scroll Engine & Chapter Navigation

### 3.1 Pinned Full-Viewport Stage
- The viewport is locked to `100vh` (`position: fixed` or pinned via GSAP ScrollTrigger).
- A virtual scroll track spanning **6 chapters** (representing ~600vh total scroll distance) drives all timeline animations.
- Each chapter corresponds to an exact normalized station $t \in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]$.

### 3.2 Smooth Scrolling & Snapping
- **Inertia Dampening**: Powered by **Lenis** (`duration: 1.2`, `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`).
- **Snapping Mechanism**: GSAP ScrollTrigger `snap` config with snap targets at `1 / (totalChapters - 1)` intervals:
  - Snap duration: 0.5s to 0.8s.
  - Easing: `power3.inOut`.
- **Keyboard Navigation**:
  - `ArrowDown`, `PageDown`, `Space`: Smoothly scroll to the next chapter.
  - `ArrowUp`, `PageUp`: Smoothly scroll to the previous chapter.
- **Direct Chapter Jump**:
  - Clicking any item in the vertical left chapter index triggers an animated scroll to that chapter's exact station.

---

## 4. UI Shell & HUD Structure

### 4.1 Color Palette & Inset HUD Frame
- **Background**: Rich dark navy gradient (`#050a1c` at top-left to `#0a1f3d` at bottom-right).
- **HUD Frame**: 1px inset border positioned 16px from the viewport boundaries (`rgba(255, 255, 255, 0.08)`).
- **Chamfered Corner**: Top-right corner of the HUD frame features an architectural cut corner (chamfer) behind the `MENU` button.
- **Accent Tones**:
  - Electric Glow Cyan: `#37d3fc`
  - Lavender Menu Pill: `#d5ddfd` (with dark text `#050a1c`)
  - Off-white HUD Text: `#d5e0ff`

### 4.2 Typography Hierarchy (via @fontsource)
- **Headlines**: `Inter Tight 700`, uppercase, 2 lines, tight letter-spacing (`~0.02em`), line-height `1.1`.
- **UI Labels & Chapter Index**: `Chakra Petch 500` with uppercase tracking `~0.12em` to `0.16em`.
- **Body & Paragraphs**: `Inter` 400/500, grey-blue tone (`#94a3b8` / `#cbd5e1`), maximum 3 lines with `text-wrap: balance`.

### 4.3 Headline Scramble & Text Entrance Transition
- **Scramble Effect**: On chapter entrance, letters resolve progressively over ~1.2s from a cycling random alphanumeric glyph pool (`A-Z0-9!#$&%`) into the final headline text.
- **Follow-up Fade**: Once the headline letters stabilize, the paragraph and outlined chamfered CTA button fade in with a slight upward translation (`y: 15px` $\to$ `0px`, duration `0.6s`, `power2.out`).

### 4.4 Loader Sequence
- **Initial State**: Full-viewport dark shutter with `0%` to `100%` tabular numeric counter.
- **Telemetry Label**: Starts with "Loading scene", transitions to "Ready to explore" upon reaching 100%.
- **Exit Shutter**: Dual vertical curtains slide open (`yPercent: -100` and `yPercent: 100`) over 0.75s, revealing the 3D scene and HUD.

---

## 5. 3D Scene Composition Across 6 Chapters

A single, persistent R3F Canvas hosts all procedural elements, smoothly moving camera position and target between 6 predefined spatial coordinates:

1. **Chapter 01 (GATEWAY)**:
   - Central luminescent glass cube floating at $(0, 0.6, 0)$.
   - Runtime-generated canvas emissive mosaic texture.
   - Ripple water ground plane at $y = -2.2$.
   - Mountain silhouettes with cyan rim lighting.
   - Pointer parallax tilting.
   - Four thin orbiting glowing "SAMPLE ONLY" ID card outlines (fictional Aadhaar, PAN, GSTIN, Passport).
2. **Chapter 02 (DETECT)**:
   - Glowing ribbon tube along a 3D CatmullRom spline flowing through dark rock formations.
   - Card wireframes glide along the ribbon path.
3. **Chapter 03 (MASK)**:
   - Low-altitude camera sweep through an instanced field of 300 flickering glowing mini-cubes situated on rolling dark hills.
4. **Chapter 04 (FORWARD)**:
   - High-velocity curving light streams launching forward from the camera towards the deep horizon.
5. **Chapter 05 (REINSERT)**:
   - Curving light streams looping back from the horizon, converging into the central monolithic cube.
6. **Chapter 06 (PROOF)**:
   - Network graph of glowing nodes joined by thin dynamic lines over blue dunes.
   - HUD overlays 4 real telemetry tiles populated via `GET /api/metrics`.

---

## 6. Mobile & Accessibility Constraints
- **Reduced Motion**: Respects `prefers-reduced-motion` and user-controlled `MOTION: ON/OFF` toggle:
  - Disables continuous camera oscillation and particle drift.
  - Instant chapter transitions without motion sickness.
- **Mobile Viewport (< 768px)**:
  - Disables complex terrain mesh to maintain 40+ fps on mobile GPUs.
  - Collapses top bar navigation into compact hamburger/menu trigger with $\ge 44\text{px}$ touch targets.
  - Real DOM text contrast meets WCAG AA standards.
