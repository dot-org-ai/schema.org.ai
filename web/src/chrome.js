  /* ---------------- shared chrome ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = mqReduce.matches;
  if (mqReduce.addEventListener) mqReduce.addEventListener("change", (e) => { reduce = e.matches; });
  const isMobile = () => innerWidth < 900;
  const fmt = (n) => n.toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const headLogo = $(".site-head .logo"), lastMark = $$(".mk", headLogo).pop();
  headLogo.classList.add("settled");
  headLogo.addEventListener("animationend", (e) => { if (e.target === lastMark && e.animationName === "logoRepour") headLogo.classList.remove("repour"); });
  $(".wordmark").addEventListener("mouseenter", () => { if (!reduce && !headLogo.classList.contains("repour")) headLogo.classList.add("repour"); });
  const menuBtn = $(".menu-btn"), mnav = $("#mnav");
  let menuHide = 0;
  function setMenu(open, now) {
    clearTimeout(menuHide);
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      mnav.hidden = false;
      mnav.getBoundingClientRect(); // commit the folded state first, so the sheet unrolls from it
      mnav.classList.add("in");
      $("a", mnav).focus({ preventScroll: true });
    } else {
      mnav.classList.remove("in");
      if (now || reduce) mnav.hidden = true;
      else menuHide = setTimeout(() => { mnav.hidden = true; }, 280);
    }
  }
  // Tab past the last link closes the menu, so nothing is ever focused behind it. A pointer blur has no
  // relatedTarget (Safari never focuses a tapped button); taps are handled below, or the X would reopen it.
  mnav.addEventListener("focusout", (e) => {
    if (menuBtn.getAttribute("aria-expanded") === "true" && e.relatedTarget && !e.relatedTarget.closest("#mnav, .menu-btn")) setMenu(false);
  });
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  // choosing a link, or tapping the dimmed page around the sheet, folds it away
  mnav.addEventListener("click", (e) => { if (e.target.closest("a") || !e.target.closest(".mnav-panel")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("pointerdown", (e) => { if (menuBtn.getAttribute("aria-expanded") === "true" && !e.target.closest("#mnav, .menu-btn")) setMenu(false); });
  addEventListener("resize", () => { if (!isMobile() && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false, true); });
