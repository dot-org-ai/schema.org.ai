/**
 * schema.org.ai — the build.
 *
 *   src/    is authored and is what a human edits (styles, script, share card).
 *   build/  is authored and is what turns three generated documents into pages.
 *   public/ is generated and is what wrangler serves.
 *
 * "Not a CDN, not a same-origin subresource: one HTTP request for the entire
 * site." One document. One inline <style>. One inline <script>. One base64
 * font. One data-URI favicon.
 *
 * Nothing outside www/ is written. The repository around this directory is the
 * vocabulary and its generator; this is a serving surface, not a second
 * generator. The three machine documents are COPIED from site/public/ and their
 * sha256 is asserted, so a regenerated profile fails the build loudly instead of
 * shipping stale.
 *
 * `node build.js --og` re-renders src/og.png from src/og-card.html with headless
 * Chrome, with the working directory at src/ because the card's @font-face path
 * is relative on purpose. Ordinary builds only copy the committed PNG.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const esbuild = require("esbuild");

const model_ = require("./build/model");
const pages = require("./build/pages");
const text = require("./build/text");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public");
const VOCAB = path.resolve(ROOT, "..");

/* Gate 14 / G15: foundation's ceiling, UNCHANGED. A ceiling that moves whenever
   a build approaches it is not a gate. The levers are named in
   soa-design-content §13.1, and copy is never one of them. */
const CEILING = 90 * 1024;

/* ── G0 · provenance ──────────────────────────────────────────────────────── */

/**
 * The three artefacts, and the sha256 each carried on origin/main when this
 * site was built against it. If the generator regenerates the profile, these
 * stop matching and the build stops, rather than serving a page that disagrees
 * with the document beside it.
 *
 * To adopt a regenerated profile: re-read the vocabulary, re-run the gate,
 * update the hash IN THE SAME CHANGE as the copy. Never the hash alone.
 */
const ARTEFACTS = [
  ["site/public/context.jsonld", "context.jsonld",
   "3588af713e7c6e83b5d3fe0cb49768b24f8cfc4d1a05646399fbd5b49600f901"],
  ["site/public/profile.json", "profile.json",
   "257a030ad1bd292699385e9a19d16078ca9f281254b49aab45b99377fa45875a"],
  ["site/public/overlays/startups.studio/context.jsonld",
   "overlays/startups.studio/context.jsonld",
   "29c03a48a220e3fb56317ead245d8b9db8aed5dc4a285e22623e61b5cee67eab"],
];

const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

/* ── the OG card, rendered only when asked ────────────────────────────────── */

if (process.argv.includes("--og")) {
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  /* cwd: SRC. The card's font path is relative, and an absolute one falls back
     silently to the system face and ships the card in the wrong typeface. */
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--screenshot=og.png",
    "og-card.html",
  ], { cwd: SRC, stdio: "inherit" });
  const png = fs.statSync(path.join(SRC, "og.png"));
  console.log("  og.png      " + String(png.size).padStart(7) + " bytes, rendered from src/og-card.html");
}

/* ── the tree ─────────────────────────────────────────────────────────────── */

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "t"), { recursive: true });
fs.mkdirSync(path.join(OUT, "fonts"), { recursive: true });
fs.mkdirSync(path.join(OUT, "overlays/startups.studio"), { recursive: true });

/* every write goes through here: it is where the case-collision gate lives */
const written = new Map();
function write(rel, body) {
  const key = rel.toLowerCase();
  if (written.has(key)) {
    /* APFS is case-insensitive and five term pairs in this profile differ only
       by case. Without the bucket prefix, public/Tool.html and public/tool.html
       are the same file and the class page is silently lost — on the
       developer's machine and in any macOS CI runner. A silent overwrite must
       be a build error. */
    throw new Error(
      "gate G10: " + rel + " collides case-insensitively with " + written.get(key)
    );
  }
  written.set(key, rel);
  const abs = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
  return Buffer.byteLength(body);
}

/* ── copy the artefacts, asserting provenance ─────────────────────────────── */

