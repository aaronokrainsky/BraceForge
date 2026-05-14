# Brace Website And Model Notes

This file records the current design intent for the brace website and procedural model. It is meant to help future work preserve the details that were worked out through screenshots, 3MF comparisons, and model fixes.

## Project Files

- `index.html`: static website markup, controls, measurement labels, range indicators, info bubbles, spec panel, and STL export button.
- `styles.css`: website layout and styling.
- `app.js`: Three.js scene, procedural brace mesh, parameter handling, thumb cutout, Velcro slit cutouts, camera controls, print estimate display, and STL export.
- Reference 3MF file used during design: `C:\Users\aaron\OneDrive - Rutgers University\3D Printing\3MF\Brace v7 - 2 parts v7.3MF`.
- Extracted 3MF thumbnail folder: `tmp_3mf_extract`.

The site runs locally from the project folder with:

```powershell
python -m http.server 8000 --bind localhost
```

Then open:

```text
http://localhost:8000
```

## Website Behavior

- The page is a direct modeling tool, not a landing page.
- The translucent hand model was removed from the viewport and should stay removed unless explicitly requested.
- The old view reset `R` control was removed.
- The UI uses human-readable parameter names:
  - Forearm circumference
  - Palm thickness
  - Knuckle width
  - Thumb opening width
  - Thumb opening height
  - Wrist thickness
  - Wrist width
  - Forearm length
  - Palm length
  - Thickness
  - Thumb position
  - Strap thickness
- The controls show clear numeric ranges in the UI.
- Info bubbles describe how to measure each parameter and what it changes in the model.
- Info bubbles should open to the right and can overlay the render area if needed, because opening left caused them to go off-screen.
- The spec section no longer shows "Medium fit" or "shell area".
- The print time is currently a simple estimate from area and thickness, not a true slicer. A real slicer integration was discussed but not fully implemented.
- STL export exists through Three.js `STLExporter`. The export should include only the brace shell meshes.

## Parameter Ranges

Current clamped ranges in `app.js` and shown in `index.html`:

| Parameter | Range |
| --- | --- |
| Forearm circumference | 130-260 mm |
| Palm thickness | 18-50 mm |
| Knuckle width | 65-120 mm |
| Thumb opening width | 20-100 mm |
| Thumb opening height | 35-100 mm |
| Wrist thickness | 30-75 mm |
| Wrist width | 40-90 mm |
| Forearm length | 70-160 mm |
| Palm length | 55-110 mm |
| Thickness | 1.5-6 mm |
| Thumb position | 20-65 mm |
| Strap thickness | 2-8 mm |

Important: `Forearm circumference` controls the bottom/forearm opening. It used to be called wrist circumference, but the user clarified it is the lower forearm area.

## Model Structure

- The model is generated procedurally in `app.js` with Three.js.
- The brace is split into two shell panels:
  - One panel roughly covers the palmar side.
  - One panel roughly covers the non-palmar side.
- Geometry is built in `buildBraceMesh(thetaMin, thetaMax)`.
- The brace uses an outer surface and inner surface based on the wall thickness.
- `SCALE = 0.05`; model parameters are in millimeters but scene geometry is scaled.
- `sectionAt(yMm, insetMm)` defines the changing cross-section from forearm, through wrist, to palm.
- `pointOnBrace(theta, yMm, insetMm)` maps angle and length position to a point on the brace.
- Left/right hand mode should mirror the thumb opening without deleting the upper half of the non-palmar side.

## Thumb Opening

The thumb opening was the most sensitive part of the model.

Design intent:

- The thumb opening should match the reference 3MF style.
- The thumb cutout should be wide and deep enough for the thumb to slide through.
- The thumb cutout should not leave a thin random strip along the cutout edge.
- The bottom of the thumb opening should be rounded/filleted visually by the generated curve.
- The thumb opening must not climb so high that it cuts off the upper thumb-side Velcro slit.

Current implementation:

- `thumbReliefProfile()` computes:
  - hand side
  - side split angle
  - top and bottom Y of the thumb opening
  - palmar start angle
- `isThumbReliefCutout(theta, yMm)` defines the actual thumb cutout.
- The top of the thumb opening is clamped with a clearance:
  - `topClearance = Math.max(24, state.velcroThickness * 2 + 16)`
  - this prevents the thumb opening from eating into the upper strap slit.

Important fix to preserve:

