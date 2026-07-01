/* ===================================================================
   Bianno Gomes · Yachting Portfolio — interactions
   =================================================================== */
(function () {
  'use strict';

  /* ---- Year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Sticky nav shrink ---- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (window.scrollY > 40) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  var closeMenu = function () {
    burger.classList.remove('open');
    links.classList.remove('open');
  };
  burger.addEventListener('click', function () {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---- Reveal on scroll ---- */
  var revealTargets = [
    '.section__head', '.about__portrait', '.about__body',
    '.route__stop', '.jcard', '.tl', '.skillcard', '.gitem',
    '.quote', '.ccard', '.ref', '.add-vessels', '.certs', '.journey__map'
  ];
  var els = document.querySelectorAll(revealTargets.join(','));
  els.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 6, 5) * 0.07) + 's';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Animated stat counters ---- */
  var counted = false;
  var runCounters = function () {
    if (counted) return;
    counted = true;
    document.querySelectorAll('.stat__num[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1600, start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = val.toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  var statsSec = document.getElementById('stats');
  if (statsSec && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounters(); so.disconnect(); } });
    }, { threshold: 0.4 });
    so.observe(statsSec);
  } else {
    runCounters();
  }

  /* ---- Lightbox gallery ---- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.gitem'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var idx = 0;

  var show = function (i) {
    idx = (i + items.length) % items.length;
    var f = items[idx];
    lbImg.src = f.getAttribute('data-full');
    lbCap.textContent = f.getAttribute('data-cap') || '';
  };
  var open = function (i) { show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  var close = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lbImg.src = ''; };

  items.forEach(function (f, i) {
    f.addEventListener('click', function () { open(i); });
  });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
