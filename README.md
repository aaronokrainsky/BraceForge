# Custom Hand Brace Generator

This project is a browser-based tool for designing a custom 3D-printable hand brace. It uses Three.js to generate a procedural two-part brace model from hand and forearm measurements, previews the model in the browser, and can export the generated brace as an STL file.

The current design is based on an existing 3MF brace reference and was tuned around the thumb opening, brace split, and Velcro strap cutouts.

## Run Locally

From this folder, start a local static server:

```powershell
python -m http.server 8000 --bind localhost
```

Then open:

```text
http://localhost:8000
```

## Main Files

- `index.html`: page layout, measurement inputs, info bubbles, render viewport, specs, and export button.
- `styles.css`: visual styling and responsive layout.
- `app.js`: Three.js scene, brace geometry generation, thumb opening, Velcro slits, measurements, camera controls, and STL export.
- `PROJECT_NOTES.md`: detailed implementation notes and design decisions from the model iteration process.

## Features

- Interactive 3D brace preview.
- Left-hand and right-hand brace modes.
- Adjustable measurements for forearm, wrist, palm, thumb opening, wall thickness, and strap thickness.
- Human-readable measurement labels with hover info bubbles.
- Visible min/max ranges for each input.
- Procedural thumb cutout that adapts to the selected hand side.
- Velcro strap slits on the palmar and non-palmar brace sections.
- Solid cutout walls around slits and thumb opening.
- STL export for the generated brace shell.

## Measurements

The model currently supports these measurement inputs:

- Forearm circumference
- Palm thickness
- Knuckle width
- Thumb opening width
- Thumb opening height
- Wrist thickness
- Wrist width
- Forearm length
- Palm length
- Wall thickness
- Thumb position
- Strap thickness

The forearm circumference controls the lower cuff opening of the brace.

## Modeling Notes

The brace is generated as two shell panels with an outer and inner surface. The model changes shape along its length from forearm, to wrist, to palm.

The thumb opening is intentionally constrained so it does not cut into the upper thumb-side Velcro slit. The Velcro slits are split into shorter cutouts to be more practical for 3D printing.

The current geometry is procedural. It approximates the reference 3MF design rather than directly editing or importing the 3MF as source geometry.

## Export

Use the `Export STL` button to download the generated brace shell. The exported STL is scaled back to millimeters from the Three.js preview scale.

## Current Limitations

- Print time is a rough estimate, not a real slicer result.
- There is no automated visual regression testing yet.
- The model is generated in JavaScript and depends on the current procedural rules in `app.js`.
- The STL export should be checked in slicer software before printing.

