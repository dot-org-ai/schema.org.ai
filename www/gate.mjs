/**
 * The validation gate.
 *
 *   npm run gate                       offline, against ./public
 *   npm run gate -- --live https://…   the same assertions against a real origin
 *
 * Offline it runs with a document loader that maps https://schema.org.ai to the
 * built public/context.jsonld. Live it uses jsonld.js's own network loader, so
 * G1 becomes the real thing: the exact call that throws
 * `jsonld.InvalidUrl: invalid remote context` against the origin today, and
 * which this deploy exists to make succeed.
 *
 * Every example rendered on any page is executed here. A vocabulary site that
 * publishes an example whose data evaporates is worse than one that publishes
 * none, so a dropped key fails the build rather than reaching a reader.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import jsonld from "jsonld";
import YAML from "yaml";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "public");
const BIND = "https://schema.org.ai";

const argv = process.argv.slice(2);
const liveAt = argv.includes("--live") ? argv[argv.indexOf("--live") + 1] || BIND : null;

let pass = 0;
const failures = [];
const ok = (id, what) => { pass++; console.log("  ✓ " + id.padEnd(5) + what); };
const bad = (id, what, why) => {
  failures.push(id + "  " + what + "\n        " + why);
  console.log("  ✗ " + id.padEnd(5) + what + "\n        " + why);
};

/* ── the loader ───────────────────────────────────────────────────────────── */

const ctxDoc = JSON.parse(fs.readFileSync(path.join(OUT, "context.jsonld"), "utf8"));
const netLoader = jsonld.documentLoaders.node();

/* In --live mode the loader points the binding string AT THE ORIGIN UNDER TEST,
   so a staging host is exercised by the same assertions as production. Against
   the real https://schema.org.ai the two are the same URL and nothing is
   rewritten. */
const loader = liveAt
  ? async (url) => {
      if (url === BIND || url === BIND + "/") return netLoader(liveAt + "/");
      return netLoader(url);
    }
  : async (url) => {
      if (url === BIND || url === BIND + "/") {
        return { contextUrl: null, document: ctxDoc, documentUrl: url };
      }
      if (url.startsWith("https://schema.org")) {
        /* the profile never dereferences schema.org's own context in these
           assertions; a stub keeps the gate offline and deterministic */
        return { contextUrl: null, document: { "@context": {} }, documentUrl: url };
      }
      return netLoader(url);
    };

const expand = (doc) => jsonld.expand(doc, { documentLoader: loader });
const canonize = (doc) =>
  jsonld.canonize(doc, {
    algorithm: "URDNA2015",
    format: "application/n-quads",
    documentLoader: loader,
  });

/* ── the built documents ──────────────────────────────────────────────────── */

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(p);
  }
})(OUT);

const htmlFiles = files.filter((f) => f.endsWith(".html"));
const unesc = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/** every code specimen on the site, grouped into its three serializations */
function specimens(html) {
  const out = [];
  const re = /<p class="rec-l">([^<]+)<\/p><pre class="rec-t">([\s\S]*?)<\/pre>/g;
  let m, cur = {};
  while ((m = re.exec(html)) !== null) {
    const label = m[1].trim();
    const body = unesc(m[2]);
    if (label === "JSON-LD") cur = { json: body };
    else if (label === "YAML-LD") cur.yaml = body;
    else if (label === "MDXLD") {
      cur.mdx = body;
      if (cur.json && cur.yaml) out.push(cur);
      cur = {};
    }
  }
  return out;
}

/** every key a specimen writes, at every depth, minus the JSON-LD keywords */
function keysOf(o, acc = []) {
  if (Array.isArray(o)) { o.forEach((v) => keysOf(v, acc)); return acc; }
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) { acc.push(k); keysOf(o[k], acc); }
  }
  return acc;
}

