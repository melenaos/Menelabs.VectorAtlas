# Menelabs.VectorAtlas

A free, lightweight SVG world map generated from [Natural Earth](https://www.naturalearthdata.com/)
public domain data. One `<path>` per country, `id`-keyed by lowercase
[ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code, ready to drop into
choropleths, "submissions by country" heatmaps, or any SVG-based map UI.

**[Live demo](https://melenaos.github.io/Menelabs.VectorAtlas/)** &middot; **[Examples](examples/)**

## Why

Most free world map SVGs are either huge (multi-megabyte), missing per-country path IDs, or
carry their own attribution/linkware requirements. This one is generated directly from Natural
Earth (public domain, no attribution required by the source itself) via a small, reproducible
pipeline, and released under a permissive open license.

## Getting the map

The generated output lives at `dist/world.svg`. Regenerate it yourself with:

```bash
npm install
npm run generate
```

## Data source and coverage

Built primarily from Natural Earth's `ne_110m_admin_0_countries` (1:110m scale), which keeps
the file small and the level of detail simple. A handful of small nations don't exist at all in
the 110m dataset (too small to render at that scale), so those are patched in from the more
detailed `ne_50m_admin_0_countries` dataset instead: Cabo Verde, Comoros, Dominica, Maldives,
Malta, Mauritius, Saint Lucia, São Tomé and Príncipe, Seychelles, Singapore, and Saint Vincent
and the Grenadines.

Disputed or unrecognized territories that Natural Earth doesn't assign a standard ISO A2 code
to (e.g. Somaliland, Northern Cyprus) get a synthesized `_name`-style id instead of being
dropped from the map.

## Examples

Live versions run on the [examples page](https://melenaos.github.io/Menelabs.VectorAtlas/examples.html).
Source for all three lives in [`examples/`](examples/): a basic embed, a data-driven
choropleth heatmap (hover tooltip, legend, color scale), and a clickable country selector.
Plain HTML, no build step or dependencies.

## License

Released under **[CC BY 4.0](LICENSE)**: free to use, including commercially, with attribution
to Menelabs / this repository.

A commercial license removing the attribution requirement is planned for a future release, but
is not available yet.