- A random thin strip near the thumb cutout kept appearing.
- The successful fix was to suppress side-wall faces only along the thumb-side split edge of the thumb relief cutout, while keeping the rest of the cutout capped.
- In `buildBraceMesh`, side-wall caps are skipped only when:
  - the current cutout is the thumb relief cutout, and
  - the edge is close to `thumbReliefProfile().sideSplit`.
- Do not go back to skipping all thumb relief side walls, because that makes other parts look hollow.

## Velcro Slits

The brace needs multiple Velcro slit cutouts. They are structural slots, not decorative marks.

Design intent:

- Slits must exist on both brace halves.
- Slits must exist on both side edges where appropriate.
- Long single slits are avoided because they may print poorly.
- Instead, there should be three separated cutouts where possible:
  - smaller top slit
  - middle slit
  - lower/bottom slit
- Non-palmar side:
  - top, middle, and bottom slits on both side edges
  - symmetrical on both edges
- Palmar side:
  - middle and bottom slits on both side edges
  - top regular slit on the non-thumb side
  - top thumb-side slit must fit between the brace top and thumb cutout
  - top thumb-side slit dynamically shortens or disappears if there is not enough space

Current implementation:

- `isStrapSlot(theta, yMm)` defines all Velcro slots.
- Palmar slit angles:
  - `-0.72`
  - `0.72`
- Non-palmar slit angles:
  - `-2.48`
  - `2.48`
- Middle and lower slit Y positions:
  - `-state.foreWristLength * 0.38`
  - `-state.foreWristLength * 0.78`
- Top regular slit position:
  - `state.wristMetaLength - 18`
- Top thumb-side slit:
  - based on the current thumb cutout top
  - keeps `thumbTopClearance = 5`
  - only appears if there is at least 14 mm of available space

Important fix to preserve:

- Missing slits on one side were caused by angle wraparound. For example, `-2.48` radians and its equivalent positive wrapped angle need to match the same physical side of the brace.
- `angleDistance(a, b)` handles wraparound and must be used for slot-angle comparisons.

## Hollow Areas And Cutout Caps

The brace should not look hollow around slot or thumb cutout boundaries.

Current implementation:

- The main mesh has outer and inner faces.
- Top and bottom brace openings are capped.
- Split seams are capped unless the seam is inside a cutout or thumb split clearance.
- Cutout side boundaries are capped.
- Cutout top and bottom boundaries are capped.

Important details:

- Strap slots need caps on all four sides through the wall.
- Thumb cutout boundaries also need caps, except for the specific side-wall suppression used to remove the random strip near the thumb split.
- If future edits create a dark open-looking cavity around a cutout, check the cap generation in `buildBraceMesh`.

## Right And Left Hand Behavior

- Left/right hand mode must mirror the thumb opening.
- It should not simply swap labels or break one side of the model.
- A previous bug caused the top half of the non-palmar side to disappear in right-hand mode. The fix was to keep cutout and seam logic symmetric and angle-aware.
- Slit detection must use wrapped angular distance so both hand modes keep matching slits.

## Export

- The export button uses `exportStl()` in `app.js`.
- It clones shell meshes from `modelGroup`, scales them back from scene units to millimeters, and exports an STL.
- The exported filename is currently:

```text
brace-{hand}-thumb-{thumbWidth}mm.stl
```

The STL export should not include the removed translucent hand model.

## Print Time

- The website shows an estimated print time.
- A true slicer integration was requested, but the current app does not include a real slicer.
- Earlier attempts to make the print estimate more complex caused rendering issues, so the stable simple estimator was kept.
- If this is revisited, use a small, isolated estimator that cannot break startup rendering.

## Things To Be Careful With

- Do not re-add the translucent hand unless specifically asked.
- Do not remove the thumb-strip fix.
- Do not remove caps around cutouts; that makes the brace look hollow.
- Do not use direct `Math.abs(theta - slotTheta)` for slit positions; use `angleDistance`.
- Do not let the thumb opening consume the top thumb-side Velcro slit.
- Do not make the palmar thumb-side top slit a full regular slot; it must adapt to the available space above the thumb opening.
- Do not treat `Forearm circumference` as the wrist opening. It controls the bottom/forearm cuff.
- Keep range labels and info bubbles visible and separated from inputs.

## Current Known Limitations

- The print time is an estimate, not a true slicer result.
- The model is procedural and approximates the 3MF reference rather than importing/editing the 3MF directly.
- There is no automated visual regression test for the brace yet.
- Node is not available in the current environment, so JavaScript syntax checks through `node --check` could not be run.

