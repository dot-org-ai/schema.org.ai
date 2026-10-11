/**
 * schema.org.ai: Schema.org as published, and the .org.ai superset of the Org.AI Foundation.
 *
 * Every page and file is built ahead of time by build.mjs into ./public. This Worker only maps addresses to
 * those files and sets headers:
 *
 *   /<Name>                a term's page        -> public/{t,p,v}/<Name>.html
 *   /<Name>.json           its JSON-LD          -> public/{t,p,v}/<Name>.json   (also /api/<Name>/json)
 *   /<Name>.md             its Markdown         -> public/{t,p,v}/<Name>.md     (also /api/<Name>/md)
 *   /index.md, /types.md, /properties.md        the three other pages as Markdown
 *   /llms.txt, /llms-full.txt, /robots.txt, /index.json, /sitemap.xml            the machine faces
 *   everything else        a static asset (/, /types, /properties, /search.json, /og/..., /s/..., ...)
 *
 * A page asked for with an Accept header that prefers text/markdown gets its Markdown instead, and both answers
 * say Vary: Accept. Plain http on schema.org.ai is sent to https; every other host (workers.dev, previews) is
 * marked noindex, so only schema.org.ai is indexed.
 *
 * Terms are filed under t/, p/ and v/ (type, property, value) because Schema.org has names that differ only
 * in case (Brand, brand); gen/names.json says which folder holds each name. A name in the wrong case that
 * matches exactly one term is redirected to it. Nothing is fetched from anywhere else.
 */

import NAMES from "./gen/names.json";

const LOWER = new Map();
for (const n of Object.keys(NAMES)) {
  const k = n.toLowerCase();
  LOWER.set(k, LOWER.has(k) ? null : n); // null: more than one term, so no guess is made
}

const SEC = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  /* The pages load their style, script, font and images from this origin, and nothing else from anywhere
     else, with one exception: the search (find.js) reads the occupations from foundation.org.ai, so that one
     search covers every Foundation site. */
  "content-security-policy":
    "default-src 'none'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self'; " +
    "img-src 'self' data:; " +
    // the search reads /search.json; the estate's edge analytics snippet posts to this origin's /e
    "connect-src 'self' https://foundation.org.ai; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'; " +
    "base-uri 'none'",
};
const CANON = "schema.org.ai";
const SHORT = "public, max-age=300, must-revalidate";
const YEAR = "public, max-age=31536000, immutable";
const TYPES = { json: "application/json; charset=utf-8", md: "text/markdown; charset=utf-8", jsonld: "application/ld+json; charset=utf-8", txt: "text/plain; charset=utf-8", xml: "application/xml; charset=utf-8" };
// the pages that are not a term's, and their markdown twins
const PAGE_MD = { "/": "/index.md", "/types": "/types.md", "/properties": "/properties.md" };
// the machine faces, by address: their type, and whether any site may read them
const MACHINE = {
  "/index.md": [TYPES.md, true], "/types.md": [TYPES.md, true], "/properties.md": [TYPES.md, true],
  "/index.json": [TYPES.json, true], "/llms.txt": [TYPES.txt, true], "/llms-full.txt": [TYPES.txt, true],
  "/robots.txt": [TYPES.txt, false], "/sitemap.xml": [TYPES.xml, false],
};

/** Does this Accept header prefer markdown to HTML? Honours q-values; a bare text/markdown wins. */
function wantsMarkdown(accept) {
  const q = (type) => {
    let best = -1;
    for (const part of (accept || "").split(",")) {
      const [t, ...params] = part.trim().toLowerCase().split(";");
      if (t !== type) continue;
      const qp = params.map((x) => x.trim()).find((x) => x.startsWith("q="));
      best = Math.max(best, qp ? Number(qp.slice(2)) || 0 : 1);
    }
    return best;
  };
  const md = q("text/markdown");
  return md > 0 && md >= q("text/html");
}

/* Every answer, last of all: https is kept to on schema.org.ai, and no other host is indexed. */
function finish(res, url) {
  const h = new Headers(res.headers);
  if (url.hostname === CANON) h.set("strict-transport-security", "max-age=31536000");
  else h.set("x-robots-tag", "noindex");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
const vary = (res) => { const h = new Headers(res.headers); h.set("vary", "Accept"); return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h }); };

function withHeaders(res, extra) {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(SEC)) h.set(k, v);
  if (extra) for (const [k, v] of Object.entries(extra)) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

/* the 404 page for a page; for data, an answer in the format that was asked for */
async function notFound(request, env, fmt) {
  if (fmt === "json") return withHeaders(new Response(JSON.stringify({ error: "Not found" }), { status: 404 }), { "content-type": TYPES.json, "cache-control": SHORT, "access-control-allow-origin": "*" });
  if (fmt === "md") return withHeaders(new Response("# Not found\n\nThere is no term by that name at schema.org.ai.\n", { status: 404 }), { "content-type": TYPES.md, "cache-control": SHORT, "access-control-allow-origin": "*" });
  const page = await env.ASSETS.fetch(new Request(new URL("/404", request.url), { method: request.method }));
  return withHeaders(new Response(page.body, { status: 404 }), { "content-type": "text/html; charset=utf-8", "cache-control": SHORT });
}

