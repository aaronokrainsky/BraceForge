# CuffForm Studio Project Notes

This file records the current state of the brace website, model generator, decisions made during iteration, and known issues. It should be used as the reference before changing the model again.

## Current Site Structure

- `index.html`: landing page for **CuffForm Studio**.
- `configurator.html`: the actual brace renderer/configurator.
- `printing.html`: printing instructions and general slicer guidance.
- `styles.css`: shared styling for the landing page and configurator.
- `app.js`: Three.js scene, procedural model generation, print estimate, STL/3MF export, controls, and render loop.
- `README.md`: short project overview.
- `PROJECT_NOTES.md`: this detailed implementation/history file.

Local server:

```powershell
python -m http.server 8000 --bind localhost
```

Pages:

```text
http://localhost:8000/
http://localhost:8000/configurator.html
http://localhost:8000/printing.html
```

The current server was restarted successfully on May 16, 2026.

## Naming

Current product/site name: **CuffForm Studio**.

Names checked during the process:

- `BraceFit` was already in use.
- `BraceForge` was already in use.
- `FormBrace` had existing search/trademark context.
- `CuffForm Studio` did not show a direct exact-match product/site result in a quick search and fits the forearm cuff/brace configurator.

## Landing Page

The landing page is intentionally lightweight and does not load Three.js. This keeps the first page faster and avoids building the model until the user opens the configurator.

Landing page behavior:

- Top navigation has filled-button links for `Printing Instructions` and `Open configurator`.
- Main hero also has an `Open configurator` link.
- Main hero also links to `Printing instructions`.
- The previous `PROJECT_NOTES.md` link was removed from the public landing page.
- Hero uses the extracted 3MF thumbnail:

```text
tmp_3mf_extract/expanded/Metadata/thumbnail.png
```

Important landing page fixes:

- A persistent top-right configurator button was added because the first version pushed the CTA below the visible fold.
- The nav/hero spacing was adjusted so the site name and hero content do not overlap while scrolling or on shorter screens.
- The landing nav is now static instead of sticky because the sticky version overlapped the hero text while scrolling.
- Both top-right landing nav links should use the same filled `nav-config-link` visual treatment.

## Printing Instructions Page

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
| Thumb opening height | 35-100 mm |
| Wrist thickness | 30-75 mm |
| Wrist width | 40-90 mm |
| Forearm length | 70-160 mm |
| Palm length | 55-110 mm |
| Thumb position | 20-100 mm |
| Strap thickness | 2-8 mm |

Important: `Forearm circumference` controls the lower/forearm cuff. It is named this way because the width/thickness version made the model look abnormal and was reverted.

The configurator header includes a `Home` link back to `index.html`.

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

Removed outputs:

- Model volume

The old top metric strip was removed. Print time now lives in the right-side generated spec panel with filament.

## Print Time And Filament

The app shows rough display estimates, not a true slicer result.

Current display behavior:

- Print time is centered around `~3 hr 30 min`.
- Filament is centered around `~70 g`.
- Both vary slightly with generated mesh volume using a clamped scale.
- Values are prefixed with `~` to communicate that they are estimates.

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
- The thumb opening now gets priority over the upper thumb-side strap. Top clearance is intentionally small so height values up to `100 mm` visibly affect the cutout; the dynamic top thumb-side strap disappears when there is not enough room.
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

## Performance

Performance was improved by:

- Debouncing input rebuilds.
- Skipping duplicate renders when values have not changed.
- Caching derived thumb/slot calculations.
- Precomputing cutout grids per panel during mesh generation.
- Removing number spinner buttons to reduce accidental rapid changes.
- Keeping preview resolution lower than export resolution.

Current model is still heavy because of the high mesh resolution needed for the smooth thumb opening.

## Things To Avoid

- Do not change the model unless explicitly requested.
- Do not include the translucent ghost hand in STL/3MF export.
- Do not re-add tube/revolve fillets.
- Do not add fillets around Velcro slots.
- Do not remove the thumb-strip fix.
- Do not replace forearm circumference with forearm width/thickness again unless the shape logic is redesigned.
- Do not remove Velcro cutout caps without replacing them with slicer-valid solid wall geometry.
- Do not put the project notes link back on the public landing page unless requested.
- Do not make the printing instructions page edge-to-edge; keep it constrained like the landing page.
- Do not make landing/printing nav sticky unless it has an opaque background and cannot overlap content.

## Current Stable State

User-approved model state:

- Forearm circumference restored.
- Thickness locked at 3 mm.
- Main and inside edge fillets look good.
- Velcro floating strips were improved/removed visually.
- Thumb cutout is much smoother after mesh resolution increase.
- Landing page and configurator split works.
- Configurator has a home link.
- Printing instructions page exists and is linked from the landing page and configurator export note.
- Export supports STL and 3MF.

Current unresolved risk:

- Orca Slicer may still see empty internals around Velcro cutouts until a fresh STL is exported and verified.