for (const [from, to, want] of ARTEFACTS) {
  const src = path.join(VOCAB, from);
  const buf = fs.readFileSync(src);
  const got = sha(buf);
  if (got !== want) {
    console.error(
      "\ngate G0 failed: " + from + "\n  expected sha256 " + want + "\n  found    sha256 " + got +
      "\nThe served profile has changed. Re-read the vocabulary, re-run `npm run gate`,\n" +
      "and update the hash in build.js in the SAME change as the copy."
    );
    process.exit(1);
  }
  write(to, buf);
}

/* ── the model ────────────────────────────────────────────────────────────── */

const model = model_.build({
  context: path.join(OUT, "context.jsonld"),
  profile: path.join(OUT, "profile.json"),
  overlay: path.join(OUT, "overlays/startups.studio/context.jsonld"),
  extensions: path.join(VOCAB, "extensions.jsonld"),
  things: path.join(VOCAB, "things"),
});

/* ── the two subresources, folded in ──────────────────────────────────────── */

const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8");

const woff2 = fs.readFileSync(path.join(SRC, "fonts/publicsans-subset.woff2"));
const fontURI = "data:font/woff2;base64," + woff2.toString("base64");

let css = read("styles.css").replace(
  /url\("\/fonts\/publicsans-subset\.woff2"\)/,
  'url("' + fontURI + '")'
);
if (css.indexOf(fontURI) === -1) {
  throw new Error("the @font-face src did not match — the font was not inlined");
}
/* @charset is only meaningful as the first bytes of an EXTERNAL stylesheet.
   Inside <style> it is an invalid at-rule browsers discard. The encoding is
   already carried twice: the document's own <meta charset> and the worker's
   Content-Type header. */
css = css.replace(/^@charset\s+"[^"]*";\s*/i, "");
css = esbuild.transformSync(css, { loader: "css", minify: true }).code.trim();

const js = esbuild
  .transformSync(read("site.js"), { loader: "js", minify: true, target: "es2017" })
  .code.trim();

const STYLE_TAG = '<link rel="stylesheet" href="/styles.css">';
const SCRIPT_TAG = '<script src="/site.js" defer></script>';

/* A FUNCTION replacer, not a string one. String.replace treats `$&`, `` $` ``
   and `$'` in the replacement as back-references, and minified JavaScript is
   full of `$`. A string replacement here silently re-inserted the very tag it
   had just removed. */
const put = (html, tag, body) => html.replace(tag, () => body);

function inline(html, name) {
  if (html.indexOf(STYLE_TAG) === -1) throw new Error(name + ": no stylesheet link to replace");
  html = put(html, STYLE_TAG, "<style>" + css + "</style>");
  if (html.indexOf(SCRIPT_TAG) !== -1) {
    html = put(html, SCRIPT_TAG, "<script>" + js + "<\/script>");
  }
  if (html.indexOf(SCRIPT_TAG) !== -1) throw new Error(name + ": the script tag survived inlining");
  return html;
}

/* ── the documents ────────────────────────────────────────────────────────── */

const docs = [];        /* [rel, bytes] for the budget gate */
const htmlDocs = [];    /* [rel, body] for the hygiene and copy gates */

function writeHtml(rel, html) {
  const body = inline(html, rel);
  docs.push([rel, write(rel, body)]);
  htmlDocs.push([rel, body]);
}

writeHtml("index.html", pages.landing(model));
write("index.md", text.landingMd(model));

writeHtml("t/x-profile.html", pages.censusPage(model));
write("t/x-profile.md", text.censusMd(model));

const nf = pages.notFoundPages(model);
writeHtml("404.html", nf["404.html"]);
writeHtml("t/e-refused.html", nf["e/refused.html"]);
writeHtml("t/e-releases.html", nf["e/releases.html"]);

for (const t of model.terms) {
  writeHtml("t/" + t.slug + ".html", pages.termPage(model, t));
  write("t/" + t.slug + ".jsonld",
    JSON.stringify(pages.termGraph(model, t, false), null, 2) + "\n");
  write("t/" + t.slug + ".md", text.termMd(model, t));
}

write("llms.txt", text.llms(model));
write("robots.txt", text.robots(model));
write("sitemap.xml", text.sitemap(model));

/* the licence travels with the face it licenses. Nothing requests it. */
fs.copyFileSync(
  path.join(SRC, "fonts/publicsans-OFL.txt"),
  path.join(OUT, "fonts/publicsans-OFL.txt")
);
/* the share card — fetched only by link unfurlers, never by the page, so the
   one-request law is untouched. */
