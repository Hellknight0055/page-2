# Aaditi Birthday — Cinematic Website v4

This version fixes the freeze that occurred immediately after opening the site.

## What was wrong

The previous leaf-animation edit accidentally removed the `drawSky()` function.
The animation loop then stopped on its first frame because it tried to call a
function that no longer existed.

`drawSky()` has been restored and the JavaScript has been syntax-validated.

## Current animation

- Black opening screen
- Random stars appear after the pause
- Moon travels from top-right to top-left
- Fixed sun appears at top-right
- Sun fades as the trees appear
- Camera moves down toward the landscape
- Trees transition into autumn
- Leaves first fall from the tree canopy
- Leaves settle
- Wind then picks the fallen leaves up and moves them around
- Single leaf transition
- Childhood photo and typewriter text
- "After 18 years"
- Current photo, positioned higher/smaller
- Final letter-style birthday message

## Replace photos

Use:

`assets/childhood.jpg`

`assets/current.jpg`

Keep the filenames unchanged.
