/**
 * schema.org.ai, the build.
 *
 *   data/       Schema.org's release, as published (CC BY-SA 3.0), pinned to one version
 *   ../extensions.jsonld   the .org.ai superset, the Foundation's own types and properties
 *   src/        written by hand: the design (base.css from the Foundation's other sites, schema.css, the
 *               chrome and page scripts), the mark, the footer, icons and the font
 *   .og-cache/  the share cards, rendered by scripts/og.mjs (run first by `npm run build`)
 *   public/     generated here, and what wrangler serves. Do not edit it.
 *
 * Every term gets a page at /<Name>, with its JSON-LD at /<Name>.json and Markdown at /<Name>.md. They are
 * written under t/, p/ and v/ (types, properties, values), because Schema.org has names that differ only in
 * case (Brand and brand) and a case-insensitive disk would keep only one of each pair. worker.js maps the
 * addresses to the files with gen/names.json.
 */

import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadVocab } from "./lib/vocab.mjs";
import { parse, toHtml, toMarkdown, toPlain, firstSentence, escHtml as esc } from "./lib/describe.mjs";
import { termCard, SITE_CARDS, dirOf } from "./lib/cards.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "public");
const GEN = join(ROOT, "gen");
const SITE = "https://schema.org.ai";
const RELEASE = { version: "30.1", date: "16 September 2026", file: "schemaorg-30.1.jsonld" };
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const sha = (s) => createHash("sha1").update(s).digest("hex");

const v = loadVocab(join(ROOT, "data", RELEASE.file), join(ROOT, "..", "extensions.jsonld"));
const pages = [...v.pages.values()];
// the site's own single-part addresses; a term with one of these names would be hidden by them (/search.json is the search index)
const RESERVED = new Set(["types", "properties", "search", "index", "404"]);
for (const t of pages) if (RESERVED.has(t.name)) throw new Error("build: a term is named like one of the site's own addresses: " + t.name);

/* ── words ─────────────────────────────────────────────────────────────────── */

const fmt = (n) => n.toLocaleString("en-US");
const plural = (n, one, many) => fmt(n) + " " + (n === 1 ? one : many);
const and = (a, w = "and") => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " " + w + " " + a[a.length - 1]);
// a long CamelCase name may break between its words
const camel = (s) => esc(s).replace(/([a-z0-9])([A-Z])/g, "$1<wbr>$2");
const href = (t) => "/" + t.name + (t.senseOf ? "#org-ai" : "");
// the article a name takes, by its sound: an Event, an actor, a URL, a UnitPriceSpecification, a Usage
const an = (w) => (/^(?:[aeioAEIO]|[uU](?![A-Z]|ni|s[aeu]|ti|ri|r[lL]))/.test(w) && !/^(?:eu|one)/i.test(w) ? "an" : "a");
const An = (w) => (an(w) === "an" ? "An" : "A");
const withA = (t) => an(t.name) + " " + camel(t.name);
const link = (t) => '<a href="' + href(t) + '">' + camel(t.name) + "</a>";
const f2 = (x) => +x.toFixed(2);

