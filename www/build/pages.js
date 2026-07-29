/**
 * The pages.
 *
 * Every visible string here is the copy law of soa-design-content §4-§8.
 * Every term, address, definition, count and lineage edge is DERIVED from the
 * model (build/model.js) and typed nowhere. A term list in a template is a
 * second source of truth and drifts from the profile the first time the
 * generator runs.
 *
 * Three templates and sixty-eight documents: the landing, the term page (×64),
 * the census page, the 404 (with two named variants).
 */

"use strict";

const HOST = "https://schema.org.ai";
const DATED = "29 July 2026";

/* the seven scroll anchors, in order. The nav, the footer, the term pages'
   "Where this sits" and both 404s all read this one array. */
const SECTIONS = [
  ["address", "The one address"],
  ["ours", "Ours"],
  ["extended", "Ours over theirs"],
  ["borrowed", "Theirs, unchanged"],
  ["refused", "One name we refused"],
  ["more", "If you need more"],
  ["three-ways", "Three ways to write it"],
];

/* The step. Ours above theirs, flush left, and ours is half the length.
   ~250 bytes, zero requests, carrying its own dark ground so it reads on light
   and dark browser chrome alike. It appears on the favicon and the share card
   only: the pages themselves draw nothing. */
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E" +
  "%3Crect width='32' height='32' fill='%2313110e'/%3E" +
  "%3Crect x='3' y='12.6' width='13' height='3.4' fill='%23f0af66'/%3E" +
  "%3Crect x='3' y='18' width='26' height='3.4' fill='%238d8b87'/%3E%3C/svg%3E";

const OG_ALT =
  "The Org.AI Foundation Schema. Everything schema.org defines keeps " +
  "schema.org's meaning. Our additions sit above it, at one unversioned address.";

const OG_DESC =
  "Everything schema.org defines keeps schema.org's meaning. Our additions " +
  "sit above it, at one address that will never carry a version number.";

/* the full boot script: sets the motion class, and un-sets it if site.js never
   reports in, so a broken script can never leave the page clipped to nothing */
const BOOT_FULL =
  "<script>(function(d){var r=d.documentElement;r.className='js'+(matchMedia('(prefers-reduced-motion: reduce)').matches?'':' motion');" +
  "requestAnimationFrame(function(){r.classList.add('arrived')});" +
  "var u=function(){if(!r.dataset.booted)r.classList.remove('motion')};" +
  "addEventListener('error',function(e){if(e.target&&e.target.tagName==='SCRIPT')u()},true);setTimeout(u,1200)})(document);<\/script>";

/* the short boot script: term and census pages animate in pure CSS with `both`
   fill, so there is no script to fail and no failsafe to arm */
const BOOT_LEAN =
  "<script>(function(d){var r=d.documentElement;r.className='js'+(matchMedia('(prefers-reduced-motion: reduce)').matches?'':' motion');" +
  "requestAnimationFrame(function(){r.classList.add('arrived')})})(document);<\/script>";

/**
 * Every string on this site that is QUOTED FROM THE RECORD rather than written
 * by us — a definition, a first sentence, a truncation of either. The build's
 * copy gates subtract this set before scanning, because a definition
 * reproduced verbatim is a citation, not our description, and the honesty law
 * outranks the family's banned-vocabulary list exactly there.
 *
 * Registering the string is what makes the exemption auditable: a builder
 * cannot smuggle authored prose past a gate without adding it here first.
 */
