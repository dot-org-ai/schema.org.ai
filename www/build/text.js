/**
 * The two plain-text faces: /llms.txt, and the `Accept: text/markdown`
 * representation of every HTML document.
 *
 * soa-design-content §8 proposes holding /llms.txt as a template literal inside
 * worker.js. Its own rule in the same paragraph — "every enumerated section is
 * generated from the copied documents at build time and interpolated, no term
 * is typed by hand" — is the load-bearing half, and it is what stops the
 * machine face and the human pages drifting apart. Generating both from the one
 * model in the one build satisfies that rule exactly, and does it without a
 * build step that rewrites the worker's own source. So /llms.txt is a generated
 * asset, and the worker stamps its media type.
 */

"use strict";

const { HOST, DATED, SECTIONS, ESTATE } = require("./pages");

const bar = (s) => s;

/* The family grammar reserves digits for counted facts — the counter block, the
   census, a ledger address. Running prose spells its counts out, and three of
   the landing's sentences would otherwise open with a bare numeral. The counts
   themselves stay derived from the model; only their spelling lives here.
   Nothing on this site counts past ninety-nine in prose, and above that a
   numeral is returned rather than a guess. */
const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty",
  "ninety",
];
function numWord(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? t + "-" + ONES[n % 10] : t;
}
/* the same word where a sentence starts on it */
const Num = (n) => {
  const w = numWord(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

function llms(model) {
  const L = [];
  const p = (s) => L.push(s === undefined ? "" : s);

  p("# The Org.AI Foundation · Schema");
  p();
  p("> Everything schema.org defines keeps schema.org's meaning. Our additions sit above it,");
  p("> at one address that will never carry a version number.");
  p();
  p("## The address");
  p("  " + HOST + " — stable, unversioned, permanent.");
  p("  Accept: application/ld+json  -> the context document");
  p("  Accept: text/html            -> the human page");
  p("  Accept: text/markdown        -> its source");
  p("  Also: Link: <" + HOST + "/context.jsonld>; rel=\"alternate\"; type=\"application/ld+json\"");
  p();
  p("## What it declares");
  p("  $id -> @id.  $type -> @type.  @context has no alias and cannot have one.");
  p("  Prefixes: schema: https://schema.org/   schemaai: https://schema.org.ai/");
  p();
  p("## The limit, stated plainly");
  p("  This profile defines " + model.terms.length + " terms, " + model.nativeProperties.length +
    " of them properties. It defines no general property");
  p("  vocabulary: bare name, description, url, identifier, image, title and author are NOT");
  p("  defined and a conforming processor drops them. Write schema:name.");
  p();

  const rows = (list, fn) => list.map(fn).join("\n");

  p("## Ours — " + model.native.length + " types");
  p(rows(model.native, (t) =>
    "  " + t.term.padEnd(20) + t.iri + "\n" +
    "    " + t.comment));
  p();
  p("## Ours — " + model.nativeProperties.length + " properties");
  p(rows(model.nativeProperties, (t) =>
    "  " + t.term.padEnd(20) + t.iri + "\n" +
    "    domain: " + (t.domain.join(", ") || "(none)") + "\n" +
    "    range:  " + (t.range.join(", ") || "(none)") + "\n" +
    "    " + t.comment));
  p();
  p("## Ours over theirs — " + model.extension.length);
  p(rows(model.extension, (t) =>
    "  " + t.term.padEnd(20) + t.iri + "\n" +
    "    subClassOf " + t.subClassOf + "\n" +
    "    " + t.comment));
  p();
  p("## schema.org's — " + model.borrow.length);
  p(rows(model.borrow, (t) => "  " + t.term.padEnd(20) + t.iri));
  p("  Definitions for these are schema.org's own words, CC BY-SA 3.0, and are on each");
  p("  term's page at " + HOST + "/<Term>.");
  p();
  p("## Same name, our meaning — " + model.shadows.length);
  p("  org.ai ADR 0004 Q3 SHADOW: each bare term below binds to its schema.org.ai native;");
  p("  the external same-named sense (a false friend, a different referent) stays reachable");
  p("  by its full IRI. Never re-homed, never borrowed.");
  p(rows(model.shadows, (t) => "  " + t.term.padEnd(20) + t.iri + "   shadows " + t.shadows));
  p();
  p("## Not admitted — " + model.notAdmitted.length);
  p("  " + model.notAdmitted.join(", ") + ". Nathan, org.ai#11, 2026-07-18, verbatim:");
  p("  \"Business = not admitted (Company carries the referent; 'business' stays the");
  p("  Register-1 thesis word)\". A builder reaching for Business types Company.");
  p();
  p("## The layer above");
  p("  ADR 0002 R4: schema.org (fixed clock) < schema.org.ai (slow) < a venue overlay (fast).");
  p("  One overlay exists and this host serves it, at");
  p("  " + HOST + "/overlays/startups.studio/context.jsonld");
  p("  It adds: " + model.overlayTerms.join(", ") + ".");
  p("  Its own $id, " + model.overlay.$id + ", is not ours to serve and we do not claim it");
  p("  resolves. Venue-homed IRIs are leases and carry no durability promise.");
  p();
  p("## Documents this host serves");
  p("  /context.jsonld  /profile.json  /overlays/startups.studio/context.jsonld  /llms.txt");
  p("  /sitemap.xml  /robots.txt  and " + model.terms.length + " term pages at /<Term> (case-sensitive)");
  p("  Every one of those also answers Accept: application/ld+json and Accept: text/markdown.");
  p();
  p("## Licence and use");
  p("  This vocabulary: CC BY-SA 4.0. The " + model.borrow.length +
    " borrowed definitions: schema.org, CC BY-SA 3.0.");
  p();
  p("## Honest state");
  p("  " + ESTATE);
  p();
  return L.join("\n");
}

/* ── the text/markdown representations ────────────────────────────────────── */

function landingMd(model) {
  const total = model.terms.length;
  const ours = model.native.length + model.extension.length + model.nativeProperties.length;
  const L = [];
  const p = (s) => L.push(s === undefined ? "" : s);

  p("# The Org.AI Foundation · Schema");
  p();
  p("Everything schema.org defines keeps schema.org's meaning. Our additions sit above it,");
  p("at one address that will never carry a version number.");
  p();
  p("This address defines " + total + " terms and nothing else. A term it does not define,");
  p("including bare `name` and `description`, is dropped rather than guessed at. Write");
  p("`schema:name`.");
  p();
  p("- In the profile: " + total + " terms · " + ours + " ours · " + model.borrow.length + " schema.org's");
  p("- Same name, our meaning: " + model.shadows.map((t) => t.term).join(" · "));
  p("- Who is using it: Not counted.");
  p();
  p("## The one address");
  p();
  p("    " + HOST);
  p();
  p("| Accept | Representation |");
  p("| --- | --- |");
  p("| `application/ld+json` | the context document |");
  p("| `text/html` | the human page |");
  p("| `text/markdown` | this document |");
  p();
  p("`$id` is `@id`. `$type` is `@type`. `$context` has no alias and never will: JSON-LD says");
  p("the keyword must not be aliased. A document carrying `$context` is definitionally MDXLD,");
  p("not JSON-LD. That asymmetry is the format boundary, not a bug.");
  p();

  const sec = (title, list, extra) => {
    p("## " + title);
    p();
    for (const t of list) {
      p("- `" + t.term + "` " + t.iri);
      p("  " + (t.lede || "(this host holds no copy of schema.org's definition for this name)"));
      if (extra) {
        const e = extra(t);
        if (e) p("  " + e);
      }
    }
    p();
  };

  sec("Ours — " + model.native.length + " types", model.native, (t) =>
    t.shadows ? "schema.org uses this name too. Its sense is at " + t.shadows + "." : "");
  sec("Ours — " + model.nativeProperties.length + " properties", model.nativeProperties, (t) =>
    "On " + t.domain.map(model.localName).join(" and ") + ". Takes " +
    t.range.map(model.localName).join(" or ") + ".");
  sec("Ours over theirs — " + model.extension.length, model.extension, (t) =>
    "A kind of " + t.subClassOf + ".");
  sec("Theirs, unchanged — " + model.borrow.length, model.borrow);

  p("## " + (model.notAdmitted.length === 1 ? "One name we refused" : "Names we refused"));
  p();
  for (const n of model.notAdmitted) {
    p("- `" + n + "` — no address here, and it never had one. Ruled out at admission.");
    p("  A builder reaching for " + n + " types Company.");
  }
  p();
  p("## If you need more");
  p();
  p("schema.org does not move. schema.org.ai moves slowly. A venue moves fast, and what it");
  p("adds are leases. One venue overlay exists and this host serves it at");
  p("/overlays/startups.studio/context.jsonld. Its own address, " + model.overlay.$id + ",");
  p("is not ours to serve.");
  p();
  p("## Three ways to write it");
  p();
  const ex = require("./pages").exampleFor(model, null);
  p("```json");
  p(ex.json);
  p("```");
  p();
  p("```yaml");
  p(ex.yaml);
  p("```");
  p();
  p("```mdx");
  p(ex.mdx);
  p("```");
  p();
  p("`$context` becomes `@context`, once, at the top of the file. `$id` and `$type` are");
  p("aliases this address declares. `schema:name` is a prefix this address declares. `name`");
  p("is not defined here.");
  p();
  p("---");
  p();
  p(ESTATE);
  p();
  p("Served here: /context.jsonld · /profile.json · /overlays/startups.studio/context.jsonld");
  p("The Org.AI Foundation · schema.org.ai · For machines: /llms.txt");
  p();
  return L.join("\n");
}

function termMd(model, t) {
  const { BUCKET_LINE, exampleFor } = require("./pages");
  const ex = exampleFor(model, t);
  const L = [];
  const p = (s) => L.push(s === undefined ? "" : s);
  p("# " + t.term);
  p();
  p(BUCKET_LINE[t.bucket]);
  p();
  p("    " + t.iri);
  p();
  p(t.comment || "");
  p();
  p(t.comment
    ? (t.ours
        ? "*The definition this document carries.*"
        : "*schema.org's own words, used under CC BY-SA 3.0.*")
    : "*This host holds no copy of schema.org's definition for this name.*");
  p();
  if (t.isProperty) {
    if (t.domain.length) p("- Used on: " + t.domain.join(", "));
    if (t.range.length) p("- Takes: " + t.range.join(", "));
  } else if (t.shadows) {
    p("- Shadows: " + t.shadows);
  } else if (t.bucket === "borrow") {
    p("- Defined by: https://schema.org");
  } else if (t.subClassOf) {
    p("- Kind of: " + t.subClassOf);
  } else {
    /* a blank, and the reason it is blank, taken out of the record itself */
    p("- Kind of:");
    p("  " + require("./pages").reasonNoParent(t));
  }
  p();
  p("## How to write it");
  p();
  p("```json");
  p(ex.json);
  p("```");
  p();
  p("```yaml");
  p(ex.yaml);
  p("```");
  p();
  p("```mdx");
  p(ex.mdx);
  p("```");
  p();
  p("The Org.AI Foundation · schema.org.ai · For machines: /llms.txt");
  p();
  return L.join("\n");
}

function censusMd(model) {
  const c = model.census;
  const L = [];
  const p = (s) => L.push(s === undefined ? "" : s);
  p("# The profile");
  p();
  p("Membership in this profile is not a list kept somewhere else. It is the document itself.");
  p();
  p("| Bucket | Count |");
  p("| --- | --- |");
  p("| Ours, types | " + c.native + " |");
  p("| Ours, properties | " + c.nativeProperties + " |");
  p("| schema.org's | " + c.borrow + " |");
  p("| Ours over theirs | " + c.extensionAdmitted + " |");
  p("| Waiting on a ruling | " + c.extensionPending.length + " |");
  p();
  p("A term's bucket is read off the address it binds to. A term that binds to an address");
  p("under schema.org.ai is ours; a term that binds to an address under schema.org is");
  p("schema.org's. There is no third place to look.");
  p();
  p("The same census as JSON: /profile.json");
  p();
  return L.join("\n");
}

function robots(model) {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# The internal bucket-prefixed asset namespace. Every document in it is",
    "# reachable at its real address instead: /<Term>, case-sensitive.",
    "Disallow: /t/",
    "",
    "Sitemap: " + HOST + "/sitemap.xml",
    "",
  ].join("\n");
}

function sitemap(model) {
  const urls = [HOST + "/", HOST + "/profile"].concat(
    model.terms.map((t) => HOST + "/" + t.term)
  );
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => "<url><loc>" + u + "</loc></url>").join("\n") +
    "\n</urlset>\n"
  );
}

module.exports = { llms, landingMd, termMd, censusMd, robots, sitemap, bar, numWord, Num };