const ctx = {
  ref: (name) => (v.pages.has(name) ? { href: "/" + name } : null),
  url: (h) => {
    h = h.trim();
    let m;
    if ((m = /^https?:\/\/schema\.org\/([A-Za-z0-9_]+)\/?$/.exec(h)) && v.pages.has(m[1])) return "/" + m[1];
    if (/^[A-Za-z0-9_]+$/.test(h)) return v.pages.has(h) ? "/" + h : "https://schema.org/" + h;
    if (h.startsWith("/")) return "https://schema.org" + h; // Schema.org's own pages, written relative to it
    if (/^https?:\/\//i.test(h)) return h;
    return null; // no other kind of address is followed
  },
  abs: (h) => (h.startsWith("/") ? SITE + h : h),
};
const D = new Map();
function desc(t) {
  if (!D.has(t)) {
    const blocks = parse(t.comment), plain = toPlain(blocks);
    D.set(t, { html: toHtml(blocks, ctx), plain, first: firstSentence(plain), md: toMarkdown(blocks, ctx), md1: toMarkdown(blocks, ctx, true) });
  }
  return D.get(t);
}
const tags = (t) => (t.ns === "orgai" ? '<span class="tag ai">.org.ai</span>' : "") + (t.pending ? '<span class="tag">Pending</span>' : "") + (t.supersededBy.length ? '<span class="tag">Superseded</span>' : "");
const kindWord = (t) => (t.kind === "type" ? (t.dataType || t.trail?.[0]?.name === "DataType" ? "data type" : "type") : t.kind === "property" ? "property" : "value");
const propCount = (t) => (t.groups || []).reduce((n, g) => n + g.props.length, 0);

/* ── what every page shares ────────────────────────────────────────────────── */

const LOGO = read("src/logo.svg.html").trim();
const FOOTER = read("src/footer.html").trim();
const CSS = read("src/base.css") + "\n" + read("src/schema.css") + "\n" + read("src/hero.css");
const JS = '(() => {\n  "use strict";\n' + read("src/chrome.js") + "\n" + read("src/schema.js") + "})();\n";
const ASSET = { css: "s/site." + sha(CSS).slice(0, 10) + ".css", js: "s/site." + sha(JS).slice(0, 10) + ".js" };

/* the home page's figure (src/hero.js draws it): every type with its first parent, its count and first sentence, and
   which types each property and value belongs to, which is what a search result lights. Only the home page loads it. */
function heroData() {
  const types = v.all.filter((t) => t.kind === "type");
  const ti = new Map(types.map((t, i) => [t, i]));
  // a superset type with no parent of its own is drawn beside the Schema.org type it shares a name with
  const lp = (t) => t.parents[0] || (t.senseOf && !t.parents.length ? t.senseOf : null);
  const depth = (t) => { let d = 0; for (let x = lp(t); x; x = lp(x)) d++; return d; };
  return {
    rows: 1 + Math.max(...types.map(depth)),
    json: JSON.stringify({
      t: types.map((t) => [t.name, t.parents.length ? ti.get(t.parents[0]) : -1, !t.parents.length && t.senseOf ? ti.get(t.senseOf) : -1, t.ns === "orgai" ? 1 : 0, t.descendants, desc(t).first, t.senseOf ? 1 : 0]),
      p: v.all.filter((t) => t.kind === "property").map((x) => [x.name, x.ns === "orgai" ? 1 : 0, x.domain.map((d) => ti.get(d))]),
      v: v.all.filter((t) => t.kind === "value").map((x) => [x.name, x.memberOf.map((m) => ti.get(m))]),
    }),
  };
}
const HERO_DATA = heroData();
const HERO_JS = '(() => {\n  "use strict";\n' + read("src/hero.js") + "})();\n";
const HERO = { data: "s/hero." + sha(HERO_DATA.json).slice(0, 10) + ".json", js: "s/hero." + sha(HERO_JS).slice(0, 10) + ".js" };

const CARDS_DIR = join(ROOT, ".og-cache", "cards");
if (!existsSync(join(CARDS_DIR, "index.json"))) throw new Error("build: no share cards; run node scripts/og.mjs first");
const cards = JSON.parse(readFileSync(join(CARDS_DIR, "index.json"), "utf8"));
const card = (name) => {
  const c = cards[name];
  if (!c) throw new Error("build: no share card " + name + "; run node scripts/og.mjs");
  return { url: SITE + "/og/" + name + ".png?v=" + c.v, alt: c.alt };
};

const NAV = [["/types", "Types", "types"], ["/properties", "Properties", "properties"], ["/#superset", "The superset", "superset"]];
function header(current) {
  const a = ([h, label, key]) => '<a href="' + h + '"' + (key === current ? ' aria-current="page"' : "") + ">" + label + "</a>";
  return '<header class="site-head"><span class="lockup-h"><a class="wordmark" href="https://foundation.org.ai/" aria-label="Org.AI Foundation, home">' + LOGO +
    '<span>Org<span class="dot">.</span>AI Foundation</span></a><span class="lsep" aria-hidden="true">/</span><a class="sub" href="/"' + (current === "home" ? ' aria-current="page"' : "") + ">Schema</a></span>" +
    '<nav class="site-nav" aria-label="Main">' + NAV.map(a).join("") + "</nav>" +
    '<button class="find-btn" type="button" data-find aria-haspopup="dialog" aria-label="Search"><svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.6 12.6l4 4"/></svg><kbd aria-hidden="true">⌘K</kbd></button>' +
    '<a class="btn btn-primary" href="https://foundation.org.ai/#partner">Partner</a>' +
    '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><span class="burger" aria-hidden="true"><i></i><i></i><i></i></span></button></header>' +
    '<nav class="mnav" id="mnav" aria-label="Main" hidden><div class="mnav-panel">' + NAV.map(a).join("") + "</div></nav>";
}

function page({ path, title, description, image, current = "", body, alternates = null, jsonld = null, scripts = "" }) {
  const c = card(image);
  const url = path == null ? null : SITE + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${url ? `<link rel="canonical" href="${url}">\n` : '<meta name="robots" content="noindex">\n'}<meta property="og:type" content="website">
<meta property="og:site_name" content="Org.AI Foundation">
${url ? `<meta property="og:url" content="${url}">\n` : ""}<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${c.url}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image:alt" content="${esc(c.alt)}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/publicsans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/${ASSET.css}">
<script src="/find.js" data-site="schema" defer></script>
${alternates ? `<link rel="alternate" type="application/ld+json" href="${alternates}.json">\n<link rel="alternate" type="text/markdown" href="${alternates}.md">\n` : ""}${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>\n` : ""}<script>document.documentElement.classList.add("js"); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.classList.add("motion");</script>
</head>
<body>
<a class="skip" href="#main">Skip to the page</a>
${header(current)}
<main id="main" tabindex="-1">
${body}
</main>
${FOOTER}
<script src="/${ASSET.js}" defer></script>
${scripts}</body>
</html>
`;
}

/* the search box: a combobox over every term, filled from /search.json */
// quiet: the label is for screen readers only, and a magnifier stands in for it (the home page's toolbar)
// short: a placeholder for where the full one would be cut off (schema.js measures)
function lookup(id, label, placeholder, { quiet = false, short = "" } = {}) {
  return `<div class="lookup${quiet ? " quiet" : ""}" data-lookup>
  <label for="${id}" id="${id}-label"${quiet ? ' class="sr"' : ""}>${label}</label>
  <div class="field-wrap">${quiet ? '\n    <svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.6 12.6l4 4"/></svg>' : ""}
    <input id="${id}" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="${esc(placeholder)}"${short ? ` data-short="${esc(short)}"` : ""}>
    <button class="clear" type="button" aria-label="Clear the search" hidden><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8"/></svg></button>
    <div class="listbox" id="${id}-list" role="listbox" aria-labelledby="${id}-label"></div>
  </div>
  <p class="sr" aria-live="polite" data-status></p>
</div>`;
}

/* where a term comes from, and the licence it carries */
function provenance(t) {
  const layers = [];
  const L = (k, v, cls = "") => layers.push(`<li class="layer lit${cls}"><span class="k">${k}</span><div class="v">${v}</div></li>`);
  if (t.ns === "schema") {
    L("Published by", `<b>Schema.org</b><span class="sub"><a class="textlink" href="${t.iri}">schema.org/${camel(t.name)}</a></span>`);
    L("Release", `<b>Version ${RELEASE.version}</b><span class="sub">${RELEASE.date}</span>`);
    if (t.pending) L("Status", `<b>Pending</b><span class="sub">Proposed for Schema.org, and open to change while it gathers use and feedback</span>`);
    if (t.sources.length) L("Proposed in", t.sources.slice(0, 4).map((u) => `<a class="textlink" href="${esc(u)}">${esc(sourceLabel(u))}</a>`).join('<span class="sub"></span>'));
    L("License", `<b>CC BY-SA 3.0</b><span class="sub">Free to copy and adapt, with credit, under the same licence</span>`);
    L("Changed by us", "<b>Nothing.</b>", " end cur");
  } else {
    L("Published by", `<b>The Org.AI Foundation</b><span class="sub">The .org.ai superset of Schema.org</span>`);
    L("Defined in", `<a class="textlink" href="https://github.com/dot-org-ai/schema.org.ai/blob/main/extensions.jsonld">extensions.jsonld</a>`);
    L("License", `<b>CC BY-SA 4.0</b><span class="sub">Free to copy and adapt, with credit, under the same licence</span>`);
    L("Written by", "<b>Us.</b>", " end cur");
  }
  return `<section class="band reg" aria-labelledby="prov-h"><div class="side"><h2 id="prov-h">Where this comes from</h2>` +
    (t.ns === "schema" ? `<p class="lead">Copied word for word from Schema.org, and credited. Nothing in this definition is written by us.</p>`
      : `<p class="lead">Written by the Org.AI Foundation, for the .org.ai superset of Schema.org.</p>`) +
    `</div><div class="trace compact"><ol class="layers">${layers.join("")}</ol></div></section>`;
}
function sourceLabel(u) {
  let m;
  if ((m = /^https?:\/\/github\.com\/schemaorg\/schemaorg\/issues\/(\d+)/.exec(u))) return "Schema.org issue " + m[1];
  if ((m = /^https?:\/\/github\.com\/schemaorg\/schemaorg\/pull\/(\d+)/.exec(u))) return "Schema.org pull request " + m[1];
  return u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function closing(t) {
  const base = "/" + t.name;
  return `<div class="closing reg"><section aria-labelledby="use-h"><h2 id="use-h">Use this ${kindWord(t)}</h2><p>${t.ns === "schema" ? "Its definition is free to reuse, with credit to Schema.org." : "Its definition is free to reuse, with credit to the Org.AI Foundation."} The same ${kindWord(t)} is here as data, for programs and for language models.</p>` +
    `<p class="links"><a class="live" href="${base}.json">JSON-LD</a><a class="live" href="${base}.md">Markdown</a><a class="live" href="https://github.com/dot-org-ai/schema.org.ai">GitHub</a></p></section>` +
    `<section aria-labelledby="pt-h"><h2 id="pt-h">Partner with us</h2><p>Fund the next pass, contribute data, or build on the record. Tell us what you have in mind.</p>` +
    `<a class="btn btn-primary" href="https://foundation.org.ai/#partner">Partner with us <span class="arr" aria-hidden="true">&rarr;</span></a></section></div>`;
}

/* a list of terms, each with the first sentence of what it means */
function termList(list, { id = "", more = 0, k = null } = {}) {
  return `<ul class="terms"${id ? ` id="${id}"` : ""}${more ? ` data-more="${more}"` : ""}>` + list.map((x) =>
    `<li><a href="${href(x)}"><span class="n nm">${camel(x.name)}${tags(x)}${k ? `<span class="k">${camel(k(x))}</span>` : ""}</span><span class="d">${esc(desc(x).first)}</span></a></li>`).join("") + "</ul>" +
    (more && list.length > more ? `<button class="btn btn-ghost sib-more" type="button" aria-expanded="false" aria-controls="${id}" hidden>More</button>` : "");
}
/* a compact list: name, and a short note */
function nameList(list, { id = "", more = 0, k = () => "" } = {}) {
  return `<ul class="sib-list"${id ? ` id="${id}"` : ""}${more ? ` data-more="${more}"` : ""}>` + list.map((x) =>
    `<li><a href="${href(x)}"><span class="nm">${camel(x.name)}</span><span class="k">${camel(k(x))}</span></a></li>`).join("") + "</ul>" +
    (more && list.length > more ? `<button class="btn btn-ghost sib-more" type="button" aria-expanded="false" aria-controls="${id}" hidden>More</button>` : "");
}

function crumbs(items) {
  return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + items.map(([h, label], i) => `<li${i === 0 ? ' class="home"' : ""}><a href="${h}">${camel(label)}</a></li>`).join("") + "</ol></nav>";
}

/* ── the type, opened: one mark per property, in the order of its tables ──── */

function ringSvg(marks, { lit = -1 } = {}) {
  // marks: [{ cls, gap }]: gap leaves one empty place before a mark, between one group and the next
  const slots = marks.length + marks.filter((m) => m.gap).length;
  const R = 37, step = (2 * Math.PI * R) / Math.max(slots, 1), TILT = 24;
  const ry = Math.max(0.42, Math.min(3.4, step * 0.27)), rx = ry * (6.8 / 3.9);
  let s = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="guide" cx="50" cy="50" r="${R}"/>` +
    '<circle class="core-halo" cx="50" cy="50" r="12.5"/><circle class="core-mark" cx="50" cy="50" r="7.4"/>';
  let slot = 0;
  marks.forEach((m, i) => {
    if (m.gap) slot++;
    const deg = -90 + (slot / slots) * 360, a = (deg * Math.PI) / 180, x = 50 + Math.cos(a) * R, y = 50 + Math.sin(a) * R;
    const w = m.cls ? Math.min(0.45, ry * 0.3) : 0;
    s += `<g class="tkw" style="--d:${Math.round(380 + i * Math.min(42, 900 / marks.length))}ms"><ellipse class="tk${m.cls ? " " + m.cls : ""}${i === lit ? " hl" : ""}" data-i="${i}" cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx - w)}" ry="${f2(ry - w)}" transform="rotate(${f2(deg + TILT)} ${f2(x)} ${f2(y)})"/></g>`;
    slot++;
  });
  return s + "</svg>";
}

