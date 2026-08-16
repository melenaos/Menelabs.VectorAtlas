// Generates dist/world.svg from Natural Earth's 110m admin-0 countries GeoJSON.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { geoPath, geoEquirectangular } from "d3-geo";
import { topology } from "topojson-server";
import { presimplify, simplify } from "topojson-simplify";
import { feature } from "topojson-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const WIDTH = 2000;
const HEIGHT = 1001;

const SOURCE = path.join(root, "data", "ne_110m_admin_0_countries.geojson");
const SOURCE_50M = path.join(root, "data", "ne_50m_admin_0_countries.geojson");
const OUT_DIR = path.join(root, "dist");
const OUT_FILE = path.join(OUT_DIR, "world.svg");

// These are absent entirely from the 110m dataset (too small to render at
// 1:110m scale) but present in BootForm's current map, so we splice their
// geometry in from the 50m dataset to keep this a true drop-in replacement.
const PATCH_CODES = new Set([
  "CV", "DM", "KM", "LC", "MT", "MU", "MV", "SC", "SG", "ST", "VC",
]);

const rawAll = JSON.parse(readFileSync(SOURCE, "utf8"));
const raw50m = JSON.parse(readFileSync(SOURCE_50M, "utf8"));

// Antarctica (AQ) is dropped entirely, not just simplified: no submitter IP ever
// resolves there (this map exists to render country_breakdown choropleths), and
// including it distorts the whole projection under an equirectangular fitSize -
// Antarctica's landmass stretches into a wide band across the bottom of the map,
// and BootForm's original map never included it for the same reason (its own
// viewBox was cropped to exclude the far south).
const raw = {
  ...rawAll,
  features: rawAll.features.filter((f) => f.properties.ISO_A2 !== "AQ"),
};

const patchFeatures = raw50m.features.filter((f) => {
  const code = f.properties.ISO_A2_EH || f.properties.ISO_A2;
  return PATCH_CODES.has(code);
});
if (patchFeatures.length !== PATCH_CODES.size) {
  throw new Error(
    `Expected ${PATCH_CODES.size} patch features from 50m data, found ${patchFeatures.length}`
  );
}

// Simplify via TopoJSON so shared borders stay coincident (no gaps/slivers
// between neighboring countries after simplification). The 110m base and the
// 50m patch features are simplified separately, at different tolerances,
// since a shared tolerance tuned for the base map would erase micro-states.
// 0.3 keeps output size comparable to the ~73KB file this replaces in BootForm
// (0.02 produced a 167KB file with no visible quality gain at this map's size).
const topo = topology({ countries: raw });
const simplified = simplify(presimplify(topo), 0.3);
const simplifiedGeo = feature(simplified, simplified.objects.countries);

const patchTopo = topology({ countries: { type: "FeatureCollection", features: patchFeatures } });
const patchSimplified = simplify(presimplify(patchTopo), 0.0001);
const patchGeo = feature(patchSimplified, patchSimplified.objects.countries);

simplifiedGeo.features.push(...patchGeo.features);

// Track ids already assigned, to guarantee uniqueness and catch collisions
// between real ISO codes and synthesized ones.
const usedIds = new Set();

function slugify(name) {
  return (
    "_" +
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "")
  );
}

function idFor(properties) {
  const candidates = [properties.ISO_A2, properties.ISO_A2_EH];
  for (const code of candidates) {
    if (code && code !== "-99" && code.length === 2) {
      return code.toLowerCase();
    }
  }
  return slugify(properties.NAME || properties.ADMIN || "unknown");
}

const projection = geoEquirectangular().fitSize([WIDTH, HEIGHT], simplifiedGeo);
const pathGenerator = geoPath(projection);

const pathElements = [];
for (const f of simplifiedGeo.features) {
  let id = idFor(f.properties);
  if (usedIds.has(id)) {
    throw new Error(`Duplicate id "${id}" for feature "${f.properties.NAME}"`);
  }
  usedIds.add(id);

  const d = pathGenerator(f);
  if (!d) {
    console.warn(`Skipping feature with empty path: ${f.properties.NAME}`);
    continue;
  }

  pathElements.push(`  <path id="${id}" d="${d}"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" id="world-map">
${pathElements.join("\n")}
</svg>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, svg, "utf8");

console.log(`Wrote ${pathElements.length} country paths to ${path.relative(root, OUT_FILE)}`);