/** every IRI the expansion kept, at every depth */
function iris(o, acc = new Set()) {
  if (Array.isArray(o)) { o.forEach((v) => iris(v, acc)); return acc; }
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) {
      if (k !== "@value") acc.add(k);
      if (k === "@type" || k === "@id") {
        for (const v of [].concat(o[k])) acc.add(v);
      }
      iris(o[k], acc);
    }
  }
  return acc;
}

/* ═══ the gates ═════════════════════════════════════════════════════════════ */

console.log("\nschema.org.ai · validation gate" + (liveAt ? "  [--live " + liveAt + "]" : "  [offline]") + "\n");

/* G0 — provenance is asserted in build.js, where the copy happens. */

/* G1 · the remote bind. THE artefact whose absence mdxld.org names. */
try {
  const base = liveAt || BIND;
  const r = await expand({
    "@context": base,
    "$id": "https://ex.test/a",
    "$type": "Agent",
  });
  const t = r[0] && r[0]["@type"] && r[0]["@type"][0];
  if (t === "https://schema.org.ai/Agent") {
    ok("G1", "the binding string dereferences and $type resolves to " + t);
  } else {
    bad("G1", "the binding string dereferences", "expected schemaai:Agent, got " + t);
  }
} catch (e) {
  bad("G1", "the binding string dereferences", e.message);
}

/* G1b · the alternate-link path — live only, and the way schema.org itself
   publishes its context. */
if (liveAt) {
  try {
    const res = await fetch(liveAt + "/", { headers: { accept: "text/html" } });
    const link = res.headers.get("link") || "";
    if (/rel="?alternate"?/.test(link) && link.includes("application/ld+json")) {
      ok("G1b", "the HTML representation advertises the alternate link");
    } else {
      bad("G1b", "the HTML representation advertises the alternate link", "link: " + link);
    }
  } catch (e) { bad("G1b", "alternate link", e.message); }
}

/* G2 · no silent drop, over EVERY example rendered on the site.
   The example mdxld.org publishes today fails this by design and is barred:
   `title`, `author` and the nested `name` are undefined in the profile and
   every conforming processor drops them. */
{
  let checked = 0, dropped = [];
  for (const f of htmlFiles) {
    const html = fs.readFileSync(f, "utf8");
    for (const s of specimens(html)) {
      checked++;
      const doc = JSON.parse(s.json);
      const want = keysOf(doc).filter((k) => k[0] !== "@" && k !== "$id" && k !== "$type");
      let got;
      try { got = iris(await expand(doc)); }
      catch (e) { dropped.push(path.relative(OUT, f) + ": " + e.message); continue; }
      for (const k of want) {
        const iri = k.startsWith("schema:")
          ? "https://schema.org/" + k.slice(7)
          : "https://schema.org.ai/" + k;
        if (!got.has(iri)) dropped.push(path.relative(OUT, f) + ": " + k);
      }
      for (const banned of ["title", "author"]) {
        if (s.json.includes('"' + banned + '"')) {
          dropped.push(path.relative(OUT, f) + ": ships the barred key " + banned);
        }
      }
    }
  }
  if (!checked) bad("G2", "every rendered example survives expansion", "no specimen found");
  else if (dropped.length) bad("G2", "every rendered example survives expansion", dropped.slice(0, 6).join("; "));
  else ok("G2", checked + " specimens expand with zero silently dropped keys");
}

/* G3 · YAML-LD parses, and parses `schema:name` as ONE key (YAML requires
   colon-space as the separator, which is why the prefix form is safe). */
{
  let n = 0, err = null;
  for (const f of htmlFiles) {
    for (const s of specimens(fs.readFileSync(f, "utf8"))) {
      try {
        const y = YAML.parse(s.yaml);
        if (!("@context" in y)) throw new Error("no @context key after parse");
        if (Object.keys(y).some((k) => k.includes(": "))) throw new Error("a prefixed key split");
        n++;
      } catch (e) { err = path.relative(OUT, f) + ": " + e.message; }
    }
  }
  err ? bad("G3", "every YAML-LD block parses", err) : ok("G3", n + " YAML-LD blocks parse");
}