/* ── one type ──────────────────────────────────────────────────────────────── */

function propRows(props, idPrefix) {
  return props.map((p) => {
    const d = desc(p);
    const vals = p.range.length ? and(p.range.map(link), "or") : '<span class="sub">Not stated</span>';
    const sup = p.supersededBy.length ? `<p>Superseded by ${and(p.supersededBy.map(link))}.</p>` : "";
    return `<tr id="${idPrefix}${esc(p.name)}" tabindex="-1"><th scope="row"><a class="nm" href="${href(p)}">${camel(p.name)}</a>${tags(p)}</th>` +
      `<td class="v"><span class="mlbl">Value: </span>${vals}</td><td class="d prose">${sup}${d.html}</td></tr>`;
  }).join("");
}
function propTable(caption, props, idPrefix, id) {
  return `<table class="props"${id ? ` id="${id}"` : ""}><caption>${caption}<span class="num">${fmt(props.length)}</span></caption>` +
    `<thead><tr><th scope="col">Property</th><th scope="col">Value</th><th scope="col">What it means</th></tr></thead><tbody>${propRows(props, idPrefix)}</tbody></table>`;
}
const groupId = (g, own) => (own ? "own" : "from-" + g.from.name);

function senseBand(t) {
  const s = t.sense;
  if (!s) return "";
  const rel = s.shadows === t
    ? `A different thing with the same name. In data written with the .org.ai superset, ${camel(t.name)} means this; Schema.org's ${camel(t.name)}${t.kind === "type" ? ", above," : ""} is named by its full address, ${esc(t.iri)}.`
    : s.parents.includes(t)
      ? `The superset's own ${camel(t.name)}: a narrower kind of the Schema.org ${camel(t.name)} on this page, with every property it has.`
      : `The superset has its own ${kindWord(s)} with this name.`;
  const facts = [];
  if (s.kind === "type") {
    if (s.parents.length) facts.push(["Kind of", and(s.parents.map(link))]);
    if (s.shadows) facts.push(["Shadows", `Schema.org's ${camel(s.shadows.name)}<span class="sub">A different thing that shares the name</span>`]);
    if (s.ownProps.length) facts.push(["Properties", plural(s.ownProps.length, "of its own", "of its own")]);
  } else {
    if (s.domain.length) facts.push(["Used on", and(s.domain.map(link))]);
    if (s.range.length) facts.push(["Value", and(s.range.map(link), "or")]);
  }
  facts.push(["Source", "The .org.ai superset"]);
  return `<section class="band reg sense" id="org-ai" aria-labelledby="sense-h"><div class="side"><h2 id="sense-h">${camel(t.name)} in the <span class="ai">.org.ai</span> superset</h2><p class="lead">${rel}</p></div>` +
    `<div class="sense-body"><div class="desc prose">${desc(s).html}</div>` +
    `<dl class="facts">${facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join("")}</dl>` +
    (s.kind === "type" && s.ownProps.length ? propTable("Its own", s.ownProps, "ai-p-", "") : "") + "</div></section>";
}

