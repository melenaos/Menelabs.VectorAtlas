# Examples

Open these directly in a browser, or serve the repo root with any static file
server (e.g. `npx http-server`) so the relative fetch to `../dist/world.svg`
resolves.

- **[basic-embed.html](basic-embed.html)**: the minimum needed to drop the
  map into a page and style a couple of countries by id.
- **[choropleth-heatmap.html](choropleth-heatmap.html)**: color every
  country by a numeric value (e.g. "submissions by country"), with a legend
  and hover tooltip. This is the pattern the map was originally built for.

Both examples load `dist/world.svg` with `fetch()` and inline it into the
page, so CSS can target individual `<path id="...">` elements directly.
Run `npm run generate` first if `dist/world.svg` doesn't exist yet.
