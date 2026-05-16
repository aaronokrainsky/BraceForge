# BraceForge

<img src="assets/braceforge-logo.png" alt="BraceForge logo" width="180">

BraceForge is a browser-based configurator for generating a custom 3D-printable wrist and hand brace. It uses Three.js to build a procedural two-part brace from forearm, wrist, palm, thumb, and strap measurements, previews the generated model in the browser, estimates print/material usage, and exports STL or 3MF files for slicing.

The current design is based on an existing 3MF brace reference and has been tuned around the thumb opening, brace split, edge fillets, and Velcro strap cutouts.

## Run Locally

Start a local static server from this folder:

```powershell
python -m http.server 8000 --bind localhost
```

Then open:

```text
http://localhost:8000/
```

Useful pages:

- `http://localhost:8000/`: landing page
- `http://localhost:8000/configurator.html`: brace configurator
- `http://localhost:8000/printing.html`: printing and slicer guidance

## Main Files

- `index.html`: landing page with BraceForge branding, top navigation, workflow cards, fixed hidden preview inputs, and an orbitable preview using the configurator model.
- `configurator.html`: measurement controls, hand-side selector, viewport, generated specs, filament type/cost estimator, not-to-scale preview note, and export buttons.
- `printing.html`: slicer setup, orientation, suggested settings, and post-print checks.
- `styles.css`: shared visual system, responsive layout, logo sizing, green primary color, gold secondary color, landing preview styling, and configurator layout.
- `app.js`: Three.js scene, brace geometry generation, ghost-hand preview, thumb opening, Velcro cutouts, homepage preview mode, print/material estimate, and STL/3MF export.
- `assets/braceforge-logo.png`: cropped high-resolution BraceForge logo.
- `PROJECT_NOTES.md`: detailed implementation notes and decisions from model iteration.

## Current UI

The landing page uses the final BraceForge branding with a deep green primary color and gold secondary accent. The top navigation links to the printing guide and configurator. The middle homepage CTA buttons were removed.

The homepage preview loads `app.js` with fixed hidden inputs, so it uses the same procedural model generator as the configurator. On the homepage only, the preview:

- Auto-rotates when the page opens.
- Uses a camera looking down at the brace.
- Hides the translucent hand.
- Hides the Three.js grid and ground sheet.
- Removes the white panel/card behind the model.

The configurator keeps the full viewport behavior with orbit controls, camera buttons, grid, ground plane, and translucent hand preview. The left controls and right spec panel scroll independently on desktop so expanding measurement groups does not stretch the rendered model. The viewport status includes: `Preview not exactly to scale.`

## User Workflow

1. Open the configurator.
2. Enter wearer measurements in the collapsed sections:
   - Forearm
   - Wrist
   - Hand
   - Thumb
   - Straps
3. Choose left-hand or right-hand mode.
4. Inspect the 3D preview using orbit, zoom, and camera buttons.
5. Choose a filament type to estimate material cost.
6. Export STL or 3MF.
7. Open the export in slicer software and inspect the first layer, cutouts, thumb opening, and overall fit before printing.

## Filament Cost Estimate

The configurator estimates print time, filament weight, material cost, and spool price basis. These values are display estimates only, not slicer output.

Current price defaults are based on representative Amazon 1 kg filament listings checked on May 16, 2026:

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

Prices fluctuate frequently on Amazon, so these are defaults for quick estimates rather than purchasing guidance.

## Modeling Notes

The brace is generated as two shell panels with outer and inner surfaces in one model. The model changes shape along its length from forearm, to wrist, to palm.

The thumb opening grows upward from the selected thumb position, and the left/right setting mirrors the thumb opening rather than only changing labels. Velcro slots are split into shorter cutouts to make the model more practical to print.

The homepage uses the same procedural model as the configurator. A previously tested 3MF homepage preview and separate mini renderer were removed so there is only one model-generation path for previews.

## Export Workflow

Use `Export STL` or `Export 3MF` from the configurator. Exports are rebuilt at a higher mesh resolution than the browser preview, scaled back to millimeters, oriented upright for printing, and lowered slightly into the virtual build plate to avoid slicer first-layer issues.

After export, open the model in Orca, Bambu Studio, PrusaSlicer, or another slicer and check:

- Both brace halves are present.
- The model touches the build plate.
- The thumb opening and strap slots slice cleanly.
- Supports and material settings are appropriate for the selected filament.

## Current Limitations

- The browser preview is not exactly to scale.
- Print time, filament weight, and material cost are rough estimates.
- The browser preview is not a replacement for slicer inspection.
- The generated model should be fit-tested before real use.
- There is no automated visual regression testing yet.
