# Photography

This build ships with original illustrated "plates" in place of photographs (the build environment had no
access to image libraries). Every picture slot is ready for a real, properly licensed photo:

1. Save a JPG as `public/photos/<slot>.jpg` (slot names are listed in `src/data/photos.ts`, e.g. `hero.jpg`,
   `ch-japan.jpg`, `region-uji.jpg`, `stage-mill.jpg`). It replaces the illustration automatically.
2. Add its credit in `PHOTO_CREDITS` in `src/data/photos.ts`; the credit is shown on the image.

Good licensed sources: Wikimedia Commons (check each file's licence and attribution terms), Unsplash/Pexels
(per their licences), or photographs taken during the trip. Only use images you have the right to use.
