# Examples

Live, running copies of these are on the [examples page](https://melenaos.github.io/Menelabs.VectorAtlas/examples.html).
To run them yourself: open these directly in a browser, or serve the repo root
with any static file server (e.g. `npx http-server`) so the relative fetch to
`../dist/world.svg` resolves.

- **[basic-embed.html](basic-embed.html)**: the minimum needed to drop the
  map into a page and style a couple of countries by id.
- **[choropleth-heatmap.html](choropleth-heatmap.html)**: color every
  country by a numeric value (e.g. "submissions by country"), with a legend
  and hover tooltip. This is the pattern the map was originally built for.
- **[country-select.html](country-select.html)**: click a country to toggle
  its selection, e.g. for a "ship to these countries" control.

All three load `dist/world.svg` with `fetch()` and inline it into the page,
so CSS/JS can target individual `<path id="...">` elements directly. Run
`npm run generate` first if `dist/world.svg` doesn't exist yet.
