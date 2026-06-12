# Original Assets

This project ships with a small original cozy pixel asset pack generated from
`scripts/generate-original-assets.mjs`.

Run:

```bash
pnpm assets:original
```

The command writes committed SVG assets into `public/original-assets/` and
updates `public/original-assets/manifest.json`.

The in-app priority is:

1. `public/local-assets/` if you add a private local pack.
2. `public/original-assets/` as the committed default visual pack.

These assets are original in-repo graphics. They are intentionally not copied
from third-party game asset repositories.
