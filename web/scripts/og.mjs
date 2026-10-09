/**
 * schema.org.ai, the share cards.
 *
 * Renders og/card.html in headless Chrome: one card per term (every type, property and value), plus the site's
 * own pages, into .og-cache/ (kept between builds; a card is rendered again only when its template or its
 * words change). build.mjs copies them into public/og/ and puts each card's hash in its page's og:image
 * address, so a changed card reaches the apps that keep old ones. lib/cards.mjs says what each card says.
 *
 *   node scripts/og.mjs        (run by `npm run build`)
 *
 * Needs Google Chrome. Set CHROME to its path if it is not in the usual place. The first run renders about
 * 3,000 cards and takes several minutes; later runs render only what changed.
 */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadVocab } from "../lib/vocab.mjs";
import { termCard, SITE_CARDS, cardAlt } from "../lib/cards.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, ".og-cache");
const MAX_BYTES = 300 * 1024; // WhatsApp is widely reported to skip larger images

const sha = (s) => createHash("sha1").update(s).digest("hex");
const read = (p) => readFileSync(join(ROOT, p));

/* ── the cards ─────────────────────────────────────────────────────────────── */

const vocab = loadVocab(join(ROOT, "data/schemaorg-30.1.jsonld"), join(ROOT, "../extensions.jsonld"));
const SITE = [...SITE_CARDS, ...[...vocab.pages.values()].map(termCard)];

/* ── the page Chrome renders: the template with its font and the mark inlined ── */

const mark = read("src/logo.svg.html").toString().trim();
if (!/^<svg class="logo" viewBox/.test(mark)) throw new Error("og: src/logo.svg.html is not the mark");
const page = read("og/card.html").toString()
  .replaceAll("{{FONT}}", "data:font/woff2;base64," + read("src/fonts/publicsans-latin.woff2").toString("base64"))
  .replaceAll("{{MARK}}", JSON.stringify(mark));
if (page.includes("{{")) throw new Error("og: the template has an unfilled placeholder");
const pageKey = sha(page);

/* ── a minimal DevTools Protocol client ─────────────────────────────────────── */

const CHROME = process.env.CHROME || ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find((p) => existsSync(p));
if (!CHROME) throw new Error("og: Google Chrome not found; set CHROME to its path");

async function withChrome(fn) {
  const profile = mkdtempSync(join(tmpdir(), "og-chrome-"));
  const port = 9600 + Math.floor(Math.random() * 300);
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  try {
    let target;
    for (let i = 0; i < 100 && !target; i++) {
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page"); } catch {}
      if (!target) await new Promise((r) => setTimeout(r, 100));
    }
    if (!target) throw new Error("og: Chrome did not start");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0; const pending = new Map(), events = [];
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.j(new Error(m.error.message)) : p.r(m.result); }
      else for (const e of events.slice()) if (e.method === m.method) { events.splice(events.indexOf(e), 1); e.r(m); }
    };
    const send = (method, params = {}) => new Promise((r, j) => { const i = ++id; pending.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params })); });
    const once = (method) => new Promise((r) => events.push({ method, r }));
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(join(CACHE, "card.html"), page);
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url: "file://" + join(CACHE, "card.html") });
    await loaded;
    return await fn(async (card) => {
      const r = await send("Runtime.evaluate", { expression: `render(${JSON.stringify(card)})`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error("og: " + card.name + ": " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
      return { fit: r.result.value, png: Buffer.from(shot.data, "base64") };
    });
  } finally {
    chrome.kill("SIGKILL");
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

/* ── render what changed, check every card, write the index ─────────────────── */

async function renderAll(cards, dir) {
  const indexFile = join(dir, "index.json");
  const old = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, "utf8")) : {};
  const index = {}, todo = [];
  for (const c of cards) {
    const key = sha(pageKey + JSON.stringify(c));
    const file = join(dir, c.name + ".png");
    if (old[c.name] && old[c.name].key === key && existsSync(file)) index[c.name] = old[c.name];
    else todo.push({ c, key, file });
  }
  const problems = [];
  if (todo.length) {
    const t0 = Date.now();
    await withChrome(async (render) => {
      for (const { c, key, file } of todo) {
        const { fit, png } = await render(c);
        if (!fit.ok) problems.push(`${c.name}: the headline does not fit (${fit.size}px, ${fit.lines} lines)`);
        if (png.length > MAX_BYTES) problems.push(`${c.name}: ${Math.round(png.length / 1024)} KB, over ${MAX_BYTES / 1024} KB`);
        if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) problems.push(`${c.name}: not 1200 x 630`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, png);
        // the alt text says what the card shows: without its detail, if that was left off
        index[c.name] = { key, v: sha(png).slice(0, 10), alt: cardAlt(fit.detailShown ? c : { ...c, detail: "" }), size: fit.size, width: fit.width, bytes: png.length };
      }
    });
    console.log(`  og: rendered ${todo.length} card${todo.length === 1 ? "" : "s"} in ${((Date.now() - t0) / 1000).toFixed(1)} s, ${cards.length - todo.length} unchanged`);
  } else console.log(`  og: all ${cards.length} cards unchanged`);
  if (problems.length) { for (const p of problems) console.error("  og: " + p); throw new Error("og: " + problems.length + " card(s) failed their checks"); }
  writeFileSync(indexFile, JSON.stringify(index, null, 1));
  return index;
}

// --preview renders a few telling cards into .og-cache/preview, to look at before rendering them all
if (process.argv.includes("--preview")) {
  const pick = ["og", "t/Person", "t/CompositeWithTrainedAlgorithmicMediaDigitalSource", "t/MedicalObservationalStudyDesign", "p/name", "p/additionalName", "v/Monday", "t/Agent", "t/Text", "t/Thing", "p/digital", "t/LocalBusiness"];
  await renderAll(SITE.filter((c) => pick.includes(c.name)), join(CACHE, "preview"));
} else {
  await renderAll(SITE, join(CACHE, "cards"));
}