function typePage(t) {
  const d = desc(t);
  const n = propCount(t), own = t.groups.find((g) => g.depth === 0 && g.from === t);
  const ownN = own ? own.props.length : 0, inh = n - ownN;
  const inheritedFrom = t.groups.filter((g) => g.from !== t);
  const facts = [];
  if (t.parents.length) facts.push(["Kind of", and(t.parents.map(link))]);
  facts.push(["Properties", n ? (ownN ? plural(ownN, "of its own", "of its own") : "None of its own") + (inh ? `<span class="sub">${fmt(inh)} more from ${inheritedFrom.length === 1 ? camel(inheritedFrom[0].from.name) : plural(inheritedFrom.length, "type", "types") + " above it"}</span>` : "")
    : "None<span class=\"sub\">" + (kindWord(t) === "data type" ? "A data type is a value in itself" : "It has no properties of its own, and none to inherit") + "</span>"]);
  if (t.members.length) facts.push(["Values", `<a href="#values">${plural(t.members.length, "value", "values")}</a>`]);
  if (t.children.length) facts.push(["Subtypes", (t.children.length <= 3 ? and(t.children.map(link)) : `<a href="#subtypes">${plural(t.children.length, "type", "types")}</a>`) +
    (t.descendants > t.children.length ? `<span class="sub">${fmt(t.descendants)} counting theirs</span>` : "")]);
  if (t.supersededBy.length) facts.push(["Superseded by", and(t.supersededBy.map(link))]);
  facts.push(["Source", t.ns === "schema" ? `Schema.org ${RELEASE.version}${t.pending ? '<span class="tag">Pending</span>' : ""}` : "The .org.ai superset"]);

  // the ring: its own properties filled, inherited ones outlined, in table order
  const marks = [];
  t.groups.forEach((g, gi) => g.props.forEach((p, i) => marks.push({ cls: g.from === t ? "" : "in", gap: gi > 0 && i === 0 })));
  // "Its own 68 are filled; the 14 it inherits, from Thing, are outlined."
  const fromNames = and(inheritedFrom.map((g) => camel(g.from.name)));
  const ringCap = `One mark for each of its ${plural(n, "property", "properties")}. ` +
    (ownN && inh ? `Its own ${fmt(ownN)} are filled; the ${fmt(inh)} it inherits, from ${fromNames}, are outlined. `
      : ownN ? `All ${fmt(ownN)} are its own. ` : `All are inherited, from ${fromNames}. `);
  const figure = n
    ? `<figure class="opened" data-ring="props" role="img" aria-label="${esc(t.name)}, opened: ${plural(n, "property", "properties")}, one mark each.">${ringSvg(marks)}<div class="tip" aria-hidden="true"></div>` +
      `<figcaption aria-hidden="true">${ringCap}<span data-point="Point at one to read it." data-tap="Tap one to find it in the list.">Point at one to read it.</span></figcaption></figure>`
    : "";

  const trail = t.trail.slice(0, -1);
  let h = crumbs([["/", "Schema"], ["/types", "Types"], ...trail.map((x) => [href(x), x.name])]);
  h += `<header class="job-head reg${figure ? "" : " solo"}"><div><h1${t.name.length > 26 ? ' class="long"' : ""}>${camel(t.name)}</h1>` +
    (d.html ? `<div class="desc prose">${d.html}</div>` : "") +
    `<dl class="facts">${facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join("")}</dl>` +
    `<p class="actions">${n ? `<a class="btn btn-ghost" href="#properties">Read the ${plural(n, "property", "properties")} <span class="arr" aria-hidden="true">&darr;</span></a>` : ""}<a class="textlink" href="/${esc(t.name)}.json">JSON-LD</a><a class="textlink" href="/${esc(t.name)}.md">Markdown</a></p></div>` +
    figure + "</header>";

  h += senseBand(t);

  if (n) {
    h += `<section class="band reg" id="properties" aria-labelledby="props-h"><div class="side"><h2 id="props-h">Properties</h2>` +
      `<p class="lead">${ownN ? (inh ? `${plural(ownN, "of its own", "of its own")}, and ${fmt(inh)} it inherits` : `All ${fmt(ownN)} are its own`) : `All ${fmt(n)} are inherited`}. Each says what kind of value it takes.</p>` +
      (t.groups.length > 1 ? `<nav class="groups-nav" aria-label="Property groups">${t.groups.map((g) => `<a href="#${esc(groupId(g, g.from === t))}">${g.from === t ? "Its own" : "From " + camel(g.from.name)} <span class="num">${fmt(g.props.length)}</span></a>`).join("")}</nav>` : "") +
      `</div><div class="props-wrap">` +
      t.groups.map((g) => propTable(g.from === t ? "Its own" : `From ${link(g.from)}`, g.props, "p-", groupId(g, g.from === t))).join("") +
      `</div></section>`;
  }
  if (t.members.length) {
    h += `<section class="band reg" id="values" aria-labelledby="values-h"><div class="side"><h2 id="values-h">Values</h2><p class="lead">${t.members.length === 1 ? `${camel(t.name)} has one value.` : `${camel(t.name)} takes one of these ${fmt(t.members.length)} values.`}</p></div>` +
      `<div>${termList(t.members, { id: "value-list", more: 24 })}</div></section>`;
  }
  if (t.children.length) {
    h += `<section class="band reg" id="subtypes" aria-labelledby="sub-h"><div class="side"><h2 id="sub-h">Subtypes</h2><p class="lead">${t.children.length === 1 ? `${camel(t.children[0].name)} is a more specific kind of ${camel(t.name)}.` : `${fmt(t.children.length)} more specific kinds of ${camel(t.name)}` + (t.descendants > t.children.length ? `, ${fmt(t.descendants)} counting their own subtypes.` : ".")}</p></div>` +
      `<div>${termList(t.children, { id: "subtype-list", more: 24, k: (x) => (x.descendants ? plural(x.descendants, "subtype", "subtypes") : "") })}</div></section>`;
  }
  if (t.valueOf.length) {
    h += `<section class="band reg" id="used-as" aria-labelledby="used-h"><div class="side"><h2 id="used-h">Where it is a value</h2><p class="lead">${t.valueOf.length === 1 ? `One property takes ${withA(t)} as its value.` : `${fmt(t.valueOf.length)} properties take ${withA(t)} as their value.`}</p></div>` +
      `<div>${nameList(t.valueOf, { id: "used-list", more: 36, k: (p) => (p.domain.length ? "on " + (p.domain.length <= 2 ? and(p.domain.map((x) => x.name)) : p.domain.length + " types") : "") })}</div></section>`;
  }
  h += provenance(t) + closing(t);

  const title = t.name + " · Schema · Org.AI Foundation";
  return page({
    path: "/" + t.name, title, image: dirOf(t) + "/" + t.name, current: t.ns === "orgai" ? "superset" : "types", body: h, alternates: "/" + t.name,
    description: d.first ? firstSentence(d.plain, 200) : `${t.name}, a ${kindWord(t)} in ${t.ns === "schema" ? "Schema.org" : "the .org.ai superset"}.`,
    jsonld: { "@context": "https://schema.org", "@type": "DefinedTerm", name: t.name, description: d.first || undefined, url: SITE + "/" + t.name, sameAs: t.ns === "schema" ? t.iri : undefined, inDefinedTermSet: t.ns === "schema" ? "https://schema.org" : SITE },
  });
}

/* ── one property ──────────────────────────────────────────────────────────── */

function flowFigure(p) {
  // the property in the middle; the types that have it on the left, the types its value can be on the right, each joined to it
  // by a curve that site.js draws from where the names land
  if (!p.domain.length && !p.range.length) return "";
  const item = (x, side) => `<li><a href="${href(x)}">` + (side === "from" ? `<span class="nm">${camel(x.name)}</span><i class="fm" aria-hidden="true"></i>` : `<i class="fm" aria-hidden="true"></i><span class="nm">${camel(x.name)}</span>`) + "</a></li>";
  const col = (list, side, label) => (list.length ? `<div class="col ${side}"><span class="lbl">${label}</span><ul>${list.map((x) => item(x, side)).join("")}</ul></div>` : `<div class="col ${side}"></div>`);
  // "A Clip, a Movie or one of 10 other types can have an actor, and its value is a PerformingGroup or a Person."
  const whole = (t) => an(t.name) + " " + esc(t.name);
  const some = (list, more) => (list.length <= 3 ? and(list.map(whole), "or") : list.slice(0, 2).map(whole).join(", ") + ", or one of " + fmt(list.length - 2) + " " + more);
  const subj = some(p.domain, "other types");
  const cap = (p.domain.length ? subj.charAt(0).toUpperCase() + subj.slice(1) + " can have " : "It gives ") + `${an(p.name)} <b>${esc(p.name)}</b>` +
    (p.range.length ? `, and its value is ${some(p.range, "other types")}` : "") + ".";
  // the figure is a size container: its own width, not the screen's, decides its layout (see schema.css)
  return `<figure class="flow" data-flow><div class="flow-in">${col(p.domain, "from", "Used on")}` +
    `<div class="mid"><span class="pm" aria-hidden="true"></span><span class="pn">${camel(p.name)}</span></div>` +
    `${col(p.range, "to", "Its value")}</div><svg class="links" aria-hidden="true"></svg><figcaption>${cap}</figcaption></figure>`;
}

