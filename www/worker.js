/**
 * schema.org.ai — the edge layer.
 *
 * This worker exists to serve ONE artefact correctly: the context document, at
 * the binding string https://schema.org.ai, under content negotiation.
 *
 * ADR 0002 R1: the binding string is stable, unversioned, forever. R2:
 * "Dereference serves both by content negotiation: Accept: application/ld+json
 * -> JSON-LD; default -> MDXLD/HTML." generator/README.md §5 names this worker
 * as the missing piece: "GitHub Pages cannot content-negotiate. Nathan must add
 * an edge layer (Cloudflare Worker) that, for GET https://schema.org.ai with
 * Accept: application/ld+json, returns site/public/context.jsonld."
 *
 * Until that is served, `jsonld.expand({'@context':'https://schema.org.ai'})`
 * throws `invalid remote context` — the artefact whose absence mdxld.org
 * publicly names today.
 *
 * The document served is site/public/context.jsonld, COPIED BYTE-FOR-BYTE, with
 * its sha256 asserted at build time. It is always generated and never
 * hand-edited; this worker is a serving surface, not a second generator.
 *
 * No network. No data source. No analytics. No cookie, ever.
 */

import { TERMS } from "./terms.generated.js";

const HOST = "https://schema.org.ai";

/* ── the term table, exact-case, generated ────────────────────────────────── */

/* URL path -> the bucket-prefixed asset stem. The prefix exists because APFS is
   case-insensitive and five term pairs differ only by case, so `Tool.html` and
   `tool.html` are one file on the build machine. The URL keeps the ratified
   spelling; only the file on disk is prefixed. */
const STEM = new Map(TERMS);
/* lowercase -> the one true spelling, for the "did you mean" line on a 404 */
const CASE = new Map();
for (const [t] of TERMS) {
  const k = t.toLowerCase();
  /* five names collide when folded. A suggestion that could mean two things is
     not a suggestion, so those five suggest nothing. */
  CASE.set(k, CASE.has(k) ? null : t);
}

/* ── headers ──────────────────────────────────────────────────────────────── */

/* The page loads nothing from anywhere and the policy says so out loud. CSP
   governs document contexts; a JSON response is never a document context, so
   `default-src 'none'` costs nothing there and widening it would only weaken
   the HTML pages, which is the one place it does work. Same block everywhere. */
const SEC = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "SAMEORIGIN",
  "content-security-policy":
    "default-src 'none'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'unsafe-inline'; " +
    "font-src 'self' data:; " +
    "img-src 'self' data:; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'; " +
    "base-uri 'none'",
  /* A browser-side JSON-LD processor fetching this origin cross-origin needs
     CORS, and `Accept: application/ld+json` is not a safelisted header value,
     so it sends a preflight. schema.org sends exactly this pair. No
     credentials, ever: with `allow-origin: *` the pair would be invalid. */
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Link",
};

const CACHE = "public, max-age=300, must-revalidate";

function respond(body, status, type, extra) {
  const h = new Headers();
  for (const [k, v] of Object.entries(SEC)) h.set(k, v);
  h.set("content-type", type);
  h.set("cache-control", CACHE);
  if (extra) for (const [k, v] of Object.entries(extra)) h.set(k, v);
  return new Response(body, { status, headers: h });
}

/* JSON media types register no charset parameter and RFC 8259 fixes UTF-8.
   jsonld.js's fast path is an exact string compare on `application/ld+json`;
   a charset parameter sends it down the alternate-following branch for a
   pointless second request. So: charset on text/*, never on the JSON types. */
const HTML = "text/html; charset=utf-8";
const LD = "application/ld+json";
const JSON_T = "application/json";
const MD = "text/markdown; charset=utf-8";
const TXT = "text/plain; charset=utf-8";

/* The complete set of media types `/fonts/` may serve. A font binary is not
   text and must never be labelled as one; anything not named here is a 404. */
const FONT_TYPE = { ".woff2": "font/woff2", ".txt": TXT };

/* ── Accept ───────────────────────────────────────────────────────────────── */

