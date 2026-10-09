/* The Org.AI Foundation's search, the same on every one of its sites (foundation, schema, standards, law, insurance).
   The magnifier in the header, ⌘K (Ctrl K) or "/" opens it: a palette on a wide screen, a tray from the bottom on a phone.
   From any site it finds the occupations in the record, Schema.org's terms, every site's own pages, and the sites.

   Built from dot-org-ai/foundation.org.ai (src/find.js and src/find.css; build.js fills in the slots below) and copied,
   unchanged, to each of the other sites. Load it with the site's name: <script src="/find.js" data-site="schema" defer>.
   Its look comes from the design tokens every Foundation site defines. */
(() => {
  "use strict";
  const me = document.currentScript;
  const SITE = (me && me.dataset.site) || "foundation";
  const HOME = { foundation: "https://foundation.org.ai", schema: "https://schema.org.ai", standards: "https://standards.org.ai", law: "https://law.org.ai", insurance: "https://insurance.org.ai" };
  // a page of this site keeps its own address (so a local copy stays local); another site's is absolute
  const at = (site, path) => (site === SITE ? path : HOME[site] + path);
  const host = (site) => HOME[site].replace("https://", "");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => n.toLocaleString("en-US");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const phone = matchMedia("(max-width: 599px)");
  const CSS = "/* The Org.AI Foundation's search palette. build.js embeds this in find.js, which every Foundation site loads; it\n   uses the design tokens every Foundation site defines (--ground, --raise, --rule, --ink, --now, --ease-out ...). */\nhtml.pal-open { overflow: hidden; }\n.pal { position: fixed; inset: 0; z-index: 60; }\n.pal[hidden] { display: none; }\n.pal-bd { position: absolute; inset: 0; background: oklch(0.12 0.005 78 / 0.66); opacity: 0; }\n.pal.in .pal-bd { opacity: 1; }\n.pal-sheet {\n  --top: clamp(56px, 11vh, 120px);\n  position: absolute; left: 50%; top: var(--top); display: flex; flex-direction: column;\n  width: min(640px, calc(100% - 32px)); max-height: min(600px, calc(100svh - var(--top) * 2));\n  background: var(--raise); border: 1px solid var(--rule); border-radius: 12px; overflow: hidden;\n  box-shadow: 0 40px 80px -24px oklch(0.06 0.004 78 / 0.85);\n  opacity: 0; transform: translate(-50%, -6px) scale(0.985);\n}\n.pal.in .pal-sheet { opacity: 1; transform: translate(-50%, 0); }\n.pal-grip { display: none; }\n.pal-field { flex: none; display: flex; align-items: center; gap: 12px; height: 60px; padding: 0 12px 0 18px; border-bottom: 1px solid var(--rule-faint); }\n.pal-field .ic { width: 18px; height: 18px; flex: none; fill: none; stroke: var(--ink-3); stroke-width: 1.6; stroke-linecap: round; }\n.pal-field input { flex: 1; min-width: 0; height: 100%; padding: 0; background: none; border: 0; outline: none; color: var(--ink); font: inherit; font-size: 1.125rem; caret-color: var(--now); -webkit-appearance: none; appearance: none; }\n.pal-field input::placeholder { color: var(--ink-3); }\n.pal-field input::-webkit-search-cancel-button, .pal-field input::-webkit-search-decoration { -webkit-appearance: none; display: none; }\n.pal-x { flex: none; display: inline-flex; align-items: center; height: 30px; padding: 0 8px; border: 1px solid var(--rule); border-radius: 4px; background: none; color: var(--ink-3); font: inherit; font-size: 0.75rem; cursor: pointer; transition: color 160ms var(--ease-state), border-color 160ms var(--ease-state); }\n.pal-x .t { display: none; }\n@media (hover: hover) { .pal-x:hover { color: var(--ink); border-color: var(--edge); } }\n.pal-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 6px; scroll-padding: 6px; }\n.pal-g + .pal-g { margin-top: 4px; }\n.pal-gh { padding: 10px 12px 6px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em; color: var(--ink-3); }\n.pal-o { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; column-gap: 12px; align-items: center; min-height: 48px; padding: 8px 12px; border-radius: 6px; cursor: pointer; }\n.pal-o .pi { display: grid; place-items: center; width: 20px; height: 20px; color: var(--ink-3); transition: color 140ms var(--ease-state); }\n.pal-o .pi svg { width: 20px; height: 20px; fill: currentColor; }\n.pal-o .pi svg.ln { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }\n.pal-o .pt { min-width: 0; color: var(--ink); line-height: 1.35; overflow-wrap: anywhere; }\n.pal-o .pm { color: var(--ink-3); font-size: 0.8125rem; line-height: 1.35; text-align: right; }\n.pal-o mark { background: none; color: var(--now); }\n.pal-o[aria-selected=\"true\"] { background: var(--raise-hi); }\n.pal-o[aria-selected=\"true\"] .pi { color: var(--now); }\n.pal-none { padding: 18px 14px; color: var(--ink-2); font-size: 0.9375rem; }\n.pal-foot { flex: none; display: flex; gap: 20px; padding: 10px 16px; border-top: 1px solid var(--rule-faint); font-size: 0.75rem; color: var(--ink-3); }\n.pal-foot kbd { display: inline-block; min-width: 18px; margin-right: 3px; padding: 1px 4px; border: 1px solid var(--rule); border-radius: 3px; font: inherit; text-align: center; }\n@media not ((hover: hover) and (pointer: fine)) { .pal-foot { display: none; } }\n/* a phone: a tray from the bottom, sitting on the keyboard (find.js sets --kb and --vvh from the visual viewport) */\n@media (max-width: 599px) {\n  .pal-sheet {\n    left: 0; right: 0; top: auto; bottom: var(--kb, 0px); width: auto; max-height: none;\n    height: min(86svh, calc(var(--vvh, 100svh) - 24px));\n    border-width: 1px 0 0; border-radius: 16px 16px 0 0; padding-bottom: env(safe-area-inset-bottom);\n    opacity: 1; transform: translateY(100%);\n  }\n  .pal.in .pal-sheet { transform: none; }\n  .pal.drag .pal-sheet { transition: none; }\n  .pal-grip { flex: none; display: grid; place-items: center; height: 22px; touch-action: none; cursor: grab; }\n  .pal-grip::before { content: \"\"; width: 36px; height: 4px; border-radius: 2px; background: var(--rule); }\n  .pal-field { height: 52px; padding: 0 4px 0 16px; touch-action: none; }\n  .pal-field input { font-size: 1.0625rem; touch-action: manipulation; }\n  .pal-x { height: 44px; padding: 0 12px; border: 0; color: var(--ink-2); font-size: 0.9375rem; }\n  .pal-x .k { display: none; }\n  .pal-x .t { display: inline; }\n  .pal-o { grid-template-columns: 20px minmax(0, 1fr); row-gap: 1px; }\n  .pal-o .pm { grid-column: 2; text-align: left; }\n}\n/* it moves only for those who allow motion; otherwise it is simply there, and simply gone */\n@media (prefers-reduced-motion: no-preference) {\n  .pal-bd { transition: opacity 200ms var(--ease-state); }\n  .pal-sheet { transition: opacity 180ms var(--ease-state), transform 240ms var(--ease-out); }\n}\n@media (prefers-reduced-motion: no-preference) and (max-width: 599px) {\n  .pal-sheet { transition: transform 340ms var(--ease-out); }\n}\n\n\n";
  let OCC = [];

  /* ---------------- occupations: the home page of foundation.org.ai's own matching, word for word ---------------- */
  const ALIASES = {
    cop: "police", doctor: "physician", trucker: "truck", lorry: "truck", realtor: "real estate", coder: "programmer",
    attorney: "lawyer", solicitor: "lawyer", caregiver: "home health", carer: "home health", nanny: "childcare",
    vet: "veterinar", dev: "developer", hairstylist: "hairdresser", farmer: "farm", ceo: "chief executive", hr: "human resources",
  };
  const FEAT = new Set(["29-1292.00", "53-3032.00", "23-2011.00", "13-1031.00", "29-1141.00", "43-3031.00", "41-3021.00", "27-3023.00", "25-2021.00", "15-1252.00", "23-1011.00", "33-3051.00", "35-1011.00", "41-2011.00", "47-2111.00", "47-2152.00", "11-1021.00"]);
  const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]s\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  // singular and plural forms of one word, so "midwife" finds Nurse Midwives and "secretary" finds Secretaries
  function forms(w) {
    const v = new Set([w]);
    if (w.length > 3) {
      if (w.endsWith("ies")) v.add(w.slice(0, -3) + "y");
      else if (w.endsWith("ves")) { v.add(w.slice(0, -3) + "fe"); v.add(w.slice(0, -3) + "f"); }
      else if (w.endsWith("s") && !w.endsWith("ss")) v.add(w.slice(0, -1));
      if (w.endsWith("fe")) v.add(w.slice(0, -2) + "ves");
      else if (w.endsWith("f")) v.add(w.slice(0, -1) + "ves");
      else if (w.endsWith("y") && !/[aeiou]y$/.test(w)) v.add(w.slice(0, -1) + "ies");
    }
    return [...v].filter((x) => x.length >= 2);
  }
  function search(q) {
    const nq = norm(q);
    if (nq.length < 2) return null;
    const words = nq.split(" ");
    const last = words[words.length - 1], stem = words.slice(0, -1).join(" ");
    // phrase terms: the whole query, its last word in either number, and any everyday alias
    const phrases = new Set(forms(last).map((f) => (stem ? stem + " " + f : f)));
    for (const ph of [...phrases]) if (ALIASES[ph]) phrases.add(ALIASES[ph]);
    const tokens = words.filter((w) => w.length >= 2).map((w) => forms(w).concat(ALIASES[w] ? [ALIASES[w]] : []));
    const out = [];
    for (const o of OCC) {
      let best = 9, terms = null;
      for (const t of phrases) {
        const i = o.t.indexOf(t);
        if (i < 0) continue;
        const sc = o.head.startsWith(t) ? 0 : i === 0 || o.t[i - 1] === " " ? 1 : 2;
        if (sc < best) { best = sc; terms = [t]; }
      }
      // every word somewhere in the title: "police officer" finds Police and Sheriff's Patrol Officers
      if (!terms && tokens.length > 1) {
        const hit = tokens.map((alts) => alts.find((a) => o.t.includes(a)));
        if (hit.every(Boolean)) { best = 3; terms = hit; }
      }
      if (terms) out.push({ o, s: best, terms });
    }
    out.sort((a, b) =>
      a.s - b.s || (FEAT.has(b.o.c) ? 1 : 0) - (FEAT.has(a.o.c) ? 1 : 0) || (b.o.k > 0) - (a.o.k > 0) || (a.o.c.endsWith(".00") ? 0 : 1) - (b.o.c.endsWith(".00") ? 0 : 1) || a.o.n.length - b.o.n.length);
    return out;
  }
  // marks every matched term in the original title; spaces in a term match any run of punctuation ("tractor-trailer")
  function highlight(title, terms) {
    const pat = terms.slice().sort((a, b) => b.length - a.length)
      .map((t) => t.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^a-z0-9]+")).join("|");
    const re = new RegExp(pat, "gi");
    let out = "", at = 0, m;
    while ((m = re.exec(title))) {
      if (!m[0]) { re.lastIndex++; continue; }
      out += esc(title.slice(at, m.index)) + "<mark>" + esc(m[0]) + "</mark>";
      at = m.index + m[0].length;
    }
    return out + esc(title.slice(at));
  }



  /* ---------------- Schema.org's terms: schema.org.ai's own ranking ---------------- */
  // whole name, then its start, then the start of one of its words (so "date" finds startDate), then anywhere in it
  let TERMS = [];
  const words = (n) => n.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const squash = (q) => q.toLowerCase().replace(/[^a-z0-9]+/g, "");
  function searchTerms(q) {
    const nq = squash(q);
    if (nq.length < 2) return [];
    const out = [];
    for (const e of TERMS) {
      const s = e.l === nq ? 0 : e.l.startsWith(nq) ? 1 : e.tails.some((t) => t.startsWith(nq)) ? 2 : e.l.includes(nq) ? 3 : -1;
      if (s >= 0) out.push([s, e]);
    }
    const rank = { t: 0, p: 1, v: 2 };
    out.sort((a, b) => a[0] - b[0] || (a[1].f ? 1 : 0) - (b[1].f ? 1 : 0) || rank[a[1].k] - rank[b[1].k] || a[1].n.length - b[1].n.length || (a[1].n < b[1].n ? -1 : 1));
    return out.map((x) => x[1]);
  }
  function markTerm(name, q) {
    const nq = squash(q), i = name.toLowerCase().indexOf(nq);
    return i < 0 || !nq ? esc(name) : esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + nq.length)) + "</mark>" + esc(name.slice(i + nq.length));
  }

  /* ---------------- every site's own pages, and the sites ---------------- */
  const PAGES = [
    { s: "foundation", t: "Every occupation", d: "All 1,016, in 23 families of work", p: "/occupations", k: "occupations jobs browse list all directory" },
    { s: "foundation", t: "Built in the open", d: "What is open today, and the whole map", p: "/#data", k: "use the data json api code open map llms" },
    { s: "foundation", t: "Find your way in", d: "Start from who you are", p: "/#paths", k: "paths build research report policy workers" },
    { s: "foundation", t: "Copied from 17 sources", d: "Every task says where it came from", p: "/#sources", k: "sources onet o*net provenance cite trace" },
    { s: "foundation", t: "Partner with us", d: "Fund it, contribute data, build on it, or study it", p: "/#partner", k: "partner fund donate contribute support" },
    { s: "schema", t: "Every type", d: "Each by what it descends from", p: "/types", k: "types tree hierarchy schema vocabulary" },
    { s: "schema", t: "Every property", d: "From A to Z", p: "/properties", k: "properties schema vocabulary" },
    { s: "schema", t: "The .org.ai superset", d: "The types and properties the Foundation adds", p: "/#superset", k: "superset extensions agent tool" },
    { s: "schema", t: "Schema.org as data", d: "Every term as JSON-LD and Markdown", p: "/#use", k: "use the data json jsonld markdown api npm" },
    { s: "standards", t: "The register", d: "The standards we copy, shelf by shelf", p: "/#register", k: "register standards copied onet naics gs1 iso" },
    { s: "standards", t: "Our standards", d: "The six the Foundation writes", p: "/#ours", k: "ours axp written" },
    { s: "standards", t: "How we cite", d: "One record, traced back to its source", p: "/#cite", k: "cite citation source" },
    { s: "law", t: "The law program", d: "Access to justice, with the lawyer kept in", p: "/", k: "law legal justice program" },
    { s: "law", t: "Reserved acts", d: "Five acts of legal help stay with a licensed human", p: "/reserved-acts", k: "reserved acts lawyer licensed law" },
    { s: "law", t: "Minnesota", d: "The precedent, the ask, the pilot", p: "/mn", k: "minnesota pilot privilege paraprofessional law" },
    { s: "insurance", t: "The licensed act", d: "Who may sell, solicit or negotiate insurance", p: "/#the-licensed-act", k: "insurance license producer licensed act" },
    { s: "insurance", t: "The method", d: "Inherited, unchanged, from law.org.ai", p: "/#the-method", k: "insurance method" },
    { s: "insurance", t: "Where it comes from", d: "Every claim names a primary source", p: "/#where-it-comes-from", k: "insurance sources" },
  ];
  // the sites, each in the words it uses for itself (the home page's "Open today", the programs' own cards)
  const SITES = [
    { s: "foundation", t: "foundation.org.ai", d: "An open record of what people do for a living", h: HOME.foundation, k: "org.ai foundation home record" },
    { s: "schema", t: "schema.org.ai", d: "The shared vocabulary", h: HOME.schema },
    { s: "standards", t: "standards.org.ai", d: "What we copied, and what we wrote", h: HOME.standards },
    { s: "law", t: "law.org.ai", d: "Access to justice, with the lawyer kept in", h: HOME.law },
    { s: "insurance", t: "insurance.org.ai", d: "The second industry we are writing down", h: HOME.insurance },
    { t: "id.org.ai", d: "Sign-in for people and AI agents", h: "https://id.org.ai" },
    { t: "mdx.org.ai", d: "Documents that people and machines can both read", h: "https://mdx.org.ai" },
    { t: "primitives.org.ai", d: "The building blocks", h: "https://primitives.org.ai" },
    { t: "github.com/dot-org-ai", d: "The code", h: "https://github.com/dot-org-ai", k: "github source code repositories" },
  ].map((x) => ({ ...x, h: x.s ? at(x.s, "/") : x.h }));
  const OCC_PICKS = ["29-1292.00", "53-3032.00", "23-2011.00", "29-1141.00"];
  const TERM_PICKS = ["Person", "Organization", "Event", "startDate"];

  /* ---------------- the record and the vocabulary, fetched when someone reaches for search ---------------- */
  let FAMS = [], BYCODE = new Map(), occLoading = null, occFailed = false, termLoading = null, termFailed = false;
  function loadOcc() {
    if (!occLoading) {
      occLoading = fetch(at("foundation", "/data/occupations.json"))
        .then((r) => { if (!r.ok) throw new Error("occupations " + r.status); return r.json(); })
        .then((d) => {
          OCC = d.occupations.map((o) => ({ ...o }));
          for (const o of OCC) {
            o.t = norm(o.n);
            const seg = o.n.split(",")[0].toLowerCase().split(/[\s/-]+/);
            o.head = norm(seg[seg.length - 1] || "");
            BYCODE.set(o.c, o);
          }
          FAMS = d.summary.groups.map((g) => ({ t: g.name, n: g.count, h: at("foundation", "/occupations#family-" + g.g), g: g.g }));
          occFailed = false;
        })
        .catch((e) => { occLoading = null; occFailed = true; throw e; });
    }
    return occLoading;
  }
  function loadTerms() {
    if (!termLoading) {
      termLoading = fetch(at("schema", "/search.json"))
        .then((r) => { if (!r.ok) throw new Error("terms " + r.status); return r.json(); })
        .then((rows) => {
          TERMS = rows.map(([n, k, d, f]) => { const w = words(n); return { n, k, d, f, l: n.toLowerCase(), tails: w.map((_, i) => w.slice(i).join("")) }; });
          termFailed = false;
        })
        .catch((e) => { termLoading = null; termFailed = true; throw e; });
    }
    return termLoading;
  }
  const loadAll = () => Promise.allSettled([loadOcc(), loadTerms()]);
  // a page, a site or a family matches when every word typed begins one of its words
  function matches(item, q) {
    const ws = norm(q).split(" ").filter(Boolean);
    if (!ws.length) return false;
    const hay = (norm(item.t) + " " + norm(item.k || "") + " " + norm(item.d || "")).split(" ");
    return ws.every((w) => hay.some((h) => h.startsWith(w)));
  }
  const famName = (g) => { const f = FAMS.find((x) => x.g === g); return f ? f.t : ""; };

  /* ---------------- results ---------------- */
  const ICON = {
    occ: '<svg viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="5.6" ry="3.2" transform="rotate(-24 10 10)"/></svg>',
    term: '<svg viewBox="0 0 20 20" class="ln"><path d="M7.5 5.5L4 10l3.5 4.5M12.5 5.5L16 10l-3.5 4.5"/></svg>',
    fam: '<svg viewBox="0 0 20 20"><circle cx="6.5" cy="12.5" r="2.4"/><circle cx="13.5" cy="12.5" r="2.4"/><circle cx="10" cy="6.4" r="2.4"/></svg>',
    page: '<svg viewBox="0 0 20 20" class="ln"><path d="M5 10h10M11 6l4 4-4 4"/></svg>',
    site: '<svg viewBox="0 0 20 20" class="ln"><path d="M7 13l6-6M8 7h5v5"/></svg>',
    all: '<svg viewBox="0 0 20 20" class="ln"><circle cx="9" cy="9" r="4.6"/><path d="M12.5 12.5l3.2 3.2"/></svg>',
  };
  const KIND = { t: "Type", p: "Property", v: "Value" };
  const occItem = (o, terms) => ({ kind: "occ", h: at("foundation", "/occupations/" + o.c), html: terms ? highlight(o.n, terms) : esc(o.n), meta: [famName(o.g), o.k ? (o.k === 1 ? "1 task" : o.k + " tasks") : "No tasks listed"].filter(Boolean).join(" · ") });
  const termItem = (e, q) => ({ kind: "term", h: at("schema", "/" + e.n + (e.f === 2 ? "#org-ai" : "")), html: markTerm(e.n, q || ""), meta: (e.f ? "Superset " + KIND[e.k].toLowerCase() : KIND[e.k]) });
  const pageItem = (x) => ({ kind: "page", h: at(x.s, x.p), html: esc(x.t), meta: (x.s === SITE ? "" : host(x.s) + " · ") + x.d });
  // in a group whose heading already names the site
  const namedPageItem = (x) => ({ ...pageItem(x), meta: x.d });
  const siteItem = (x) => ({ kind: "site", h: x.h, html: esc(x.t), meta: x.d });
  const famItem = (x) => ({ kind: "fam", h: x.h, html: esc(x.t), meta: x.n + " occupations" });
  // a group from another site says where it lives
  const label = (name, site) => (site && site !== SITE ? name + " · " + host(site) : name);

  let pal, sheet, input, list, status, opener = null, items = [], active = -1, seq = 0, closeTimer = 0;
  function build() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    pal = document.createElement("div");
    pal.className = "pal"; pal.id = "pal"; pal.hidden = true;
    pal.innerHTML =
      '<div class="pal-bd" aria-hidden="true"></div>' +
      '<div class="pal-sheet" role="dialog" aria-modal="true" aria-label="Search the Org.AI Foundation">' +
        '<div class="pal-grip" aria-hidden="true"></div>' +
        '<div class="pal-field"><svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.6 12.6l4 4"/></svg>' +
          '<input id="pal-q" type="search" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" aria-label="Search the Org.AI Foundation" placeholder="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go">' +
          '<button class="pal-x" type="button"><span class="k">esc</span><span class="t">Cancel</span><span class="sr"> search</span></button></div>' +
        '<div class="pal-body"><div id="pal-list" role="listbox" aria-label="Results"></div></div>' +
        '<p class="pal-foot" aria-hidden="true"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> to move</span><span><kbd>&crarr;</kbd> to open</span><span><kbd>esc</kbd> to close</span></p>' +
        '<p class="sr" aria-live="polite"></p>' +
      "</div>";
    document.body.appendChild(pal);
    sheet = $(".pal-sheet", pal); input = $("#pal-q", pal); list = $("#pal-list", pal); status = $(".pal-sheet > .sr", pal);
    $(".pal-bd", pal).addEventListener("pointerdown", (e) => { e.preventDefault(); close(); });
    $(".pal-x", pal).addEventListener("click", () => close());
    input.addEventListener("input", () => update());
    input.addEventListener("keydown", onKey);
    $(".pal-x", pal).addEventListener("keydown", onKey);
    list.addEventListener("pointermove", (e) => { const o = e.target.closest('[role="option"]'); if (o && +o.dataset.i !== active) setActive(+o.dataset.i, false); });
    // pressing a result must not take focus from the field, or a phone's keyboard would drop as it opens
    list.addEventListener("mousedown", (e) => e.preventDefault());
    list.addEventListener("click", (e) => { const o = e.target.closest('[role="option"]'); if (o) go(+o.dataset.i); });
    drag();
  }

  function option(it, i) {
    return '<div class="pal-o" role="option" id="pal-o-' + i + '" aria-selected="false" data-i="' + i + '"><span class="pi ' + it.kind + '" aria-hidden="true">' + ICON[it.kind] + "</span>" +
      '<span class="pt">' + it.html + "</span>" + (it.meta ? '<span class="pm">' + esc(it.meta) + "</span>" : "") + "</div>";
  }
  function render() {
    const q = input.value.trim();
    const groups = [];
    const others = SITES.filter((x) => x.s !== SITE);
    if (!q) {
      groups.push(["Jump to", PAGES.filter((p) => p.s === SITE).map(pageItem)]);
      if (SITE === "foundation") { const picks = OCC_PICKS.map((c) => BYCODE.get(c)).filter(Boolean); if (picks.length) groups.push(["Try", picks.map((o) => occItem(o))]); }
      if (SITE === "schema") { const picks = TERM_PICKS.map((n) => TERMS.find((e) => e.n === n && !e.f)).filter(Boolean); if (picks.length) groups.push(["Try", picks.map((e) => termItem(e))]); }
      // from any other site, the way back to the Foundation is the first thing past this site's own pages
      if (SITE !== "foundation") groups.push([label("The Org.AI Foundation", "foundation"), PAGES.filter((p) => p.s === "foundation" && /^(\/occupations|\/#data|\/#partner)$/.test(p.p)).map(namedPageItem)]);
      groups.push(["The Foundation's sites", others.map(siteItem)]);
    } else {
      const occ = OCC.length ? search(q) || [] : [];
      const occRows = occ.slice(0, 6).map((r) => occItem(r.o, r.terms));
      if (occ.length > 6) occRows.push({ kind: "all", h: at("foundation", "/occupations?q=" + encodeURIComponent(q)), html: "See all " + fmt(occ.length) + " occupations that match", meta: "" });
      const terms = TERMS.length ? searchTerms(q) : [];
      const termRows = terms.slice(0, 6).map((e) => termItem(e, q));
      // schema.org.ai's own search, which lists the first 60 of them with what each one is
      if (terms.length > 6) termRows.push({ kind: "all", h: at("schema", "/?q=" + encodeURIComponent(q)), html: "Search Schema.org for \u201c" + esc(q) + "\u201d", meta: fmt(terms.length) + " terms match" });
      const fams = FAMS.filter((f) => matches(f, q)).map(famItem);
      const pages = PAGES.filter((p) => matches(p, q)).sort((a, b) => (a.s === SITE ? 0 : 1) - (b.s === SITE ? 0 : 1)).map(pageItem);
      const sites = others.filter((s) => matches(s, q)).map(siteItem);
      const G = {
        occ: [label("Occupations", "foundation"), occRows], term: [label("Schema.org terms", "schema"), termRows], fam: [label("Families of work", "foundation"), fams],
        page: ["Pages", pages], site: ["The Foundation's sites", sites],
      };
      // what this site is about comes first
      const order = SITE === "foundation" ? ["occ", "fam", "page", "term", "site"] : SITE === "schema" ? ["term", "page", "occ", "fam", "site"] : ["page", "occ", "term", "fam", "site"];
      for (const k of order) if (G[k][1].length) groups.push(G[k]);
    }
    items = groups.flatMap((g) => g[1]);
    let i = 0;
    list.innerHTML = groups.length
      ? groups.map(([name, rows], gi) => '<div class="pal-g" role="group" aria-labelledby="pal-g' + gi + '"><p class="pal-gh" id="pal-g' + gi + '" role="presentation">' + esc(name) + "</p>" + rows.map((r) => option(r, i++)).join("") + "</div>").join("")
      : '<p class="pal-none">Nothing in the Foundation is called anything like “' + esc(q) + "”. Try a job title, a Schema.org term, or a word like “data”.</p>";
    const lost = [occFailed && "the occupations", termFailed && "Schema.org's terms"].filter(Boolean);
    if (q && lost.length) list.insertAdjacentHTML("afterbegin", '<p class="pal-none">' + lost.join(" and ").replace(/^t/, "T") + " did not load. Check your connection, then type again.</p>");
    setActive(items.length ? 0 : -1, false);
    list.parentElement.scrollTop = 0;
    status.textContent = !q ? "" : items.length ? (items.length === 1 ? "One result." : items.length + " results.") + " Use the arrow keys to choose one." : "No results.";
  }
  // pages and sites show at once; the record and the vocabulary as soon as they are in (reaching for search fetches them)
  function update() {
    const mine = ++seq;
    render();
    if (OCC.length && TERMS.length) return;
    loadAll().then(() => { if (mine === seq) render(); });
  }
  function setActive(i, scroll) {
    const opts = $$('[role="option"]', list);
    if (active >= 0 && opts[active]) opts[active].setAttribute("aria-selected", "false");
    active = i;
    if (i >= 0 && opts[i]) {
      opts[i].setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", opts[i].id);
      if (scroll) opts[i].scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }
  function go(i) {
    const it = items[i];
    if (!it) return;
    const url = new URL(it.h, location.href);
    // a section of the page already open: close, then go there, so nothing reloads
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
      close(true);
      if (location.hash === url.hash) { const t = document.getElementById(decodeURIComponent(url.hash.slice(1))); if (t) t.scrollIntoView({ behavior: mqReduce.matches ? "auto" : "smooth" }); }
      else location.hash = url.hash;
      return;
    }
    location.href = url.href;
  }
  function onKey(e) {
    const n = items.length;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown" && e.target === input) { if (n) { e.preventDefault(); setActive(active < n - 1 ? active + 1 : 0, true); } }
    else if (e.key === "ArrowUp" && e.target === input) { if (n) { e.preventDefault(); setActive(active > 0 ? active - 1 : n - 1, true); } }
    else if (e.key === "Enter" && e.target === input) { e.preventDefault(); if (active >= 0) go(active); }
    else if (e.key === "Tab") {
      // focus stays in the dialog: the field and its close button
      e.preventDefault();
      (document.activeElement === input ? $(".pal-x", pal) : input).focus();
    }
  }

  /* ---------------- open and close ---------------- */
  // the field says what it finds when that fits in it, and otherwise what it searches (measured, so zoom and text size count)
  let ruler;
  function hint() {
    const cs = getComputedStyle(input), LONG = "Find a job, a term, a page or a site";
    ruler = ruler || document.createElement("canvas").getContext("2d");
    ruler.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    const room = input.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    input.placeholder = ruler.measureText(LONG).width <= room ? LONG : "Search the Foundation";
  }
  function open() {
    if (!pal) build();
    clearTimeout(closeTimer);
    if (pal.classList.contains("in")) { input.focus(); input.select(); return; }
    opener = document.activeElement;
    // the menu folds away first, so only one thing is open at a time
    const menu = $(".menu-btn");
    if (menu && menu.getAttribute("aria-expanded") === "true") menu.click();
    input.value = "";
    sheet.style.transform = "";
    pal.hidden = false;
    document.documentElement.classList.add("pal-open");
    fit();
    hint();
    render();
    input.focus({ preventScroll: true }); // in the same tap, so a phone raises its keyboard
    requestAnimationFrame(() => requestAnimationFrame(() => pal.classList.add("in")));
    loadAll().then(() => { if (!pal.hidden) render(); });
    if (window.visualViewport) { visualViewport.addEventListener("resize", fit); visualViewport.addEventListener("scroll", fit); }
    addEventListener("resize", fit);
    addEventListener("resize", hint);
  }
  function close(keepPlace, now) {
    if (!pal || pal.hidden) return;
    pal.classList.remove("in", "drag");
    document.documentElement.classList.remove("pal-open");
    if (window.visualViewport) { visualViewport.removeEventListener("resize", fit); visualViewport.removeEventListener("scroll", fit); }
    removeEventListener("resize", fit);
    removeEventListener("resize", hint);
    const done = () => { pal.hidden = true; sheet.style.transform = ""; };
    if (mqReduce.matches || now) { clearTimeout(closeTimer); done(); } else closeTimer = setTimeout(done, 360);
    if (!keepPlace && opener && document.contains(opener) && opener.focus) opener.focus({ preventScroll: true });
    opener = null;
  }
  // on a phone the tray sits on the keyboard, not under it: the visual viewport says where the keyboard begins
  function fit() {
    if (!pal || !window.visualViewport) return;
    const vv = visualViewport;
    const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
    sheet.style.setProperty("--kb", Math.round(kb) + "px");
    sheet.style.setProperty("--vvh", Math.round(vv.height) + "px");
  }
  // the tray follows a finger on its handle; let go far enough or fast enough and it folds away
  function drag() {
    let y0 = 0, t0 = 0, dy = 0, on = false, id = null;
    const start = (e) => {
      if (!phone.matches || e.button > 0 || e.target.closest("input, button")) return;
      on = true; id = e.pointerId; y0 = e.clientY; t0 = performance.now(); dy = 0;
      pal.classList.add("drag");
      e.currentTarget.setPointerCapture(id);
    };
    const move = (e) => {
      if (!on || e.pointerId !== id) return;
      dy = Math.max(0, e.clientY - y0);
      sheet.style.transform = "translateY(" + dy + "px)";
    };
    const end = (e) => {
      if (!on || e.pointerId !== id) return;
      on = false;
      const v = dy / Math.max(1, performance.now() - t0);
      pal.classList.remove("drag");
      sheet.style.transform = "";
      if (dy > 96 || (dy > 24 && v > 0.55)) close();
    };
    for (const el of [$(".pal-grip", pal), $(".pal-field", pal)]) {
      el.addEventListener("pointerdown", start);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    }
  }

  /* ---------------- the ways in ---------------- */
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$("[data-find]").forEach((b) => {
    const k = $("kbd", b);
    if (k) k.textContent = mac ? "⌘K" : "Ctrl K";
    b.setAttribute("aria-keyshortcuts", mac ? "Meta+K /" : "Control+K /");
    b.addEventListener("click", (e) => { e.preventDefault(); open(); });
    // the record and the vocabulary are fetched as soon as anyone reaches for search, so they are there when it opens
    const warm = () => loadAll();
    b.addEventListener("pointerenter", warm, { once: true });
    b.addEventListener("focus", warm, { once: true });
    b.addEventListener("touchstart", warm, { once: true, passive: true });
  });
  // leaving closes it at once: Back brings a page back as it was left, and should bring back the page, not the search
  addEventListener("pagehide", () => close(true, true));
  const typing = (el) => el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (pal && pal.classList.contains("in")) close(); else open();
    } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target) && !(pal && pal.classList.contains("in"))) {
      e.preventDefault();
      open();
    }
  });
})();