if (fs.existsSync(path.join(SRC, "og.png"))) {
  fs.copyFileSync(path.join(SRC, "og.png"), path.join(OUT, "og.png"));
} else {
  console.warn("  ⚠ src/og.png is missing. Run `npm run og` once and commit it.");
}

/* ── the worker's term table, generated so it can never drift ─────────────── */

const table = model.terms.map((t) => [t.term, t.slug]);
fs.writeFileSync(
  path.join(ROOT, "terms.generated.js"),
  "/* GENERATED by build.js — do not edit. The worker's exact-case term table.\n" +
  "   " + table.length + " terms, derived from the copied context document. */\n" +
  "export const TERMS = " + JSON.stringify(table) + ";\n"
);

/* ═══ GATES — asserted over the BUILT artefact, never over src ═════════════ */

let failed = false;
const fail = (msg, extra) => { failed = true; console.error("  ✗ " + msg + (extra ? "\n      " + extra : "")); };

/* G10 · the 64 pages exist and none overwrote another */
const termHtml = model.terms.filter((t) => written.has(("t/" + t.slug + ".html").toLowerCase()));
if (termHtml.length !== model.terms.length) fail("gate G10: not every term page was written");

/* G8 · no borrow term is ever re-homed under our domain.
   The gate is precise on purpose. `https://schema.org.ai/Person` is legitimate
   as the address OF OUR PAGE — the page at /Person is our profile entry for a
   borrowed term, a different resource from the class, and it canonicalises to
   itself. What must never happen is the address being printed or asserted as
   the TERM's own identifier. So: the class node's @id in every served graph,
   and every address this site prints in a ledger row or on a term page. */
{
  const borrowSet = new Set(model.borrow.map((t) => t.term));
  for (const t of model.terms) {
    const g = JSON.parse(fs.readFileSync(path.join(OUT, "t", t.slug + ".jsonld"), "utf8"));
    const id = g["@graph"][0]["@id"];
    if (id !== t.iri) fail("gate G8: t/" + t.slug + ".jsonld asserts the class as " + id);
    if (borrowSet.has(t.term) && id.startsWith("https://schema.org.ai/")) {
      fail("gate G8: " + t.term + " is borrowed and its graph re-homes it");
    }
  }
  for (const [rel, body] of htmlDocs) {
    const printed = [];
    const re = /<(?:span|p) class="(?:iri|taddr|addr)">([^<]*)<\/(?:span|p)>/g;
    let m;
    while ((m = re.exec(body)) !== null) printed.push(m[1]);
    for (const a of printed) {
      const local = a.replace("https://schema.org.ai/", "");
      if (a !== local && borrowSet.has(local)) {
        fail("gate G8: " + rel + " prints " + a + " as the address of a borrowed term");
      }
    }
  }
}

/* G9 / gate 16 · profile closure.
   The names below are the open PR's ten types, the disposition table's PROPOSED
   rows and its DEFERRED rows. Not one of them is in the document this address
   serves, so not one of them may appear on any surface as a type, a heading, a
   link, a path or an og: string. This is the governance boundary compiled into
   the build. */
const FORBIDDEN = [
  "AutonomyLevel", "AssuranceTier", "DeclaredScope", "SeamClass", "DoctrineWall",
  "MinimalRiskCondition", "AutonomyClaim", "EvidenceRegister", "ObservabilityRegister",
  "Law", "Mandate", "Human", "Dataset", "Skill", "Credential", "Regulator",
  "Country", "Subdivision", "Regulation", "Location", "Jurisdiction", "Activity",
  "Software", "Formula", "Shipment", "CapitalEquipment", "Knowledge", "Ability",
  "Locale", "Trigger", "Stake", "DataSubstrate", "Document",
];
/* Every string the record itself carries, so the scan can tell OUR copy from a
   definition reproduced verbatim. A definition is a citation, not a claim. */
const RECORD = model.terms
  .map((t) => t.comment)
  .concat(model.terms.map((t) => t.lede))
  .concat([...pages.QUOTED])
  .filter(Boolean)
  /* longest first: a lede is a prefix of its comment, and removing the short
     one first would leave the long one unmatchable */
  .sort((a, b) => b.length - a.length);

