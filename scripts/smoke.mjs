#!/usr/bin/env node
/**
 * Smoke test: verifies dist/ output after `npm run build`.
 * Run with: node scripts/smoke.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

let failures = 0;

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}${detail ? ": " + detail : ""}`);
    failures++;
  }
}

function readDist(rel) {
  const p = join(DIST, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

function findInDist(ext) {
  if (!existsSync(DIST)) return [];
  const results = [];
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (extname(full) === ext) {
        results.push(full);
      }
    }
  }
  walk(DIST);
  return results;
}

console.log("\n🔍 ViewForge Lab — smoke tests\n");

// 1. dist/ exists
console.log("── dist/ existence ──");
check("dist/ directory exists", existsSync(DIST));

// 2. index.html exists and has expected content
console.log("\n── index.html ──");
const indexHtml = readDist("index.html");
check("index.html exists", indexHtml !== null);
if (indexHtml) {
  check("has <title>ViewForge Lab</title>", indexHtml.includes("ViewForge Lab"));
  check("references manifest.webmanifest", indexHtml.includes("manifest.webmanifest"));
  check("has app mount point #app", indexHtml.includes('id="app"'));
  check("has cmd-palette mount", indexHtml.includes('id="cmd-palette"'));
  check("has module script tag", indexHtml.includes('type="module"'));
}

// 3. manifest.webmanifest
console.log("\n── manifest.webmanifest ──");
const manifest = readDist("manifest.webmanifest");
check("manifest.webmanifest exists", manifest !== null);
if (manifest) {
  let parsed;
  try {
    parsed = JSON.parse(manifest);
  } catch {
    check("manifest is valid JSON", false, "parse error");
  }
  if (parsed) {
    check("has name field", typeof parsed.name === "string" && parsed.name.length > 0);
    check("has start_url", typeof parsed.start_url === "string");
    check("display is standalone", parsed.display === "standalone");
    check("has icons array", Array.isArray(parsed.icons) && parsed.icons.length > 0);
  }
}

// 4. sw.js
console.log("\n── sw.js ──");
const sw = readDist("sw.js");
check("sw.js exists", sw !== null);
if (sw) {
  check("has install event listener", sw.includes("install"));
  check("has fetch event listener", sw.includes("fetch"));
  check("has caches.open call", sw.includes("caches.open"));
}

// 5. JS bundles
console.log("\n── JS bundles ──");
const jsFiles = findInDist(".js").filter((f) => !f.endsWith("sw.js"));
check("at least one JS bundle in dist/", jsFiles.length > 0);

// check bundle content for key strings
if (jsFiles.length > 0) {
  const bundleContent = jsFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  check(
    "bundle contains 'Orbit Notes'",
    bundleContent.includes("Orbit Notes")
  );
  check(
    "bundle contains 'Pixel Pantry'",
    bundleContent.includes("Pixel Pantry")
  );
  check(
    "bundle contains 'Garden Grid'",
    bundleContent.includes("Garden Grid")
  );
  check(
    "bundle contains 'ViewForge'",
    bundleContent.includes("ViewForge")
  );
  check(
    "no private/sensitive references in bundle",
    !bundleContent.includes("Qanun") &&
      !bundleContent.includes("Qanoon") &&
      !bundleContent.includes("PLS") &&
      !bundleContent.includes("pakistan-law")
  );
}

// 6. CSS
console.log("\n── CSS ──");
const cssFiles = findInDist(".css");
check("at least one CSS file in dist/", cssFiles.length > 0);

if (cssFiles.length > 0) {
  const cssContent = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  check("CSS contains custom properties (--)", cssContent.includes("--"));
  check("CSS contains color-mix", cssContent.includes("color-mix"));
}

// 7. Source maps
console.log("\n── Source maps ──");
const mapFiles = findInDist(".map");
check("source maps generated", mapFiles.length > 0);

// ── Summary ──────────────────────────────────────────────
console.log("\n" + "─".repeat(44));
if (failures === 0) {
  console.log(`✅  All smoke checks passed!\n`);
  process.exit(0);
} else {
  console.error(`❌  ${failures} smoke check(s) failed.\n`);
  process.exit(1);
}