/* G4 · the MDXLD rename is EXACTLY ONE KEY, at the top level. Nested $id and
   $type are never renamed; they are resolved by the aliases the served context
   declares. */
{
  let n = 0, err = null;
  for (const f of htmlFiles) {
    for (const s of specimens(fs.readFileSync(f, "utf8"))) {
      try {
        const fm = /^---\n([\s\S]*?)\n---$/.exec(s.mdx.trim());
        if (!fm) throw new Error("frontmatter fences missing");
        const y = YAML.parse(fm[1]);
        const keys = Object.keys(y);
        if (!keys.includes("$context")) throw new Error("no $context key");
        if (keys.includes("@context")) throw new Error("already carries @context");
        const renamed = { "@context": y.$context };
        for (const k of keys) if (k !== "$context") renamed[k] = y[k];
        const before = JSON.stringify(YAML.parse(s.yaml));
        if (JSON.stringify(renamed) !== before) throw new Error("rename did not reproduce the YAML-LD");
        n++;
      } catch (e) { err = path.relative(OUT, f) + ": " + e.message; }
    }
  }
  err ? bad("G4", "the $context rename touches exactly one key", err)
      : ok("G4", n + " MDXLD blocks rename exactly one key");
}

/* G5 · round-trip identity. If the three ever stop producing the same RDF the
   build stops rather than the page saying they do. */
{
  let n = 0, err = null;
  for (const f of htmlFiles) {
    for (const s of specimens(fs.readFileSync(f, "utf8"))) {
      try {
        const j = JSON.parse(s.json);
        const y = YAML.parse(s.yaml);
        const fm = YAML.parse(/^---\n([\s\S]*?)\n---$/.exec(s.mdx.trim())[1]);
        const m = { "@context": fm.$context };
        for (const k of Object.keys(fm)) if (k !== "$context") m[k] = fm[k];
        const [a, b, c] = await Promise.all([canonize(j), canonize(y), canonize(m)]);
        if (a !== b || b !== c) throw new Error("the three do not canonize alike");
        if (!a.trim()) throw new Error("canonized to nothing");
        n++;
      } catch (e) { err = path.relative(OUT, f) + ": " + e.message; }
    }
  }
  err ? bad("G5", "JSON-LD = YAML-LD = MDXLD under URDNA2015", err)
      : ok("G5", n + " specimens canonize to byte-identical N-Quads across all three");
}

/* G6 · the term-page graph: two nodes, and the class is not the page. */
{
  const termPages = htmlFiles.filter((f) => /\/t\/[cp]-/.test(f));
  let n = 0, err = null;
  for (const f of termPages) {
    const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(
      fs.readFileSync(f, "utf8")
    );
    if (!m) { err = path.relative(OUT, f) + ": no embedded graph"; break; }
    try {
      const g = await expand(JSON.parse(unesc(m[1])));
      if (g.length !== 2) throw new Error("expanded to " + g.length + " nodes, expected 2");
      if (g[0]["@id"] === g[1]["@id"]) throw new Error("the class and the page share an @id");
      n++;
    } catch (e) { err = path.relative(OUT, f) + ": " + e.message; break; }
  }
  err ? bad("G6", "every term page's JSON-LD expands to two distinct nodes", err)
      : ok("G6", n + " term pages expand to a class node and a distinct page node");
}

