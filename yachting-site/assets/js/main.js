/* Bianno Gomes — portfolio interactions */
(function () {
  "use strict";

  /* ---------- nav: solid on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var links = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- hero parallax (water-depth drift) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroBg = document.querySelector(".hero__bg");
  var heroContent = document.querySelector(".hero__content");
  if (!reduceMotion && heroBg && heroContent) {
    var parallaxTicking = false;
    var applyParallax = function () {
      var y = window.scrollY;
      if (y <= window.innerHeight * 1.2) {
        heroBg.style.transform = "translate3d(0," + y * 0.3 + "px,0)";
        heroContent.style.transform = "translate3d(0," + y * 0.16 + "px,0)";
        heroContent.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.85));
      }
      parallaxTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!parallaxTicking) {
        requestAnimationFrame(applyParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll(".stat__num[data-count]");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent =
        parseInt(el.getAttribute("data-count"), 10).toLocaleString("en-US") +
        (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- hide any season-log tile whose image fails to load ---------- */
  document.querySelectorAll(".work__item img").forEach(function (img) {
    var hideTile = function () {
      var item = img.closest(".work__item");
      if (item) item.classList.add("is-unavailable");
      var section = document.getElementById("work");
      if (section && section.querySelectorAll(".work__item:not(.is-unavailable)").length === 0) {
        section.style.display = "none";
      }
    };
    img.addEventListener("error", hideTile);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) hideTile();
  });

  /* ---------- gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  var lastFocus = null;

  document.querySelectorAll(".gallery__item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lastFocus = btn;
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.querySelector("img").alt;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lbClose.focus();
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
})();
