# BraceForge Project Notes

This file records the current state of the brace website, model generator, decisions made during iteration, and known issues. It should be used as the reference before changing the model again.

## Current Site Structure

- `index.html`: landing page for **BraceForge**.
- `case-study.html`: case study page for the project story, problem, iteration process, planned image slots, and lessons learned.
- `configurator.html`: the actual brace renderer/configurator.
- `printing.html`: printing guide and general slicer guidance.
- `styles.css`: shared styling for the landing page and configurator.
- `app.js`: Three.js scene, procedural model generation, print estimate, STL/3MF export, controls, and render loop.
- `assets/braceforge-logo.png`: user-provided BF logo used in page headers and the landing hero.
- `README.md`: public project overview with a resized logo image, workflow, pricing, export notes, and limitations.
- `PROJECT_NOTES.md`: this detailed implementation/history file.

Local server:

```powershell
python -m http.server 8000 --bind localhost
```

Pages:

```text
http://localhost:8000/
http://localhost:8000/case-study.html
http://localhost:8000/configurator.html
http://localhost:8000/printing.html
```

The current server was restarted successfully on May 16, 2026.

## Naming

Current product/site name: **BraceForge**.

Naming note:

- On May 16, 2026, the user requested the name be changed to **BraceForge**.

## Branding

Current branding:

- Primary color: deep green from the logo family.
- Secondary color: metallic gold from the logo family.
- The user-provided BF logo is used in the top-left header on public pages, in the configurator topbar, and as the single logo mark in the landing hero body.
- The README displays the logo with an HTML image tag at `width="180"` so it does not render at full size on GitHub.
- Shared logo asset:

```text
assets/braceforge-logo.png
```

## Footer / Disclaimer

All public pages include small fine print at the bottom:

```text
BraceForge is not medical advice and is not intended to provide real medical support, diagnosis, treatment, or professional care. Created by Aaron Okrainsky, 2026.
```

This footer appears on:

- `index.html`
- `case-study.html`
- `configurator.html`
- `printing.html`

## Landing Page

The landing page now loads Three.js through `app.js` so the hero preview uses the same procedural model as the configurator.

Landing page behavior:

- Top navigation has the BraceForge logo/name and filled-button links for `Printing Guide` and `Open configurator`.
- Top navigation also links to the project case study.
- Main hero no longer has duplicated middle buttons for `Open configurator` or `Printing Guide`; those actions live in the top navigation.
- Main hero uses the same procedural brace renderer as the configurator by loading `app.js` with fixed hidden homepage inputs.
- The separate `home-preview.js` mini renderer and 3MF homepage asset were removed so the homepage no longer uses a separate preview model.
- The homepage preview sets `data-home-preview="true"` so `app.js` skips the translucent hand and Three.js grid only on the landing page.
- The homepage preview also enables OrbitControls auto-rotate.
- The Three.js ground sheet and CSS panel/background are removed for the homepage preview only; the configurator grid and ground stay unchanged.
- The homepage camera is overridden in `setCamera()` when `isHomePreview` is true so the model is viewed from above instead of from below.
- The homepage preview uses the same `#braceViewport` element and hidden fixed inputs, including thumb defaults of width `60`, height `60`, and position `80`.
- The previous `PROJECT_NOTES.md` link was removed from the public landing page.
- The previous static thumbnail was:

```text
tmp_3mf_extract/expanded/Metadata/thumbnail.png
```

Important landing page fixes:

- A persistent top-right configurator button was added because the first version pushed the CTA below the visible fold.
- The nav/hero spacing was adjusted so the site name and hero content do not overlap while scrolling or on shorter screens.
- The landing nav is now static instead of sticky because the sticky version overlapped the hero text while scrolling.
- Both top-right landing nav links should use the same filled `nav-config-link` visual treatment.

## Case Study Page

The case study page is at `case-study.html`.

Current design:

- Uses the shared BraceForge public-page header, footer, logo, colors, and responsive nav.
- Adds a project-story page without changing the configurator model.
- Documents the problem: traditional custom orthotics can be slow and expensive because each fit change can require manual design iteration.
- Documents the process: seven SolidWorks versions, measurement-driven geometry, parametric transitions, slicer/material testing, and browser configurator development.
- Documents failures and learning: the original strapless plastic-spring concept, difficult fit, oversized thumb clearance, brittle top geometry, lack of ventilation, strap slicing behavior, and ventilation structure risks.
- Uses optimized local web images in `assets/case-study/web/` for the early perforated one-sided design, oversized-thumb design, split Velcro design, final reference design, SolidWorks parameter table, thumb-hole testing, and physical fit-test images.
- The problem section intentionally has no image slots; the visual story starts in the iteration section.
- The landing page includes a short case-study callout linking to this page.
- Public top navigation links to the case study from the landing page, printing page, and configurator.

