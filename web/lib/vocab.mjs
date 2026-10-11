/**
 * The vocabulary the site shows: Schema.org's release as published (web/data/), and the .org.ai superset
 * (extensions.jsonld at the root of this repository), read into one set of terms with every relationship
 * worked out. References are resolved by full IRI, so the superset's Product and Schema.org's Product,
 * which share a name, stay two different terms.
 *
 * Every address on the site is a term's name. Where a superset term shares its name with a Schema.org term
 * (Event, Product and a few more), the address keeps showing the Schema.org term, as it always has, and the
 * superset term appears on the same page as a second sense, at #org-ai.
 */

import { readFileSync } from "node:fs";

const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const idsOf = (v) => arr(v).map((x) => (typeof x === "string" ? x : x && x["@id"])).filter(Boolean);
const textOf = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return textOf(v.find((x) => x && x["@language"] === "en") || v[0]);
  return v["@value"] || "";
};
const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

export const SCHEMA = "https://schema.org/";
export const ORGAI = "https://schema.org.ai/";

export function loadVocab(schemaFile, extensionsFile) {
  const graph = JSON.parse(readFileSync(schemaFile, "utf8"))["@graph"];
  const ext = JSON.parse(readFileSync(extensionsFile, "utf8"))["@graph"];
  const problems = [];
  const all = []; // every term, in both vocabularies
  const byId = new Map(); // "schema:Person" or "schemaai:Agent" -> term

  function make(curie, n, ns) {
    const name = curie.slice(curie.indexOf(":") + 1);
    const types = arr(n["@type"]);
    const kind = types.includes("rdfs:Class") ? "type" : types.includes("rdf:Property") ? "property" : "value";
    const t = {
      name, ns, kind, curie,
      iri: (ns === "schema" ? SCHEMA : ORGAI) + name,
      label: textOf(n["rdfs:label"]) || name,
      comment: textOf(n["rdfs:comment"]).trim(),
      raw: { types, parents: idsOf(n["rdfs:subClassOf"]), domain: idsOf(n["schema:domainIncludes"]), range: idsOf(n["schema:rangeIncludes"]),
        subPropertyOf: idsOf(n["rdfs:subPropertyOf"]), inverseOf: idsOf(n["schema:inverseOf"]), supersededBy: idsOf(n["schema:supersededBy"]),
        shadows: idsOf(n["schemaai:shadows"]) },
      pending: idsOf(n["schema:isPartOf"]).includes("https://pending.schema.org"),
      sources: idsOf(n["schema:source"]).filter((u) => /^https?:\/\//.test(u)),
      dataType: types.includes("schema:DataType"),
      parents: [], children: [], domain: [], range: [], ownProps: [], valueOf: [], members: [], memberOf: [],
      subPropertyOf: [], subProps: [], inverseOf: [], supersededBy: [], supersedes: [], shadows: null, sense: null, senseOf: null,
    };
    if (byId.has(curie)) problems.push("two terms with the IRI " + curie);
    byId.set(curie, t);
    all.push(t);
    return t;
  }

  for (const n of graph) if (typeof n["@id"] === "string" && n["@id"].startsWith("schema:")) make(n["@id"], n, "schema");
  for (const n of ext) {
    if (!String(n["@id"]).startsWith("schemaai:")) { problems.push("extensions.jsonld: an IRI outside schemaai: " + n["@id"]); continue; }
    make(n["@id"], n, "orgai");
  }

  // a reference to a term outside both vocabularies (rdfs:Class, say) is not one the site can show
  const resolve = (t, ids, what, { outside = false } = {}) => ids.map((id) => {
    const r = byId.get(id);
    if (!r && !(outside && !/^schema(ai)?:/.test(id))) problems.push(`${t.curie}: ${what} ${id} is not in either vocabulary`);
    return r;
  }).filter(Boolean);

  for (const t of all) {
    if (t.kind === "type") {
      t.parents = resolve(t, t.raw.parents, "parent", { outside: true });
      // Schema.org's data types (Text, Number, Boolean, Date, DateTime, Time) are instances of DataType, not subclasses
      if (t.dataType && !t.parents.length) t.parents = [byId.get("schema:DataType")];
    }
    if (t.kind === "property") { t.domain = resolve(t, t.raw.domain, "domain"); t.range = resolve(t, t.raw.range, "range"); }
    if (t.kind === "value") t.memberOf = resolve(t, t.raw.types.filter((x) => /^schema(ai)?:/.test(x)), "type");
    t.subPropertyOf = resolve(t, t.raw.subPropertyOf, "super-property", { outside: true });
    t.inverseOf = resolve(t, t.raw.inverseOf, "inverse");
    t.supersededBy = resolve(t, t.raw.supersededBy, "successor");
    t.shadows = resolve(t, t.raw.shadows, "shadowed term")[0] || null;
  }

  // the reverse edges
  for (const t of all) {
    for (const p of t.parents) p.children.push(t);
    for (const d of t.domain) d.ownProps.push(t);
    for (const r of t.range) r.valueOf.push(t);
    for (const m of t.memberOf) m.members.push(t);
    for (const s of t.subPropertyOf) s.subProps.push(t);
    for (const s of t.supersededBy) s.supersedes.push(t);
  }
  for (const t of all) for (const k of ["parents", "children", "domain", "range", "ownProps", "valueOf", "members", "memberOf", "subProps", "supersedes", "inverseOf", "subPropertyOf", "supersededBy"]) t[k].sort(byName);

  // pages: one per name. A superset term that shares a Schema.org term's name is that page's second sense.
  const pages = new Map();
  for (const t of all) {
    const have = pages.get(t.name);
    if (!have) { pages.set(t.name, t); continue; }
    if (have.ns === "schema" && t.ns === "orgai") { have.sense = t; t.senseOf = have; }
    else problems.push("two terms named " + t.name + " in the same vocabulary");
  }
  // a site served from a case-sensitive store but built on a case-insensitive disk: no two pages of a kind may differ only in case
  const folded = new Map();
  for (const t of pages.values()) {
    const k = t.kind + ":" + t.name.toLowerCase();
    if (folded.has(k)) problems.push(`${t.name} and ${folded.get(k)} differ only in case`);
    folded.set(k, t.name);
  }

  // inheritance, nearest first; a type reached by two paths counts at its nearest
  const ancestry = new Map();
  const ancestors = (t) => {
    if (ancestry.has(t)) return ancestry.get(t);
    const seen = new Map([[t, 0]]), queue = [t], order = [];
    while (queue.length) {
      const x = queue.shift();
      for (const p of x.parents) {
        if (p === t) { problems.push("a cycle through " + t.curie); continue; }
        if (!seen.has(p)) { seen.set(p, seen.get(x) + 1); order.push(p); queue.push(p); }
      }
    }
    const res = order.map((a) => ({ type: a, depth: seen.get(a) }));
    ancestry.set(t, res);
    return res;
  };
  for (const t of all) if (t.kind === "type") {
    t.ancestors = ancestors(t);
    // the trail: first parents all the way up
    const trail = [];
    for (let x = t, guard = 0; x && guard < 64; x = x.parents[0], guard++) trail.unshift(x);
    t.trail = trail;
    t.isEnum = t.ancestors.some((a) => a.type.curie === "schema:Enumeration");
    // properties by the type they come from: its own first, then each ancestor's, each property once, at its nearest
    const listed = new Set();
    t.groups = [{ from: t, depth: 0 }].concat(t.ancestors.map((a) => ({ from: a.type, depth: a.depth }))).map((g) => {
      const props = g.from.ownProps.filter((p) => !listed.has(p));
      props.forEach((p) => listed.add(p));
      return { ...g, props };
    }).filter((g) => g.props.length);
  }
  for (const t of all) if (t.kind === "type") {
    let n = 0; const stack = [...t.children], seen = new Set();
    while (stack.length) { const c = stack.pop(); if (seen.has(c)) continue; seen.add(c); n++; stack.push(...c.children); }
    t.descendants = n;
  }

  const roots = all.filter((t) => t.kind === "type" && !t.parents.length && !t.senseOf).map((t) => t.curie).sort();
  if (problems.length) throw new Error("vocabulary:\n  " + problems.join("\n  "));
  return { all, pages, byId, roots };
}
