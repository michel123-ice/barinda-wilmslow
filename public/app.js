/* =========================================================
   Barinda — motion & navigation
   Progressive enhancement: the page is complete without JS.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");

  /* -------------------------------------------------------
     Masthead: solid on scroll
     ------------------------------------------------------- */
  var mast = document.querySelector(".mast");
  var lastSolid = null;
  function syncMast() {
    if (!mast) return;
    var solid = window.scrollY > 40;
    if (solid !== lastSolid) {
      mast.classList.toggle("is-solid", solid);
      lastSolid = solid;
    }
  }
  syncMast();
  window.addEventListener("scroll", syncMast, { passive: true });

  /* -------------------------------------------------------
     Mobile drawer
     ------------------------------------------------------- */
  var toggle = document.querySelector(".mast__toggle");
  var drawer = document.getElementById("mobile-nav");

  function setDrawer(open) {
    if (!toggle || !drawer) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.hidden = !open;
    if (open) {
      var first = drawer.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      setDrawer(drawer.hidden);
    });

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setDrawer(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawer.hidden) {
        setDrawer(false);
        toggle.focus();
      }
    });

    /* Keep the drawer honest if the viewport grows to desktop. */
    var wide = window.matchMedia("(min-width: 62rem)");
    var onWide = function (e) { if (e.matches) setDrawer(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* -------------------------------------------------------
     Smooth scroll for in-page links (respects reduced motion)
     ------------------------------------------------------- */
  if (!reduce) {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (drawer && !drawer.hidden) setDrawer(false);

      var offset = mast ? mast.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - offset + 1;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.replaceState(null, "", id);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  /* -------------------------------------------------------
     Animation: GSAP ScrollTrigger if available
     ------------------------------------------------------- */
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  function markVisible(el) {
    el.classList.add("reveal-done");
    el.style.opacity = "";
    el.style.transform = "";
  }

  function collect(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  if (!gsap || !ScrollTrigger || reduce) {
    /* No motion, or animation unavailable: reveal everything. */
    collect(".reveal").forEach(markVisible);
    collect(".line").forEach(function (n) { n.style.opacity = ""; n.style.transform = ""; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Hero: one orchestrated entrance */
  var heroTl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });

  heroTl
    .from(".hero__media img", { scale: 1.06, duration: 1.6, ease: "power2.out" }, 0)
    .from(".hero__eyebrow", { autoAlpha: 0, y: 12 }, 0.05)
    .from(".hero__title .l", { autoAlpha: 0, y: 26, stagger: 0.08 }, 0.1)
    .from(".hero__lede", { autoAlpha: 0, y: 14 }, 0.26)
    .from(".hero__cta .btn", { autoAlpha: 0, y: 12, stagger: 0.06 }, 0.34)
    .from(".hero__strip > div", { autoAlpha: 0, y: 10, stagger: 0.05 }, 0.44);

  /* Scroll-linked parallax on the experience band */
  var bandImg = document.querySelector(".band__img");
  if (bandImg) {
    gsap.fromTo(bandImg, { yPercent: -6 }, {
      yPercent: 6,
      ease: "none",
      scrollTrigger: {
        trigger: ".band",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* Hero image drift as the page scrolls away */
  var heroImg = document.querySelector(".hero__media img");
  if (heroImg && window.matchMedia("(min-width: 62rem)").matches) {
    gsap.to(heroImg, {
      yPercent: 7,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* Generic reveals */
  collect(".reveal").forEach(function (el) {
    gsap.fromTo(el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1, y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: parseFloat(el.dataset.delay || "0"),
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onComplete: function () { el.classList.add("reveal-done"); }
      }
    );
  });

  /* Kitchen plates, gallery shots: gentle stagger inside their groups */
  [".plates", ".gallery__grid"].forEach(function (sel) {
    var group = document.querySelector(sel);
    if (!group) return;
    var kids = group.children;
    gsap.fromTo(kids,
      { autoAlpha: 0, y: 34 },
      {
        autoAlpha: 1, y: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: group, start: "top 85%", once: true }
      }
    );
  });

  /* Hours rows: type ticking in, left to right */
  var rows = collect(".hours__row");
  if (rows.length) {
    gsap.fromTo(rows,
      { autoAlpha: 0, x: -14 },
      {
        autoAlpha: 1, x: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".hours__list", start: "top 88%", once: true }
      }
    );
  }

  /* Refresh once webfonts settle so trigger positions are exact */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  /* Safety net: reveal anything that is already on screen but still
     hidden (e.g. if a trigger fired before layout settled). */
  function sweep() {
    var vh = window.innerHeight;
    collect(".reveal").forEach(function (el) {
      if (el.classList.contains("reveal-done")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 1.02 && r.bottom > -40) markVisible(el);
    });
  }
  window.addEventListener("load", function () { setTimeout(sweep, 300); });
  window.addEventListener("scroll", function () {
    if (sweep.pending) return;
    sweep.pending = true;
    requestAnimationFrame(function () { sweep.pending = false; sweep(); });
  }, { passive: true });
  setTimeout(sweep, 900);
})();