/* G6b · the homepage graph, and the reason it has to exist.
   Every term page asserts `schema:isPartOf` -> https://schema.org.ai/#website.
   If nothing on this site ever defines that IRI, the published graph ships a
   dangling reference. So this gate does not merely check that the landing
   carries a graph: it resolves every isPartOf target the 64 term pages emit
   against the set of subjects the homepage defines, and fails if one of them
   points at nothing.
   It also asserts the vocabulary node at the bare binding string with its
   licence and its basis, which is the machine-readable half of the dual-licence
   honesty note (machine doc §4.3) — CC BY-SA 4.0 ours, CC BY-SA 3.0 the work it
   extends. Without it, that statement exists only in prose. */
{
  const CC4 = "https://creativecommons.org/licenses/by-sa/4.0/";
  const S = "https://schema.org/";
  const home = path.join(OUT, "index.html");
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(
    fs.readFileSync(home, "utf8")
  );
  let err = null, subjects = new Set();
  if (!m) err = "index.html carries no embedded graph";
  else {
    try {
      const g = await expand(JSON.parse(unesc(m[1])));
      for (const node of g) if (node["@id"]) subjects.add(node["@id"]);
      const site = g.find((n) => n["@id"] === BIND + "/#website");
      if (!site) throw new Error("no schema:WebSite at " + BIND + "/#website");
      if (!(site["@type"] || []).includes(S + "WebSite")) throw new Error("#website is not a schema:WebSite");
      const vocab = g.find((n) => n["@id"] === BIND);
      if (!vocab) throw new Error("no node for the vocabulary at " + BIND);
      const lic = (vocab[S + "license"] || [])[0];
      if (!lic || lic["@id"] !== CC4) throw new Error("the vocabulary node does not carry CC BY-SA 4.0");
      const basis = (vocab[S + "isBasedOn"] || [])[0];
      if (!basis || basis["@id"] !== "https://schema.org") {
        throw new Error("the vocabulary node is not schema:isBasedOn https://schema.org");
      }
    } catch (e) { err = "index.html: " + e.message; }
  }
  /* the dangling-reference check, run over the real emissions */
  if (!err) {
    const dangling = new Set();
    for (const f of htmlFiles.filter((x) => /\/t\/[cp]-/.test(x))) {
      const t = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(
        fs.readFileSync(f, "utf8")
      );
      if (!t) continue;
      for (const node of await expand(JSON.parse(unesc(t[1])))) {
        for (const ref of node[S + "isPartOf"] || []) {
          if (ref["@id"] && !subjects.has(ref["@id"])) dangling.add(ref["@id"]);
        }
      }
    }
    if (dangling.size) err = "term pages point at undefined " + [...dangling].join(", ");
  }
  err ? bad("G6b", "the homepage defines the graph the term pages point into", err)
      : ok("G6b", "index.html defines #website and the vocabulary work; no term page's isPartOf dangles");
}

/* G7 · shadow fidelity: the marker survives expansion, and no lineage edge is
   ever emitted for a shadow. Event carries a ratified lineage VETO. */
{
  const profile = JSON.parse(fs.readFileSync(path.join(OUT, "profile.json"), "utf8"));
  const shadows = profile.buckets.native.filter((r) => r.shadows);
  let err = null;
  for (const s of shadows) {
    const f = path.join(OUT, "t", "c-" + s.term + ".jsonld");
    const g = await expand(JSON.parse(fs.readFileSync(f, "utf8")));
    const node = g[0];
    const mark = node["https://schema.org.ai/shadows"];
    if (!mark || mark[0]["@id"] !== s.shadows) { err = s.term + ": shadow marker missing"; break; }
    if (node["http://www.w3.org/2000/01/rdf-schema#subClassOf"]) {
      err = s.term + ": emits a subClassOf edge, inverting a ratified lineage veto"; break;
    }
  }
  err ? bad("G7", "the shadows mark and never claim lineage", err)
      : ok("G7", shadows.length + " shadows emit schemaai:shadows and no subClassOf");
}

