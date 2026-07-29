/**
 * The model — derived, never authored.
 *
 * soa-design-content §0: "No hand-listed term data, anywhere, ever. Every row,
 * every page, every llms.txt line is derived at build time from the copied
 * context.jsonld + extensions.jsonld + profile.json. A term list typed into a
 * template is a second source of truth and will drift from the profile the
 * first time the generator runs."
 *
 * So this file contains no term name. It contains the rules that turn three
 * generated documents into 64 rows, and nothing else.
 *
 * The one exception, and it is not a term list: NOT_ADMITTED is read out of
 * the copied context document's own `_generated.notAdmitted.terms`, so even the
 * refusal is derived.
 */

"use strict";

const fs = require("fs");
const path = require("path");

/* The five keys of the served @context that are not dereferenceable terms:
   two keyword aliases, the version marker, two prefix bindings. Everything
   else in the object is a term with a page. (soa-machine §3.1) */
const NON_TERMS = new Set(["$id", "$type", "@version", "schema", "schemaai"]);

const SCHEMA_ORG = "https://schema.org/";
const SCHEMA_ORG_AI = "https://schema.org.ai/";

/** `https://schema.org/Person` → `Person`; passes anything else through. */
function localName(iri) {
  return String(iri).replace(/^https:\/\/schema\.org(\.ai)?\//, "");
}

/** extensions.jsonld uses compact IRIs. Expand the two prefixes it binds. */
function expand(v) {
  if (v == null) return null;
  const id = typeof v === "object" ? v["@id"] : v;
  if (typeof id !== "string") return null;
  return id
    .replace(/^schemaai:/, SCHEMA_ORG_AI)
    .replace(/^schema:/, SCHEMA_ORG);
}

/** domainIncludes / rangeIncludes are one node or an array of them. */
function expandAll(v) {
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).map(expand).filter(Boolean);
}

/**
 * A definition's first sentence, ending at its first full stop, unmodified.
 * No ellipsis is ever printed: "an ellipsis is a shape shaped like the missing
 * thing, which is what WITHHELD refuses to render" (soa-design-content §4.5).
 *
 * The record is full of abbreviations that carry a full stop and are not the
 * end of a sentence, so the split requires the stop to be followed by a space
 * and a capital, and the abbreviation and bracket guards below reject the rest.
 *
 * There is no minimum length. A floor here would print more than one sentence
 * for any term whose first sentence is shorter than it, which is exactly what
 * `WebPage` — "A web page." — did under a 40-character floor, while the aside
 * directly beneath the ledger said "Each row shows a definition's first
 * sentence." A three-word row is the truthful first sentence, and the aside
 * already tells the reader where the whole definition is.
 */