## Printing Guide Page

The printing guide is at `printing.html`.

Current design:

- Uses the same constrained max-width rhythm as the landing page.
- Top navigation is a contained white bar with border and shadow so it does not visually overlay page content.
- Main content is wrapped in `info-content`.
- Hero content is inside a white panel with a compact quick-summary panel for:
  - Orientation
  - Layer Height
  - Material
- Instruction content is grouped into cards:
  - Export
  - Slicer Setup
  - Suggested Settings
  - Post-Print Check

Links:

- `Home` links to `index.html`.
- `Open Configurator` links to `configurator.html`.
- Configurator export note links to `printing.html`.

## Configurator UI

The configurator is at `configurator.html`.

Current controls:

- Forearm circumference
- Palm thickness
- Knuckle width
- Thumb opening width
- Thumb opening height
- Wrist thickness
- Wrist width
- Forearm length
- Palm length
- Thumb position
- Strap thickness
- Hand side: left/right
- Breathability: Off/Low/Medium/High hex ventilation holes

Removed controls:

- Wall `Thickness` input was removed from the controls.
- Thickness is locked at `3 mm` in `app.js`.
- Number input spinner arrows were visually removed so fields are typed values rather than click-to-step controls.

Current parameter ranges:

| Parameter | Range |
| --- | --- |
| Forearm circumference | 130-260 mm |
| Palm thickness | 18-50 mm |
| Knuckle width | 65-120 mm |
| Thumb opening width | 20-60 mm |
| Thumb opening height | 0-80 mm |
| Wrist thickness | 30-75 mm |
| Wrist width | 40-90 mm |
| Forearm length | 70-160 mm |
| Palm length | 55-110 mm |
| Thumb position | 20-100 mm |
| Strap thickness | 2-8 mm |
| Breathability | 0-3 levels |

Important: `Forearm circumference` controls the lower/forearm cuff. It is named this way because the width/thickness version made the model look abnormal and was reverted.

The configurator header includes a `Home` link back to `index.html`.

The configurator logo/brand block in the top-left is also a link back to `index.html`.

Configurator layout:

- Desktop uses a fixed-height grid row for the main content so expanding the left-side measurement groups does not stretch the middle renderer.
- The left control panel and right generated spec panel scroll independently when their content is taller than the viewport.
- Mobile still stacks the panels and renderer naturally.
- The rendered viewport status text includes: `Preview not exactly to scale.`
- Configuration includes a `Breathability` slider with labels `Off`, `Low`, `Medium`, and `High`.

Measurement controls are grouped into expandable sections:

- Forearm
- Wrist
- Hand
- Thumb
- Straps

The measurement groups are collapsed by default using `<details class="control-group">`.

Group styling:

- Squircle-style rounded borders.
- Closed state has a compact `+` indicator.
- Open state has a white background, border highlight, subtle shadow, and `-` indicator.
- `control-group-body` animates the open/closed transition.

The `Thumb` section contains:

- Thumb opening width
- Thumb opening height
- Thumb position

Current default thumb values:

- Thumb opening width: `60 mm`
- Thumb opening height: `60 mm`
- Thumb position: `80 mm`

## Generated Spec Panel

The right-side generated spec panel was simplified.

Removed because they repeat parameters already shown on the left:

- Shell length
- Forearm opening
- Metacarpal opening
- Thickness
- Strap count

Current generated outputs:

- Estimated Print Time
- Estimated Filament
- Filament Type dropdown
- Estimated Material Cost
- Spool Price Basis

Removed outputs:

- Model volume

The old top metric strip was removed. Print time now lives in the right-side generated spec panel with filament.

## Print Time, Filament, And Material Cost

The app shows rough display estimates, not a true slicer result.

Current display behavior:

- Print time is centered around `~3 hr 30 min`.
- Filament is centered around `~70 g`.
- Both vary slightly with generated mesh volume using a clamped scale.
- Values are prefixed with `~` to communicate that they are estimates.
- The generated spec panel now includes a `Filament Type` dropdown.
- Selecting a filament updates:
  - Estimated filament grams, adjusted by material density relative to the PLA/PETG baseline.
  - Estimated material cost.
  - Spool price basis.
- Filament changes update the estimate display without requiring a geometry rebuild.

Price source used:

- Nawa 3D Amazon US filament comparison pages and search snippets for current 1 kg Amazon listing prices.

Current filament price defaults, researched May 16, 2026 from current Amazon US 1 kg listings:

| Filament | Price basis |
| --- | ---: |
| PLA | $14.99/kg |
| PLA+ / Tough PLA | $15.99/kg |
| PETG | $15.99/kg |
| ABS | $15.99/kg |
| ASA | $20.99/kg |
| TPU 95A | $22.99/kg |
| Nylon / PA | $34.99/kg |
| Polycarbonate | $31.99/kg |
| PLA-CF | $34.99/kg |
| PA-CF / Nylon-CF | $39.99/kg |

Current estimator constants are still present in `app.js`:

- `layerHeight: 0.2`
- `lineWidth: 0.45`
- `printSpeed: 45`
- `travelOverhead: 1.35`
- `layerChangeSeconds: 2.2`
- `filamentDensity: 1.24`

This is not a full slicer. Orca/Bambu/Prusa slicers may report different times and filament use.

## Model Structure

The model is generated procedurally in `app.js`.

Core functions:

- `sectionAt(yMm, insetMm)`: cross-section shape along forearm/wrist/palm.
- `pointOnBrace(theta, yMm, insetMm)`: maps polar brace coordinates to 3D points.
- `buildBraceMesh(thetaMin, thetaMax)`: builds each brace panel.
- `thumbReliefProfile()`: thumb opening profile data.
- `isThumbReliefCutout(theta, yMm)`: thumb opening cutout.
- `strapSlotSpecs()`: Velcro slot definitions.
- `isStrapSlot(theta, yMm)`: Velcro slot test.
- `angleDistance(a, b)`: required for wrapped angle comparisons.

Current mesh resolution:

- Preview: `thetaSegments = 240`, `ySegments = 420`
- STL export: `thetaSegments = 320`, `ySegments = 560`

The preview resolution is kept lower for browser responsiveness. STL and 3MF export rebuild shell meshes at higher resolution so downloaded files are smoother than the live renderer without making the renderer too heavy.

## Fillets

Current fillet approach:

- No added tube/revolve geometry.
- No added Velcro-slot fillets.
- Fillets are made by moving shell vertices inward near exposed edges.
- Inner shell surface mirrors the same rounding.
- Radius is based on locked wall thickness:

```text
state.thick * 0.5
```

This was the approach the user liked. Do not go back to tube-based fillet geometry; it looked like raised hollow strips rather than true fillets.

## Thumb Opening

The thumb opening was the most sensitive part of the model.

Design intent:

- Match the reference 3MF style.
- Wide/deep enough for the thumb to slide through.
- No random thin strip along the thumb-side cutout.
- Smooth/filleted edge around the thumb opening.
- Do not let the thumb opening eat into the upper thumb-side Velcro slit.

Important implementation details:

- `thumbReliefProfile()` clamps the top of the thumb opening using:

```js
const topClearance = 8;
```

- `Thumb position` defines the bottom of the thumb opening. Changing `Thumb opening height` grows the cutout upward from that bottom point instead of moving the bottom edge.
- The thumb opening now gets priority over the upper thumb-side strap. Top clearance is intentionally small so higher thumb-height values visibly affect the cutout; the dynamic top thumb-side strap disappears when there is not enough room.
- The dynamic top thumb-side strap should not shrink too early. It currently keeps only `2 mm` clearance from the thumb opening and stays full height until the available space is less than a full regular top slot.
- `Thumb opening width` currently has a UI/model range of `20-60 mm`; wider ranges looked unreliable.
- `Thumb opening width` is converted to an angular span using the local brace radius around the thumb opening. It should behave like a measured width instead of the old narrow width/metacarpal ratio.
- The successful thin-strip fix was to skip side-wall faces only near `thumbReliefProfile().sideSplit`, not around the whole thumb cutout.
- Do not add a seam guard to `isThumbReliefCutout()` near `sideSplit`. That creates a visible vertical strip of plastic through the thumb opening.
- Current strip-removal rule in `buildBraceMesh()`: when adding theta-side caps for thumb cutout cells, skip only the cap edge whose angle is within `0.08` radians of `thumbReliefProfile().sideSplit`; still cap the other exposed side of the cell if it exists.
- The thumb opening roughness was improved by increasing mesh resolution and adding thumb-edge distance into the fillet inset calculation.
- `thumbReliefCurveTheta()` uses eased rounding near the lower thumb transition so the thumb corner is not sharp.
- `distanceToThumbReliefEdge()` uses a slightly larger thumb-edge fillet radius than the general edge radius to soften the thumb opening.
- `smoothedThumbBoundaryTheta()` nudges vertices near the thumb cutout boundary toward the smooth relief curve to reduce serrated/stair-stepped finish along the thumb opening.

