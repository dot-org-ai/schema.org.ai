/**
 * What each share card says. scripts/og.mjs renders these; build.mjs reads the same list, so a page and its
 * card always agree. A card is 1200 x 630: the Foundation's lockup with "Schema", the term's name, and one line
 * that says what kind of term it is.
 */

export const dirOf = (t) => (t.kind === "type" ? "t" : t.kind === "property" ? "p" : "v");
const and = (a) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

export function termCard(t) {
  const card = { name: dirOf(t) + "/" + t.name, sub: "Schema", headline: t.name, camel: true };
  if (t.kind === "type") {
    card.detailBold = "Type";
    card.detail = t.ns === "orgai" ? "in the .org.ai superset"
      : t.parents.length ? "a kind of " + and(t.parents.map((p) => p.name))
      : t.name === "Thing" ? "where every type starts" : "where every data type starts";
  } else if (t.kind === "property") {
    card.detailBold = "Property";
    card.detail = t.ns === "orgai" ? "in the .org.ai superset"
      : t.domain.length ? "on " + (t.domain.length <= 2 ? and(t.domain.map((d) => d.name)) : t.domain.length + " types") : "";
  } else {
    card.detailBold = "Value";
    card.detail = "of " + and(t.memberOf.map((m) => m.name));
  }
  return card;
}

export const SITE_CARDS = [
  { name: "og", sub: "Schema", headline: "Every Schema.org term, and the ones we added." },
  { name: "og-types", sub: "Schema", headline: "Every type, by what it descends from." },
  { name: "og-properties", sub: "Schema", headline: "Every property, from A to Z." },
];

/** the card's own words, for og:image:alt */
export const cardAlt = (c) => "Org.AI Foundation" + (c.sub ? " / " + c.sub : "") + ": " + c.headline +
  (c.detailBold || c.detail ? (/[.!?]$/.test(c.headline) ? " " : ". ") + [c.detailBold, c.detail].filter(Boolean).join(" · ") + "." : "");