/* G8 · borrow fidelity, precisely.
   `https://schema.org.ai/Person` is legitimate as the address of OUR PAGE — a
   different resource from the class, canonicalising to itself. What must never
   happen is that address being asserted or printed as the TERM's identifier.
   So the gate reads the served graphs and the printed addresses, not raw text. */
{
  const profile = JSON.parse(fs.readFileSync(path.join(OUT, "profile.json"), "utf8"));
  const borrow = new Set(profile.buckets.borrow.map((b) => b.term));
  const hits = [];
  for (const b of profile.buckets.borrow) {
    const g = JSON.parse(fs.readFileSync(path.join(OUT, "t", "c-" + b.term + ".jsonld"), "utf8"));
    const id = g["@graph"][0]["@id"];
    if (id !== b.iri) hits.push("t/c-" + b.term + ".jsonld asserts " + id);
    const defBy = g["@graph"][0]["rdfs:isDefinedBy"];
    if (!defBy || defBy["@id"] !== "https://schema.org") {
      hits.push(b.term + ": isDefinedBy is not schema.org");
    }
  }
  for (const f of htmlFiles) {
    const body = fs.readFileSync(f, "utf8");
    const re = /<(?:span|p) class="(?:iri|taddr|addr)">([^<]*)<\/(?:span|p)>/g;
    let m;
    while ((m = re.exec(body)) !== null) {
      const local = m[1].replace("https://schema.org.ai/", "");
      if (m[1] !== local && borrow.has(local)) {
        hits.push(path.relative(OUT, f) + " prints " + m[1]);
      }
    }
  }
  hits.length ? bad("G8", "no borrowed term is re-homed under our domain", hits.slice(0, 5).join("; "))
              : ok("G8", borrow.size + " borrowed terms keep schema.org's address, in every graph and every printed row");
}

/* G9 · profile closure: the set of term pages is exactly the derived set. */
{
  const ctxKeys = Object.keys(ctxDoc["@context"]).filter(
    (k) => !["$id", "$type", "@version", "schema", "schemaai"].includes(k)
  );
  const built = files
    .filter((f) => /\/t\/[cp]-[^/]+\.html$/.test(f))
    .map((f) => path.basename(f).replace(/^[cp]-/, "").replace(/\.html$/, ""));
  const missing = ctxKeys.filter((k) => !built.includes(k));
  const extra = built.filter((b) => !ctxKeys.includes(b));
  missing.length || extra.length
    ? bad("G9", "term pages == the served profile, exactly",
          "missing " + missing.join(",") + " extra " + extra.join(","))
    : ok("G9", built.length + " term pages, one per key of the served @context, no more");
}

/* G13 · hygiene, re-asserted over the artefact */
{
  const problems = [];
  for (const f of htmlFiles) {
    const body = fs.readFileSync(f, "utf8");
    const rel = path.relative(OUT, f);
    if (!body.startsWith("<!doctype html>")) problems.push(rel + ": no doctype");
    if (body.indexOf('<meta charset="utf-8">') > 1024) problems.push(rel + ": charset outside the sniff window");
    if (/<link rel="canonical" href="https:\/\/schema\.org\.ai\/">/.test(body) && rel !== "index.html") {
      problems.push(rel + ": canonicalises to the homepage");
    }
  }
  problems.length ? bad("G13", "doctype, charset, canonical", problems.slice(0, 5).join("; "))
                  : ok("G13", htmlFiles.length + " documents carry a doctype, an early charset and a self canonical");
}

/* ── live only ────────────────────────────────────────────────────────────── */