function propertyPage(p) {
  const d = desc(p);
  const facts = [];
  facts.push(["Value", p.range.length ? and(p.range.map(link), "or") : "Not stated"]);
  facts.push(["Used on", p.domain.length ? (p.domain.length <= 4 ? and(p.domain.map(link)) : `<a href="#used-on">${plural(p.domain.length, "type", "types")}</a>`) : "Not stated"]);
  if (p.subPropertyOf.length) facts.push(["A kind of", and(p.subPropertyOf.map(link))]);
  if (p.inverseOf.length) facts.push(["Inverse of", and(p.inverseOf.map(link))]);
  if (p.supersededBy.length) facts.push(["Superseded by", and(p.supersededBy.map(link))]);
  if (p.supersedes.length) facts.push(["Replaces", and(p.supersedes.map(link))]);
  facts.push(["Source", p.ns === "schema" ? `Schema.org ${RELEASE.version}${p.pending ? '<span class="tag">Pending</span>' : ""}` : "The .org.ai superset"]);
  const figure = flowFigure(p);
  let h = crumbs([["/", "Schema"], ["/properties", "Properties"]]);
  h += `<header class="job-head reg${figure ? "" : " solo"}"><div><h1${p.name.length > 26 ? ' class="long"' : ""}>${camel(p.name)}</h1>` +
    (d.html ? `<div class="desc prose">${d.html}</div>` : "") +
    `<dl class="facts">${facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join("")}</dl>` +
    `<p class="actions"><a class="textlink" href="/${esc(p.name)}.json">JSON-LD</a><a class="textlink" href="/${esc(p.name)}.md">Markdown</a></p></div>` + figure + "</header>";
  h += senseBand(p);
  if (p.domain.length) h += `<section class="band reg" id="used-on" aria-labelledby="on-h"><div class="side"><h2 id="on-h">Used on</h2><p class="lead">${p.domain.length === 1 ? `One type has ${withA(p)}, and so does every type that descends from it.` : `${fmt(p.domain.length)} types have ${withA(p)}, and so does every type that descends from them.`}</p></div><div>${termList(p.domain, { id: "on-list", more: 24 })}</div></section>`;
  if (p.range.length) h += `<section class="band reg" id="values-of" aria-labelledby="val-h"><div class="side"><h2 id="val-h">Its value</h2><p class="lead">${p.range.length === 1 ? `Its value is ${withA(p.range[0])}.` : `Its value is one of these ${fmt(p.range.length)} types.`}</p></div><div>${termList(p.range, { id: "range-list", more: 24 })}</div></section>`;
  if (p.subProps.length) h += `<section class="band reg" id="narrower" aria-labelledby="nar-h"><div class="side"><h2 id="nar-h">Narrower properties</h2><p class="lead">${p.subProps.length === 1 ? "One property is a more specific kind of this one." : `${fmt(p.subProps.length)} properties are more specific kinds of this one.`}</p></div><div>${termList(p.subProps, { id: "narrower-list", more: 24 })}</div></section>`;
  h += provenance(p) + closing(p);
  return page({
    path: "/" + p.name, title: p.name + " · Schema · Org.AI Foundation", image: "p/" + p.name, current: p.ns === "orgai" ? "superset" : "properties", body: h, alternates: "/" + p.name,
    description: d.first ? firstSentence(d.plain, 200) : `${p.name}, a property in ${p.ns === "schema" ? "Schema.org" : "the .org.ai superset"}.`,
    jsonld: { "@context": "https://schema.org", "@type": "DefinedTerm", name: p.name, description: d.first || undefined, url: SITE + "/" + p.name, sameAs: p.ns === "schema" ? p.iri : undefined, inDefinedTermSet: p.ns === "schema" ? "https://schema.org" : SITE },
  });
}

/* ── one value ─────────────────────────────────────────────────────────────── */

function valuePage(x) {
  const d = desc(x);
  const en = x.memberOf[0];
  const facts = [["A value of", and(x.memberOf.map(link))]];
  if (x.supersededBy.length) facts.push(["Superseded by", and(x.supersededBy.map(link))]);
  facts.push(["Source", `Schema.org ${RELEASE.version}${x.pending ? '<span class="tag">Pending</span>' : ""}`]);
  const sibs = en.members;
  const lit = sibs.indexOf(x);
  const figure = sibs.length > 1
    ? `<figure class="opened" data-ring="values" role="img" aria-label="${esc(x.name)}, lit, among the ${fmt(sibs.length)} values of ${esc(en.name)}.">${ringSvg(sibs.map(() => ({ cls: "in" })), { lit })}<div class="tip" aria-hidden="true"></div>` +
      `<figcaption aria-hidden="true">${camel(x.name)}, lit, among the ${fmt(sibs.length)} values of ${camel(en.name)}. <span data-point="Point at one to see which; choose it to open its page." data-tap="Tap one to see which; tap it again to open its page.">Point at one to see which; choose it to open its page.</span></figcaption>` +
      `<ol class="sr" data-ring-names>${sibs.map((s) => `<li data-href="${href(s)}">${esc(s.name)}</li>`).join("")}</ol></figure>`
    : "";
  let h = crumbs([["/", "Schema"], ["/types", "Types"], ...en.trail.map((t) => [href(t), t.name])]);
  h += `<header class="job-head reg${figure ? "" : " solo"}"><div><h1${x.name.length > 26 ? ' class="long"' : ""}>${camel(x.name)}</h1>` +
    (d.html ? `<div class="desc prose">${d.html}</div>` : "") +
    `<dl class="facts">${facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join("")}</dl>` +
    `<p class="actions"><a class="textlink" href="/${esc(x.name)}.json">JSON-LD</a><a class="textlink" href="/${esc(x.name)}.md">Markdown</a></p></div>` + figure + "</header>";
  for (const m of x.memberOf) {
    const others = m.members.filter((s) => s !== x);
    if (others.length) h += `<section class="band reg" aria-labelledby="sib-h-${esc(m.name)}"><div class="side"><h2 id="sib-h-${esc(m.name)}">More values of ${camel(m.name)}</h2><p class="lead">${others.length === 1 ? `One other value of ${camel(m.name)}.` : `The ${fmt(others.length)} other values of ${camel(m.name)}.`}</p></div><div>${termList(others, { id: "sib-" + m.name, more: 24 })}</div></section>`;
  }
  h += provenance(x) + closing(x);
  return page({
    path: "/" + x.name, title: x.name + " · Schema · Org.AI Foundation", image: "v/" + x.name, current: "types", body: h, alternates: "/" + x.name,
    description: d.first ? firstSentence(d.plain, 200) : `${x.name}, a value of ${en.name} in Schema.org.`,
    jsonld: { "@context": "https://schema.org", "@type": "DefinedTerm", name: x.name, description: d.first || undefined, url: SITE + "/" + x.name, sameAs: x.iri, inDefinedTermSet: "https://schema.org" },
  });
}

/* ── the data: JSON-LD in the shape the site has always served, and Markdown ── */

const iriRef = (t) => ({ "@id": t.iri });
// relations in the order the source gives them, as the site has always served them
const raw = (t, key) => t.raw[key].map((id) => v.byId.get(id)).filter(Boolean).map(iriRef);
function termJson(t) {
  const d = t.comment;
  const j = { "@context": "https://schema.org" };
  if (t.kind === "type") {
    Object.assign(j, { "@type": "Class", "@id": t.iri, "rdfs:label": t.label, "rdfs:comment": d });
    j["rdfs:subClassOf"] = raw(t, "parents");
    j["schema:properties"] = t.ownProps.filter((p) => p.ns === t.ns).map((p) => p.name);
    j["schema:subTypes"] = t.children.filter((c) => c.ns === t.ns).map((c) => c.name);
    if (t.ns === "schema" && t.members.length) j["schema:values"] = t.members.map((m) => m.name);
  } else if (t.kind === "property") {
    Object.assign(j, { "@type": "Property", "@id": t.iri, "rdfs:label": t.label, "rdfs:comment": d });
    j["schema:domainIncludes"] = raw(t, "domain");
    j["schema:rangeIncludes"] = raw(t, "range");
    if (t.raw.subPropertyOf.length) j["rdfs:subPropertyOf"] = raw(t, "subPropertyOf");
    if (t.raw.inverseOf.length) j["schema:inverseOf"] = raw(t, "inverseOf");
  } else {
    Object.assign(j, { "@type": t.memberOf.length === 1 ? t.memberOf[0].name : t.memberOf.map((m) => m.name), "@id": t.iri, "rdfs:label": t.label, "rdfs:comment": d });
  }
  if (t.raw.supersededBy.length) j["schema:supersededBy"] = raw(t, "supersededBy");
  if (t.pending) j["schema:isPartOf"] = { "@id": "https://pending.schema.org" };
  return JSON.stringify(j);
}

const mdLink = (t) => `[${t.name}](${SITE}/${t.name})`;
const credit = (t) => (t.ns === "schema"
  ? `---\n\nCopied word for word from Schema.org ${RELEASE.version}, ${t.iri}, under CC BY-SA 3.0. Served by the Org.AI Foundation at ${SITE}/${t.name}.\n`
  : `---\n\nFrom the .org.ai superset of Schema.org, written by the Org.AI Foundation, under CC BY-SA 4.0. ${SITE}/${t.name}\n`);