/**
 * Parse Accept into matchers, then pick the best offer.
 *
 * Specificity matters as well as q, and that is what makes `*​/*` (curl) return
 * the page while `application/ld+json, application/json` (jsonld.js, verbatim,
 * with no q-values) returns the document. A tie goes to the first offer, and
 * the first offer is always the human page.
 *
 *   browser  text/html,...,*​/*;q=0.8      -> html   (1, exact) beats (0.8, any)
 *   jsonld   application/ld+json, ...     -> ld+json (1, exact) beats (0, absent)
 *   curl     *​/*                          -> html   tie on (1, any), offer order
 *   ext      text/html, ld+json;q=0.1     -> html   (1, exact) beats (0.1, exact)
 */
function pick(accept, offers) {
  if (!accept) return offers[0];
  const parts = String(accept)
    .split(",")
    .map((s) => {
      const bits = s.trim().split(";");
      const type = bits.shift().trim().toLowerCase();
      let q = 1;
      for (const b of bits) {
        const m = /^\s*q\s*=\s*([0-9.]+)/i.exec(b);
        if (m) q = parseFloat(m[1]);
      }
      return { type, q: q === q ? q : 1 };
    })
    .filter((p) => p.q > 0);

  const score = (type) => {
    const [t] = type.split("/");
    let best = null;
    for (const p of parts) {
      let spec = 0;
      if (p.type === type) spec = 3;
      else if (p.type === t + "/*") spec = 2;
      else if (p.type === "*/*") spec = 1;
      else continue;
      if (!best || p.q > best.q || (p.q === best.q && spec > best.spec)) {
        best = { q: p.q, spec: spec };
      }
    }
    return best;
  };

  let win = null;
  for (const o of offers) {
    let s = null;
    for (const type of o.accepts) {
      const c = score(type);
      if (c && (!s || c.q > s.q || (c.q === s.q && c.spec > s.spec))) s = c;
    }
    if (!s) continue;
    if (!win || s.q > win.s.q || (s.q === win.s.q && s.spec > win.s.spec)) {
      win = { o: o, s: s };
    }
  }
  return win ? win.o : offers[0];
}

const OFFER_HTML = { id: "html", accepts: ["text/html", "application/xhtml+xml"] };
const OFFER_LD = { id: "ld", accepts: ["application/ld+json", "application/json"] };
const OFFER_MD = { id: "md", accepts: ["text/markdown", "text/x-markdown"] };
const THREE = [OFFER_HTML, OFFER_LD, OFFER_MD];

/* ── the ld+json refusal body ─────────────────────────────────────────────── */

function refusal(name, description) {
  return JSON.stringify(
    {
      "@context": { schema: "https://schema.org/" },
      "schema:name": name,
      "schema:description": description,
    },
    null,
    2
  ) + "\n";
}

/* ── the asset server ─────────────────────────────────────────────────────── */

async function asset(env, url, pathname) {
  const u = new URL(url);
  u.pathname = pathname;
  u.search = "";
  return env.ASSETS.fetch(new Request(u.toString(), { method: "GET" }));
}

async function assetText(env, url, pathname) {
  const res = await asset(env, url, pathname);
  if (!res.ok) return null;
  return res.text();
}

/**
 * Serve a fixed asset as itself, or 404 if it is not there.
 *
 * The one thing this must never do is hand back `respond(null, 200, type)`:
 * that is a 200 with the right media type and zero bytes, and a JSON-LD
 * processor binding this address would fail with a PARSE error where it should
 * have failed with a FETCH error. A less diagnosable failure than the one this
 * worker exists to remove is not an acceptable failure mode.
 *
 * Unreachable today — the build gates assert provenance and the full file
 * count, so every path below is present in `public/` or the build stopped.
 * Guarded anyway, because "unreachable" is a property of the build, and the
 * worker is deployed independently of it.
 *
 * Recursion is bounded: `notFound` reads `/404.html` through `assetText` and
 * carries its own inline fallback body, so it never re-enters this helper.
 */
async function serve(env, url, accept, pathname, type, extra) {
  const body = await assetText(env, url, pathname);
  if (body == null) return notFound(env, url, accept);
  return respond(body, 200, type, extra);
}