if (liveAt) {
  const probe = async (p, accept) =>
    fetch(liveAt + p, { headers: accept ? { accept } : {}, redirect: "manual" });

  const BROWSER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
  const JSONLD = "application/ld+json, application/json";

  /* G11 · the negotiation matrix, replayed with the three real-world headers */
  {
    const rows = [
      ["/", BROWSER, 200, "text/html"],
      ["/", JSONLD, 200, "application/ld+json"],
      ["/", "*/*", 200, "text/html"],
      ["/Agent", BROWSER, 200, "text/html"],
      ["/Agent", JSONLD, 200, "application/ld+json"],
      ["/Agent", "text/markdown", 200, "text/markdown"],
      ["/context.jsonld", "*/*", 200, "application/ld+json"],
      ["/profile", JSONLD, 200, "application/json"],
      ["/agent", BROWSER, 404, "text/html"],
      ["/Business", BROWSER, 404, "text/html"],
      ["/releases/01", BROWSER, 404, "text/html"],
      ["/t/c-Agent.html", BROWSER, 404, "text/html"],
    ];
    const problems = [];
    for (const [p, a, status, ct] of rows) {
      const r = await probe(p, a);
      const got = (r.headers.get("content-type") || "").split(";")[0].trim();
      if (r.status !== status) problems.push(p + " [" + a.slice(0, 24) + "] status " + r.status);
      else if (got !== ct) problems.push(p + " [" + a.slice(0, 24) + "] " + got);
      if (got === "application/ld+json" && (r.headers.get("content-type") || "").includes("charset")) {
        problems.push(p + ": charset on application/ld+json");
      }
    }
    problems.length ? bad("G11", "the negotiation matrix", problems.join("; "))
                    : ok("G11", rows.length + " negotiation rows return the right status and media type");
  }

  /* G4.4 · the one printed command, run.
     The site prints exactly one shell command and defends the exception on the
     ground that it is checkable. So it is checked: the line is lifted verbatim
     out of the built index.html, its origin swapped for the one under test, and
     handed to /bin/sh unaltered. A typographic quote is not a shell quote
     character, so a curled version of this line fails here rather than in a
     reader's terminal. */
  {
    const home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
    const m = /<p class="cmd[^"]*">([\s\S]*?)<\/p>/.exec(home);
    if (!m) bad("G4.4", "the printed command runs", "no command found in index.html");
    else {
      const printed = unesc(m[1]);
      const cmd = printed.replace(BIND, liveAt);
      try {
        /* stderr is piped, not inherited: curl's progress meter is not this
           gate's output, and on failure it is the message. */
        const out = execFileSync("/bin/sh", ["-c", cmd], {
          encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"],
        });
        const doc = JSON.parse(out);
        if (!doc["@context"]) throw new Error("the body carries no @context");
        ok("G4.4", "`" + printed + "` runs and returns the context document");
      } catch (e) {
        bad("G4.4", "the printed command runs",
            printed + "\n        " + (e.stderr || "").trim() + " " + e.message);
      }
    }
  }

  /* G12 · CORS */
  {
    const pre = await fetch(liveAt + "/", { method: "OPTIONS" });
    const get = await probe("/", JSONLD);
    const problems = [];
    if (pre.status !== 204) problems.push("OPTIONS " + pre.status);
    if (!/Accept/i.test(pre.headers.get("access-control-allow-headers") || "")) problems.push("no allow-headers: Accept");
    if (get.headers.get("access-control-allow-origin") !== "*") problems.push("no allow-origin");
    if (!/Link/i.test(get.headers.get("access-control-expose-headers") || "")) problems.push("no expose-headers: Link");
    problems.length ? bad("G12", "CORS", problems.join("; ")) : ok("G12", "preflight 204, allow-origin *, expose Link");
  }

  /* G16 · no cookies. The incumbent sets a two-year `_id` from an upstream
     analytics layer; if it survives the route change the route is not ours. */
  {
    const r = await probe("/", BROWSER);
    r.headers.get("set-cookie")
      ? bad("G16", "no cookie on any response", r.headers.get("set-cookie"))
      : ok("G16", "no Set-Cookie");
  }

  /* Vary */
  {
    const r = await probe("/", BROWSER);
    /vary/i.test([...r.headers.keys()].join(",")) && /accept/i.test(r.headers.get("vary") || "")
      ? ok("Vary", "the negotiated routes send Vary: Accept")
      : bad("Vary", "the negotiated routes send Vary: Accept", "vary: " + r.headers.get("vary"));
  }
}

/* ═══ ═════════════════════════════════════════════════════════════════════ */

console.log("\n  " + pass + " passed, " + failures.length + " failed\n");
if (failures.length) process.exit(1);