const mdTable = (head, rows) => `| ${head.join(" | ")} |\n|${head.map((h) => "-".repeat(Math.max(3, h.length + 2))).join("|")}|\n` + rows.map((r) => `| ${r.join(" | ")} |`).join("\n") + "\n";
function termMd(t) {
  const d = desc(t);
  let s = `# ${t.name}\n\n`;
  if (t.kind === "type") {
    if (t.trail.length > 1) s += `> ${t.trail.map(mdLink).join(" > ")}\n\n`;
    if (d.md) s += d.md + "\n\n";
    if (t.parents.length) s += `**Extends:** ${t.parents.map(mdLink).join(", ")}\n\n`;
    t.groups.forEach((g) => {
      s += (g.from === t ? "## Properties" : `## ${mdLink(g.from)} Properties`) + "\n\n";
      s += mdTable(["Property", "Expected Type", "Description"], g.props.map((p) => [mdLink(p), p.range.map(mdLink).join(", "), desc(p).md1]));
      s += "\n";
    });
    if (t.members.length) s += "## Values\n\n" + mdTable(["Value", "Description"], t.members.map((m) => [mdLink(m), desc(m).md1])) + "\n";
    if (t.children.length) s += "## Subtypes\n\n" + mdTable(["Type", "Description"], t.children.map((c) => [mdLink(c), desc(c).md1])) + "\n";
  } else if (t.kind === "property") {
    if (d.md) s += d.md + "\n\n";
    if (t.range.length) s += "## Expected Types\n\n" + mdTable(["Type", "Description"], t.range.map((r) => [mdLink(r), desc(r).md1])) + "\n";
    if (t.domain.length) s += "## Used on Types\n\n" + mdTable(["Type", "Description"], t.domain.map((r) => [mdLink(r), desc(r).md1])) + "\n";
  } else {
    if (d.md) s += d.md + "\n\n";
    s += `**A value of:** ${t.memberOf.map(mdLink).join(", ")}\n\n`;
  }
  if (t.supersededBy.length) s += `**Superseded by:** ${t.supersededBy.map(mdLink).join(", ")}\n\n`;
  if (t.sense) s += `## ${t.name} in the .org.ai superset\n\n${desc(t.sense).md}\n\n`;
  return s + credit(t);
}

/* ── the home page, the two indexes, the 404 ───────────────────────────────── */

const count = (ns, kind) => v.all.filter((t) => t.ns === ns && t.kind === kind).length;
const N = { types: count("schema", "type"), props: count("schema", "property"), values: count("schema", "value"), xTypes: count("orgai", "type"), xProps: count("orgai", "property") };
const thing = v.pages.get("Thing"), dataType = v.pages.get("DataType");
const branches = [...thing.children.filter((c) => c.ns === "schema"), dataType];
const superset = v.all.filter((t) => t.ns === "orgai").sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "type" ? -1 : 1));

/* every type, drawn by src/hero.js: in layers wider than the page, or as branches out from Thing, under a toolbar with
   the view, the search that lights it, and the key. Its height is set here, from the number of layers, so nothing moves
   when it draws; without scripts none of it is shown, and if its data does not arrive only the drawing goes. */
function hero() {
  const layers = `${fmt(N.types)} Schema.org types and ${fmt(N.xTypes)} from the .org.ai superset, each under the type it is a more specific kind of.`;
  const branches = `${fmt(N.types)} Schema.org types and ${fmt(N.xTypes)} from the .org.ai superset, each growing out of the type it is a more specific kind of.`;
  return `<div class="hero" data-hero="/${HERO.data}" data-cap-layers="${esc(layers)}" data-cap-branches="${esc(branches)}" style="--rows:${HERO_DATA.rows}">` +
    `<div class="hero-head"><div class="hero-views" role="group" aria-label="Show the types as">` +
    // on a phone the two views are drawn, not named: a strata and a ring of marks (the names stay, for screen readers)
    `<button type="button" data-view="layers" aria-pressed="true"><svg class="vi" viewBox="0 0 18 18" aria-hidden="true"><rect x="1.5" y="3" width="15" height="3" rx="1.5"/><rect x="1.5" y="7.5" width="7" height="3" rx="1.5"/><rect x="9.5" y="7.5" width="7" height="3" rx="1.5"/><rect x="1.5" y="12" width="4" height="3" rx="1.5"/><rect x="6.5" y="12" width="2" height="3" rx="1"/><rect x="9.5" y="12" width="3" height="3" rx="1.5"/><rect x="13.5" y="12" width="3" height="3" rx="1.5"/></svg><span>Layers</span></button>` +
    `<button type="button" data-view="branches" aria-pressed="false"><svg class="vi" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="1.8"/>${[0, 60, 120, 180, 240, 300].map((d) => { const r = (d * Math.PI) / 180, x = f2(9 + Math.cos(r) * 6), y = f2(9 + Math.sin(r) * 6); return `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.25" transform="rotate(${d} ${x} ${y})"/>`; }).join("")}</svg><span>Branches</span></button></div>` +
    lookup("q", "Find a term", "Find a term, like Person or startDate", { quiet: true, short: "Find a term" }) +
    `<ul class="hero-legend" data-for="layers" aria-hidden="true"><li><i class="bar"></i>A type, as wide as the types under it</li><li><i class="bar am"></i>The .org.ai superset</li><li><i class="bar line"></i>Your search</li></ul>` +
    `<ul class="hero-legend" data-for="branches" aria-hidden="true" hidden><li><i class="ov"></i>One mark per type, out from Thing</li><li><i class="ov am"></i>The .org.ai superset</li><li><i class="ov ring"></i>Your search</li></ul></div>` +
    `<figure class="hero-fig"><div class="hero-frame"><div class="hero-scroll" tabindex="0" aria-label="Every type, in layers. Scroll sideways to see them all."><div class="hero-spacer"></div></div><canvas aria-hidden="true"></canvas><div class="hero-tip" aria-hidden="true"></div></div>` +
    `<div class="hero-mini-wrap"><canvas class="hero-mini" aria-hidden="true"></canvas></div>` +
    `<figcaption class="hero-cap">${esc(layers)}</figcaption></figure></div>`;
}

