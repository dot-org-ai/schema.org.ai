/* ═══════════════════════════════════════════════════════════════════════════
   schema.org.ai — the writing edge. LANDING PAGE ONLY.

   One tween engine. Three consumers: the pass, the section cut, the close.
   Plus one scrubbed scene, the record rule.

   There is no input on this page — the profile is 64 terms and all 64 are
   printed, so a lookup control is theatre and the browser's own find beats any
   matcher we could ship (delta D1). No matcher, no suggestion list, no answer
   state, no drain, no idle wipe. The edge exits and the page is still. A
   reference document does not ask you anything, so nothing on it waits for an
   answer.

   The term pages and the census page carry NO script: their one arrival cut is
   pure CSS, so 64 documents do not each pay for a tween engine.

   No network. No framework. No timers at rest. rAF runs only while a tween is
   in flight and stops on the last one.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  var MOTION = root.classList.contains("motion");

  /* ── the durations, read from the stylesheet and nowhere written twice ──── */

  function ms(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    var n = parseFloat(v);
    if (!v || n !== n) return fallback;
    return /ms$/i.test(v) ? n : n * 1000;
  }

  var D_CUT = ms("--d-cut", 700);
  var D_PASS = ms("--d-pass", 1150);
  var D_TICK = ms("--d-tick", 700);
  var D_CLOSE = ms("--d-close", 900);

  /* ── the tween engine ──────────────────────────────────────────────────── */
  /* Time-based and clamped: a dropped frame skips positions, never the
     endpoint. visibilitychange:hidden completes every tween immediately. */

  var live = [];

  function bez(x1, y1, x2, y2) {
    function A(a, b) { return 1 - 3 * b + 3 * a; }
    function B(a, b) { return 3 * b - 6 * a; }
    function C(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, d;
      for (i = 0; i < 6; i++) {
        d = slope(t, x1, x2);
        if (d === 0) break;
        t -= (calc(t, x1, x2) - x) / d;
      }
      return calc(t, y1, y2);
    };
  }
  var EASE_WRITE = bez(0.16, 1, 0.3, 1);

  function tween(dur, ease, onFrame, onDone) {
    var t0 = performance.now(), rec = { done: false };
    rec.finish = function () {
      if (rec.done) return;
      rec.done = true;
      onFrame(1);
      if (onDone) onDone();
    };
    function step(now) {
      if (rec.done) return;
      var t = (now - t0) / dur;
      if (t >= 1) { rec.finish(); return; }
      onFrame(ease(t));
      requestAnimationFrame(step);
    }
    live.push(rec);
    requestAnimationFrame(step);
    return rec;
  }

  doc.addEventListener("visibilitychange", function () {
    if (doc.visibilityState === "hidden") {
      live.forEach(function (r) { r.finish(); });
      live.length = 0;
    }
  });

  /* the negative left inset is not a typo: without it the ink of the first
     glyph clips */
  function clipTo(el, f) {
    el.style.clipPath = "inset(0 " + ((1 - f) * 100).toFixed(3) + "% 0 -0.14em)";
  }

  var sticky = $("#sticky");

  /* ── the spine ─────────────────────────────────────────────────────────── */

  var spine = $(".spine"), spineLine = $(".spine-line"), ticks = [], spineH = 0, passed = 0;

  function tickTarget(t) { return t.last ? spineH : t.y; }

  function buildSpine() {
    var closing = $(".closing");
    if (!spine || !closing) return;
    var end = closing.getBoundingClientRect().bottom + window.scrollY;
    spineH = end;
    spine.style.height = end + "px";
    /* A rebuild re-measures; it must not erase the record of what she passed. */
    var was = [];
    ticks.forEach(function (t) { if (t.marked) was.push(t.sec); t.el.remove(); });
    var all = $$("[data-tick]");
    ticks = all.map(function (sec, i) {
      var y = sec.getBoundingClientRect().top + window.scrollY;
      var el = doc.createElement("i");
      el.className = "tick";
      el.style.top = Math.max(0, y) + "px";
      var marked = was.indexOf(sec) !== -1;
      if (marked) el.classList.add("marked");
      spine.appendChild(el);
      return { el: el, sec: sec, y: y, last: i === all.length - 1, marked: marked };
    });
    passed = 0;
    ticks.forEach(function (t) {
      if (!t.marked || !spineH) return;
      var f = Math.min(1, Math.max(0, tickTarget(t) / spineH));
      if (f > passed) passed = f;
    });
  }

  function markTick(sec) {
    var t = ticks.filter(function (x) { return x.sec === sec; })[0];
    if (!t || t.marked) return;
    t.marked = true;
    t.el.classList.add("marked");
    /* the hairline advances here and nowhere else: one discrete stroke, at the
       instant a section's heading finishes being written. It cannot be a
       progress bar, because it never shows how much is left. */
    advanceSpine(tickTarget(t));
    if (!MOTION) return;
    t.el.classList.add("now");
    setTimeout(function () { t.el.classList.remove("now"); }, D_TICK);
  }

  function writeSpine(f, snap) {
    if (!spineLine) return;
    if (snap) spineLine.style.transition = "none";
    spineLine.style.transform = "scaleY(" + f.toFixed(4) + ")";
    if (snap) { void spineLine.offsetHeight; spineLine.style.transition = ""; }
  }

  function advanceSpine(y) {
    if (!MOTION || !spineH) return;
    var f = Math.min(1, Math.max(0, y / spineH));
    if (f <= passed) return;
    passed = f;
    writeSpine(f, false);
  }

  function growSpine() {
    if (!spineH) return;
    writeSpine(MOTION ? passed : 1, true);
  }

  /* ── Scene 0 · THE PASS ────────────────────────────────────────────────── */

  function thePass() {
    var els = $$(".pass");
    if (!els.length) return;
    var rects = els.map(function (e) { return e.getBoundingClientRect(); });
    var edge = doc.createElement("i");
    edge.className = "pass-edge";
    doc.body.appendChild(edge);
    var span = window.innerWidth + 2;

    els.forEach(function (e) { e.style.willChange = "clip-path"; clipTo(e, 0); });

    tween(D_PASS, EASE_WRITE, function (p) {
      var x = p * span;
      edge.style.transform = "translateX(" + x.toFixed(2) + "px)";
      for (var i = 0; i < els.length; i++) {
        var r = rects[i];
        var f = Math.min(1, Math.max(0, (x - r.left) / r.width));
        clipTo(els[i], f);
      }
    }, function () {
      /* The edge exits and the page is still. Nothing blinks, nothing pulses,
         no scroll cue, no chevron, no hint. There is nothing armed here.
         No number counts up, anywhere on this site, at any point, ever. */
      edge.remove();
      root.classList.add("wrote");
      els.forEach(function (e) { e.style.clipPath = ""; e.style.willChange = ""; });
    });
  }

  /* ── Scenes 1-7 · THE SECTION CUT, and the fling guard ─────────────────── */

  var entries = [], snapped = false;

  function snapAll() {
    if (snapped) return;
    snapped = true;
    root.classList.add("snap");
    $$(".cut").forEach(function (e) { e.classList.add("on"); });
    $$(".door, .strip-sec, .what, .foot").forEach(function (s) { s.classList.add("drawn"); });
    $$(".fade").forEach(function (e) { e.classList.add("on"); });
  }

  /* A fling means she is travelling, not reading. On a thirty-one-row ledger
     this fires often, and that is correct. */
  function flingCheck() {
    var now = performance.now();
    entries.push(now);
    entries = entries.filter(function (t) { return now - t < 250; });
    if (entries.length > 2) snapAll();
    return snapped;
  }

  function releaseWillChange(el) {
    var clear = function () { el.style.willChange = ""; el.removeEventListener("transitionend", clear); };
    el.addEventListener("transitionend", clear);
    setTimeout(clear, D_CUT + 600);
  }

  /* The ledger is cut as ONE BLOCK, never row by row: a per-row stagger ranks
     the rows by arrival order, which is a per-row weight this page is not
     entitled to print — in digits or in time. It would also breach the
     eight-concurrent clip-path cap on its own in a 31-row section. */
  function doorCut(sec) {
    sec.classList.add("drawn");
    var heading = $(".dh", sec);
    var blocks = $$(".cut", sec).filter(function (e) { return e !== heading; });

    if (snapped) {
      if (heading) heading.classList.add("on");
      blocks.forEach(function (b) { b.classList.add("on"); });
      markTick(sec);
      return;
    }

    blocks.forEach(function (b, i) {
      b.classList.add("d" + Math.min(4, i + 1));
      b.style.willChange = "clip-path";
      releaseWillChange(b);
      requestAnimationFrame(function () { b.classList.add("on"); });
    });

    if (!heading) { markTick(sec); return; }

    var hr = heading.getBoundingClientRect();
    var sr = sec.getBoundingClientRect();
    var frame = $(".frame", sec).getBoundingClientRect();
    var travel = Math.max(hr.width + 8, frame.right - hr.left);
    var edge = doc.createElement("i");
    edge.className = "cut-edge";
    edge.style.left = (hr.left - sr.left) + "px";
    edge.style.top = (hr.top - sr.top + Math.max(0, (hr.height - Math.min(hr.height, 68)) / 2)) + "px";
    edge.style.height = Math.min(hr.height, 68) + "px";
    sec.appendChild(edge);

    heading.style.willChange = "clip-path";
    var ticked = false;

    tween(D_CUT, EASE_WRITE, function (p) {
      var x = p * travel;
      edge.style.transform = "translateX(" + x.toFixed(2) + "px)";
      var f = Math.min(1, x / hr.width);
      clipTo(heading, f);
      if (f >= 1 && !ticked) { ticked = true; markTick(sec); }
    }, function () {
      edge.remove();
      heading.style.clipPath = "";
      heading.style.willChange = "";
      heading.classList.add("on");
      if (!ticked) markTick(sec);
    });
  }

  /* ── Scene 8 · THE RECORD RULE — fallback scrub ────────────────────────── */

  var strip = $("#record");
  var nativeScrub = MOTION && CSS && CSS.supports && CSS.supports("animation-timeline", "view()");

  /* FOUR phrases. `.k-name` is not in this list and there is nothing here that
     can light it: the refusal is the absence of an entry, exactly as it is the
     absence of a rule in the stylesheet. The page's one moving rule reads the
     keys of its own flagship example, marks each one this address resolves,
     reaches the one key a reader reaches for first, and stops. */
  var PHASES = [[".k-context", 0.30], [".k-id", 0.34], [".k-type", 0.38], [".k-schema", 0.44]];
  var stripRules = strip ? $$(".strip-rule", strip) : [];
  var stripPhases = strip ? PHASES.map(function (p) { return [$(p[0], strip), p[1]]; }) : [];
  var stripNear = false;

  function scrubRecord() {
    if (!MOTION || nativeScrub || !strip || !stripNear) return;
    var r = strip.getBoundingClientRect();
    var q = (window.innerHeight - r.top) / (window.innerHeight + r.height);
    q = Math.min(1, Math.max(0, q));
    /* the rule completes past the blank fifth row anyway */
    var f = Math.min(1, Math.max(0, (q - 0.18) / 0.22)).toFixed(4);
    for (var i = 0; i < stripRules.length; i++) {
      stripRules[i].style.transform = "scaleX(" + f + ")";
    }
    stripPhases.forEach(function (p) {
      if (p[0]) p[0].classList.toggle("lit", q >= p[1]);
    });
  }

  if (MOTION && !nativeScrub && strip) {
    new IntersectionObserver(function (l) {
      l.forEach(function (en) { stripNear = en.isIntersecting; });
      if (stripNear) scrubRecord();
    }, { rootMargin: "100% 0px 100% 0px" }).observe(strip);
  }

  /* ── Scene 9 · THE CLOSE ───────────────────────────────────────────────── */

  /* The page ends by writing down the three documents a machine can fetch from
     this host — which is what this property exists to do, and which was empty
     until this deploy. */
  function theClose() {
    var open = $("#open");
    if (!open) return;
    if (snapped || !MOTION) { open.classList.add("on"); return; }
    var foot = $(".foot"), fr = foot.getBoundingClientRect();
    var r = open.getBoundingClientRect();
    var edge = doc.createElement("i");
    edge.className = "cut-edge";
    edge.style.left = (r.left - fr.left) + "px";
    edge.style.top = (r.top - fr.top) + "px";
    edge.style.height = r.height + "px";
    foot.appendChild(edge);
    open.style.willChange = "clip-path";
    tween(D_CLOSE, EASE_WRITE, function (p) {
      edge.style.transform = "translateX(" + (p * r.width).toFixed(2) + "px)";
      clipTo(open, p);
    }, function () {
      edge.remove();
      open.style.clipPath = "";
      open.style.willChange = "";
      open.classList.add("on");
    });
  }

  /* ── observers ─────────────────────────────────────────────────────────── */

  /* Every arrival observer is once-only. Nothing on this page ever replays. */
  if (MOTION) {
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        flingCheck();
        if (el.classList.contains("door")) { doorCut(el); return; }

        el.classList.add("drawn");
        markTick(el);
        if (el.classList.contains("foot")) { theClose(); return; }

        $$(".cut", el).forEach(function (b, i) {
          if (snapped) { b.classList.add("on"); return; }
          b.classList.add("d" + Math.min(4, i + 1));
          b.style.willChange = "clip-path";
          releaseWillChange(b);
          requestAnimationFrame(function () { b.classList.add("on"); });
        });
        $$(".fade", el).forEach(function (b, i) {
          setTimeout(function () { b.classList.add("on"); }, snapped ? 0 : i * 120);
        });
      });
    }, { rootMargin: "-30% 0px -30% 0px" });

    $$(".door, .strip-sec, .what, .foot").forEach(function (s) { io.observe(s); });

    /* The tenth tick is the closing line and it is the last thing in the
       document: a -30% bottom inset would put it permanently out of reach at
       the foot of the page, so it gets its own observer at rootMargin 0. */
    var closing = $(".closing");
    if (closing) {
      var ioClose = new IntersectionObserver(function (l) {
        l.forEach(function (en) { if (en.isIntersecting) { markTick(en.target); ioClose.unobserve(en.target); } });
      }, { rootMargin: "0px" });
      ioClose.observe(closing);
    }
  } else {
    $$(".fade").forEach(function (e) { e.classList.add("on"); });
  }

  /* ── sticky nav, hero handover, spine growth ───────────────────────────── */

  var hero = $("#hero"), heroIn = $(".hero-in");
  var navLinks = $$("[data-nv]");

  var spy = new IntersectionObserver(function (l) {
    l.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      navLinks.forEach(function (a) { a.classList.toggle("here", a.getAttribute("data-nv") === id); });
      var cur = navLinks.filter(function (a) { return a.classList.contains("here"); })[0];
      if (cur && window.innerWidth <= 1120 && cur.scrollIntoView) {
        cur.scrollIntoView({ inline: "center", block: "nearest" });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$(".door, .strip-sec").forEach(function (s) { spy.observe(s); });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      /* the spine is not here. It is driven by markTick, not by scroll position. */
      scrubRecord();
      if (!hero) return;
      var hr = hero.getBoundingClientRect();
      if (sticky) sticky.classList.toggle("on", hr.bottom <= 0);
      if (MOTION && heroIn && hr.bottom > -200) {
        var p = Math.min(1, Math.max(0, (-hr.top / hr.height - 0.4) / 0.3));
        heroIn.style.opacity = (1 - p).toFixed(3);
        heroIn.style.transform = p ? "translateY(" + (-8 * p).toFixed(2) + "px)" : "";
      }
    });
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* A resize is not a scene: finish every live tween, rebuild the geometry,
     re-assert the final states without a tween. */
  var rt;
  addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      live.forEach(function (r) { r.finish(); });
      live.length = 0;
      buildSpine();
      growSpine();
      scrubRecord();
    }, 150);
  });

  /* ── go ────────────────────────────────────────────────────────────────── */

  function start() {
    root.dataset.booted = "1";
    buildSpine();
    growSpine();
    scrubRecord();
    onScroll();
    if (MOTION) thePass();
  }

  /* At most 300 ms of pre-roll. Late font metrics are corrected by re-measuring
     the spine rather than by holding the page blank until they land. */
  if (doc.fonts && doc.fonts.ready) {
    var fired = false;
    var kick = function () { if (!fired) { fired = true; start(); } };
    doc.fonts.ready.then(function () {
      kick();
      buildSpine();
      growSpine();
    });
    setTimeout(kick, 300);
  } else {
    start();
  }

  /* reduced motion: arrival is still composed. One 200 ms fade of the root. */
  requestAnimationFrame(function () { root.classList.add("arrived"); });
})();