function firstSentence(text) {
  const s = String(text).trim();
  const re = /\.(?=\s+[A-Z(])/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const upto = s.slice(0, m.index + 1);
    /* an abbreviation's full stop is not the end of a sentence. The record is
       full of them, and cutting at one leaves a row reading "(e.g." */
    if (/(?:^|[\s(])(?:e\.g|i\.e|etc|vs|cf|approx|no|fig|Dr|Mr|Ms)\.$/i.test(upto)) continue;
    /* nor is a full stop inside an unclosed bracket */
    const opens = (upto.match(/\(/g) || []).length;
    const closes = (upto.match(/\)/g) || []).length;
    if (opens > closes) continue;
    return upto;
  }
  return s;
}

/**
 * The `description:` line of a schema.org courtesy doc's frontmatter.
 * These are schema.org's own words, used under CC BY-SA 3.0, and are the only
 * definitions on this site that are not ours.
 */
function borrowDefinition(thingsDir, term) {
  const file = path.join(thingsDir, term + ".mdx");
  /* Two of the nineteen borrowed terms — the structurally-pulled parents the
     generator adds because a native leans on them — have no courtesy doc in
     the 905-file mirror at all. We hold no copy of schema.org's words for
     them, so the page shows a blank rather than a plausible meaning, and says
     which. Raised to the owner; not filled in. */
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, "utf8");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  if (!fm) throw new Error("things/" + term + ".mdx: no frontmatter");
  const line = /^description:[ \t]*(.*)$/m.exec(fm[1]);
  if (!line) throw new Error("things/" + term + ".mdx: no description");
  return line[1]
    .trim()
    /* the mirror escapes hard line breaks as a trailing backslash */
    .replace(/\\+$/, "")
    .replace(/\\\s+/g, " ")
    /* schema.org's rdfs:comment is authored as HTML, and the mirror carries the
       markup through: WebPage's definition contains `<code>breadcrumb</code>`.
       We render it as text, so the tags would be escaped and a reader would see
       the angle brackets. Drop the markup and keep the words — the wording is
       still schema.org's, verbatim. */
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build the whole model.
 *
 * @param {object} p paths: { context, profile, overlay, extensions, things }
 */
function build(p) {
  const context = JSON.parse(fs.readFileSync(p.context, "utf8"));
  const profile = JSON.parse(fs.readFileSync(p.profile, "utf8"));
  const overlay = JSON.parse(fs.readFileSync(p.overlay, "utf8"));
  const ext = JSON.parse(fs.readFileSync(p.extensions, "utf8"));

  const ctx = context["@context"];
  if (!ctx || typeof ctx !== "object") {
    throw new Error("the copied context document has no @context object");
  }

  /* ── the record, keyed by IRI ─────────────────────────────────────────── */

  const record = new Map();
  for (const node of ext["@graph"]) {
    record.set(expand(node["@id"]), node);
  }

  /* ── the buckets, read off profile.json ───────────────────────────────── */

  const bucketOf = new Map();
  const shadowOf = new Map();
  const parentOf = new Map();
  const B = profile.buckets;
  for (const r of B.native) {
    bucketOf.set(r.term, r.shadows ? "shadow" : "native");
    if (r.shadows) shadowOf.set(r.term, r.shadows);
  }
  for (const r of B.nativeProperties) bucketOf.set(r.term, "property");
  for (const r of B.extension) {
    bucketOf.set(r.term, "extension");
    parentOf.set(r.term, r.subClassOf);
  }
  for (const r of B.borrow) bucketOf.set(r.term, "borrow");

  /* ── the 64, derived mechanically from the served @context ────────────── */

  const terms = [];
  for (const key of Object.keys(ctx)) {
    if (NON_TERMS.has(key)) continue;

    const def = ctx[key];
    const iri = typeof def === "string" ? def : def["@id"];
    const isProperty = key[0] === key[0].toLowerCase();
    const ours = iri.startsWith(SCHEMA_ORG_AI);

    /* The extensional rule, ADR 0002 R3: the bucket is read off the address
       the term binds to, and there is no third place to look. profile.json
       agrees by construction; where a term is not in any of its lists (the
       structurally-pulled parents Integer/Number/Text are), the address
       decides. */
    let bucket = bucketOf.get(key);
    if (!bucket) bucket = ours ? "native" : "borrow";

    const node = record.get(iri);
    let comment, source;
    if (node) {
      comment = node["rdfs:comment"];
      source = "ours";
    } else if (!ours) {
      comment = borrowDefinition(p.things, key);
      source = "schema.org";
    } else {
      throw new Error(
        key + " binds to " + iri + " but extensions.jsonld carries no node for it"
      );
    }

    terms.push({
      term: key,
      iri: iri,
      ours: ours,
      isProperty: isProperty,
      bucket: bucket,
      comment: comment,
      lede: comment ? firstSentence(comment) : null,
      source: comment ? source : "unheld",
      /* Nothing below asserts a lineage the source file does not carry. */
      subClassOf: node ? expand(node["rdfs:subClassOf"]) : null,
      shadows: shadowOf.get(key) || (node ? expand(node["schemaai:shadows"]) : null),
      domain: node ? expandAll(node["schema:domainIncludes"]) : [],
      range: node ? expandAll(node["schema:rangeIncludes"]) : [],
      /* the bucket-prefixed on-disk name. APFS is case-insensitive and five
         term pairs differ only by case, so `Tool.html` and `tool.html` are the
         same file and the class page is silently lost. soa-machine §3.2. */
      slug: (isProperty ? "p-" : "c-") + key,
    });
  }

  if (parentOf.size) {
    for (const t of terms) {
      if (t.bucket === "extension" && !t.subClassOf) {
        t.subClassOf = parentOf.get(t.term) || null;
      }
    }
  }

  const by = (b) => terms.filter((t) => t.bucket === b);
  const classes = terms.filter((t) => !t.isProperty);
  const properties = terms.filter((t) => t.isProperty);

  /* native and shadow are one bucket in the profile; the shadow flag is a
     property of a row, not a fourth bucket. (soa-design-content §4.5) */
  const native = terms.filter((t) => t.bucket === "native" || t.bucket === "shadow");

  const model = {
    terms,
    classes,
    properties,
    native: native.filter((t) => !t.isProperty),
    nativeProperties: properties,
    extension: by("extension"),
    borrow: by("borrow"),
    shadows: by("shadow"),
    notAdmitted: context._generated.notAdmitted.terms.slice(),
    census: profile.census,
    overlay: overlay,
    /* the venue overlay's own additions, derived from its second context layer */
    overlayTerms: Object.keys(overlay["@context"][1])
      .filter((k) => !NON_TERMS.has(k) && k !== "studio")
      .sort(),
    byName: new Map(terms.map((t) => [t.term, t])),
    localName,
  };

  /* ── assertions that make a silent drift into a build failure ─────────── */

  const n = model.census;
  const expected = n.native + n.nativeProperties + n.borrow + n.extensionAdmitted;
  if (terms.length !== expected) {
    throw new Error(
      "term census disagrees with the context document: derived " +
        terms.length + ", profile.json says " + expected
    );
  }
  if (model.shadows.length !== Object.keys(context._generated.shadowedTerms.shadows).length) {
    throw new Error("shadow count disagrees with the context document");
  }
  for (const t of model.borrow) {
    if (t.iri.startsWith(SCHEMA_ORG_AI)) {
      throw new Error("gate G8: borrow term " + t.term + " re-homed under schema.org.ai");
    }
  }
  for (const t of model.shadows) {
    if (t.subClassOf) {
      throw new Error(
        "gate G7: shadow " + t.term + " carries a subClassOf edge. " +
        "The shadows hold a ratified lineage VETO; emitting one inverts a ruling."
      );
    }
  }

  return model;
}

module.exports = { build, localName, firstSentence, NON_TERMS };