function homePage() {
  const max = Math.max(...branches.map((b) => b.descendants + 1));
  let h = `<section class="intro has-hero" aria-labelledby="home-h"><div class="intro-grid"><h1 id="home-h">Every Schema.org term, and the ones we added<span class="dot">.</span></h1><div>` +
    `<p class="lede"><strong>${fmt(N.types)} types</strong>, <strong>${fmt(N.props)} properties</strong> and <strong>${fmt(N.values)} values</strong>, copied word for word from Schema.org ${RELEASE.version}. ` +
    `Beside them, the <a class="textlink" href="#superset">.org.ai superset</a>: ${plural(N.xTypes, "type", "types")} and ${plural(N.xProps, "property", "properties")} for agents, the tools they use, and the businesses they work in.</p>` +
    `<p class="links"><a class="textlink" href="/types">Every type, as a tree</a><a class="textlink" href="/properties">Every property, A to Z</a></p></div></div>` + hero() + `</section>`;
  h += `<section class="band reg" id="branches" aria-labelledby="br-h"><div class="side"><h2 id="br-h">Where every type starts</h2><p class="lead">Every type is a more specific kind of another, back to ${link(thing)}, or to ${link(dataType)} for plain values like text and numbers. These are the first branches.</p></div>` +
    `<div><ul class="branches">${branches.map((b) => `<li><a href="${href(b)}"><span class="n nm">${camel(b.name)}</span><span class="c num">${plural(b.descendants, "type", "types")} below it</span><span class="d">${esc(desc(b).first)}</span><span class="bar" aria-hidden="true"><b style="transform:scaleX(${f2((b.descendants + 1) / max)})"></b></span></a></li>`).join("")}</ul></div></section>`;
  const senses = superset.filter((t) => t.senseOf).length;
  h += `<section class="band reg" id="superset" aria-labelledby="sup-h"><div class="side"><h2 id="sup-h">The .org.ai superset</h2>` +
    `<p class="lead">${plural(N.xTypes, "type", "types")} and ${plural(N.xProps, "property", "properties")} the Org.AI Foundation adds to Schema.org, for the work agents and businesses do. ${senses ? `${fmt(senses)} share a name with a Schema.org term; each is shown on that term's page.` : ""}</p>` +
    `<a class="textlink more" href="https://github.com/dot-org-ai/schema.org.ai/blob/main/extensions.jsonld">extensions.jsonld</a></div>` +
    `<div>${termList(superset, { id: "superset-list", more: 0, k: (x) => (x.kind === "property" ? "Property" : x.senseOf ? "Type, beside Schema.org's " + x.name : "Type") })}</div></section>`;
  h += `<section class="band reg" id="use" aria-labelledby="use-h2"><div class="side"><h2 id="use-h2">Use the data</h2><p class="lead">Every term is here as data, at an address you can guess from its name.</p></div>` +
    `<div><dl class="uses">` +
    `<div><dt><code>/Person.json</code></dt><dd>A term as JSON-LD. <a class="textlink" href="/Person.json">Person</a></dd></div>` +
    `<div><dt><code>/Person.md</code></dt><dd>A term as Markdown, for language models. <a class="textlink" href="/Person.md">Person</a></dd></div>` +
    `<div><dt><code>/${RELEASE.file}</code></dt><dd>The whole of Schema.org ${RELEASE.version}, the file every page here is built from.</dd></div>` +
    `<div><dt><code>/extensions.jsonld</code></dt><dd>The whole .org.ai superset.</dd></div>` +
    `<div><dt><code>npm i schema.org.ai</code></dt><dd>TypeScript types for Schema.org and the superset. <a class="textlink" href="https://www.npmjs.com/package/schema.org.ai">npm</a></dd></div>` +
    `<div><dt><code>/llms.txt</code></dt><dd>What this site is, for language models.</dd></div>` +
    `</dl></div></section>`;
  h += `<section class="band reg" aria-labelledby="prov-h"><div class="side"><h2 id="prov-h">Where this comes from</h2><p class="lead">Schema.org's terms are copied word for word and credited. The superset is ours, and says so on every page.</p></div>` +
    `<div class="trace compact"><ol class="layers"><li class="layer lit"><span class="k">Published by</span><div class="v"><b>Schema.org</b><span class="sub">A vocabulary for structured data, founded by Google, Microsoft, Yahoo and Yandex, and run by its community</span></div></li>` +
    `<li class="layer lit"><span class="k">Release</span><div class="v"><b>Version ${RELEASE.version}</b><span class="sub">${RELEASE.date}</span></div></li>` +
    `<li class="layer lit"><span class="k">License</span><div class="v"><b>CC BY-SA 3.0</b><span class="sub">Free to copy and adapt, with credit, under the same licence</span></div></li>` +
    `<li class="layer end lit cur"><span class="k">Changed by us</span><div class="v"><b>Nothing.</b></div></li></ol></div></section>`;
  h += `<div class="closing reg"><section aria-labelledby="gh-h"><h2 id="gh-h">Build with it</h2><p>The site, the superset and the TypeScript types are open source.</p><p class="links"><a class="live" href="https://github.com/dot-org-ai/schema.org.ai">GitHub</a><a class="live" href="/llms.txt">/llms.txt</a></p></section>` +
    `<section aria-labelledby="pt-h"><h2 id="pt-h">Partner with us</h2><p>Fund the next pass, contribute data, or build on the record. Tell us what you have in mind.</p><a class="btn btn-primary" href="https://foundation.org.ai/#partner">Partner with us <span class="arr" aria-hidden="true">&rarr;</span></a></section></div>`;
  return page({
    path: "/", title: "Schema · Org.AI Foundation", image: "og", current: "home", body: h, scripts: `<script src="/${HERO.js}" defer></script>\n`,
    description: `Every Schema.org ${RELEASE.version} term, copied word for word: ${fmt(N.types)} types, ${fmt(N.props)} properties and ${fmt(N.values)} values. With the .org.ai superset the Org.AI Foundation adds.`,
  });
}

// a type in the tree; one with types below it has a chevron before it that folds them away (schema.js)
function treeItem(t, anchors) {
  const kids = t.children.filter((c) => !c.senseOf);
  const id = anchors.has(t) ? ` id="tree-${esc(t.name)}"` : "";
  const a = `<a href="${href(t)}"><span class="nm">${camel(t.name)}</span>${t.ns === "orgai" ? '<span class="tag ai">.org.ai</span>' : ""}${t.descendants ? `<span class="k">${fmt(t.descendants)}</span>` : ""}</a>`;
  if (!kids.length) return `<li${id}>${a}</li>`;
  return `<li${id} class="br"><div class="row"><button class="tw" type="button" aria-expanded="true" aria-label="Types under ${esc(t.name)}"></button>${a}</div>` +
    "<ul>" + kids.map((c) => treeItem(c, anchors)).join("") + "</ul></li>";
}
function typesPage() {
  const roots = [thing, dataType, ...v.roots.map((c) => v.byId.get(c)).filter((t) => t !== thing && t !== dataType)];
  const all = v.all.filter((t) => t.kind === "type" && !t.senseOf).length;
  let h = `<section class="intro" aria-labelledby="types-h"><div class="intro-grid"><h1 id="types-h">Every type, by what it descends from<span class="dot">.</span></h1><div>` +
    `<p class="lede"><strong>${fmt(all)} types</strong>, ${fmt(N.types)} from Schema.org and ${fmt(all - N.types)} from the .org.ai superset. Each is a more specific kind of the one above it; the number beside a type counts every type below it.</p>` +
    lookup("q", "Find a term", "Try Event, Recipe or Hotel") + `</div></div></section>`;
  // the branch list: Thing, its branches beneath it as in the tree, then the other roots; a count only where a type has types below it
  const navItem = (t) => `<a href="#tree-${esc(t.name)}" data-spy="tree-${esc(t.name)}"><span class="n">${camel(t.name)}${t.ns === "orgai" ? '<span class="tag ai">.org.ai</span>' : ""}</span>${t.descendants ? `<span class="c num">${fmt(t.descendants)}</span>` : ""}</a>`;
  h += `<div class="directory reg"><nav class="index-nav side" aria-label="Branches">${navItem(thing)}<div class="kids">${thing.children.filter((c) => !c.senseOf).map(navItem).join("")}</div>` +
    roots.filter((r) => r !== thing).map(navItem).join("") + `</nav>` +
    `<div class="tree-wrap"><div class="tree-tools"><button class="tree-all" type="button" data-tree="open">Expand all</button><button class="tree-all" type="button" data-tree="fold">Collapse all</button></div>` +
    // the roots and the branches under Thing are the ones the branch list points at
    `<ul class="tree">${roots.map((r) => treeItem(r, new Set([...roots, ...thing.children]))).join("")}</ul></div></div>`;
  return page({ path: "/types", title: "Types · Schema · Org.AI Foundation", image: "og-types", current: "types", body: h,
    description: `Every type in Schema.org ${RELEASE.version} and the .org.ai superset, ${fmt(all)} in all, as a tree: each one a more specific kind of the one above it.` });
}