Do not remove this thumb-strip fix.

## Velcro Slits

Design intent:

- Slits must be on both brace halves and both side edges where appropriate.
- Long continuous slits were avoided because they may print poorly.
- There should be separated cutouts:
  - top
  - middle
  - lower/bottom

Current layout:

- Non-palmar side:
  - top, middle, and bottom slits on both side edges.
- Palmar side:
  - middle and bottom slits on both side edges.
  - regular top slit on the non-thumb side.
  - dynamic smaller top slit on the thumb side when space permits.

Current slot angle groups:

- Palmar: `-0.72`, `0.72`
- Non-palmar: `-2.48`, `2.48`

Important fix:

- Use `angleDistance(a, b)` for slot angle comparisons.
- Direct `Math.abs(theta - slotTheta)` caused missing slots because wrapped angles did not match the second panel.

## Breathability / Hex Vent Holes

The configurator includes a breathability slider:

- `0`: Off
- `1`: Low
- `2`: Medium
- `3`: High

Implementation:

- The slider is `#ventilation` in `configurator.html`.
- The display label is `#ventilationValue`.
- `state.vents` is included in `geometryStateKey()` so changing ventilation rebuilds the mesh.
- `isVentHole(theta, yMm)` adds deterministic hexagonal cutouts in surface-coordinate space.
- Hex holes use staggered rows with spacing and radius based on level.
- Holes are intentionally disabled on the homepage preview by `isHomePreview`.

Vent exclusion zones:

- Top and bottom rims.
- Panel split edges.
- Expanded Velcro slot areas.
- Expanded thumb opening area.

Rationale:

- Controlled hex holes were chosen over true Voronoi because they are more predictable, easier to keep away from structural cutouts, and less likely to create thin webs or slicer issues.
- Do not replace this with full Voronoi unless the model is also given much stronger manufacturability validation.

## Slicer / Orca Issue

Current known issue:

- Orca Slicer has reported empty internals / hollow behavior around Velcro cutouts.
- The most recent change removed separate overlay slot-wall geometry and reconnected cutout caps into the main grid again.
- This should be more slicer-friendly, but it has not yet been confirmed by exporting a fresh STL and checking it in Orca.
- The slicer error `one object has empty initial layer and cant be printed. please cut the bottom or enable supports` means Orca/Bambu did not find printable extrusion on the first layer for at least one object.
- User confirmed the actual issue was the exported model sitting very slightly above the slicer build plate. Manually lowering it from about `90.0` to `89.9` fixed slicing.
- Current export fix: keep both brace halves in one STL, rotate the export upright for printing, then lower the whole exported group so its minimum `Z` intersects the bed by `0.1 mm`.
- Do not reintroduce the seam-guard thumb fix that left a visible strip of plastic in the thumb opening.

If Orca still reports empty internals:

- Inspect the STL near Velcro cutouts for non-manifold edges.
- Focus on the cap generation in `buildBraceMesh`.
- Velcro slot walls must be connected to the main mesh, not separate floating surfaces.
- Avoid removing slot caps entirely, because that creates open walls through the shell.
- Avoid adding separate tube/wall pieces unless they are welded into the main mesh.

This is the main current technical risk.

## Right And Left Hand Behavior

- Left/right hand mode mirrors the thumb opening.
- It must not simply swap labels.
- A previous bug made the top half of the non-palmar side disappear in right-hand mode.
- The current angle-aware cutout logic fixed that.
- Any future slot or thumb logic must be tested in both left and right hand modes.

## STL And 3MF Export

`exportStl()`:

- Rebuilds shell meshes at export resolution and scales them back from preview scene units to millimeters.
- Keeps both brace halves in one STL file.
- `orientExportGroupForPrinting()` rotates the export `Math.PI / 2` around X so the brace length axis becomes slicer vertical `Z`.
- `lowerExportGroupSlightlyIntoBed()` lowers the exported group so the lowest point is `0.1 mm` below the slicer bed.
- Exports an ASCII STL using Three.js `STLExporter`.

`export3mf()`:

- Uses the same export group as STL.
- Writes a minimal 3MF package with uncompressed ZIP entries:
  - `[Content_Types].xml`
  - `_rels/.rels`
  - `3D/3dmodel.model`
- Uses a small built-in ZIP writer:
  - `createZip(files)`
  - `crc32(data)`

Configurator export UI:

- `Export STL`
- `Export 3MF`
- Export note says the model is pre-oriented upright and suggests lowering by `.1 mm` if a slicer reports an empty initial layer.
- Export note links to `printing.html`.

Filename:

```text
brace-{hand}-thumb-{thumbWidth}mm.stl
brace-{hand}-thumb-{thumbWidth}mm.3mf
```

A translucent ghost hand preview was re-added by user request. It is built from simple measurement-driven preview meshes only, includes palm/wrist/forearm, thumb, and four fingers, and is not included in STL/3MF export.

The translucent ghost hand is shown in the configurator only. It is skipped for the homepage preview through the `isHomePreview` flag.

## README / GitHub

README status:

- Uses `<img src="assets/braceforge-logo.png" alt="BraceForge logo" width="180">`.
- Documents the current homepage preview behavior, configurator behavior, filament pricing defaults, export workflow, and limitations.
- The default-measurements section was removed from the README by user request.

Git status notes:

- `assets/braceforge-logo.png` was committed and pushed so the README image renders on GitHub.
- Commit `172d3ff` added the logo asset.
- Commit `6629c76` resized the README logo.
- Pushes go to `origin master`; GitHub reported the repository moved to `https://github.com/aaronokrainsky/BraceForge.git`.

## Performance

Performance was improved by:

- Debouncing input rebuilds.
- Skipping duplicate renders when values have not changed.
- Caching derived thumb/slot calculations.
- Precomputing cutout grids per panel during mesh generation.
- Removing number spinner buttons to reduce accidental rapid changes.
- Keeping preview resolution lower than export resolution.
- Separating desktop side-panel scrolling from the middle renderer so opening controls does not resize the canvas.

Current model is still heavy because of the high mesh resolution needed for the smooth thumb opening.

## Things To Avoid

- Do not change the model unless explicitly requested.
- Do not include the translucent ghost hand in STL/3MF export.
- Do not re-add tube/revolve fillets.
- Do not add fillets around Velcro slots.
- Do not remove the thumb-strip fix.
- Do not replace forearm circumference with forearm width/thickness again unless the shape logic is redesigned.
- Do not remove Velcro cutout caps without replacing them with slicer-valid solid wall geometry.
- Do not let ventilation holes overlap thumb cutouts, strap slots, split edges, or top/bottom rims.
- Do not put the project notes link back on the public landing page unless requested.
- Do not make the printing guide page edge-to-edge; keep it constrained like the landing page.
- Do not make landing/printing nav sticky unless it has an opaque background and cannot overlap content.
- Do not reintroduce a separate homepage preview model unless explicitly requested; the homepage currently uses the same procedural renderer as the configurator.
- Do not remove the medical disclaimer / attribution footer unless explicitly requested.

## Current Stable State

User-approved model state:

- Forearm circumference restored.
- Thickness locked at 3 mm.
- Main and inside edge fillets look good.
- Velcro floating strips were improved/removed visually.
- Thumb cutout is much smoother after mesh resolution increase.
- Landing page and configurator split works.
- Configurator has a home link.
- Configurator top-left logo/brand also links home.
- Homepage preview uses the configurator procedural model, auto-rotates, hides the hand/grid/ground, and has no white backing panel.
- Configurator panels no longer stretch the renderer when measurement groups expand.
- Fine-print medical disclaimer and Aaron Okrainsky 2026 attribution appear on all pages.
- Printing guide page exists and is linked from the landing page and configurator export note.
- Export supports STL and 3MF.

Current unresolved risk:

- Orca Slicer may still see empty internals around Velcro cutouts until a fresh STL is exported and verified.