const QUOTED = new Set();
const quote = (s) => { if (s) QUOTED.add(String(s)); return s; };

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const attr = (s) => esc(s).replace(/'/g, "&#39;");

/* Counts in running prose are spelled, not printed as numerals — the spelling
   table lives in build/text.js beside the other copy. text.js reads this
   module's constants, so a top-level require here would close a cycle and hand
   it an empty object; resolving it at call time costs one cached lookup.
   `numWord` for mid-sentence, `Num` where a sentence starts on the count. */
const numWord = (n) => require("./text").numWord(n);
const Num = (n) => require("./text").Num(n);

/* A <meta name="description"> that fits the 155 characters search engines show.
   No ellipsis is ever printed on this site, but the no-ellipsis rule does not
   license cutting inside a word: cut at the last space at or before 155 and
   stop there, so the description ends on a whole word and no marker stands in
   for what was dropped. */
const clip155 = (s) => {
  const t = String(s).trim();
  if (t.length <= 155) return t;
  const cut = t.lastIndexOf(" ", 155);
  return (cut > 0 ? t.slice(0, cut) : t.slice(0, 155)).replace(/[\s,;:]+$/, "");
};

/* ── head ─────────────────────────────────────────────────────────────────── */

function head(o) {
  const robots = o.noindex ? "noindex, follow" : "index, follow";
  const canon = o.canonical
    ? '<link rel="canonical" href="' + attr(o.canonical) + '">\n'
    : "";
  const social = o.noindex
    ? ""
    : '<meta property="og:type" content="website">\n' +
      '<meta property="og:site_name" content="The Org.AI Foundation · Schema">\n' +
      '<meta property="og:url" content="' + attr(o.canonical) + '">\n' +
      '<meta property="og:title" content="' + attr(o.ogTitle) + '">\n' +
      '<meta property="og:description" content="' + attr(o.ogDesc) + '">\n' +
      '<meta property="og:locale" content="en_US">\n' +
      '<meta property="og:image" content="' + HOST + '/og.png">\n' +
      '<meta property="og:image:width" content="1200">\n' +
      '<meta property="og:image:height" content="630">\n' +
      '<meta property="og:image:alt" content="' + attr(OG_ALT) + '">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="twitter:image" content="' + HOST + '/og.png">\n' +
      '<meta name="twitter:title" content="' + attr(o.ogTitle) + '">\n' +
      '<meta name="twitter:description" content="' + attr(o.ogDesc) + '">\n';

  return (
    "<!doctype html>\n" +
    '<html lang="en">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    "<title>" + esc(o.title) + "</title>\n" +
    '<meta name="description" content="' + attr(o.desc) + '">\n' +
    '<meta name="robots" content="' + robots + '">\n' +
    canon +
    social +
    '<link rel="icon" href="' + FAVICON + '">\n' +
    '<link rel="stylesheet" href="/styles.css">\n' +
    (o.boot || "") + "\n" +
    "</head>\n<body>\n"
  );
}

/* ── the footer, identical on every template ──────────────────────────────── */

const words = (cls, prefix) =>
  '<ul class="words ' + cls + '">\n' +
  SECTIONS.map(
    ([slug, label], i) =>
      '<li class="u"><a href="' + prefix + "#" + slug + '">' + esc(label) + "</a>" +
      (i < SECTIONS.length - 1 ? '<span class="sep"> · </span>' : "") +
      "</li>"
  ).join("<wbr>") +
  "\n</ul>";

const ESTATE =
  "Sixty-four terms, counted from the document this address serves on " + DATED +
  ". Some rulings have been made that this document does not yet carry. The " +
  "document is the profile, and what it carries is what this page shows. No " +
  "release snapshot has been cut, so there is nothing to pin to by choice yet.";

function footer(o) {
  const prefix = o && o.prefix ? o.prefix : "";
  const cut = o && o.cut ? " cut" : "";
  return (
    '<footer class="foot"' + (o && o.tick ? ' data-tick="' + o.tick + '"' : "") + '>\n' +
    '<div class="frame">\n' +
    words("footwords", prefix) + "\n" +
    '<p class="estate">' + esc(ESTATE) + "</p>\n" +
    /* The census this property owes is not the estate's live hosts but the set
       of documents a machine can fetch FROM THIS HOST — which is what it exists
       to do, and which was empty until this deploy. It grows or shrinks with
       the curl check and it never gets padded. */
    '<p class="opentoday' + cut + '" id="open"><span class="olabel">Served here:</span> ' +
    '<span class="u"><a class="dom live" href="/context.jsonld">/context.jsonld</a><span class="sep"> · </span></span><wbr>' +
    '<span class="u"><a class="dom live" href="/profile.json">/profile.json</a><span class="sep"> · </span></span><wbr>' +
    /* The third path is 40 characters of unbroken mono and is the one string on
       the site wider than a 320px viewport. It is the last item in the row, so
       it strands no separator and needs no `.u`; without the nowrap `.u`
       carries, `.opentoday .dom`'s `overflow-wrap: anywhere` lets it break and
       the document stops scrolling sideways at 320 and 360.
       The two <wbr>s say WHERE to break: a path breaks before a slash, at a
       segment, not in the middle of `context`. `overflow-wrap` is the floor
       under them, for the width where even one segment does not fit. */
    '<a class="dom live" href="/overlays/startups.studio/context.jsonld">/overlays<wbr>/startups.studio<wbr>/context.jsonld</a></p>\n' +
    '<hr class="frule">\n' +
    '<p class="closing"' + (o && o.closeTick ? ' data-tick="' + o.closeTick + '"' : "") + '>' +
    '<a class="live" href="https://foundation.org.ai/">The Org.AI Foundation</a> · ' +
    "schema.org.ai · For machines: " +
    '<a class="dom live" href="/llms.txt">/llms.txt</a></p>\n' +
    "</div>\n</footer>\n"
  );
}

/* ── row primitives ───────────────────────────────────────────────────────── */

/* Two borrowed terms have no courtesy doc in the mirror, so this host holds no
   copy of schema.org's words for them. Where a definition did not arrive, the
   row shows a blank instead of a plausible meaning, and says which. A blank is
   information. */
const UNHELD = "This host holds no copy of schema.org’s definition for this name.";

/** a ledger row whose name is a link and whose value is an address */
function termRow(t, extra) {
  const def = t.lede
    ? '<span class="def">' + esc(quote(t.lede)) + "</span>"
    : '<span class="def"></span><span class="note">' + esc(UNHELD) + "</span>";
  return (
    '<div class="rrow"><dt><a class="term" href="/' + t.term + '">' + esc(t.term) + "</a></dt>" +
    '<dd><span class="iri">' + esc(t.iri) + "</span>" +
    def +
    (extra || "") +
    "</dd></div>"
  );
}

/** a ledger row whose value is our prose */
function proseRow(dt, value, mono) {
  return (
    '<div class="rrow"><dt' + (mono ? "" : ' class="plain" style="font-family:inherit"') + ">" +
    esc(dt) + "</dt>" +
    '<dd><span class="val">' + value + "</span></dd></div>"
  );
}

/* ── the shared code specimen ─────────────────────────────────────────────── */

/**
 * The one example, and no variant of it, is negotiable. It is soa-machine
 * §5.3's measured example: every key survives expansion, nothing is silently
 * dropped, and it needs no governance ruling because `schema:` is a prefix the
 * ratified document already binds.
 *
 * The example mdxld.org publishes today (title, author, bare name) must not
 * appear on any surface of this site: measured, its data evaporates.
 */
function specimen(keys) {
  const jsonBody = keys
    .map((k, i) => '  "' + k[0] + '": ' + JSON.stringify(k[1]) + (i < keys.length - 1 ? "," : ""))
    .join("\n");
  const yamlBody = keys
    .map((k) => (k[0].charAt(0) === "@" ? "'" + k[0] + "'" : k[0]) + ": " + k[1])
    .join("\n");
  return {
    json: "{\n" + jsonBody + "\n}",
    yaml: yamlBody,
    mdx: "---\n" + yamlBody.replace(/^'@context':/, "$context:") + "\n---",
  };
}

/** the flagship, and the per-term variant, share one builder */
function exampleFor(model, t) {
  const keys = [["@context", HOST]];
  if (!t) {
    keys.push(["$id", "https://example.com/agents/cody"]);
    keys.push(["$type", "Agent"]);
    keys.push(["schema:name", "Cody"]);
    keys.push(["goal", "Triage inbound support mail"]);
    return specimen(keys);
  }
  if (t.isProperty) {
    /* a property is shown in use, on the type its domainIncludes names */
    const on = t.domain.length ? model.localName(t.domain[0]) : "Thing";
    keys.push(["$id", "https://example.com/" + on.toLowerCase() + "/1"]);
    keys.push(["$type", on]);
    keys.push(["schema:name", on]);
    keys.push([t.term, valueFor(t)]);
    return specimen(keys);
  }
  keys.push(["$id", "https://example.com/" + t.term.toLowerCase() + "/1"]);
  keys.push(["$type", t.term]);
  keys.push(["schema:name", t.term]);
  return specimen(keys);
}

/** a plausible, typed value for a property example, from its own rangeIncludes */
function valueFor(t) {
  const r = t.range.map((x) => x.replace(/^https:\/\/schema\.org(\.ai)?\//, ""));
  if (r.indexOf("Integer") !== -1) return 512;
  if (r.indexOf("Number") !== -1) return 0.7;
  if (r.indexOf("Text") !== -1 || !r.length) return "Triage inbound support mail";
  return "https://example.com/" + r[0].toLowerCase() + "/1";
}

function recBlock(label, body, cls) {
  return (
    '<div class="rec' + (cls ? " " + cls : "") + '">' +
    '<p class="rec-l">' + esc(label) + "</p>" +
    '<pre class="rec-t">' + esc(body) + "</pre></div>"
  );
}

/* ═══ THE LANDING ═══════════════════════════════════════════════════════════ */

/**
 * The homepage graph (machine doc §4.3). Two nodes, and both of them are load
 * bearing.
 *
 * The `schema:WebSite` at `#website` exists because every one of the 64 term
 * pages already asserts `schema:isPartOf` -> https://schema.org.ai/#website. An
 * IRI that nothing on the site ever defines is a dangling reference in a
 * published graph, and a vocabulary property is the last place to ship one.
 *
 * The vocabulary node at the BARE binding string is the site's only
 * machine-readable statement about the vocabulary AS A WORK. It carries the
 * dual licence that §4.3 requires be stated: ours is CC BY-SA 4.0, and the
 * thing it is based on is schema.org's, CC BY-SA 3.0 — so the honesty note the
 * borrowed section prints in prose is also readable by the processor that never
 * reads prose.
 *
 * The 64 terms are NOT enumerated here. They are one dereference away at their
 * own addresses, and the page budget is a gate, not a preference.
 *
 * The inline @context mirrors the term pages' for the same reason (§4.1): the
 * served profile has no rdfs: binding, because it is a profile OF the
 * vocabulary, not a schema for DESCRIBING it.
 */
function siteGraph(model) {
  return {
    "@context": {
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      schema: "https://schema.org/",
      schemaai: "https://schema.org.ai/",
    },
    "@graph": [
      {
        "@id": HOST + "/#website",
        "@type": "schema:WebSite",
        "schema:url": { "@id": HOST + "/" },
        "schema:name": "The Org.AI Foundation · Schema",
        "schema:mainEntity": { "@id": HOST },
      },
      {
        "@id": HOST,
        "@type": ["schema:DefinedTermSet", "schema:CreativeWork"],
        "schema:name": "schema.org.ai",
        "schema:url": { "@id": HOST },
        "schema:license": { "@id": "https://creativecommons.org/licenses/by-sa/4.0/" },
        "schema:isBasedOn": {
          "@id": "https://schema.org",
          "@type": "schema:DefinedTermSet",
          "schema:name": "schema.org",
          "schema:license": { "@id": "https://creativecommons.org/licenses/by-sa/3.0/" },
        },
      },
    ],
  };
}

function landing(model) {
  const ours = model.native.length + model.extension.length + model.nativeProperties.length;
  const theirs = model.borrow.length;
  const total = model.terms.length;
  const shadowNames = model.shadows.map((t) => t.term).join(" · ");

  const out = [];
  out.push(
    head({
      title: "schema.org.ai: everything schema.org defines, plus ours",
      desc:
        "One address, unversioned. Nineteen schema.org terms keep schema.org's " +
        "meaning; forty-five more are ours. Bind it and a processor fetches it.",
      canonical: HOST + "/",
      ogTitle: "The Org.AI Foundation · Schema",
      ogDesc: OG_DESC,
      boot: BOOT_FULL,
    })
  );

  out.push(
    '<script type="application/ld+json">' +
      JSON.stringify(siteGraph(model), null, 2) +
      "<\/script>\n"
  );

  out.push('<a class="skip" href="#ours">Skip to the three buckets</a>\n');
  out.push('<div class="spine" aria-hidden="true"><i class="spine-line"></i></div>\n');

  out.push(
    '<nav class="sticky" id="sticky" aria-label="The seven sections">\n<div class="sticky-in">\n' +
      '<ul class="words">\n' +
      SECTIONS.map(
        ([slug, label], i) =>
          '<li class="u"><a href="#' + slug + '" data-nv="' + slug + '">' + esc(label) + "</a>" +
          (i < SECTIONS.length - 1 ? '<span class="sep"> · </span>' : "") +
          "</li>"
        /* No <wbr> here, and the difference is load-bearing. This row is the one
           element on the site that scrolls sideways instead of wrapping
           (soa-design-content §4.3, gate 11), and a <wbr> between the items is a
           standing invitation to break the line that defeats the `white-space:
           nowrap` on `.sticky .words`: Chromium then wraps the seven labels onto
           two or three lines, the 48px bar renders empty, and the words spill
           above it. The hero and footer rows keep their <wbr>s because wrapping
           there is what they are supposed to do. */
      ).join("") +
      "\n</ul>\n</div>\n</nav>\n"
  );

  out.push("<main>\n");

  /* ── 1 · HERO ───────────────────────────────────────────────────────────── */

  out.push('<header class="hero" id="hero">\n<div class="frame hero-in">\n');
  out.push('<p class="wordmark pass">The Org.AI Foundation<span class="sep"> · </span>Schema</p>\n');
  out.push(
    '<h1 class="mission pass">Everything schema.org defines keeps schema.org’s meaning.' +
      '<br class="wide-only"> Our additions sit above it, at one address that will never carry a version number.</h1>\n'
  );
  /* Answers, before it is asked, the two fair objections to the word superset:
     that binding this address does not hand you all of schema.org, and that
     your labels vanish. The third sentence is the whole fix and needs no
     ruling — `schema:` is a prefix the ratified document already binds. */
  out.push(
    '<p class="honesty pass">This address defines ' + total + " terms and nothing else. " +
      "A term it does not define, including bare <span class=\"v\">name</span> and " +
      "<span class=\"v\">description</span>, is dropped rather than guessed at. " +
      "Write <span class=\"v\">schema:name</span>.</p>\n"
  );

  out.push(
    '<dl class="counters pass">\n' +
      '<div class="crow"><dt>In the profile</dt><dd>' +
      '<span class="cval num">' + total + " terms · " + ours + " ours · " + theirs + " schema.org’s</span>" +
      '<span class="check">Counted from the context document this address serves, on ' +
      DATED + ". Every key in it, less the aliases, the version marker and the two prefixes. " +
      "All " + total + " are listed below.</span></dd></div>\n" +
      '<div class="crow"><dt>Same name, our meaning</dt><dd>' +
      '<span class="cval">' + esc(shadowNames) + "</span>" +
      '<span class="check">Three names schema.org also uses. Here each binds to our definition; ' +
      "schema.org’s sense stays reachable at its own full address.</span></dd></div>\n" +
      /* Adoption is the one thing every reader of a vocabulary wants to know
         and the one thing we have not measured. There is not a single digit
         anywhere in this row, value or check-line. */
      '<div class="crow"><dt>Who is using it</dt><dd>' +
      '<span class="cval checked">Not counted.</span>' +
      '<span class="check">We have not counted the documents that bind this address, ' +
      "and we will not estimate one.</span></dd></div>\n</dl>\n"
  );

  out.push(words("herowords pass", "") + "\n");
  out.push("</div>\n</header>\n");

  /* ── 2 · THE ONE ADDRESS ────────────────────────────────────────────────── */

  out.push('<section class="door seam" id="address" data-tick="1">\n<div class="frame reg">\n');
  out.push('<div class="ra"><h2 class="dh cut">The one address</h2></div>\n<div class="rb">\n');
  out.push(
    '<p class="test cut">Bind to it and a processor fetches it. It has never carried a version number and it never will.</p>\n'
  );
  out.push('<p class="addr cut">' + HOST + "</p>\n");
  out.push(
    '<dl class="rows tight cut">\n' +
      proseRow("Accept: application/ld+json", "the context document", true) +
      proseRow("Accept: text/html", "this page", true) +
      proseRow("Accept: text/markdown", "this page’s source", true) +
      "\n</dl>\n"
  );
  out.push('<p class="sublab cut">Two keyword aliases</p>\n');
  out.push(
    '<dl class="rows cut">\n' +
      proseRow("$id", "@id, spelled the way an MDX file can spell it", true) +
      proseRow("$type", "@type, the same", true) +
      /* The value slot is BLANK. No dash, no underscore, no dotted rule, no
         greyed box, no dimmed placeholder. A blank is information. */
      proseRow("$context", "", true) +
      "\n</dl>\n"
  );
  out.push(
    '<p class="aliasnote cut">There is no alias for <span class="v">@context</span> and there ' +
      "never will be: JSON-LD says the keyword must not be aliased, and an alias could not be " +
      'used inside a context in any case. A document carrying <span class="v">$context</span> is ' +
      "definitionally MDXLD, not JSON-LD. That asymmetry is the format boundary, not a bug.</p>\n"
  );
  /* STRAIGHT QUOTES, and the build gate holds them straight. This is the one
     command on the whole site, and it earns its place by being runnable: a
     typographic ’ is not a shell quote character, so a curled version of this
     line errors in zsh and bash and inverts the argument that permitted it.
     Every other quote on the page is typeset; this one is code. */
  out.push(
    '<p class="aside cut">Every row above is one line away from being checked:</p>\n' +
      '<p class="cmd cut">curl -H \'Accept: application/ld+json\' ' + HOST + "</p>\n"
  );
  out.push(
    '<p class="closer cut">The three buckets below are the whole profile. The count is at ' +
      '<a class="term" href="/profile">/profile</a>.</p>\n'
  );
  out.push("</div>\n</div>\n</section>\n");

  /* ── 3 · OURS ───────────────────────────────────────────────────────────── */

  const shadowNote = (t) =>
    '<span class="note">schema.org uses this name too. Its sense is at ' +
    esc(t.shadows) + ".</span>";

  const propNote = (t) => {
    const d = t.domain.map((x) => model.localName(x));
    const r = t.range.map((x) => model.localName(x));
    const on = d.length ? "On " + d.join(" and ") + "." : "";
    const takes = r.length ? " Takes " + (r.length > 1 ? "a " + r.join(" or a ") : "a " + r[0]) + "." : "";
    return '<span class="note">' + esc((on + takes).trim()) + "</span>";
  };

  out.push('<section class="door" id="ours" data-tick="2">\n<div class="frame reg">\n');
  out.push('<div class="ra"><h2 class="dh cut">Ours</h2></div>\n<div class="rb">\n');
  out.push(
    '<p class="test cut">' + Num(model.native.length + model.nativeProperties.length) +
      " terms schema.org does not define. " + Num(model.shadows.length) +
      " of them are names schema.org does define, meaning something else.</p>\n"
  );
  out.push(
    '<dl class="rows cut">\n' +
      model.native
        .map((t) => termRow(t, t.shadows ? shadowNote(t) : ""))
        .join("\n") +
      "\n</dl>\n"
  );
  out.push('<p class="sublab cut">' + model.nativeProperties.length + " properties</p>\n");
  out.push(
    '<dl class="rows cut">\n' +
      model.nativeProperties.map((t) => termRow(t, propNote(t))).join("\n") +
      "\n</dl>\n"
  );
  out.push(
    '<p class="aside cut">Each row shows a definition’s first sentence. The term’s own page has it whole.</p>\n'
  );
  out.push("</div>\n</div>\n</section>\n");

  /* ── 4 · OURS OVER THEIRS ───────────────────────────────────────────────── */

  out.push('<section class="door" id="extended" data-tick="3">\n<div class="frame reg">\n');
  out.push('<div class="ra"><h2 class="dh cut">Ours over theirs</h2></div>\n<div class="rb">\n');
  out.push(
    '<p class="test cut">' + Num(model.extension.length) +
      " terms we defined and then declared a kind of schema.org’s, so a crawler walking the " +
      "edge still understands the parent.</p>\n"
  );
  out.push(
    '<dl class="rows cut">\n' +
      model.extension
        .map((t) =>
          termRow(t, '<span class="note">A kind of ' + esc(t.subClassOf) + ".</span>")
        )
        .join("\n") +
      "\n</dl>\n"
  );
  out.push(
    '<p class="aside cut">An admitted extension wins its bare name. The schema.org term it ' +
      "descends from stays reachable at its own full address.</p>\n"
  );
  out.push('<p class="aside cut">Each row shows a definition’s first sentence. The term’s own page has it whole.</p>\n');
  out.push("</div>\n</div>\n</section>\n");

  /* ── 5 · THEIRS, UNCHANGED ──────────────────────────────────────────────── */

  out.push('<section class="door" id="borrowed" data-tick="4">\n<div class="frame reg">\n');
  out.push('<div class="ra"><h2 class="dh cut">Theirs, unchanged</h2></div>\n<div class="rb">\n');
  out.push(
    '<p class="test cut">' + Num(model.borrow.length) +
      " schema.org terms admitted to this profile and mapped to schema.org’s own addresses. " +
      "We never re-home what schema.org already defines.</p>\n"
  );
  /* The address column here is the section's whole argument: nineteen rows on a
     page at schema.org.ai whose addresses all say schema.org. Nothing marks it.
     A reader sees it. */
  out.push('<dl class="rows cut">\n' + model.borrow.map((t) => termRow(t)).join("\n") + "\n</dl>\n");
  out.push(
    '<p class="aside cut">The definitions in this section are schema.org’s own words, used ' +
      "under CC BY-SA 3.0. This vocabulary is CC BY-SA 4.0.</p>\n"
  );
  out.push('<p class="aside cut">Each row shows a definition’s first sentence. The term’s own page has it whole.</p>\n');
  out.push("</div>\n</div>\n</section>\n");

  /* ── 6 · ONE NAME WE REFUSED ────────────────────────────────────────────── */

  const refused = model.notAdmitted;
  out.push('<section class="door" id="refused" data-tick="5">\n<div class="frame reg">\n');
  out.push(
    '<div class="ra"><h2 class="dh cut">' +
      (refused.length === 1 ? "One name we refused" : "Names we refused") +
      "</h2></div>\n<div class=\"rb\">\n"
  );
  out.push(
    '<p class="test cut">' +
      (refused.length === 1 ? "One name was" : refused.length + " names were") +
      " ruled out of this profile entirely. It has no address here and it never had one.</p>\n"
  );
  /* The address column is BLANK. Business is the one term name on the entire
     site that is not a link: no underline, no hover, no pointer. Company in the
     second line IS a link, and the row's last four words are the actionable
     half. */
  out.push(
    '<dl class="rows cut">\n' +
      refused
        .map(
          (name) =>
            '<div class="rrow"><dt><span class="dom">' + esc(name) + "</span></dt>" +
            "<dd><span class=\"iri\"></span>" +
            '<span class="def">Ruled out at admission. A builder reaching for ' + esc(name) +
            ' types <a class="term" href="/Company">Company</a>.</span></dd></div>'
        )
        .join("\n") +
      "\n</dl>\n"
  );
  out.push(
    '<p class="aside cut">The generator refuses to emit this name. If it ever reappears in the ' +
      "document this address serves, the build stops.</p>\n"
  );
  out.push("</div>\n</div>\n</section>\n");

  /* ── 7 · IF YOU NEED MORE ───────────────────────────────────────────────── */

  const venueNatives = model.overlayTerms.filter((k) => k[0] === k[0].toUpperCase());
  const venueProps = model.overlayTerms.filter((k) => k[0] !== k[0].toUpperCase());

  out.push('<section class="door" id="more" data-tick="6">\n<div class="frame reg">\n');
  out.push('<div class="ra"><h2 class="dh cut">If you need more</h2></div>\n<div class="rb">\n');
  out.push(
    '<p class="test cut">Three clocks over one set of names. A venue can add its own on top, ' +
      "and its names are leases.</p>\n"
  );
  out.push(
    '<dl class="rows cut">\n' +
      proseRow("schema.org", "does not move", true) +
      proseRow("schema.org.ai", "moves slowly", true) +
      /* "a venue" is our phrase and not an address, so this one dt is sans.
         The exception is the mono law working correctly. */
      proseRow("a venue", "moves fast, and what it adds are leases", false) +
      "\n</dl>\n"
  );
  out.push(
    '<p class="body cut">One venue overlay ' +
      "exists and this host serves it. It adds " + numWord(venueNatives.length) + " names and " +
      numWord(venueProps.length) + " property on top of everything above, and it may never redefine a " +
      "name that is already here.</p>\n"
  );
  out.push(
    '<p class="aside cut">Served at <a class="term" href="/overlays/startups.studio/context.jsonld">' +
      "/overlays/startups.studio/context.jsonld</a>.</p>\n"
  );
  out.push(
    '<p class="aside cut">The overlay’s own address, <span class="v">' +
      esc(model.overlay.$id) + '</span>, is not ours to serve. We do not claim it resolves, ' +
      "and a lease carries no promise that it will still be there.</p>\n"
  );
  out.push("</div>\n</div>\n</section>\n");

  /* ── 8 · THREE WAYS TO WRITE IT ─────────────────────────────────────────── */

  const ex = exampleFor(model, null);

  out.push('<section class="strip-sec" id="three-ways" data-tick="7">\n<div class="frame">\n');
  out.push('<h2 class="sh cut">Three ways to write it</h2>\n');
  out.push(
    '<p class="lede cut">The same document, spelled three ways. A processor reads all three as ' +
      "the same document.</p>\n"
  );
  out.push('<div class="strip" id="strip">\n');
  out.push(recBlock("JSON-LD", ex.json));
  out.push(recBlock("YAML-LD", ex.yaml, "ruled"));
  out.push(recBlock("MDXLD", ex.mdx, "ruled"));

  /* THE KEY LEDGER AND THE RULE — the one scrubbed scene, and the property's
     signature moment. The rule reads the keys of the flagship example above,
     marks each one this address resolves, reaches the one key a reader reaches
     for first, and stops. Nothing explains it. The honesty line said it in
     words 900 pixels earlier; the motion performs the sentence.

     In the blank, draw nothing. */
  out.push(
    '<div class="rec ruled" id="record"><div class="klist">' +
      '<div class="krow"><span class="kk">$context → @context</span>' +
      '<span class="kp k-context">renamed once, at the top of the file only</span></div>' +
      '<div class="krow"><span class="kk">$id</span>' +
      '<span class="kp k-id">an alias this address declares</span></div>' +
      '<div class="krow"><span class="kk">$type</span>' +
      '<span class="kp k-type">an alias this address declares</span></div>' +
      '<div class="krow"><span class="kk">schema:name</span>' +
      '<span class="kp k-schema">a prefix this address declares</span></div>' +
      '<div class="krow"><span class="kk">name</span>' +
      '<span class="kp k-name"></span></div>' +
      '</div><i class="strip-rule"></i></div>\n'
  );
  out.push("</div>\n");

  out.push(
    '<div class="notes cut">\n' +
      "<p>Where a key is not defined, the line shows a blank instead of a plausible meaning. " +
      "A blank is information.</p>\n" +
      "<p>The build runs all three blocks through a JSON-LD processor and compares the result. " +
      "If they ever stop matching, the build stops rather than this page saying they do.</p>\n" +
      '<p>The rename is exactly one key, at the top of the file. Nested <span class="v">$id</span> ' +
      'and <span class="v">$type</span> are never renamed; they are resolved by the aliases this ' +
      "address declares.</p>\n</div>\n"
  );
  out.push("</div>\n</section>\n");

  /* ── 9 · WHAT THIS IS ───────────────────────────────────────────────────── */

  out.push('<section class="what" id="what" data-tick="8">\n<div class="frame">\n');
  out.push('<h2 class="sh fade">What this is</h2>\n');
  out.push(
    '<div class="whatbody fade">\n' +
      "<p>This is the Org.AI Foundation’s schema. It is one address that a machine can fetch, " +
      "and it carries " + total + " terms.</p>\n" +
      "<p>Nineteen of them are schema.org’s, mapped to schema.org’s own addresses and " +
      "meaning what schema.org says they mean.</p>\n" +
      "<p>The rest are ours, and each one says what it is a kind of, or that it is a kind of " +
      "nothing.</p>\n</div>\n"
  );
  out.push("</div>\n</section>\n");

  out.push("</main>\n");
  out.push(footer({ tick: 9, closeTick: 10, cut: true }));
  out.push('<script src="/site.js" defer><\/script>\n</body>\n</html>\n');

  return out.join("");
}

/* ═══ THE TERM PAGE ═════════════════════════════════════════════════════════ */

const BUCKET_LINE = {
  native: "Ours. schema.org does not define this name.",
  shadow: "Ours. schema.org defines this name too, meaning something else.",
  extension: "Ours, and a kind of schema.org’s.",
  borrow: "schema.org’s, unchanged.",
  property: "Ours. A property, not a type.",
};

/**
 * The two-node graph. Node one asserts the TERM; node two describes the PAGE.
 *
 * The `#page` fragment is load-bearing: https://schema.org.ai/Agent is a class,
 * and the HTML document at that URL is a different resource. Giving both the
 * same @id asserts that a class IS a web page — the httpRange-14 conflation,
 * and precisely the confusion the live site's markup causes today.
 *
 * The inline @context is deliberate and is NOT "https://schema.org.ai": the
 * served profile has no rdfs: binding, because it is a profile OF the
 * vocabulary, not a schema for DESCRIBING it. extensions.jsonld carries its own
 * local context for exactly this reason; this mirrors it.
 */
function termGraph(model, t, withPage) {
  const node = {
    "@id": t.iri,
    "@type": t.isProperty ? "rdf:Property" : "rdfs:Class",
    "rdfs:label": t.term,
  };
  /* never assert a comment we do not hold */
  if (t.comment) node["rdfs:comment"] = t.comment;
  if (t.subClassOf) node["rdfs:subClassOf"] = { "@id": t.subClassOf };
  if (t.shadows) node["schemaai:shadows"] = { "@id": t.shadows };
  if (t.domain.length) {
    node["schema:domainIncludes"] = t.domain.map((x) => ({ "@id": x }));
  }
  if (t.range.length) {
    node["schema:rangeIncludes"] = t.range.map((x) => ({ "@id": x }));
  }
  /* A borrow is defined by schema.org, not by us. We never claim otherwise. */
  node["rdfs:isDefinedBy"] = { "@id": t.ours ? HOST : "https://schema.org" };

  const graph = [node];
  if (withPage) {
    graph.push({
      "@id": HOST + "/" + t.term + "#page",
      "@type": "schema:WebPage",
      "schema:url": { "@id": HOST + "/" + t.term },
      "schema:name": t.term + " · schema.org.ai",
      "schema:mainEntity": { "@id": t.iri },
      "schema:isPartOf": { "@id": HOST + "/#website" },
      "schema:license": { "@id": "https://creativecommons.org/licenses/by-sa/4.0/" },
    });
  }
  return {
    "@context": {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      schema: "https://schema.org/",
      schemaai: "https://schema.org.ai/",
    },
    "@graph": graph,
  };
}

function lineageRows(model, t) {
  const rows = [];
  if (t.isProperty) {
    if (t.domain.length) {
      rows.push(proseRow("Used on", t.domain.map((x) => '<span class="v">' + esc(x) + "</span>").join(" · "), false));
    }
    if (t.range.length) {
      rows.push(proseRow("Takes", t.range.map((x) => '<span class="v">' + esc(x) + "</span>").join(" · "), false));
    }
    return rows;
  }
  if (t.shadows) {
    /* No `Kind of` row at all. Event carries a ratified lineage VETO; emitting
       one would invert a ruling. */
    rows.push(proseRow("Shadows", '<span class="v">' + esc(t.shadows) + "</span>", false));
    return rows;
  }
  if (t.bucket === "borrow") {
    rows.push(proseRow("Defined by", '<span class="v">https://schema.org</span>', false));
    return rows;
  }
  if (t.subClassOf) {
    rows.push(proseRow("Kind of", '<span class="v">' + esc(t.subClassOf) + "</span>", false));
    return rows;
  }
  /* The best single row on the site: a blank, and the reason it is blank. The
     reason is verbatim from the record, not authored here. */
  rows.push(
    '<div class="rrow"><dt class="plain" style="font-family:inherit">Kind of</dt>' +
      '<dd><span class="val"></span><span class="note">' +
      esc(reasonNoParent(t)) +
      "</span></dd></div>"
  );
  return rows;
}

/**
 * The ruled reason a native carries no parent, taken out of its own record and
 * printed whole. Task is the one term this fires on, and its row is the best
 * single row on the site: a blank, and the reason it is blank, in the
 * vocabulary's own words rather than ours.
 */
function reasonNoParent(t) {
  const m = /deliberately no subClassOf[\s\S]*$/i.exec(t.comment || "");
  const s = m
    ? m[0].charAt(0).toUpperCase() + m[0].slice(1)
    : (t.comment || "").split(/:\s/).slice(-1)[0];
  return quote(s);
}

function termPage(model, t) {
  const url = HOST + "/" + t.term;
  const bline = BUCKET_LINE[t.bucket];
  const ex = exampleFor(model, t);
  const graph = termGraph(model, t, true);

  const out = [];
  out.push(
    head({
      title: t.term + " · schema.org.ai",
      desc: quote(clip155(bline + (t.lede ? " " + t.lede : ""))),
      canonical: url,
      ogTitle: t.term + " · schema.org.ai",
      ogDesc: quote(bline + (t.lede ? " " + t.lede : "")),
      boot: BOOT_LEAN,
    })
  );

  out.push(
    '<script type="application/ld+json">' + JSON.stringify(graph, null, 2) + "<\/script>\n"
  );

  out.push('<main class="tp">\n<div class="frame">\n');
  out.push(
    '<p class="wordmark"><a href="/">The Org.AI Foundation<span class="sep"> · </span>Schema</a></p>\n'
  );
  out.push('<div class="tcut">\n');
  out.push('<h1 class="tname">' + esc(t.term) + "</h1>\n");
  out.push('<p class="bline">' + esc(bline) + "</p>\n");
  out.push('<p class="taddr">' + esc(t.iri) + "</p>\n");
  out.push("</div>\n");
  /* The definitions are reproduced WHOLE AND VERBATIM, including the internal
     shorthand some of them carry — ruling numbers, issue references, ADR names.
     Excerpting or laundering them would make the page disagree with the
     document it serves. The source line below is what makes it work: a reader
     is told she is reading the record, not our prose about it. */
  out.push('<p class="tdef tcut d1">' + (t.comment ? esc(quote(t.comment)) : "") + "</p>\n");
  out.push(
    '<p class="tsrc tcut d1">' +
      (t.comment
        ? t.ours
          ? "The definition this document carries."
          : "schema.org’s own words, used under CC BY-SA 3.0."
        : esc(UNHELD)) +
      "</p>\n"
  );

  out.push('<div class="tsec tcut d2"><dl class="rows">\n' + lineageRows(model, t).join("\n") + "\n</dl></div>\n");

  out.push('<div class="tsec tcut d3">\n<p class="tlab">How to write it</p>\n<div class="strip">\n');
  out.push(recBlock("JSON-LD", ex.json));
  out.push(recBlock("YAML-LD", ex.yaml, "ruled"));
  out.push(recBlock("MDXLD", ex.mdx, "ruled"));
  out.push("</div>\n</div>\n");

  out.push('<div class="tsec">\n<p class="dpick">Where this sits:</p>\n<ul class="ddoors">\n');
  out.push(SECTIONS.map(([s, l]) => '<li><a href="/#' + s + '">' + esc(l) + "</a></li>").join("\n"));
  out.push("\n</ul>\n</div>\n");

  out.push("</div>\n</main>\n");
  out.push(footer({ prefix: "/" }));
  out.push("</body>\n</html>\n");
  return out.join("");
}

/* ═══ THE CENSUS PAGE ═══════════════════════════════════════════════════════ */

function censusPage(model) {
  const c = model.census;
  const rows = [
    ["Ours, types", c.native],
    ["Ours, properties", c.nativeProperties],
    ["schema.org’s", c.borrow],
    ["Ours over theirs", c.extensionAdmitted],
    ["Waiting on a ruling", c.extensionPending.length],
  ];

  const out = [];
  out.push(
    head({
      title: "The profile · schema.org.ai",
      desc:
        "The three-bucket census of the schema.org.ai profile, read off the " +
        "context document this address serves.",
      canonical: HOST + "/profile",
      ogTitle: "The profile · schema.org.ai",
      ogDesc: OG_DESC,
      boot: BOOT_LEAN,
    })
  );

  out.push('<main class="tp census">\n<div class="frame">\n');
  out.push(
    '<p class="wordmark"><a href="/">The Org.AI Foundation<span class="sep"> · </span>Schema</a></p>\n'
  );
  out.push('<div class="tcut">\n<h1 class="sh">The profile</h1>\n');
  out.push(
    '<p class="lede">Membership in this profile is not a list kept somewhere else. It is the ' +
      "document itself.</p>\n</div>\n"
  );
  out.push(
    '<div class="tsec tcut d1"><dl class="rows">\n' +
      rows
        .map(
          ([label, n]) =>
            '<div class="rrow"><dt class="plain">' + esc(label) + "</dt>" +
            '<dd><span class="cnum">' + n + "</span></dd></div>"
        )
        .join("\n") +
      "\n</dl></div>\n"
  );
  out.push(
    '<p class="method tcut d2">A term’s bucket is read off the address it binds to. A term ' +
      "that binds to an address under schema.org.ai is ours; a term that binds to an address " +
      "under schema.org is schema.org’s. There is no third place to look.</p>\n"
  );
  out.push(
    '<p class="tsrc tcut d3">The same census as JSON: <a class="term" href="/profile.json">/profile.json</a></p>\n'
  );
  out.push("</div>\n</main>\n");
  out.push(footer({ prefix: "/" }));
  out.push("</body>\n</html>\n");
  return out.join("");
}

/* ═══ THE 404s ══════════════════════════════════════════════════════════════ */

/**
 * Every 404 carries a real 404 status, `noindex, follow`, and NO canonical.
 * Never the homepage: the live site canonicalises 404 pages to `/` today, which
 * is the single worst defect present.
 *
 * `<!--SUGGEST-->` is the one dynamic slot on the whole site. The worker fills
 * it with the correct-case path when a request differs from a real term only by
 * case, and strips it otherwise.
 */
function notFound(o) {
  const out = [];
  out.push(
    head({
      title: o.title,
      desc: o.line.replace(/<[^>]+>/g, ""),
      noindex: true,
    })
  );
  out.push('<main class="nf">\n<div class="frame">\n');
  out.push(
    '<p class="wordmark"><a href="/">The Org.AI Foundation<span class="sep"> · </span>Schema</a></p>\n'
  );
  out.push('<h1 class="dhead">' + esc(o.head) + "</h1>\n");
  out.push('<p class="anote">' + o.line + "</p>\n");
  out.push("<!--SUGGEST-->\n");
  out.push('<p class="dpick">Pick a part of it instead:</p>\n<ul class="ddoors">\n');
  out.push(SECTIONS.map(([s, l]) => '<li><a href="/#' + s + '">' + esc(l) + "</a></li>").join("\n"));
  out.push("\n</ul>\n");
  out.push('<hr class="frule">\n');
  out.push(
    '<p class="closing"><a class="live" href="https://foundation.org.ai/">The Org.AI Foundation</a> · ' +
      'schema.org.ai · For machines: <a class="dom live" href="/llms.txt">/llms.txt</a></p>\n'
  );
  out.push("</div>\n</main>\n</body>\n</html>\n");
  return out.join("");
}

function notFoundPages(model) {
  const refused = model.notAdmitted[0];
  return {
    "404.html": notFound({
      title: "schema.org.ai: there is no term here",
      head: "There is no term here.",
      line:
        "This host holds a schema of " + model.terms.length +
        ' terms. Term names are case-sensitive: <span class="v">/Agent</span> is a term and ' +
        '<span class="v">/agent</span> is not.',
    }),
    /* 404 and not 410: 410 asserts the resource existed and was removed.
       Business was ruled out at admission and never had an address. 404 is the
       truthful status and the body carries the ruling. */
    "e/refused.html": notFound({
      title: refused + " is not a term here · schema.org.ai",
      head: refused + " is not a term here.",
      line:
        "It was ruled out at admission. A builder reaching for " + refused +
        ' types <a class="term" href="/Company">Company</a>.',
    }),
    "e/releases.html": notFound({
      title: "No snapshot has been cut · schema.org.ai",
      head: "No snapshot has been cut.",
      line:
        "This path is reserved for snapshots a document can pin to by choice. None has been " +
        "cut. The address itself has no version in it and never will.",
    }),
  };
}

module.exports = {
  HOST,
  DATED,
  SECTIONS,
  ESTATE,
  landing,
  termPage,
  censusPage,
  notFoundPages,
  termGraph,
  siteGraph,
  exampleFor,
  reasonNoParent,
  BUCKET_LINE,
  QUOTED,
};