function propertiesPage() {
  const props = v.all.filter((t) => t.kind === "property" && !t.senseOf).sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  const groups = new Map();
  for (const p of props) { const L = p.name[0].toUpperCase(); if (!groups.has(L)) groups.set(L, []); groups.get(L).push(p); }
  let h = `<section class="intro" aria-labelledby="props-h"><div class="intro-grid"><h1 id="props-h">Every property, from A to Z<span class="dot">.</span></h1><div>` +
    `<p class="lede"><strong>${fmt(props.length)} properties</strong>, ${fmt(N.props)} from Schema.org and ${fmt(props.length - N.props)} from the .org.ai superset. Beside each, the kind of value it takes.</p></div></div></section>`;
  // the bar that stays under the header: a filter over the list below, and the letters, the one in view marked as you scroll
  const letters = [...new Set([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ...groups.keys()])];
  h += `<div class="az-bar" data-az><div class="az-bar-in"><div class="az-filter"><label class="sr" for="az-q">Filter the properties by name</label>` +
    `<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.6 12.6l4 4"/></svg>` +
    `<input id="az-q" type="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="Filter ${fmt(props.length)} properties" aria-describedby="az-count">` +
    `<span class="az-count num" id="az-count" aria-live="polite"></span></div>` +
    `<nav class="letters" aria-label="Letters">${letters.map((L) => groups.has(L) ? `<a href="#letter-${L}" data-letter="${L}">${L}</a>` : `<span aria-disabled="true">${L}</span>`).join("")}</nav></div></div>`;
  // each property, its name and the kind of value it takes; data-n is the name the filter reads
  const takes = (p) => (p.range.length ? and(p.range.slice(0, 2).map((x) => x.name), "or") + (p.range.length > 2 ? ` and ${p.range.length - 2} more` : "") : "");
  h += `<div class="az-list">` + [...groups].map(([L, list]) => `<section class="az-group" id="letter-${L}" data-letter="${L}" aria-labelledby="letter-h-${L}"><h2 id="letter-h-${L}">${L}<span class="num">${fmt(list.length)}</span></h2>` +
    `<ul class="az-names">${list.map((p) => `<li data-n="${esc(p.name)}"><a href="${href(p)}"><span class="t"><span class="nm">${camel(p.name)}</span>${p.ns === "orgai" ? '<span class="tag ai">.org.ai</span>' : ""}</span><span class="k">${camel(takes(p))}</span></a></li>`).join("")}</ul></section>`).join("") +
    `<p class="az-none" hidden></p></div>`;
  return page({ path: "/properties", title: "Properties · Schema · Org.AI Foundation", image: "og-properties", current: "properties", body: h,
    description: `Every property in Schema.org ${RELEASE.version} and the .org.ai superset, ${fmt(props.length)} in all, from A to Z, with the kind of value each takes.` });
}

function notFoundPage() {
  const h = `<section class="missing reg" aria-labelledby="nf-h"><div><h1 id="nf-h">There is no term by that name.</h1></div><div>` +
    `<p>Nothing here is called <code id="where"></code>. Names are exact, capitals and all: <a class="textlink" href="/Person">Person</a> is a type, <a class="textlink" href="/name">name</a> a property.</p>` +
    lookup("q", "Find a term", "Try Person, Offer or startDate") +
    `<p class="links"><a class="textlink" href="/types">Every type</a><a class="textlink" href="/properties">Every property</a><a class="textlink" href="/">Schema home</a></p></div></section>`;
  return page({ path: null, title: "Not found · Schema · Org.AI Foundation", image: "og", body: h, description: "There is no term at this address in Schema.org or the .org.ai superset." });
}

/* ── write public/ ─────────────────────────────────────────────────────────── */

// empty public/ rather than replace it, so a running `wrangler dev` keeps watching the same folder
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(join(OUT, f), { recursive: true, force: true });
mkdirSync(GEN, { recursive: true });
for (const d of ["t", "p", "v", "s", "og"]) mkdirSync(join(OUT, d), { recursive: true });

const w = (p, s) => writeFileSync(join(OUT, p), s);
w(ASSET.css, CSS);
w(ASSET.js, JS);
w(HERO.js, HERO_JS);
w(HERO.data, HERO_DATA.json);
w("index.html", homePage());
w("types.html", typesPage());
w("properties.html", propertiesPage());
w("404.html", notFoundPage());

const names = {};
let bytes = 0;
for (const t of pages) {
  const dir = dirOf(t);
  const html = t.kind === "type" ? typePage(t) : t.kind === "property" ? propertyPage(t) : valuePage(t);
  w(`${dir}/${t.name}.html`, html);
  w(`${dir}/${t.name}.json`, termJson(t));
  w(`${dir}/${t.name}.md`, termMd(t));
  names[t.name] = dir;
  bytes += html.length;
}
writeFileSync(join(GEN, "names.json"), JSON.stringify(names));

// search: every term, with the first sentence of what it means
w("search.json", JSON.stringify(pages.flatMap((t) => {
  const row = [t.name, dirOf(t), desc(t).first, t.ns === "orgai" ? 1 : 0];
  return t.sense ? [row, [t.name, dirOf(t.sense), desc(t.sense).first, 2]] : [row];
})));

const urls = ["/", "/types", "/properties", ...pages.map((t) => "/" + t.name)];
w("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${esc(u)}</loc></url>`).join("\n")}\n</urlset>\n`);
w("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
w("llms.txt", `# Schema · Org.AI Foundation

> Every Schema.org ${RELEASE.version} term, copied word for word, and the .org.ai superset the Org.AI Foundation adds.

schema.org.ai serves Schema.org ${RELEASE.version} (released ${RELEASE.date}): ${fmt(N.types)} types, ${fmt(N.props)} properties and
${fmt(N.values)} enumeration values, each with its own page. Beside them is the .org.ai superset: ${fmt(N.xTypes)} types
and ${fmt(N.xProps)} properties for agents, tools and the businesses they work in. ${fmt(superset.filter((t) => t.senseOf).length)} superset terms share a name
with a Schema.org term; the name's page shows the Schema.org term, and the superset's at #org-ai.

## Addresses

Every term is at ${SITE}/<Name>, with capitals exactly as in Schema.org (Person is a type, person is not a term).

- ${SITE}/<Name>.json       the term as JSON-LD (also at /api/<Name>/json)
- ${SITE}/<Name>.md         the term as Markdown (also at /api/<Name>/md)
- ${SITE}/${RELEASE.file}   all of Schema.org ${RELEASE.version}, as published
- ${SITE}/extensions.jsonld   all of the .org.ai superset
- ${SITE}/search.json       every term: [name, t|p|v for type, property or value, its first sentence, 0 Schema.org, 1 superset, 2 superset term sharing a Schema.org name]
- ${SITE}/sitemap.xml

## Licence

Schema.org's terms are CC BY-SA 3.0, from https://schema.org. The superset is CC BY-SA 4.0, from the
Org.AI Foundation. Nothing here is generated at request time: every page and file is built ahead of time
from those two files.
`);

cpSync(join(ROOT, "data", RELEASE.file), join(OUT, RELEASE.file));
cpSync(join(ROOT, "..", "extensions.jsonld"), join(OUT, "extensions.jsonld"));
cpSync(join(ROOT, "src", "fonts"), join(OUT, "fonts"), { recursive: true });
for (const f of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) cpSync(join(ROOT, "src", f), join(OUT, f));
// the Foundation's search, the same file on every Foundation site (built in dot-org-ai/foundation.org.ai; copy it from there)
cpSync(join(ROOT, "src", "find.js"), join(OUT, "find.js"));
cpSync(join(ROOT, "src", "favicon.svg"), join(OUT, "org-ai.svg")); // the address the previous site served its mark at
// share cards: only the ones a page uses
for (const c of [...SITE_CARDS.map((x) => x.name), ...pages.map((t) => termCard(t).name)]) {
  card(c);
  mkdirSync(dirname(join(OUT, "og", c + ".png")), { recursive: true });
  cpSync(join(CARDS_DIR, c + ".png"), join(OUT, "og", c + ".png"));
}

console.log(`  ${fmt(pages.length)} term pages (${fmt(N.types)} types, ${fmt(N.props)} properties, ${fmt(N.values)} values from Schema.org; ${fmt(N.xTypes + N.xProps)} superset terms), ${(bytes / pages.length / 1024).toFixed(1)} KB each on average`);
console.log(`  ${ASSET.css} ${(CSS.length / 1024).toFixed(1)} KB, ${ASSET.js} ${(JS.length / 1024).toFixed(1)} KB`);
