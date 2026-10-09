/**
 * A term's description, as Schema.org writes it, made into HTML, Markdown and plain text.
 *
 * Schema.org's comments mix four notations: Markdown links and `code`, [[Term]] references to other terms,
 * a little HTML (<a>, <br>, <code>, <p>, <ul>, <li>) and a few entities. Some carry the two characters "\n"
 * where a line break was meant. The words are kept exactly; only the notation is rendered. Anything that is
 * not one of those notations is shown as the text it is, never as markup.
 */

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–", hellip: "…" };

/** Splits a description into blocks: paragraphs and lists, each a list of inline nodes. */
export function parse(raw) {
  let s = String(raw || "")
    .replace(/\\n/g, "\n") // the two characters \n, where a newline was meant
    .replace(/\r\n?/g, "\n")
    .replace(/<\/?p>/gi, "\n\n")
    .replace(/<\/?ul>/gi, "\n\n")
    .replace(/<li>/gi, "\n* ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\u0001");
  const blocks = [];
  for (const para of s.split(/\n[ \t]*\n/)) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
    let text = [], items = null;
    const flushText = () => { if (text.length) { blocks.push({ type: "p", inline: inline(text.join(" ")) }); text = []; } };
    const flushList = () => { if (items) { blocks.push({ type: "ul", items: items.map((it) => inline(it)) }); items = null; } };
    for (const l of lines) {
      const m = /^[*-]\s+(.*)$/.exec(l);
      if (m && !/^\*[^*\s][^*]*\*/.test(l)) { flushText(); (items = items || []).push(m[1]); }
      else if (items) items[items.length - 1] += " " + l; // a list item's continuation line
      else text.push(l);
    }
    flushText(); flushList();
  }
  return blocks;
}