async function term(request, env, url, raw, fmt, rewrite) {
  let name;
  try { name = decodeURIComponent(raw); } catch { return notFound(request, env, fmt); }
  const dir = Object.prototype.hasOwnProperty.call(NAMES, name) ? NAMES[name] : null;
  if (!dir) {
    const fixed = LOWER.get(name.toLowerCase());
    if (fixed) return withHeaders(new Response(null, { status: 301, headers: { location: rewrite(fixed) + url.search } }), { "cache-control": SHORT });
    return notFound(request, env, fmt);
  }
  const asset = new URL("/" + dir + "/" + name + (fmt === "html" ? "" : "." + fmt), url);
  const res = await env.ASSETS.fetch(new Request(asset, request));
  if (res.status === 404) return notFound(request, env, fmt);
  const extra = { "cache-control": SHORT };
  if (fmt === "html") extra["content-type"] = "text/html; charset=utf-8";
  else { extra["content-type"] = TYPES[fmt]; extra["access-control-allow-origin"] = "*"; }
  return withHeaders(res, extra);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // plain http on the site's own host goes to https, the same address otherwise; a GET or HEAD for good, anything else kept as sent
    if (url.protocol === "http:" && url.hostname === CANON) {
      return withHeaders(new Response(null, { status: request.method === "GET" || request.method === "HEAD" ? 301 : 308, headers: { location: "https://" + url.host + url.pathname + url.search } }), { "cache-control": SHORT });
    }
    return finish(await route(request, env, url), url);
  },
};

async function route(request, env, url) {
    const path = url.pathname;

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: { allow: "GET, HEAD", ...SEC } });
    }

    // the folders terms are filed in are not addresses of their own
    if (/^\/[tpv]\//.test(path)) return notFound(request, env, "html");

    // one address per page: no trailing slash. Leading slashes collapse too, so "//host/" can never become "//host"
    if (path.length > 1 && path.endsWith("/")) {
      const to = "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");
      return withHeaders(new Response(null, { status: 301, headers: { location: to + url.search } }), { "cache-control": SHORT });
    }

    const md = wantsMarkdown(request.headers.get("accept"));
    let m;
    if (path === "/search.json") return asset(request, env, url);
    if (Object.prototype.hasOwnProperty.call(MACHINE, path)) return machine(request, env, url, path);
    // the three pages that are not a term's, as HTML or, asked for, as their markdown twin
    if (Object.prototype.hasOwnProperty.call(PAGE_MD, path)) return vary(md ? await machine(request, env, url, PAGE_MD[path]) : await asset(request, env, url));
    if ((m = /^\/api\/([^/]+)\/(json|md)$/.exec(path))) return term(request, env, url, m[1], m[2], (n) => "/api/" + n + "/" + m[2]);
    if ((m = /^\/([^/.]+)\.(json|md)$/.exec(path))) return term(request, env, url, m[1], m[2], (n) => "/" + n + "." + m[2]);
    if ((m = /^\/([^/.]+)$/.exec(path))) { const name = m[1]; return vary(await term(request, env, url, name, md ? "md" : "html", (n) => "/" + n)); }

    return asset(request, env, url);
}

/* a machine face: the file, with the type it is, readable by any site where it is data */
async function machine(request, env, url, path) {
  const res = await env.ASSETS.fetch(new Request(new URL(path, url), { method: request.method }));
  if (!res.ok) return notFound(request, env, path.endsWith(".json") ? "json" : path.endsWith(".md") ? "md" : "html");
  const [type, open] = MACHINE[path];
  const extra = { "content-type": type, "cache-control": SHORT };
  if (open) extra["access-control-allow-origin"] = "*";
  return withHeaders(res, extra);
}

/* Everything else is a static asset; not_found_handling serves 404.html for a miss. */
async function asset(request, env, url) {
    const path = url.pathname;
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get("content-type") || "";
    const extra = {};
    // the asset server gives HTML as bare text/html; the header states the charset the documents declare
    if (ct.startsWith("text/html") && !ct.includes("charset")) extra["content-type"] = "text/html; charset=utf-8";
    if (res.ok && path.endsWith(".jsonld")) { extra["content-type"] = TYPES.jsonld; extra["access-control-allow-origin"] = "*"; }
    if (res.ok && path === "/search.json") { extra["content-type"] = TYPES.json; extra["access-control-allow-origin"] = "*"; }
    // hashed and versioned files never change at their address; a miss is the 404 page, and must not be kept a year
    extra["cache-control"] = res.ok && (path.startsWith("/s/") || path.startsWith("/fonts/")) ? YEAR : res.ok && path.startsWith("/og/") ? "public, max-age=86400" : SHORT;
    return withHeaders(res, extra);
}