/* Subtract, longest first, every string this build QUOTED from the record.
   Nothing is derived here: a string is exempt only because pages.js registered
   it as a quotation, which is what makes the exemption auditable. */
function stripRecord(body) {
  let s = body;
  for (const c of RECORD) {
    const escd = c
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    s = s.split(escd).join(" ");
    s = s.split(escd.replace(/'/g, "&#39;")).join(" ");
    s = s.split(c).join(" ");
  }
  return s;
}

const allFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else allFiles.push(p);
  }
})(OUT);

const textFiles = allFiles.filter((p) => /\.(html|md|txt|xml|jsonld|json)$/.test(p));

for (const p of textFiles) {
  const rel = path.relative(OUT, p);
  /* the three copied machine documents are the record itself and are served
     byte-for-byte; they are not our copy and are not scanned */
  if (rel === "context.jsonld" || rel === "profile.json" ||
      rel.startsWith("overlays/") || rel.startsWith("fonts/")) continue;
  const body = stripRecord(fs.readFileSync(p, "utf8"));
  for (const name of FORBIDDEN) {
    if (new RegExp("\\b" + name + "\\b").test(body)) {
      fail("gate G9: " + rel + " names " + name + ", which the served document does not carry");
    }
  }
  /* the refused name may never be an address, a link or a type anywhere */
  for (const name of model.notAdmitted) {
    if (body.indexOf('href="/' + name + '"') !== -1 ||
        body.indexOf("https://schema.org.ai/" + name) !== -1) {
      fail("gate G9: " + rel + " gives " + name + " an address. It has none and never had one.");
    }
  }
}

/* Every ledger section prints, directly beneath its rows, "Each row shows a
   definition's first sentence. The term's own page has it whole." A page that
   makes a checkable claim about itself must be checked against it, so every
   printed `.def` is re-cut here: firstSentence is idempotent on one sentence,
   so a row that survives it unchanged carries exactly one sentence-final stop
   and the aside is true. `WebPage` — "A web page." — is why this exists: it is
   shorter than any plausible minimum, and a minimum is what made the row print
   three sentences under an aside promising one.

   `[^<]*` is the scope, not an accident: it matches a reproduced definition and
   skips the refused name's row, whose `.def` carries a link and is our own
   two-sentence sentence about a name that has no definition to reproduce. */
const unesc = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
   .replace(/&#39;/g, "'").replace(/&amp;/g, "&");
for (const [rel, body] of htmlDocs) {
  for (const m of body.match(/<span class="def">[^<]*<\/span>/g) || []) {
    const def = unesc(m.slice('<span class="def">'.length, -"</span>".length));
    if (def && model_.firstSentence(def) !== def) {
      fail("the aside: " + rel + " prints a .def that is more than one sentence",
           JSON.stringify(def));
    }
  }
}

/* gate 13 · hygiene */
for (const [rel, body] of htmlDocs) {
  if (!/^<!doctype html>/i.test(body)) fail("gate 13: " + rel + " does not start <!doctype html>");
  if (body.indexOf('<meta charset="utf-8">') > 1024) fail("gate 13: " + rel + " declares its charset outside the sniff window");
  const canon = /<link rel="canonical" href="([^"]+)">/.exec(body);
  const is404 = rel === "404.html" || rel.startsWith("t/e-");
  if (is404) {
    if (canon) fail("gate 13: " + rel + " is a 404 and carries a canonical");
    if (body.indexOf('content="noindex, follow"') === -1) fail("gate 13: " + rel + " is a 404 and is not noindex");
  } else if (!canon) {
    fail("gate 13: " + rel + " has no canonical");
  } else if (canon[1] === pages.HOST + "/" && rel !== "index.html") {
    fail("gate 13: " + rel + " canonicalises to the homepage");
  }
}