/* inline notation, tried in this order at each position */
const INLINE = new RegExp([
  /<a\s[^>]*?href=(?:"([^"]*)"|'([^']*)')[^>]*>((?:(?!<a\s)[\s\S])*?)<\/a>/.source, // 1|2 href, 3 text: a link closed in its own paragraph
  /<code>([\s\S]*?)<\/code>/.source, // 4
  /<(em|i|strong|b)>([\s\S]*?)<\/\5>/.source, // 5 tag, 6 text
  /\[\[([A-Za-z0-9_]+)\]\]?(?!\])/.source, // 7 term; "[[value]", with one bracket short, is read as meant
  /\[([^\[\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/.source, // 8 text, 9 url (one level of parentheses, as in Wikipedia addresses)
  /(`+)([^`]+?)\10(?!`)/.source, // 10 the backticks, 11 code
  /(?<![\w*])\*([^*\s](?:[^*]*[^*\s])?)\*(?![\w*])/.source, // 12 emphasis
  /(https?:\/\/[^\s<>"'`\]]+)/.source, // 13 a bare address
  /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/.source, // 14 entity
  /\\([\\_*\[\]`])/.source, // 15 an escaped character
  /(<a\s[^>]*>|<\/(?:a|code|em|i|strong|b)>)/.source, // 16 a tag left open or closed twice: markup noise, its words are kept
  /\u0001/.source, // a line break
].join("|"), "g");

/** inline nodes; inside a link (plain), nothing is linked again */
function inline(s, plain = false) {
  const out = [];
  let last = 0, m;
  const text = (t) => { if (!t) return; if (out.length && out[out.length - 1].t === "text") out[out.length - 1].v += t; else out.push({ t: "text", v: t }); };
  const re = new RegExp(INLINE.source, "g"); // its own copy: a link's text is read by a nested call
  while ((m = re.exec(s))) {
    text(s.slice(last, m.index));
    if (m[3] !== undefined) {
      const kids = inline(m[3].replace(/<[^>]*>/g, ""), true);
      if (plain) kids.forEach((k) => (k.t === "text" ? text(k.v) : out.push(k)));
      else out.push({ t: "link", href: m[1] ?? m[2], kids });
    }
    else if (m[4] !== undefined) out.push({ t: "code", v: decode(m[4]) });
    else if (m[5] !== undefined) out.push({ t: "em", strong: /^(strong|b)$/.test(m[5]), kids: inline(m[6], plain) });
    else if (m[7] !== undefined) { if (plain) text(m[7]); else out.push({ t: "ref", name: m[7], suffix: "" }); }
    else if (m[8] !== undefined) { const kids = inline(m[8], true); if (plain) kids.forEach((k) => (k.t === "text" ? text(k.v) : out.push(k))); else out.push({ t: "link", href: m[9], kids }); }
    else if (m[11] !== undefined) out.push({ t: "code", v: m[11].trim() });
    else if (m[12] !== undefined) out.push({ t: "em", kids: inline(m[12], plain) });
    else if (m[13] !== undefined) {
      // an address ends before the punctuation that closes its sentence
      const keep = trimUrl(m[13]);
      if (plain) text(keep); else out.push({ t: "link", href: keep, kids: [{ t: "text", v: keep }], bare: true });
      text(m[13].slice(keep.length));
    }
    else if (m[14] !== undefined) text(decode("&" + m[14] + ";"));
    else if (m[15] !== undefined) text(m[15]);
    else if (m[16] !== undefined) { /* dropped */ }
    else out.push({ t: "br" });
    last = re.lastIndex;
  }
  text(s.slice(last));
  // "[[encoding]]s": a plural ending joins its link
  for (let i = 0; i < out.length - 1; i++) {
    if (out[i].t === "ref" && out[i + 1].t === "text") {
      const sm = /^(e?s)\b/.exec(out[i + 1].v);
      if (sm) { out[i].suffix = sm[1]; out[i + 1].v = out[i + 1].v.slice(sm[1].length); }
    }
  }
  return out.filter((n) => n.t !== "text" || n.v);
}

/** a bare address loses the punctuation that ends its sentence, and a closing parenthesis it did not open */
function trimUrl(u) {
  let x = u;
  for (;;) {
    const y = x.replace(/[.,;:!?'"]+$/, "");
    const open = (y.match(/\(/g) || []).length, close = (y.match(/\)/g) || []).length;
    const z = y.endsWith(")") && close > open ? y.slice(0, -1) : y;
    if (z === x) return x;
    x = z;
  }
}

function decode(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (all, e) => {
    if (e[0] === "#") { const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : all; }
    return ENTITIES[e.toLowerCase()] ?? all;
  });
}

/* ── rendering ─────────────────────────────────────────────────────────────── */

export const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * ctx.ref(name) -> { href, label } for a term that exists, or null.
 * ctx.url(href) -> the address a link should take (Schema.org's own relative links are made absolute).
 */
export function toHtml(blocks, ctx) {
  const run = (nodes) => nodes.map((n) => {
    if (n.t === "text") return escHtml(n.v);
    if (n.t === "br") return "<br>";
    if (n.t === "code") return "<code>" + escHtml(n.v) + "</code>";
    if (n.t === "em") return (n.strong ? "<strong>" : "<em>") + run(n.kids) + (n.strong ? "</strong>" : "</em>");
    if (n.t === "ref") {
      const r = ctx.ref(n.name);
      return r ? '<a href="' + escHtml(r.href) + '">' + escHtml(n.name + n.suffix) + "</a>" : escHtml(n.name + n.suffix);
    }
    if (n.t === "link") {
      const href = ctx.url(n.href);
      const inner = run(n.kids);
      if (!href) return inner;
      const ext = /^https?:\/\//.test(href);
      return '<a href="' + escHtml(href) + '"' + (ext ? ' class="ext" rel="noopener"' : "") + ">" + (n.bare ? '<span class="url">' + inner + "</span>" : inner) + "</a>";
    }
    return "";
  }).join("");
  return blocks.map((b) => (b.type === "p" ? "<p>" + run(b.inline) + "</p>" : "<ul>" + b.items.map((it) => "<li>" + run(it) + "</li>").join("") + "</ul>")).join("");
}

/** Markdown; `oneLine` gives a single line for a table cell */
export function toMarkdown(blocks, ctx, oneLine = false) {
  const cell = (s) => (oneLine ? s.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ") : s);
  const mdEsc = (s) => s.replace(/([\\`*_\[\]])/g, "\\$1");
  const run = (nodes) => nodes.map((n) => {
    if (n.t === "text") return mdEsc(n.v);
    if (n.t === "br") return oneLine ? " " : "  \n";
    if (n.t === "code") return n.v.includes("`") ? "`` " + n.v + " ``" : "`" + n.v + "`";
    if (n.t === "em") return (n.strong ? "**" : "*") + run(n.kids) + (n.strong ? "**" : "*");
    if (n.t === "ref") { const r = ctx.ref(n.name); return r ? "[" + mdEsc(n.name + n.suffix) + "](" + ctx.abs(r.href) + ")" : mdEsc(n.name + n.suffix); }
    if (n.t === "link") { const href = ctx.url(n.href); const inner = run(n.kids); return href ? "[" + inner + "](" + ctx.abs(href).replace(/\)/g, "%29").replace(/\(/g, "%28") + ")" : inner; }
    return "";
  }).join("");
  const parts = blocks.map((b) => (b.type === "p" ? run(b.inline) : b.items.map((it) => (oneLine ? "" : "* ") + run(it)).join(oneLine ? "; " : "\n")));
  return cell(parts.join(oneLine ? " " : "\n\n"));
}

/** plain words, for meta descriptions, search and share cards */
export function toPlain(blocks) {
  const run = (nodes) => nodes.map((n) => (n.t === "text" || n.t === "code" ? n.v : n.t === "br" ? " " : n.t === "ref" ? n.name + n.suffix : n.kids ? run(n.kids) : "")).join("");
  return blocks.map((b) => (b.type === "p" ? run(b.inline) : b.items.map(run).join("; "))).join(" ").replace(/\s+/g, " ").trim();
}

/** the first sentence of plain text, cut at a word if it runs past max */
export function firstSentence(plain, max = 160) {
  const m = /^(.{12,}?[.!?])(?=\s+[A-Z(\[]|$)/.exec(plain);
  let s = m ? m[1] : plain;
  if (s.length > max) s = s.slice(0, max).replace(/\s+\S*$/, "").replace(/[,;:(\s]+$/, "") + "…";
  return s;
}