/* ── 404s ─────────────────────────────────────────────────────────────────── */

const SUGGEST = "<!--SUGGEST-->";

async function notFound(env, url, accept, opts) {
  const o = opts || {};
  const choice = pick(accept, [OFFER_HTML, OFFER_LD]);
  if (choice.id === "ld") {
    return respond(
      refusal(o.ldName || "Not found",
              o.ldDesc || "No such term or document in this profile."),
      404, LD, { vary: "Accept" }
    );
  }
  let body = await assetText(env, url, o.page || "/404.html");
  if (body == null) body = "<!doctype html><title>Not found</title>";
  /* the one dynamic slot on the whole site */
  const line = o.suggest
    ? '<p class="dsug">Did you mean <a class="term" href="/' + o.suggest + '">/' +
      o.suggest + "</a>?</p>"
    : "";
  body = body.replace(SUGGEST, line);
  return respond(body, 404, HTML, { vary: "Accept" });
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get("accept");
    let p = url.pathname;

    /* ── methods ──────────────────────────────────────────────────────────── */

    if (request.method === "OPTIONS") {
      /* The preflight a browser JSON-LD processor sends before it may add
         `Accept: application/ld+json`. The sibling worker answers 405 to every
         non-GET method; copied unchanged that breaks every browser-based
         binder, so it is changed here. */
      return new Response(null, {
        status: 204,
        headers: {
          ...SEC,
          "access-control-allow-methods": "GET, HEAD, OPTIONS",
          "access-control-allow-headers": "Accept",
          "access-control-max-age": "86400",
        },
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, {
        status: 405,
        headers: { ...SEC, allow: "GET, HEAD, OPTIONS" },
      });
    }

    /* ── trailing slash ───────────────────────────────────────────────────── */

    if (p.length > 1 && p.endsWith("/")) {
      const to = p.replace(/\/+$/, "") || "/";
      return new Response(null, {
        status: 308,
        headers: { ...SEC, location: to + url.search },
      });
    }

    /* ── the internal namespace is never reachable from outside ───────────── */

    if (p.startsWith("/t/")) return notFound(env, url, accept);

    /* ── the binding string itself ────────────────────────────────────────── */

    if (p === "/") {
      const choice = pick(accept, THREE);
      if (choice.id === "ld") {
        return serve(env, url, accept, "/context.jsonld", LD, { vary: "Accept" });
      }
      if (choice.id === "md") {
        return serve(env, url, accept, "/index.md", MD, { vary: "Accept" });
      }
      /* The second, independent path to the document, and the one schema.org
         itself uses: jsonld.js follows an alternate link even when it never
         negotiated. A processor now succeeds whether it negotiates or not.
         Emitted on the HTML representation of `/` only — a term page
         negotiates on its own URL and embeds its own graph, so an alternate
         link there would cost a second request for nothing. */
      return serve(env, url, accept, "/index.html", HTML, {
        vary: "Accept",
        link: "<" + HOST + '/context.jsonld>; rel="alternate"; type="application/ld+json"',
      });
    }

    /* ── the three machine documents, served as themselves ────────────────── */

    if (p === "/context.jsonld") {
      return serve(env, url, accept, "/context.jsonld", LD);
    }
    if (p === "/profile.json") {
      return serve(env, url, accept, "/profile.json", JSON_T);
    }
    if (p === "/overlays/startups.studio/context.jsonld") {
      return serve(env, url, accept, "/overlays/startups.studio/context.jsonld", LD);
    }

    /* ── /profile · the census.
       It exists because profile.json declares $id https://schema.org.ai/profile,
       and an identifier that 404s is a broken promise. ─────────────────────── */

    if (p === "/profile") {
      const choice = pick(accept, THREE);
      if (choice.id === "ld") {
        return serve(env, url, accept, "/profile.json", JSON_T, { vary: "Accept" });
      }
      if (choice.id === "md") {
        return serve(env, url, accept, "/t/x-profile.md", MD, { vary: "Accept" });
      }
      return serve(env, url, accept, "/t/x-profile.html", HTML, { vary: "Accept" });
    }

    /* ── plain files ──────────────────────────────────────────────────────── */

    if (p === "/llms.txt") return serve(env, url, accept, "/llms.txt", TXT);
    if (p === "/robots.txt") return serve(env, url, accept, "/robots.txt", TXT);
    if (p === "/sitemap.xml") {
      return serve(env, url, accept, "/sitemap.xml", "application/xml; charset=utf-8");
    }
    if (p === "/og.png") {
      const res = await asset(env, url, "/og.png");
      if (!res.ok) return notFound(env, url, accept);
      return respond(res.body, 200, "image/png");
    }
    /* Today `public/fonts/` holds exactly one file — the OFL licence text. The
       face itself is inlined as a data: URI in the stylesheet, which is what
       the one-request law rests on. Switch on the extension anyway rather than
       hard-coding text/plain for the whole prefix: the sibling recipe ships a
       .woff2 here, and a byte-budget lever could put one here later. Served as
       text/plain AND pinned immutable for a year, that break would be silent
       and would not be recoverable by a redeploy. An extension this branch does
       not name is a 404, not a guess. */
    if (p.startsWith("/fonts/")) {
      const dot = p.lastIndexOf(".");
      const type = dot > -1 ? FONT_TYPE[p.slice(dot).toLowerCase()] : undefined;
      if (!type) return notFound(env, url, accept);
      const res = await asset(env, url, p);
      if (!res.ok) return notFound(env, url, accept);
      /* the immutable year is gated on a successful response as well as on the
         path: a miss under /fonts/ pinned for a year is not recoverable. */
      return respond(res.body, 200, type, {
        "cache-control": "public, max-age=31536000, immutable",
      });
    }

    /* ── /releases/* · reserved, and empty ────────────────────────────────── */

    if (p === "/releases" || p.startsWith("/releases/")) {
      return notFound(env, url, accept, {
        page: "/t/e-releases.html",
        ldName: "No snapshot has been cut",
        ldDesc:
          "This path is reserved for snapshots a document can pin to by choice. " +
          "None has been cut. The address itself has no version in it and never will.",
      });
    }

    /* ── the 64 terms ─────────────────────────────────────────────────────── */

    const name = p.slice(1);
    if (STEM.has(name)) {
      const stem = "/t/" + STEM.get(name);
      const choice = pick(accept, THREE);
      if (choice.id === "ld") {
        /* the class or the property, and not our page metadata: a machine
           asking for the term's address wants the term. */
        return serve(env, url, accept, stem + ".jsonld", LD, { vary: "Accept" });
      }
      if (choice.id === "md") {
        return serve(env, url, accept, stem + ".md", MD, { vary: "Accept" });
      }
      return serve(env, url, accept, stem + ".html", HTML, { vary: "Accept" });
    }

    /* ── the refused name ─────────────────────────────────────────────────── */

    /* 404 and not 410: 410 asserts the resource existed and was removed. This
       name was ruled out at admission and never had an address. */
    if (name === "Business") {
      return notFound(env, url, accept, {
        page: "/t/e-refused.html",
        ldName: "Business is not a term here",
        ldDesc:
          "Ruled out at admission (Nathan, org.ai#11, 2026-07-18). Company carries " +
          "the referent. A builder reaching for Business types Company: " +
          HOST + "/Company",
      });
    }

    /* ── everything else ──────────────────────────────────────────────────── */

    /* IRIs are case-sensitive strings and https://schema.org.ai/Agent is the
       ratified one, so /agent is not an alias for it — a case-insensitive
       route would mint a second address for the same term. The body may point
       at the right one; the status stays 404. */
    const suggest = /^[A-Za-z]+$/.test(name) ? CASE.get(name.toLowerCase()) : null;
    return notFound(env, url, accept, {
      suggest: suggest && suggest !== name ? suggest : null,
      ldDesc: suggest && suggest !== name
        ? "No such term. Term names are case-sensitive; this profile spells it " + suggest + "."
        : "No such term or document in this profile.",
    });
  },
};