/* gate 14 · one request. Zero external hosts, zero same-origin subresources. */
for (const [rel, body] of htmlDocs) {
  const refs = body.match(/(?:src|href)="([^"]*)"/g) || [];
  for (const r of refs) {
    const v = /"([^"]*)"/.exec(r)[1];
    if (/^(https?:)?\/\//.test(v)) {
      /* Our own origin written absolutely (canonical, og:url) is this host, not
         an outside one. A link a person clicks is not a subresource either:
         only the two permitted outside destinations may appear, and only as an
         <a href>. */
      if (v.startsWith(pages.HOST)) continue;
      if (!/^https:\/\/(foundation\.org\.ai|creativecommons\.org)\//.test(v)) {
        fail("gate 14: " + rel + " references the outside host " + v);
      }
    } else if (/\.(css|js|woff2?|png|svg|jpg|gif|ico)$/.test(v)) {
      fail("gate 14: " + rel + " loads the same-origin subresource " + v);
    }
  }
  if (/<link[^>]+rel="(preconnect|dns-prefetch|preload)"/.test(body)) {
    fail("gate 14: " + rel + " carries a resource hint");
  }
}

/* gate 15 · the banned constructs. Only four classes of em dash survive, and
   every one of them is QUOTED from the record, never written by us. */
for (const [rel, body] of htmlDocs) {
  const stripped = stripRecord(body);
  for (const bad of ["dashed", "dotted", "<table", "<canvas", "conic-gradient", "background-clip"]) {
    if (stripped.indexOf(bad) !== -1) fail("gate 15: " + rel + " contains " + bad);
  }
  /* the sticky nav's mask is the one linear-gradient in the system */
  const grads = (stripped.match(/linear-gradient/g) || []).length;
  if (rel === "index.html" ? grads > 2 : grads > 2) {
    fail("gate 15: " + rel + " has " + grads + " gradients; only the sticky nav's mask pair is allowed");
  }
  const em = stripped.indexOf("—");
  if (em !== -1) {
    fail("gate 15: " + rel + " carries an em dash outside a reproduced definition",
         JSON.stringify(stripped.slice(Math.max(0, em - 70), em + 40)));
  }
}

/* M6 · the record's one left edge, asserted structurally rather than sampled.
   §4.8's claim is "the same document, spelled three ways". A record is
   whitespace-significant, so any rule that reflows it can change what it says:
   a hanging indent (`padding-left` + negative `text-indent`) addresses the
   FIRST FORMATTED LINE of the block, never wrap continuations, so over hard
   newlines it outdents each record's opening line — YAML's '@context' to
   column 0 under 4ch-indented siblings, MDXLD's opening `---` away from its own
   closing `---`, JSON's `{` away from its `}`.
   The invariant "every .rec-t line box shares one left edge, at 320, 360, 390,
   430, 768 and 879 px" is not sampled at six widths here; it is proved for ALL
   widths by holding `white-space: pre` with no indentation anywhere in the
   cascade, and giving the block its own scroll container instead. A rule that
   would break the six measured widths cannot get past this gate to be
   measured. */
{
  const home = (htmlDocs.find(([rel]) => rel === "index.html") || [])[1] || "";
  const style = /<style>([\s\S]*?)<\/style>/.exec(home);
  if (!style) fail("measurement M6: the built document carries no inline stylesheet");
  else {
    let blocks = 0, scrolls = 0, m;
    const re = /([^{}@]*\.rec-t[^{},]*(?:,[^{}]*)?)\{([^{}]*)\}/g;
    while ((m = re.exec(style[1])) !== null) {
      const sel = m[1].trim(), decl = m[2];
      blocks++;
      if (/text-indent\s*:/.test(decl)) {
        fail("measurement M6: `" + sel + "` sets text-indent on a whitespace-significant record");
      }
      if (/(^|;)\s*padding(-left|-inline-start)?\s*:/.test(decl)) {
        fail("measurement M6: `" + sel + "` indents a whitespace-significant record");
      }
      const ws = /(?:^|;)\s*white-space\s*:\s*([^;]+)/.exec(decl);
      if (ws && ws[1].trim() !== "pre") {
        fail("measurement M6: `" + sel + "` reflows the record with white-space: " + ws[1].trim());
      }
      if (/overflow-x\s*:\s*auto/.test(decl)) scrolls++;
    }
    if (!blocks) fail("measurement M6: no .rec-t rule in the stylesheet");
    if (!scrolls) {
      fail("measurement M6: .rec-t is not its own scroll container; a record that " +
           "cannot scroll must either reflow or push the page sideways");
    }
  }
  /* the real longest line, measured over every record the site ships — the
     number soa-design-content §4.8 estimated at 36 characters before the
     flagship gained `"$id": "https://example.com/agents/cody",`. It is
     reported, not gated: under `pre` + `overflow-x: auto` no width reflows it,
     so no breakpoint depends on it. */
  let longest = 0, where = "", line = "";
  for (const [rel, body] of htmlDocs) {
    const re = /<pre class="rec-t">([\s\S]*?)<\/pre>/g;
    let m;
    while ((m = re.exec(body)) !== null) {
      for (const l of m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").split("\n")) {
        if (l.length > longest) { longest = l.length; where = rel; line = l.trim(); }
      }
    }
  }
  console.log("\n  measurement M6: longest record line is " + longest +
    " characters (" + where + ")\n      " + line);
}

