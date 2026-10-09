/**
 * schema.org.ai: Schema.org, copied word for word, and the .org.ai superset of the Org.AI Foundation.
 *
 * Every page and file is built ahead of time by build.mjs into ./public. This Worker only maps addresses to
 * those files and sets headers:
 *
 *   /<Name>                a term's page        -> public/{t,p,v}/<Name>.html
 *   /<Name>.json           its JSON-LD          -> public/{t,p,v}/<Name>.json   (also /api/<Name>/json)
 *   /<Name>.md             its Markdown         -> public/{t,p,v}/<Name>.md     (also /api/<Name>/md)
 *   everything else        a static asset (/, /types, /properties, /search.json, /og/..., /s/..., ...)
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
  /* The pages load nothing from anywhere else: page, style, script, font and images all come from this
     origin, so the policy admits this origin (and inline style and script) and no other host. */
  "content-security-policy":
    "default-src 'none'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self'; " +
    "img-src 'self' data:; " +
    // the search reads /search.json; the estate's edge analytics snippet posts to this origin's /e
    "connect-src 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'; " +
    "base-uri 'none'",
};
const SHORT = "public, max-age=300, must-revalidate";
const YEAR = "public, max-age=31536000, immutable";
const TYPES = { json: "application/json; charset=utf-8", md: "text/markdown; charset=utf-8", jsonld: "application/ld+json; charset=utf-8" };

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

    let m;
    if (path === "/search.json") return asset(request, env, url);
    if ((m = /^\/api\/([^/]+)\/(json|md)$/.exec(path))) return term(request, env, url, m[1], m[2], (n) => "/api/" + n + "/" + m[2]);
    if ((m = /^\/([^/.]+)\.(json|md)$/.exec(path))) return term(request, env, url, m[1], m[2], (n) => "/" + n + "." + m[2]);
    if ((m = /^\/([^/.]+)$/.exec(path)) && m[1] !== "types" && m[1] !== "properties") return term(request, env, url, m[1], "html", (n) => "/" + n);

    return asset(request, env, url);
  },
};

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
