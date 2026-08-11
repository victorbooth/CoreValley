# CoreValley

CoreValley is a browser-persisted household finance dashboard hosted with GitHub Pages.

## Project structure

- `index.html` contains the application shell and existing modal markup.
- `assets/styles.css` contains the shared visual system and responsive layout.
- `js/core.js` contains the data provider, original renderers, calculations, and shared controls.
- `js/features/` contains feature-focused modules loaded in dependency order.
- `js/bootstrap.js` performs the final page initialization.

The browser-storage key remains `corevalley-prototype-v1`, so modularization does not reset existing local demo data.

## Development

Serve the repository root with any static HTTP server. No build step is currently required. GitHub Pages continues to publish the repository directly.
Fin Dash