/* The one command on the whole site, and it is code, not typesetting.
   soa-design-content §4.4 permits exactly one command anywhere, on the grounds
   that this is the most checkable claim the property makes. U+2018/U+2019 are
   not shell quote characters: a curled version of this line errors in zsh and
   bash, which inverts the argument that earned it its place. So the line is
   asserted pure ASCII, and asserted to be the only one. */
{
  let found = 0;
  for (const [rel, body] of htmlDocs) {
    const re = /<p class="cmd[^"]*">([\s\S]*?)<\/p>/g;
    let m;
    while ((m = re.exec(body)) !== null) {
      found++;
      const cmd = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      if (!/^[\x20-\x7e]+$/.test(cmd)) {
        const bad = [...new Set(cmd.split("").filter((c) => !/[\x20-\x7e]/.test(c)))]
          .map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"))
          .join(" ");
        fail("gate 4.4: " + rel + " prints a command that will not run: " + bad, cmd);
      }
      if (!cmd.startsWith("curl ") || cmd.indexOf(pages.HOST) === -1) {
        fail("gate 4.4: " + rel + " prints a command that does not fetch the binding string", cmd);
      }
    }
  }
  if (found !== 1) {
    fail("gate 4.4: the site prints " + found + " commands; exactly one is permitted");
  }
}

/* M8 · the glyph budget. The subset covers ASCII plus the eight punctuation
   marks below; `→` is foundation's one deliberate per-glyph fallback to the
   system stack and appears inside the record. Anything else must extend
   --unicodes in the same change. */
const ALLOWED = /^[\u00d7 -~ ·–—‘’“”→\n\r\t]*$/;
for (const [rel, body] of htmlDocs) {
  if (!ALLOWED.test(body.replace(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/g, ""))) {
    const bad = [...new Set(body.split("").filter((c) => !ALLOWED.test(c)))].join(" ");
    fail("measurement M8: " + rel + " uses glyphs outside the subset: " + bad);
  }
}

/* gate 14 (bytes) / G15 · the page budget, asserted not estimated */
console.log("");
for (const [rel, bytes] of docs) {
  const over = bytes > CEILING;
  if (over) failed = true;
  if (rel === "index.html" || rel === "404.html" || over || bytes > 80 * 1024) {
    console.log(
      "  " + rel.padEnd(22) + String(bytes).padStart(7) + " bytes  (" +
      (bytes / 1024).toFixed(1) + " KB of 90)" + (over ? "  ← OVER CEILING" : "")
    );
  }
}
const biggest = docs.filter((d) => d[0].startsWith("t/c-") || d[0].startsWith("t/p-"))
  .sort((a, b) => b[1] - a[1])[0];
if (biggest) {
  console.log("  " + ("largest term page:").padEnd(22) + String(biggest[1]).padStart(7) +
    " bytes  (" + biggest[0] + ")");
}
console.log("  " + "(font)".padEnd(22) + String(woff2.length).padStart(7) +
  " bytes raw, " + fontURI.length + " base64, inlined");
console.log("  " + "documents:".padEnd(22) + String(docs.length).padStart(7) +
  " HTML · " + model.terms.length + " terms · " + written.size + " files");

if (failed) {
  console.error("\nbuild gates failed. Nothing above is a lever; each one is a fact about the profile.");
  process.exit(1);
}
console.log("\n  all build gates pass.");
