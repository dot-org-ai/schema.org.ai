  /* ---------------- the home page's figure: every type, as layers or as branches ---------------- */
  // Layers is wider than the page and scrolls sideways under fades at the page margins; one canvas the size of the
  // window draws whatever part of it is in view. Branches is the same types as a tree, out from Thing. Switching
  // moves every type from its place in one view to its place in the other. The search box tells the figure which
  // term its result is (the "lookup-result" event, from schema.js), and the figure lights it.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phoneQ = matchMedia("(max-width: 699px)");
  const coarse = matchMedia("(pointer: coarse)");
  const C = { ground: [19, 17, 14], ink: [243, 242, 238], ink2: [192, 189, 185], ink3: [151, 149, 145], now: [240, 175, 102] };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const fmt = (n) => n.toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const plural = (n, one, many) => fmt(n) + " " + (n === 1 ? one : many);
  const and = (a) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
  const FF = '"Public Sans", system-ui, "Segoe UI", Roboto, sans-serif';
  const TAU = Math.PI * 2;
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  const fig = document.querySelector(".hero[data-hero]");
  if (!fig) return;
  // a result can arrive before the figure's data does (a search handed over in the address, or kept on Back)
  let pending = null, onResult = (d) => (pending = d);
  const intro = fig.closest(".intro");
  intro.addEventListener("lookup-result", (e) => onResult(e.detail));
  fetch(fig.dataset.hero)
    .then((r) => { if (!r.ok) throw new Error("hero " + r.status); return r.json(); })
    .then((D) => figure(prepare(D)))
    .catch(() => fig.classList.add("failed"));

  /* every type, with the tree worked out: first parents, depth, how many leaf types each one holds */
  function prepare(D) {
    const T = D.t.map(([n, p, b, s, d, f, sense], i) => ({ i, n, p, b, s, d, f, h: "/" + n + (sense ? "#org-ai" : ""), kids: [] }));
    const byName = (a, b) => a.n.localeCompare(b.n, "en", { sensitivity: "base" }) || (a.n < b.n ? -1 : 1);
    // the tree is drawn by first parents; a superset type with no parent sits beside the Schema.org type it shares a name with
    for (const t of T) { t.lp = t.p >= 0 ? t.p : t.b; if (t.lp >= 0) T[t.lp].kids.push(t); }
    for (const t of T) t.kids.sort(byName);
    const roots = T.filter((t) => t.lp < 0).sort((a, b) => (b.n === "Thing") - (a.n === "Thing") || b.d - a.d || byName(a, b));
    const walk = (t, depth) => { t.depth = depth; t.leaves = t.kids.length ? t.kids.reduce((n, c) => n + walk(c, depth + 1), 0) : 1; return t.leaves; };
    roots.forEach((r) => walk(r, 0));
    for (const t of T) { const tr = []; for (let x = t; x; x = x.p >= 0 ? T[x.p] : null) tr.unshift(x); t.trail = tr; }
    const index = (arr) => { const m = new Map(); for (const x of arr) { if (!m.has(x.n)) m.set(x.n, []); m.get(x.n).push(x); } return m; };
    const P = D.p.map(([n, s, dom]) => ({ n, s, dom })), V = D.v.map(([n, of]) => ({ n, of }));
    const tI = index(T), pI = index(P), vI = index(V);
    const pick = (m, n, sup) => { const l = m.get(n) || []; return l.find((x) => (x.s || 0) === sup) || l[0]; };
    // a search result, as the types it lights: the type itself, a property's types, a value's type
    function find(r) {
      if (!r) return null;
      const sup = r.f ? 1 : 0;
      if (r.k === "t") { const t = pick(tI, r.n, sup); return t ? { kind: "t", term: t, types: [t.i] } : null; }
      if (r.k === "p") { const p = pick(pI, r.n, sup); return p && p.dom.length ? { kind: "p", term: p, types: p.dom } : null; }
      const x = pick(vI, r.n, 0); return x && x.of.length ? { kind: "v", term: x, types: x.of } : null;
    }
    const sub = (t, out = new Set()) => { out.add(t.i); for (const c of t.kids) sub(c, out); return out; };
    const anc = (t, out = new Set()) => { for (let x = t; x; x = x.lp >= 0 ? T[x.lp] : null) out.add(x.i); return out; };
    return { T, roots, find, sub, anc };
  }

  function figure(M) {
    const frame = fig.querySelector(".hero-frame"), sc = fig.querySelector(".hero-scroll"), spacer = fig.querySelector(".hero-spacer");
    const cv = frame.querySelector("canvas"), ctx = cv.getContext("2d"), tip = fig.querySelector(".hero-tip"), cap = fig.querySelector(".hero-cap");
    const miniWrap = fig.querySelector(".hero-mini-wrap"), mini = fig.querySelector(".hero-mini"), mx = mini.getContext("2d");
    const views = [...fig.querySelectorAll(".hero-views button")], legends = [...fig.querySelectorAll(".hero-legend")];
    const CAP = { layers: fig.dataset.capLayers, branches: fig.dataset.capBranches };
    const T = M.T, thing = M.roots[0], sats = M.roots.slice(1);
    const units = M.roots.reduce((n, r) => n + r.leaves, 0);
    { const place = (t, u0) => { t.u0 = u0; let s = u0; for (const c of t.kids) { place(c, s); s += c.leaves; } }; let s = 0; for (const r of M.roots) { place(r, s); s += r.leaves; } }
    const rows = 1 + Math.max(...T.map((t) => t.depth));
    const byRow = Array.from({ length: rows }, () => []);
    for (const t of T) byRow[t.depth].push(t);
    for (const r of byRow) r.sort((a, b) => a.u0 - b.u0);
    const ALPHA = [0.92, 0.8, 0.68, 0.58, 0.5, 0.46, 0.44, 0.42];
    const RING = [0, 0.2, 0.42, 0.63, 0.83, 1, 1.12, 1.2];
    const L = { top: 30, band: 40, gap: 5, H: 0, off: 0 }, B = { H: 0, R: 0, K: 1, cx: 0, cy: 0, labels: true };
    let view = "layers";
    try { if (localStorage.getItem("schema-hero-view") === "branches") view = "branches"; } catch {}
    let FW = 0, pad = 20, dpr = 1, total = 0, H = 0, lastScroll = 0;
    let focus = null, hover = null, raf = 0, t0 = performance.now(), morph = null, drag = null;
    const norm = (a) => { a = (a + Math.PI / 2) % Math.PI; if (a < 0) a += Math.PI; return a - Math.PI / 2; };
    const size = (t) => 1 + 1.3 * Math.min(1, Math.log1p(t.d) / Math.log1p(300));
    // names are measured once per font, not on every frame
    const widths = new Map();
    const width = (s, font) => { const k = font + "|" + s; if (!widths.has(k)) { ctx.font = font; widths.set(k, ctx.measureText(s).width); } return widths.get(k); };
    const F_NAME = `560 13px ${FF}`, F_NUM = `400 12px ${FF}`, F_SMALL = `400 12px ${FF}`, F_PILL = `600 13px ${FF}`;

    function layout() {
      FW = frame.clientWidth;
      pad = parseFloat(getComputedStyle(intro).paddingLeft) || 20;
      dpr = Math.min(2, devicePixelRatio || 1);
      const phone = phoneQ.matches;
      total = Math.max(FW - 2 * pad, units * (phone ? 5 : 7));
      L.gap = phone ? 4 : 5;
      for (const t of T) { t.lx = (t.u0 / units) * total; t.lw = (t.leaves / units) * total; }
      fit(view === "layers" ? undefined : L.top + 4 + rows * (phone ? 34 : 40) + (rows - 1) * L.gap);
      // Branches: Thing at the middle of the page; DataType and the superset's own roots as small trees in a corner
      B.labels = !phone;
      if (phone) { B.R = FW / 2 - pad - 4; B.H = Math.round(2 * B.R + 130); B.cy = B.R + 20; }
      else { B.H = Math.round(Math.min(Math.max(560, innerHeight - 190), 800)); B.R = Math.min(B.H / 2 - 22, FW / 2 - pad - 112); B.cy = B.H / 2; }
      B.K = Math.max(0.62, Math.min(1.25, B.R / 300));
      B.cx = FW / 2;
      const place = (t, a0, a1, ox, oy, rad) => {
        t.ba = (a0 + a1) / 2; t.br = rad(t); t.ox = ox; t.oy = oy;
        t.bx = ox + Math.cos(t.ba) * t.br; t.by = oy + Math.sin(t.ba) * t.br;
        let s = a0;
        for (const c of t.kids) { const e = s + ((a1 - a0) * c.leaves) / t.leaves; place(c, s, e, ox, oy, rad); s = e; }
      };
      const gap = 0.014, top = thing.kids, span = TAU - gap * top.length;
      Object.assign(thing, { ba: -Math.PI / 2, br: 0, bx: B.cx, by: B.cy, ox: B.cx, oy: B.cy });
      let a = -Math.PI / 2;
      for (const c of top) { const e = a + (span * c.leaves) / thing.leaves; place(c, a, e, B.cx, B.cy, (t) => B.R * RING[Math.min(t.depth, RING.length - 1)]); a = e + gap; }
      let sx = pad + 14;
      for (const s of sats) {
        const kin = M.sub(s), depth = Math.max(0, ...[...kin].map((i) => T[i].depth - s.depth));
        const rad = depth ? 13 + 13 * depth : 0, ox = sx + rad, oy = B.H - 24 - rad;
        Object.assign(s, { ba: -Math.PI / 2, br: 0, bx: ox, by: oy, ox, oy });
        let b = -Math.PI / 2;
        for (const c of s.kids) { const e = b + (TAU * c.leaves) / s.leaves; place(c, b, e, ox, oy, (t) => 13 * (t.depth - s.depth)); b = e; }
        for (const i of kin) T[i].sat = true;
        s.labelX = ox + rad + 8; s.labelY = oy + (rad ? rad - 2 : 4);
        sx = s.labelX + width(s.n, F_SMALL) + 26;
      }
      mini.width = Math.round((FW - 2 * pad) * dpr); mini.height = Math.round(MH * dpr);
      mini.style.width = FW - 2 * pad + "px"; mini.style.height = MH + "px";
      settle();
    }
    // Layers at its own thickness, measured from the page (schema css sets the frame's height from the number of layers)
    function fit(h) {
      // measured from the page, unless Layers is not showing: then at its least height, until it is
      if (h == null) { frame.style.height = ""; frame.style.flex = ""; h = frame.clientHeight; }
      const phone = phoneQ.matches;
      L.band = phone ? 34 : 40;
      const need = L.top + rows * L.band + (rows - 1) * L.gap + 4;
      L.H = Math.max(h, need);
      L.off = Math.floor((L.H - need) / 2);
      for (const t of T) t.ly = L.off + L.top + t.depth * (L.band + L.gap);
    }
    function canvasTo(h) {
      H = h;
      cv.width = Math.round(FW * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = FW + "px"; cv.style.height = h + "px";
    }
    // Branches, and the switch between the views, set the frame's height themselves
    function setHeight(h) { frame.style.height = h + "px"; frame.style.flex = "none"; canvasTo(h); }
    function chrome(v) {
      fig.dataset.view = v;
      for (const b of views) b.setAttribute("aria-pressed", String(b.dataset.view === v));
      for (const l of legends) l.hidden = l.dataset.for !== v;
      cap.innerHTML = caption(v);
    }
    // a view at rest: its scroll width, its height, its legend and words
    function settle() {
      chrome(view);
      spacer.style.width = (view === "layers" ? total + 2 * pad : FW) + "px";
      sc.classList.toggle("still", view !== "layers");
      if (view === "layers") { fit(); canvasTo(L.H); sc.scrollLeft = lastScroll; }
      else setHeight(B.H);
      miniWrap.hidden = view !== "layers" || total <= FW - 2 * pad + 1;
    }
    function caption(v) {
      if (!focus) return esc(CAP[v]);
      const t = focus.term;
      if (focus.kind === "t") return `<b>${esc(t.n)}</b>: ${t.d ? plural(t.d, "type", "types") + " below it" : "no types below it"}. ${t.trail.map((x) => esc(x.n)).join(" › ")}`;
      if (focus.kind === "p") return `<b>${esc(t.n)}</b>: a property of ${plural(focus.types.length, "type", "types")}, marked.`;
      return `<b>${esc(t.n)}</b>: a value of ${and(focus.types.map((i) => esc(T[i].n)))}.`;
    }

    // where a type sits in each view, as a rounded shape: centre, width, height, turn
    function geoL(t, scroll) {
      const g = Math.min(1.5, t.lw * 0.34);
      return { x: pad + t.lx - scroll + t.lw / 2, y: t.ly + L.band / 2, w: Math.max(0.7, t.lw - g), h: L.band, rot: 0 };
    }
    function geoB(t) {
      if (t === thing) return { x: t.bx, y: t.by, w: 14 * B.K, h: 8 * B.K, rot: norm((129 * Math.PI) / 180) }; // the mark's own proportions
      const s = size(t) * B.K * (t.sat ? 0.85 : 1);
      return { x: t.bx, y: t.by, w: 5 * s, h: 2.3 * s, rot: norm(t.ba) };
    }
    function shape(g, fill, a) {
      ctx.save(); ctx.translate(g.x, g.y); if (g.rot) ctx.rotate(g.rot);
      ctx.beginPath(); ctx.roundRect(-g.w / 2, -g.h / 2, g.w, g.h, Math.min(g.w, g.h) / 2);
      ctx.fillStyle = rgba(fill, a); ctx.fill(); ctx.restore();
    }
    // on arrival the types come in a generation at a time, Thing first
    const appear = (t, now, step) => {
      if (reduce) return 1;
      const x = (now - t0 - t.depth * step) / 380;
      return x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 4);
    };
    function lit() {
      const sel = focus || (hover && { kind: "t", types: [hover.i] });
      if (!sel) return null;
      const keep = new Set(), path = new Set();
      for (const i of sel.types) { M.anc(T[i], path); M.anc(T[i], keep); if (sel.kind === "t") M.sub(T[i], keep); }
      return { keep, path };
    }

    function draw(now) {
      raf = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, FW, H);
      if (morph) {
        const p = clamp01((now - morph.start) / 1150);
        drawMorph(p);
        fades(morph.at, morph.to === "branches" ? 1 - p : p);
        if (p >= 1) { morph = null; settle(); paint(); }
      } else if (view === "layers") { drawLayers(now); fades(sc.scrollLeft, 1); }
      else drawBranches(now);
      drawMini();
      if (morph || (!reduce && now - t0 < 1400)) raf = requestAnimationFrame(draw);
    }
    const paint = () => { if (!raf) raf = requestAnimationFrame(draw); };

    function drawLayers(now) {
      const scroll = sc.scrollLeft, S = lit();
      for (const t of T) {
        const x0 = pad + t.lx - scroll;
        if (x0 > FW || x0 + t.lw < 0) continue;
        const g = appear(t, now, 110);
        if (!g) continue;
        let a = t.s ? 1 : ALPHA[t.depth];
        if (S && !S.keep.has(t.i)) a *= 0.2;
        shape(geoL(t, scroll), t.s ? C.now : C.ink, a * g);
      }
      // names ride along inside their layer, so a wide type stays named while any of it is in view
      ctx.textBaseline = "middle"; ctx.textAlign = "left";
      for (const t of T) {
        const x0 = pad + t.lx - scroll, x1 = x0 + t.lw;
        if (x1 < pad || x0 > FW - pad || appear(t, now, 110) < 1) continue;
        const nw = width(t.n, F_NAME);
        if (Math.min(x1, FW - pad) - Math.max(x0, pad) < nw + 24) continue;
        const x = Math.min(Math.max(x0 + 14, pad + 12), x1 - nw - 14), y = t.ly + L.band / 2 + 0.5;
        const dim = S && !S.keep.has(t.i);
        ctx.font = F_NAME; ctx.fillStyle = rgba(C.ground, dim ? 0.35 : 0.92); ctx.fillText(t.n, x, y);
        if (t.d) {
          const c = fmt(t.d), cw = width(c, F_NUM);
          if (x + nw + 10 + cw < Math.min(x1, FW - pad) - 12) { ctx.font = F_NUM; ctx.fillStyle = rgba(C.ground, dim ? 0.25 : 0.6); ctx.fillText(c, x + nw + 10, y); }
        }
      }
      const ring = (t, colour, lw) => {
        const g = geoL(t, scroll);
        ctx.strokeStyle = colour; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.roundRect(g.x - g.w / 2 - 1.5, t.ly - 2, g.w + 3, L.band + 4, Math.min(g.w + 3, L.band + 4) / 2); ctx.stroke();
      };
      if (focus) {
        for (const i of focus.types) {
          const t = T[i], x = pad + t.lx - scroll + t.lw / 2;
          ctx.strokeStyle = rgba(C.now, 1); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x, L.off + L.top - 6); ctx.lineTo(x, Math.min(H - 2, T[i].ly + L.band + 2 + (rows - 1 - T[i].depth) * (L.band + L.gap))); ctx.stroke();
          ring(t, rgba(C.now, 1), 1.5);
        }
        if (focus.types.length <= 4) for (const i of focus.types) pill(T[i].n, pad + T[i].lx - scroll + T[i].lw / 2, L.off, "centre");
      } else if (hover) ring(hover, rgba(C.ink, 1), 1.2);
    }

    function edge(t) {
      const p = T[t.p], pa = p.br === 0 ? t.ba : p.ba, rm = (p.br + t.br) / 2;
      ctx.moveTo(p.bx, p.by);
      ctx.bezierCurveTo(t.ox + Math.cos(pa) * rm, t.oy + Math.sin(pa) * rm, t.ox + Math.cos(t.ba) * rm, t.oy + Math.sin(t.ba) * rm, t.bx, t.by);
    }
    function edges(alpha) {
      if (alpha <= 0) return;
      ctx.lineWidth = 0.6; ctx.strokeStyle = rgba(C.ink, alpha);
      ctx.beginPath(); for (const t of T) if (t.p >= 0) edge(t); ctx.stroke();
    }
    function drawBranches(now) {
      const S = lit(), near = new Set();
      if (focus && focus.kind === "t") for (const i of focus.types) M.sub(T[i], near);
      edges(S ? 0.05 : 0.11);
      if (S) {
        ctx.lineWidth = 1.3; ctx.strokeStyle = focus ? rgba(C.now, 0.85) : rgba(C.ink, 0.75); ctx.beginPath();
        for (const i of S.path) { const t = T[i]; if (t.p >= 0 && S.path.has(t.p)) edge(t); }
        ctx.stroke();
        if (near.size > 1) { ctx.lineWidth = 0.7; ctx.strokeStyle = rgba(C.ink, 0.32); ctx.beginPath(); for (const i of near) { const t = T[i]; if (t.p >= 0 && !focus.types.includes(i)) edge(t); } ctx.stroke(); }
      }
      for (const t of T) {
        const g = appear(t, now, 120);
        if (!g) continue;
        let a = t.s ? 1 : 0.84;
        if (S && !S.keep.has(t.i)) a *= 0.26;
        const o = geoB(t);
        ctx.beginPath(); ctx.ellipse(o.x, o.y, (o.w / 2) * (0.4 + 0.6 * g), (o.h / 2) * (0.4 + 0.6 * g), o.rot, 0, TAU);
        ctx.fillStyle = rgba(t.s ? C.now : C.ink, a * g); ctx.fill();
      }
      ctx.textBaseline = "middle";
      if (B.labels) {
        ctx.font = F_SMALL;
        for (const b of thing.kids) {
          if (b.d < 30) continue;
          ctx.textAlign = Math.cos(b.ba) >= 0 ? "left" : "right";
          ctx.fillStyle = rgba(C.ink3, S ? 0.5 : 1);
          ctx.fillText(b.n, B.cx + Math.cos(b.ba) * (B.R + 14), B.cy + Math.sin(b.ba) * (B.R + 14));
        }
      }
      ctx.textAlign = "center"; ctx.font = `500 12px ${FF}`; ctx.fillStyle = rgba(C.ink2, 1);
      ctx.fillText("Thing", thing.bx, thing.by + 15 * B.K + 4);
      ctx.textAlign = "left"; ctx.font = F_SMALL; ctx.fillStyle = rgba(C.ink3, 1);
      for (const s of sats) ctx.fillText(s.n, s.labelX, s.labelY);
      if (focus) {
        ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(C.now, 1);
        for (const i of focus.types) { const t = T[i]; ctx.beginPath(); ctx.arc(t.bx, t.by, (t === thing ? 9 : 5.5) * B.K + 2, 0, TAU); ctx.stroke(); }
        if (focus.types.length <= 6) for (const i of focus.types) {
          const t = T[i], out = t.br ? 1 : 0;
          pill(t.n, t.bx + Math.cos(t.ba) * 14 * out, t.by + Math.sin(t.ba) * 14 * out - 12 - (out ? 0 : 22), out && Math.cos(t.ba) < 0 ? "right" : "left");
        }
      } else if (hover) { ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(C.ink, 1); ctx.beginPath(); ctx.arc(hover.bx, hover.by, 5.5 * B.K + 2, 0, TAU); ctx.stroke(); }
    }

    // in two beats: each layer condenses into its mark where it is on screen, then the marks travel into the tree,
    // Thing first; going back, the marks travel home, deepest first, and open out into their layers
    const lerp = (A, Z, q) => ({ x: A.x + (Z.x - A.x) * q, y: A.y + (Z.y - A.y) * q, w: A.w + (Z.w - A.w) * q, h: A.h + (Z.h - A.h) * q, rot: A.rot + (Z.rot - A.rot) * q });
    function drawMorph(p) {
      const { lay, seed, br, to } = morph, toB = to === "branches";
      if (!toB) edges(0.11 * (1 - clamp01(p / 0.2)));
      for (const t of T) {
        const d = t.depth / Math.max(1, rows - 1);
        let g, q;
        if (toB) {
          const q2 = ease(clamp01((p - 0.3 - d * 0.22) / 0.48));
          g = q2 > 0 ? lerp(seed[t.i], br[t.i], q2) : lerp(lay[t.i], seed[t.i], ease(clamp01(p / 0.36)));
          q = q2;
        } else {
          const q2 = ease(clamp01((p - 0.62) / 0.38));
          g = q2 > 0 ? lerp(seed[t.i], lay[t.i], q2) : lerp(br[t.i], seed[t.i], ease(clamp01((p - (1 - d) * 0.22) / 0.4)));
          q = 1 - q2;
        }
        const aL = t.s ? 1 : ALPHA[t.depth], aB = t.s ? 1 : 0.84;
        shape(g, t.s ? C.now : C.ink, aL + (aB - aL) * q);
      }
      if (toB) edges(0.11 * clamp01((p - 0.8) / 0.2));
    }

    // the edges: the strip dissolves across the page margin on an eased curve, and only on a side that has more to
    // see, so at rest Thing starts crisp on the margin, in line with the words above it
    const SMOOTH = Array.from({ length: 17 }, (_, k) => { const u = k / 16; return [u, u * u * u * (u * (u * 6 - 15) + 10)]; });
    function fades(scroll, strength) {
      const max = Math.max(0, total + 2 * pad - FW);
      const l = strength * clamp01(scroll / 72), r = strength * clamp01((max - scroll) / 72);
      if (l < 0.01 && r < 0.01) return;
      const fw = Math.min(FW / 4, pad + Math.max(28, pad * 0.6));
      const g = ctx.createLinearGradient(0, 0, FW, 0);
      for (const [u, e] of SMOOTH) g.addColorStop((u * fw) / FW, `rgba(0,0,0,${(1 - l * (1 - e)).toFixed(4)})`);
      for (let k = SMOOTH.length - 1; k >= 0; k--) { const [u, e] = SMOOTH[k]; g.addColorStop(1 - (u * fw) / FW, `rgba(0,0,0,${(1 - r * (1 - e)).toFixed(4)})`); }
      ctx.save(); ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = g; ctx.fillRect(0, 0, FW, H); ctx.restore();
    }

    function pill(text, x, y, align) {
      const w = width(text, F_PILL) + 16, h = 24;
      let left = align === "centre" ? x - w / 2 : align === "right" ? x - w - 6 : x + 6;
      left = Math.max(pad, Math.min(FW - pad - w, left));
      const top = Math.max(0, Math.min(H - h, y));
      ctx.fillStyle = rgba(C.ground, 0.94); ctx.strokeStyle = rgba(C.now, 1); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(left + 0.5, top + 0.5, w - 1, h - 1, 4); ctx.fill(); ctx.stroke();
      ctx.font = F_PILL; ctx.fillStyle = rgba(C.ink, 1); ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(text, left + 8, top + h / 2 + 0.5);
    }

    // the track under Layers: the whole strip in one line, the part in view as a window on it, where the superset's
    // types are, and the search's result
    const MH = 14;
    function drawMini() {
      if (miniWrap.hidden) return;
      const MW = FW - 2 * pad, y = MH / 2, at = (x) => (x / total) * MW;
      mx.setTransform(dpr, 0, 0, dpr, 0, 0); mx.clearRect(0, 0, MW, MH);
      mx.fillStyle = rgba(C.ink, 0.16);
      mx.beginPath(); mx.roundRect(0, y - 1, MW, 2, 1); mx.fill();
      mx.fillStyle = rgba(C.now, 0.75);
      for (const t of T) if (t.s) mx.fillRect(Math.round(at(t.lx + t.lw / 2)) - 0.75, y - 2.5, 1.5, 5);
      const v0 = at(sc.scrollLeft), w = Math.max(18, Math.min(MW, at(sc.scrollLeft + MW)) - v0);
      mx.fillStyle = rgba(C.ink, scrub || miniHover ? 0.9 : 0.62);
      mx.beginPath(); mx.roundRect(Math.min(v0, MW - w), y - 3, w, 6, 3); mx.fill();
      if (focus) { mx.fillStyle = rgba(C.now, 1); for (const i of focus.types) { const t = T[i]; mx.beginPath(); mx.roundRect(Math.round(at(t.lx + t.lw / 2)) - 1, 0, 2, MH, 1); mx.fill(); } }
    }

    function setView(v) {
      if (v === view || morph) return;
      const from = view;
      if (from === "layers") lastScroll = sc.scrollLeft;
      setHover(null);
      view = v;
      try { localStorage.setItem("schema-hero-view", v); } catch {}
      if (reduce) { settle(); paint(); return; }
      // Layers as it was (or will be), each type's mark at the middle of the part of its layer in view, and the tree
      const at = lastScroll;
      const lay = T.map((t) => geoL(t, at)), br = T.map(geoB);
      const seed = T.map((t) => {
        const x0 = pad + t.lx - at, x1 = x0 + t.lw, b = br[t.i];
        const x = x1 > pad && x0 < FW - pad ? (Math.max(x0, pad) + Math.min(x1, FW - pad)) / 2 : (x0 + x1) / 2;
        return { x, y: t.ly + L.band / 2, w: b.w, h: b.h, rot: 0 };
      });
      // back to Layers: its height is measured now (the window may have changed), then while the types travel the
      // frame holds the taller of the two views
      if (v === "layers") { fit(); for (const t of T) lay[t.i] = geoL(t, at); for (const t of T) seed[t.i].y = t.ly + L.band / 2; }
      chrome(v);
      miniWrap.hidden = true;
      setHeight(Math.max(L.H, B.H));
      morph = { from, to: v, lay, seed, br, at, start: performance.now() };
      // Branches is sized to the window: bring all of it into view
      if (v === "branches") {
        const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--head")) || 64;
        const r = fig.getBoundingClientRect(), bottom = r.top + (frame.offsetTop - fig.offsetTop) + B.H + 70;
        if (r.top < head || bottom > innerHeight) scrollTo({ top: scrollY + r.top - head - 14, behavior: "smooth" });
      }
      paint();
    }
    for (const b of views) b.addEventListener("click", () => setView(b.dataset.view));

    /* pointing, dragging, tapping */
    function hit(x, y) {
      if (view === "branches") {
        let best = null, bd = coarse.matches ? 18 : 9;
        for (const t of T) { const d = Math.hypot(t.bx - x, t.by - y); if (d < bd) { bd = d; best = t; } }
        return best;
      }
      const yy = y - L.off - L.top, r = Math.floor(yy / (L.band + L.gap));
      if (r < 0 || r >= rows || yy - r * (L.band + L.gap) > L.band) return null;
      const wx = x - pad + sc.scrollLeft;
      let best = null, bd = 5;
      for (const t of byRow[r]) {
        if (wx >= t.lx && wx <= t.lx + t.lw) return t;
        const d = Math.min(Math.abs(wx - t.lx), Math.abs(wx - t.lx - t.lw));
        if (d < bd) { bd = d; best = t; }
      }
      return best;
    }
    const local = (e) => { const r = frame.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function setHover(t, x, y) {
      if (t !== hover) { hover = t; paint(); }
      sc.style.cursor = drag && drag.moved ? "grabbing" : t ? "pointer" : view === "layers" ? "grab" : "";
      if (!t) { tip.classList.remove("on"); return; }
      tip.innerHTML = `<b>${esc(t.n)}</b><span>${t.s ? "Superset type" : "Type"}${t.d ? " · " + plural(t.d, "type", "types") + " below it" : ""}</span>` +
        (t.trail.length > 1 ? `<span class="tr">${t.trail.map((x) => esc(x.n)).join(" › ")}</span>` : "") + (t.f ? `<span class="f">${esc(t.f)}</span>` : "");
      tip.classList.add("on");
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let left, top;
      if (view === "branches" && t.br && !t.sat) {
        // in the tree the note opens on the outer side of the type, away from Thing, so it never covers the lines
        // that run back to the centre: left of a type on the left, above one at the top, and so on
        const c = Math.cos(t.ba), s = Math.sin(t.ba), gap = 14;
        left = c >= 0 ? t.bx + gap : t.bx - w - gap;
        top = t.by - h / 2 + s * (h / 2 + gap);
      } else if (view === "branches") { left = t.bx + 14; top = t.by - h - 14; } // Thing, and the small trees in the corner
      else { left = x + 16; top = y + 14; if (left + w > FW - pad) left = x - w - 16; if (top + h > H) top = y - h - 14; }
      left = Math.max(pad, Math.min(FW - pad - w, left));
      top = Math.max(0, Math.min(H - h, top));
      tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    }
    function point(e) {
      const [x, y] = local(e);
      if (morph || x < pad * 0.5 || x > FW - pad * 0.5) return setHover(null);
      setHover(hit(x, y), x, y);
    }
    sc.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || view !== "layers") return;
      drag = { x: e.clientX, s: sc.scrollLeft, moved: false };
      sc.setPointerCapture(e.pointerId);
    });
    sc.addEventListener("pointermove", (e) => {
      if (drag) {
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; setHover(null); }
        if (drag.moved) { sc.scrollLeft = drag.s - dx; sc.style.cursor = "grabbing"; return; }
      }
      if (e.pointerType === "mouse") point(e);
    });
    sc.addEventListener("pointerup", (e) => {
      const d = drag; drag = null;
      if (d && d.moved) { point(e); return; }
      if (e.pointerType !== "mouse") {
        // on a touch screen a tap shows a type, and a second tap on the same one opens it
        const [x, y] = local(e), t = morph ? null : hit(x, y);
        if (t && t === hover) location.href = t.h;
        else setHover(t, x, y);
        return;
      }
      if (hover) location.href = hover.h;
    });
    sc.addEventListener("pointercancel", () => { drag = null; });
    sc.addEventListener("pointerleave", () => { if (!drag) setHover(null); });
    sc.addEventListener("scroll", () => { if (morph) return; if (hover && !drag) setHover(null); paint(); }, { passive: true });
    sc.addEventListener("keydown", (e) => {
      if (view !== "layers" || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      sc.scrollBy({ left: (e.key === "ArrowLeft" ? -1 : 1) * Math.round(FW * 0.4), behavior: reduce ? "auto" : "smooth" });
    });
    // the overview: press or drag along it to travel
    let scrub = false, miniHover = false;
    const scrubTo = (e) => { const r = mini.getBoundingClientRect(); sc.scrollLeft = ((e.clientX - r.left) / r.width) * total - r.width / 2; };
    mini.addEventListener("pointerdown", (e) => { scrub = true; mini.setPointerCapture(e.pointerId); scrubTo(e); });
    mini.addEventListener("pointermove", (e) => { if (scrub) scrubTo(e); });
    mini.addEventListener("pointerup", () => { scrub = false; paint(); });
    mini.addEventListener("pointercancel", () => { scrub = false; paint(); });
    mini.addEventListener("pointerenter", () => { miniHover = true; paint(); });
    mini.addEventListener("pointerleave", () => { miniHover = false; paint(); });

    // the search: the figure lights the result, and in Layers the strip travels to it
    onResult = (r) => {
      focus = M.find(r);
      cap.innerHTML = caption(view);
      if (focus && view === "layers" && !morph) {
        const t = focus.types.map((i) => T[i]).sort((a, b) => a.lx - b.lx)[0];
        const x = pad + t.lx - sc.scrollLeft + t.lw / 2;
        if (x < pad + 60 || x > FW - pad - 60) sc.scrollTo({ left: t.lx + t.lw / 2 - (FW - 2 * pad) / 2, behavior: reduce ? "auto" : "smooth" });
      }
      paint();
    };

    layout();
    if (pending) onResult(pending);
    paint();
    fig.classList.add("ready");
    // Layers always opens at its start, even if the browser would put back an old scroll on reload or Back
    const home = () => { if (view === "layers" && !focus && !drag && !morph) { sc.scrollLeft = 0; lastScroll = 0; paint(); } };
    requestAnimationFrame(home);
    addEventListener("pageshow", (e) => { if (e.persisted) home(); });
    // names are drawn in the site's face once it has loaded
    if (document.fonts) document.fonts.ready.then(() => { widths.clear(); paint(); });
    // a new width lays everything out again; in Layers a new height (the window's) shares out the layers again
    new ResizeObserver(() => {
      if (morph) return;
      const w = frame.clientWidth, h = frame.clientHeight;
      if (w !== FW) { if (view === "layers") lastScroll = sc.scrollLeft * (w / FW); layout(); paint(); }
      else if (view === "layers" && h !== H) { fit(); canvasTo(L.H); paint(); }
    }).observe(frame);
  }
