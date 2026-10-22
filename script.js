// Small bits of behaviour for the page: accordions, side panels (About + mobile menu), hero slides.
(function () {
  'use strict';

  // ---- Accordions ("What I do" and "More builds") ----
  // "What I do" keeps one item open at a time, like the mockup.
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var wasOpen = item.classList.contains('on');
      item.parentElement.querySelectorAll('.acc-item').forEach(function (other) {
        setOpen(other, other.querySelector('.acc-btn'), false);
      });
      setOpen(item, btn, !wasOpen);
    });
  });

  var moreBtn = document.querySelector('.more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      var box = moreBtn.closest('.more');
      setOpen(box, moreBtn, !box.classList.contains('on'));
    });
  }

  function setOpen(box, btn, open) {
    box.classList.toggle('on', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var sign = btn.querySelector('.plus');
    if (sign) sign.textContent = open ? '−' : '+';
  }

  // ---- Side panels ----
  var scrim = document.querySelector('.scrim');
  var page = document.querySelector('.site');
  var current = null;
  var returnFocus = null;

  function openPanel(name) {
    var panel = document.getElementById('drawer-' + name);
    if (!panel) return;
    if (current && current !== panel) hidePanel(current);
    else returnFocus = document.activeElement;
    current = panel;
    panel.hidden = false;
    // let the browser paint it off-screen first so it slides in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { panel.classList.add('open'); });
    });
    scrim.classList.add('open');
    page.inert = true;
    document.body.style.overflow = 'hidden';
    var closeBtn = panel.querySelector('.drawer-top [data-close]');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function hidePanel(panel) {
    panel.classList.remove('open');
    setTimeout(function () { if (current !== panel) panel.hidden = true; }, 560);
  }

  function closePanel() {
    if (!current) return;
    var panel = current;
    current = null;
    hidePanel(panel);
    scrim.classList.remove('open');
    page.inert = false;
    document.body.style.overflow = '';
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) { openPanel(opener.getAttribute('data-open')); return; }
    var closer = e.target.closest('[data-close]');
    if (closer) {
      var href = closer.getAttribute('href');
      closePanel();
      // menu links: close the panel, then scroll smoothly to the section
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        returnFocus = null;
        goTo(href);
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  function goTo(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.pushState(null, '', hash);
  }

  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Reading progress line ----
  var bar = document.querySelector('.progress span');
  var ticking = false;
  function drawProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    ticking = false;
  }
  if (bar) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(drawProgress); }
    }, { passive: true });
    drawProgress();
  }

  // ---- Explore tracker: one segment per section, filled once it has been seen ----
  var explore = document.querySelector('.explore');
  var tracked = ['what', 'builds', 'workshops', 'toolkit', 'resources', 'idea', 'find', 'communities', 'wins', 'writing', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (explore && tracked.length && 'IntersectionObserver' in window) {
    var segBox = explore.querySelector('.explore-bar');
    var countEl = explore.querySelector('.explore-count');
    var segs = tracked.map(function () { return segBox.appendChild(document.createElement('i')); });
    var seen = 0;
    var toast = document.querySelector('.toast');
    countEl.textContent = '0/' + tracked.length;
    var toastLabel = toast && toast.querySelector('.toast-label');
    if (toastLabel) toastLabel.textContent = tracked.length + '/' + tracked.length + ' explored';

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var seg = segs[tracked.indexOf(en.target)];
        seg.classList.add('on', 'pop');
        setTimeout(function () { seg.classList.remove('pop'); }, 400);
        seen += 1;
        countEl.textContent = seen + '/' + tracked.length;
        if (seen === tracked.length) {
          explore.classList.add('done');
          showToast();
        }
      });
    }, { threshold: 0.3 });
    tracked.forEach(function (sec) { io.observe(sec); });

    function showToast() {
      if (!toast) return;
      setTimeout(function () {
        toast.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { toast.classList.add('show'); });
        });
      }, 600);
    }
    if (toast) {
      toast.addEventListener('click', function (e) {
        if (!e.target.closest('[data-toast-close]')) return;
        toast.classList.remove('show');
        setTimeout(function () { toast.hidden = true; }, 400);
      });
    }
  }

  // ---- "Break it": knock the Break Your Build letters loose, then build them back ----
  var breakBtn = document.querySelector('.break-btn');
  var bybHead = document.getElementById('idea-h');
  if (breakBtn && bybHead) {
    bybHead.setAttribute('aria-label', 'Break Your Build');
    // wrap each letter in its own span (the dash line stays as it is)
    bybHead.querySelectorAll('span').forEach(function (sp) {
      if (sp.children.length || sp.classList.contains('dash')) return;
      var text = sp.textContent;
      sp.textContent = '';
      sp.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (c) {
        var ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = c;
        sp.appendChild(ch);
      });
    });
    var letters = bybHead.querySelectorAll('.ch');
    var label = breakBtn.querySelector('.break-label');

    breakBtn.addEventListener('click', function () {
      var broken = !bybHead.classList.contains('broken');
      bybHead.classList.toggle('broken', broken);
      breakBtn.setAttribute('aria-pressed', broken ? 'true' : 'false');
      label.textContent = broken ? 'Build it back' : 'Break it';
      letters.forEach(function (ch) {
        if (!broken) { ch.style.transform = ''; return; }
        var x = (Math.random() - .5) * (reduceMotion ? 20 : 120);
        var y = Math.random() * (reduceMotion ? 16 : 110) - 20;
        var r = (Math.random() - .5) * (reduceMotion ? 10 : 70);
        ch.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px) rotate(' + r.toFixed(0) + 'deg)';
      });
    });
  }

  // ---- Hero slides (arrows only show when there is more than one portrait) ----
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var ctrl = document.querySelector('.slide-ctrl');
  if (slides.length > 1 && ctrl) {
    var cur = 0;
    ctrl.hidden = false;
    ctrl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-slide]');
      if (!b) return;
      slides[cur].classList.remove('is-on');
      cur = (cur + Number(b.getAttribute('data-slide')) + slides.length) % slides.length;
      slides[cur].classList.add('is-on');
    });
  }
})();
