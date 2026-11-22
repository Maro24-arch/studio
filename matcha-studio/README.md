# Matcha Exploration Studio (working title)

A private, exploratory website: Discover Matcha · Explore Japan · The Matcha Lab · Inspiration Library ·
From Idea to Product · My Workspace.

React + TypeScript + Tailwind + Framer Motion. No backend: everything she writes is saved in the browser's
localStorage (device-specific, not a cloud backup) with JSON export/import in My Workspace.

```
npm install
npm run dev      # develop
npm run build    # production build in dist/ (static; any static host works — hash routing, relative paths)
```

See `PHOTOS.md` for adding photographs. Map outline: Natural Earth (public domain) via `scripts/build-map.mjs`.
Content notes: listed Japanese businesses are labelled "Established · confirm details" or "Research lead"; none
carry contact details, prices or availability. Regulatory topics are pointers to verify, not legal advice.
