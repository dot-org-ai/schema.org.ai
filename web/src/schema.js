  /* ---------------- schema.org.ai ---------------- */
  // Runs after the shared chrome (chrome.js), which defines $, $$, reduce, isMobile, fmt and esc.
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------------- the search: every term, by name ---------------- */
  let INDEX = null, loading = null;
  const words = (n) => n.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  function loadIndex() {
    if (INDEX) return Promise.resolve(INDEX);
    if (!loading) {
      loading = fetch("/search.json")
        .then((r) => { if (!r.ok) throw new Error("search.json " + r.status); return r.json(); })
        .then((rows) => {
          INDEX = rows.map(([n, k, d, f]) => {
            const w = words(n);
            // every run of words to the end of the name, so "date" finds startDate
            const tails = w.map((_, i) => w.slice(i).join(""));
            return { n, k, d, f, l: n.toLowerCase(), tails };
          });
          return INDEX;
        })
        .catch((e) => { loading = null; throw e; });
    }
    return loading;
  }
  const KIND = { t: "Type", p: "Property", v: "Value" };
  const kindLabel = (e) => (e.f ? "Superset " + KIND[e.k].toLowerCase() : KIND[e.k]);
  const hrefOf = (e) => "/" + e.n + (e.f === 2 ? "#org-ai" : "");
  function search(q) {
    const nq = q.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!nq) return [];
    const out = [];
    for (const e of INDEX) {
      const s = e.l === nq ? 0 : e.l.startsWith(nq) ? 1 : e.tails.some((t) => t.startsWith(nq)) ? 2 : e.l.includes(nq) ? 3 : -1;
      if (s >= 0) out.push([s, e]);
    }
    const rank = { t: 0, p: 1, v: 2 };
    out.sort((a, b) => a[0] - b[0] || (a[1].f ? 1 : 0) - (b[1].f ? 1 : 0) || rank[a[1].k] - rank[b[1].k] || a[1].n.length - b[1].n.length || (a[1].n < b[1].n ? -1 : 1));
    return out.map((x) => x[1]);
  }
  function highlight(name, q) {
    const nq = q.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const i = name.toLowerCase().indexOf(nq);
    return i < 0 || !nq ? esc(name) : esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + nq.length)) + "</mark>" + esc(name.slice(i + nq.length));
  }
  const SHOW = 60;

  $$("[data-lookup]").forEach((box) => {
    const input = $("input", box), list = $(".listbox", box), status = $("[data-status]", box);
    const clear = $(".clear", box);
    let results = [], active = -1, err = null, seq = 0;
    const open = (on) => { list.classList.toggle("open", on); input.setAttribute("aria-expanded", String(on)); };
    const setActive = (i, scroll) => {
      const opts = $$('[role="option"]', list);
      if (active >= 0 && opts[active]) opts[active].setAttribute("aria-selected", "false");
      active = i;
      if (i >= 0 && opts[i]) {
        opts[i].setAttribute("aria-selected", "true");
        input.setAttribute("aria-activedescendant", opts[i].id);
        if (scroll) opts[i].scrollIntoView({ block: "nearest" });
      } else input.removeAttribute("aria-activedescendant");
      tell();
    };
    // the result Enter would open (the one chosen, or else the first), for whatever on the page follows the search:
    // the home page's figure lights it
    let told;
    const tell = () => {
      const e = results[active >= 0 ? active : 0] || null;
      if (e === told) return;
      told = e;
      box.dispatchEvent(new CustomEvent("lookup-result", { bubbles: true, detail: e && { n: e.n, k: e.k, f: e.f } }));
    };
    const showError = (on) => {
      if (on && !err) { err = document.createElement("p"); err.className = "err"; err.textContent = "The list of terms did not load. Check your connection, then type again."; box.appendChild(err); }
      if (!on && err) { err.remove(); err = null; }
    };
    function render(q) {
      if (clear) clear.hidden = !input.value;
      results = search(q);
      active = -1; input.removeAttribute("aria-activedescendant");
      tell();
      if (!q.trim()) { list.innerHTML = ""; open(false); status.textContent = ""; return; }
      if (!results.length) {
        list.innerHTML = '<p class="none">No term is called anything like “' + esc(q.trim()) + "”.</p>";
        open(true);
        status.textContent = "No term matches.";
        return;
      }
      const shown = results.slice(0, SHOW);
      list.innerHTML = (results.length > 1 ? '<p class="count" aria-hidden="true">' + fmt(results.length) + " terms match" + (results.length > SHOW ? ", the first " + SHOW + " shown" : "") + "</p>" : "") +
        shown.map((e, i) => '<div role="option" id="' + input.id + "-opt-" + i + '" aria-selected="false" data-i="' + i + '"><span class="t"><span class="nm">' + highlight(e.n, q) + '</span><span class="kd">' + kindLabel(e) + '</span></span><span class="m">' + esc(e.d) + "</span></div>").join("");
      open(true);
      status.textContent = results.length === 1 ? "One term matches. Press Enter to open it." : fmt(results.length) + " terms match. Use the arrow keys to choose one.";
    }
    function update() {
      const q = input.value, mine = ++seq;
      if (clear) clear.hidden = !q;
      if (!q.trim()) { render(""); return; }
      loadIndex().then(() => { if (mine === seq) { showError(false); render(input.value); } }, () => { if (mine === seq) { showError(true); open(false); } });
    }
    const go = (i) => { const e = results[i]; if (e) location.href = hrefOf(e); };
    input.addEventListener("input", () => {
      update();
      // on a phone, the list needs the room above the keyboard
      if (isMobile() && box.getBoundingClientRect().top > innerHeight * 0.35) box.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
    // a long placeholder gives way to its short form wherever it would be cut off
    if (input.dataset.short) {
      const long = input.placeholder, mctx = document.createElement("canvas").getContext("2d");
      const fit = () => {
        const cs = getComputedStyle(input), room = input.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        mctx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
        input.placeholder = mctx.measureText(long).width <= room ? long : input.dataset.short;
      };
      fit();
      addEventListener("resize", fit);
      if (document.fonts) document.fonts.ready.then(fit);
    }
    // the cross clears the box, the list and whatever follows the search, and leaves the cursor in the box
    if (clear) clear.addEventListener("click", () => { input.value = ""; seq++; clear.hidden = true; showError(false); render(""); input.focus(); });
    input.addEventListener("focus", () => { loadIndex().catch(() => {}); if (input.value.trim() && results.length) open(true); });
    input.addEventListener("keydown", (e) => {
      const n = Math.min(results.length, SHOW);
      if (e.key === "ArrowDown") { if (!n) return; e.preventDefault(); if (!list.classList.contains("open")) open(true); setActive(active < n - 1 ? active + 1 : 0, true); }
      else if (e.key === "ArrowUp") { if (!n) return; e.preventDefault(); setActive(active > 0 ? active - 1 : n - 1, true); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (active >= 0) go(active);
        else if (results.length) go(0);
        else if (input.value.trim()) update();
      }
      else if (e.key === "Escape") {
        if (list.classList.contains("open")) { e.preventDefault(); open(false); setActive(-1); }
        else if (input.value) { e.preventDefault(); input.value = ""; render(""); }
      }
    });
    list.addEventListener("pointermove", (e) => { const o = e.target.closest('[role="option"]'); if (o && +o.dataset.i !== active) setActive(+o.dataset.i, false); });
    // pressing an option must not blur the input first, or the list would close under the pointer
    list.addEventListener("mousedown", (e) => e.preventDefault());
    list.addEventListener("click", (e) => { const o = e.target.closest('[role="option"]'); if (o) go(+o.dataset.i); });
    document.addEventListener("pointerdown", (e) => { if (!box.contains(e.target)) open(false); });
    input.addEventListener("blur", () => setTimeout(() => { if (!box.contains(document.activeElement)) open(false); }, 0));
    // a value typed before the script ran, or kept by the browser on Back; or a search handed over in the address (?q=)
    const given = new URLSearchParams(location.search).get("q");
    if (given && !input.value && box === $("[data-lookup]")) { input.value = given; input.focus({ preventScroll: true }); }
    if (input.value.trim()) update();
  });

  /* ---------------- the rings: point at a mark to read it ---------------- */
  $$(".opened[data-ring]").forEach((fig) => {
    const svg = $("svg", fig), tip = $(".tip", fig), marks = $$(".tk", svg);
    if (!marks.length) return;
    const props = fig.dataset.ring === "props";
    const rows = props ? $$("#properties tbody tr") : [];
    const names = props ? [] : $$("[data-ring-names] li", fig);
    if (props ? rows.length !== marks.length : names.length !== marks.length) return; // never point at the wrong row
    const lit = marks.findIndex((m) => m.classList.contains("hl"));
    const pts = marks.map((m) => ({ x: +m.getAttribute("cx"), y: +m.getAttribute("cy") }));
    const gap = pts.length > 1 ? Math.min(...pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))) : 10;
    const reach = Math.max(+marks[0].getAttribute("rx") + 1.6, gap * 0.6);
    const cap = $("[data-point]", fig);
    if (cap && !fine.matches) cap.textContent = cap.dataset.tap;
    let cur = -1, armed = -1;
    const toSvg = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
    const pick = (e) => {
      const p = toSvg(e);
      let best = -1, bd = 1e9;
      pts.forEach((q, i) => { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = i; } });
      return bd <= reach ? best : -1;
    };
    function light(i, withTip) {
      if (cur === i && (!withTip || tip.classList.contains("on"))) return;
      if (cur >= 0) { if (cur !== lit) marks[cur].classList.remove("hl"); if (rows[cur]) rows[cur].classList.remove("hl"); }
      cur = i;
      if (i < 0) { tip.classList.remove("on"); return; }
      marks[i].classList.add("hl");
      if (rows[i]) rows[i].classList.add("hl");
      if (!withTip) { tip.classList.remove("on"); return; }
      if (props) {
        const r = rows[i], name = $(".nm", r).textContent, val = $("td.v", r).textContent.replace(/^Value:\s*/, "");
        // the table's caption without its count: "Its own", "From Thing"
        const group = [...r.closest("table").caption.childNodes].filter((n) => !(n.classList && n.classList.contains("num"))).map((n) => n.textContent).join("").trim();
        tip.innerHTML = "<b>" + esc(name) + "</b><span>" + esc(group) + " · " + esc(val) + "</span>";
      } else {
        tip.innerHTML = "<b>" + esc(names[i].textContent) + "</b><span>" + (i === lit ? "This value" : fine.matches ? "Choose it to open its page" : "Tap again to open its page") + "</span>";
      }
      const d = marks[i].getBoundingClientRect(), fr = fig.getBoundingClientRect();
      tip.classList.add("on");
      const tw = tip.offsetWidth, th = tip.offsetHeight, cx = d.left + d.width / 2 - fr.left, cy = d.top + d.height / 2 - fr.top;
      let x = cx < fr.width / 2 ? cx + 14 : cx - tw - 14, y = cy - th / 2;
      x = Math.max(-8, Math.min(fr.width - tw + 8, x)); y = Math.max(-8, y);
      tip.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
    }
    svg.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { const i = pick(e); light(i, true); svg.style.cursor = i >= 0 ? "pointer" : "default"; } });
    svg.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") light(-1); });
    svg.addEventListener("click", (e) => {
      const i = pick(e);
      if (i < 0) { light(-1); armed = -1; return; }
      if (props) {
        light(i, false);
        const r = rows[i];
        r.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        r.focus({ preventScroll: true });
      } else {
        if (i === lit) { light(i, true); return; }
        // with a mouse one click opens it; on touch the first tap names it and the second opens it
        if (fine.matches || armed === i) location.href = names[i].dataset.href;
        else { armed = i; light(i, true); }
      }
    });
    rows.forEach((r, i) => {
      r.addEventListener("mouseenter", () => light(i, false));
      r.addEventListener("mouseleave", () => light(-1));
      r.addEventListener("blur", () => { if (cur === i) light(-1); });
    });
  });

  /* ---------------- a property, drawn: a curve from each type to it, and from it to each value ---------------- */
  // Measured from where the names land, so a name that wraps still meets its line; redrawn whenever the figure changes size.
  // Two layouts, chosen by the figure's own width in schema.css: a fan (names either side) or one column (names on a spine).
  // The property's ring is an oval 54 by 41 turned -24 degrees; every line stops 3px short of its edge, found exactly.
  const RING = { a: 27, b: 20.5, t: (-24 * Math.PI) / 180, gap: 3 };
  const rc = Math.cos(RING.t), rs = Math.sin(RING.t);
  const qA = (rc * rc) / (RING.a * RING.a) + (rs * rs) / (RING.b * RING.b);
  const qB = 2 * rc * rs * (1 / (RING.a * RING.a) - 1 / (RING.b * RING.b));
  const qC = (rs * rs) / (RING.a * RING.a) + (rc * rc) / (RING.b * RING.b);
  // where a level line dy below the centre crosses the ring, to the left (-1) or right (+1); and how far the ring reaches up or down
  const ringX = (dy, side) => { const B = qB * dy, C = qC * dy * dy - 1, d = Math.sqrt(Math.max(0, B * B - 4 * qA * C)); return (side < 0 ? -B - d : -B + d) / (2 * qA); };
  const ringY = 1 / Math.sqrt(qC);
  $$("[data-flow]").forEach((fig) => {
    const svg = $("svg.links", fig), inner = $(".flow-in", fig), pm = $(".pm", fig), mid = $(".mid", fig);
    const from = $$(".from li a", fig), to = $$(".to li a", fig), links = from.concat(to);
    if (!svg || !inner || !pm || !links.length) return;
    const NS = "http://www.w3.org/2000/svg";
    const paths = links.map((a, i) => {
      const p = document.createElementNS(NS, "path");
      p.style.setProperty("--d", 160 + i * 70 + "ms");
      svg.appendChild(p);
      return p;
    });
    const r1 = (v) => Math.round(v * 10) / 10;
    function draw() {
      const fr = fig.getBoundingClientRect();
      if (!fr.width) return;
      const m = pm.getBoundingClientRect(), cx = m.left + m.width / 2 - fr.left, cy = m.top + m.height / 2 - fr.top;
      const column = getComputedStyle(inner).display === "block";
      svg.setAttribute("viewBox", "0 0 " + r1(fr.width) + " " + r1(fr.height));
      links.forEach((a, i) => {
        const mk = $(".fm", a).getBoundingClientRect(), y = mk.top + mk.height / 2 - fr.top, left = i < from.length;
        let d;
        if (column) {
          // straight along the spine, from the name's mark to the ring, above it or below
          const y2 = left ? cy - ringY - RING.gap : cy + ringY + RING.gap;
          d = "M" + r1(cx) + " " + r1(y) + "V" + r1(y2);
        } else {
          // where many lines meet the ring they spread a little along its edge, as if entering it
          const dy = Math.max(-12, Math.min(12, (y - cy) * 0.05));
          const ex = cx + ringX(dy, left ? -1 : 1) + (left ? -RING.gap : RING.gap), ey = cy + dy;
          const x1 = left ? mk.right - fr.left + 6 : ex, y1 = left ? y : ey;
          const x2 = left ? ex : mk.left - fr.left - 6, y2 = left ? ey : y;
          const k = (x2 - x1) * 0.55;
          d = "M" + r1(x1) + " " + r1(y1) + "C" + r1(x1 + k) + " " + r1(y1) + " " + r1(x2 - k) + " " + r1(y2) + " " + r1(x2) + " " + r1(y2);
        }
        paths[i].setAttribute("d", d);
        paths[i].style.setProperty("--len", Math.ceil(paths[i].getTotalLength()) + 1);
      });
    }
    const light = (i, on) => {
      if (i < 0) { fig.classList.toggle("all", on); paths.forEach((p) => p.classList.toggle("on", on)); links.forEach((a) => a.classList.toggle("on", on)); return; }
      paths[i].classList.toggle("on", on); links[i].classList.toggle("on", on);
      if (on) svg.appendChild(paths[i]); // a lit line is drawn over the lines it shares a path with
    };
    links.forEach((a, i) => {
      a.addEventListener("mouseenter", () => light(i, true)); a.addEventListener("mouseleave", () => light(i, false));
      a.addEventListener("focus", () => light(i, true)); a.addEventListener("blur", () => light(i, false));
    });
    mid.addEventListener("mouseenter", () => light(-1, true)); mid.addEventListener("mouseleave", () => light(-1, false));
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(fig); else addEventListener("resize", draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  });

  /* ---------------- long lists show their first rows; the button shows the rest ---------------- */
  $$("[data-more]").forEach((list) => {
    const btn = list.nextElementSibling;
    const items = $$(":scope > li", list), first = +list.dataset.more;
    if (!btn || !btn.classList.contains("sib-more") || items.length <= first) return;
    let opened = false;
    const set = () => {
      items.forEach((li, i) => { li.hidden = !opened && i >= first; });
      btn.textContent = opened ? "Show fewer" : "Show all " + fmt(items.length);
      btn.setAttribute("aria-expanded", String(opened));
    };
    btn.hidden = false;
    btn.addEventListener("click", () => {
      opened = !opened;
      set();
      if (opened) { const a = $("a", items[first]); if (a) a.focus(); }
      else list.closest("section").scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
    set();
  });

  /* ---------------- the two indexes: which part of the page is in view ---------------- */
  // A one-pixel line just under the sticky chrome; of the sections it crosses, the last in page order is the one in view
  // (so a branch wins over Thing, which holds it). Nothing is in view above the first section.
  function spy(sections, line, onChange) {
    let io = null, cur;
    const on = new Set();
    const pick = () => { const c = sections.filter((s) => on.has(s)).pop() || null; if (c !== cur) { cur = c; onChange(c); } };
    const arm = () => {
      if (io) io.disconnect();
      on.clear();
      const y = Math.round(line());
      io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? on.add(e.target) : on.delete(e.target))); pick(); },
        { rootMargin: -y + "px 0px " + -Math.max(0, innerHeight - y - 1) + "px 0px" });
      sections.forEach((s) => io.observe(s));
    };
    arm();
    let t = 0;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(arm, 120); });
  }
  // keep a marked link in sight inside a list that scrolls on its own, without moving the page
  function reveal(box, el, axis) {
    const x = axis === "x", start = x ? el.offsetLeft : el.offsetTop, size = x ? el.offsetWidth : el.offsetHeight;
    const pos = x ? box.scrollLeft : box.scrollTop, view = x ? box.clientWidth : box.clientHeight, pad = x ? 48 : 24;
    let to = pos;
    if (start - pad < pos) to = start - pad;
    else if (start + size + pad > pos + view) to = start + size + pad - view;
    if (to !== pos) box.scrollTo({ [x ? "left" : "top"]: Math.max(0, to), behavior: reduce ? "auto" : "smooth" });
  }
  const headH = () => $(".site-head").getBoundingClientRect().height;

  // every type: the branch list marks the branch the tree is showing
  const branchNav = $(".index-nav");
  if (branchNav) {
    const edges = () => {
      const over = branchNav.scrollHeight > branchNav.clientHeight + 1;
      branchNav.classList.toggle("more-t", over && branchNav.scrollTop > 1);
      branchNav.classList.toggle("more-b", over && branchNav.scrollTop + branchNav.clientHeight < branchNav.scrollHeight - 1);
    };
    branchNav.addEventListener("scroll", edges, { passive: true });
    addEventListener("resize", edges);
    edges();
    const links = $$("a[data-spy]", branchNav);
    const sections = links.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean);
    if (sections.length === links.length) {
      // the tree's own order: Thing first, its branches inside it, then the other roots
      sections.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      spy(sections, () => headH() + 40, (s) => {
        links.forEach((a) => a.removeAttribute("aria-current"));
        const a = s && links.find((l) => l.dataset.spy === s.id);
        if (a) { a.setAttribute("aria-current", "true"); if (branchNav.scrollHeight > branchNav.clientHeight) reveal(branchNav, a, "y"); }
      });
    }
  }

  // every type: a type with types below it folds them away under its chevron, and Option-click folds or opens every
  // branch below it as well. A folded branch is plainly hidden: hidden="until-found" would keep it findable, but
  // Safari 26 keeps the old height of a branch folded inside another one, and opening the outer one leaves gaps
  const tree = $(".tree");
  if (tree) {
    const chevrons = $$(".tw", tree), openAll = $('[data-tree="open"]'), foldAll = $('[data-tree="fold"]');
    const isOpen = (b) => b.getAttribute("aria-expanded") === "true";
    const set = (btn, open) => {
      btn.setAttribute("aria-expanded", String(open));
      const ul = btn.closest("li").querySelector(":scope > ul");
      ul.hidden = !open;
    };
    // each switch is off when there is nothing for it to do; focus never falls off one that has just switched off
    const sync = () => {
      const was = document.activeElement;
      if (openAll) openAll.disabled = chevrons.every(isOpen);
      if (foldAll) foldAll.disabled = !chevrons.some(isOpen);
      if (was && was.disabled) (was === openAll ? foldAll : openAll).focus();
    };
    // every folded branch that holds el opens, so el can be seen
    const unfold = (el) => {
      for (let ul = el.closest("ul"); ul && ul !== tree && tree.contains(ul); ul = ul.parentElement.closest("ul")) {
        const b = ul.parentElement.querySelector(":scope > .row > .tw");
        if (b && !isOpen(b)) set(b, true);
      }
      sync();
    };
    tree.addEventListener("click", (e) => {
      const btn = e.target.closest(".tw");
      if (!btn) return;
      const open = !isOpen(btn);
      set(btn, open);
      if (e.altKey) $$(".tw", btn.closest("li")).forEach((b) => set(b, open));
      sync();
    });
    if (openAll) openAll.addEventListener("click", () => { chevrons.forEach((b) => set(b, true)); sync(); });
    if (foldAll) foldAll.addEventListener("click", () => { chevrons.forEach((b) => set(b, false)); sync(); });
    // the branch list, or the address, can point into a folded branch
    const target = (hash) => { try { const el = hash && document.getElementById(decodeURIComponent(hash.slice(1))); return el && tree.contains(el) ? el : null; } catch { return null; } };
    document.addEventListener("click", (e) => { const a = e.target.closest('a[href^="#"]'); const el = a && target(a.getAttribute("href")); if (el) unfold(el); }, true);
    addEventListener("hashchange", () => { const el = target(location.hash); if (el) { unfold(el); el.scrollIntoView(); } });
    sync();
  }

  // every property: the filter, and the letters under the header
  const az = $("[data-az]");
  if (az) {
    const input = $("#az-q", az), count = $(".az-count", az), row = $(".letters", az), none = $(".az-none");
    const groups = $$(".az-group").map((g) => ({
      g, num: $("h2 .num", g), link: $('a[data-letter="' + g.dataset.letter + '"]', row),
      items: $$(".az-names > li", g).map((li) => ({ li, nm: $(".nm", li), name: li.dataset.n, l: li.dataset.n.toLowerCase(), a: $("a", li) })),
    }));
    const total = groups.reduce((n, x) => n + x.items.length, 0);
    // the bar's height, for where a chosen letter lands (schema.css reads it)
    const setBar = () => document.documentElement.style.setProperty("--az-bar", Math.ceil(az.getBoundingClientRect().height) + "px");
    setBar();
    if (window.ResizeObserver) new ResizeObserver(setBar).observe(az);
    // the name again, its words breakable as camel() writes them, with the part that matches marked
    const nameHtml = (s, i, n) => {
      let out = "";
      for (let k = 0; k < s.length; k++) {
        if (k && /[a-z0-9]/.test(s[k - 1]) && /[A-Z]/.test(s[k])) out += "<wbr>";
        if (k === i) out += "<mark>";
        out += esc(s[k]);
        if (k === i + n - 1) out += "</mark>";
      }
      return out;
    };
    let shown = [], last = "";
    function apply(raw) {
      const q = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
      if (q === last && shown.length) return;
      last = q; shown = [];
      for (const x of groups) {
        let n = 0;
        for (const it of x.items) {
          const i = q ? it.l.indexOf(q) : 0, hit = i >= 0;
          it.li.hidden = !hit;
          if (hit) { n++; shown.push(it); }
          if (q || it.marked) { it.nm.innerHTML = nameHtml(it.name, hit && q ? i : -1, q.length); it.marked = !!q; }
        }
        x.g.hidden = !n;
        x.num.textContent = fmt(n);
        if (x.link) {
          if (n) { x.link.removeAttribute("aria-disabled"); x.link.removeAttribute("tabindex"); }
          else { x.link.setAttribute("aria-disabled", "true"); x.link.setAttribute("tabindex", "-1"); }
        }
      }
      count.textContent = q ? fmt(shown.length) + " of " + fmt(total) : "";
      none.hidden = !!shown.length;
      none.textContent = shown.length ? "" : "No property is called anything like “" + raw.trim() + "”.";
      // the address keeps the filter, so a reload or Back shows the same list
      const u = new URL(location.href);
      if (q) u.searchParams.set("q", raw.trim()); else u.searchParams.delete("q");
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
      // scrolled past the start of the list, the shorter list starts again just under the bar
      const list = $(".az-list"), top = list.getBoundingClientRect().top, under = az.getBoundingClientRect().bottom;
      if (top < under) scrollTo({ top: scrollY + top - under, behavior: "instant" });
    }
    input.addEventListener("input", () => apply(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && input.value) { e.preventDefault(); input.value = ""; apply(""); }
      else if (e.key === "Enter") { e.preventDefault(); if (shown.length === 1) location.href = shown[0].a.href; }
    });
    row.addEventListener("click", (e) => { const a = e.target.closest("a"); if (a && a.getAttribute("aria-disabled") === "true") e.preventDefault(); });
    // a letter is in view once its heading reaches the bar: the line sits a group's top padding below it
    const lead = () => (groups[1] ? parseFloat(getComputedStyle(groups[1].g).paddingTop) || 0 : 0);
    spy(groups.map((x) => x.g), () => az.getBoundingClientRect().height + headH() + lead() + 8, (g) => {
      groups.forEach((x) => x.link && x.link.removeAttribute("aria-current"));
      const x = g && groups.find((y) => y.g === g);
      if (x && x.link) { x.link.setAttribute("aria-current", "true"); if (row.scrollWidth > row.clientWidth) reveal(row, x.link, "x"); }
    });
    const given = new URLSearchParams(location.search).get("q");
    if (given) input.value = given;
    if (input.value) apply(input.value);
  }

  /* ---------------- the 404 page says which address it was ---------------- */
  const where = $("#where");
  if (where) { let p = location.pathname; try { p = decodeURIComponent(p); } catch (e) {} where.textContent = p.replace(/^\//, ""); }
