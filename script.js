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
