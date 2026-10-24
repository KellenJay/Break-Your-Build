// Workshop waitlist form: pre-selects sessions from ?session=02, sends the sign-up, shows the thank-you.
(function () {
  'use strict';

  // Google Apps Script web app (Workshop waitlist project) that saves each sign-up to Ellen's Google Sheet and emails her.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxX-n4PsOVt1JSI8Q6hn_wK1lxgQIWo0TPNu_0dRuKC55NdMBfFyx2hkiApdBbFD44N/exec';

  var form = document.getElementById('waitlist-form');
  if (!form) return;
  var orgField = document.getElementById('wl-org-field');
  var errorEl = document.getElementById('wl-error');
  var thanks = document.getElementById('wl-thanks');

  // pre-tick the session(s) from the link, e.g. /waitlist?session=02 or ?session=02,04
  var params = new URLSearchParams(location.search);
  (params.get('session') || '').split(',').forEach(function (v) {
    var box = form.querySelector('input[name="sessions"][value="' + v.trim() + '"]');
    if (box) box.checked = true;
  });

  // organisation name only for groups
  form.addEventListener('change', function (e) {
    if (e.target.name !== 'joiningAs') return;
    var group = e.target.value !== 'Myself';
    orgField.hidden = !group;
    if (!group) form.organisation.value = '';
  });

  function showError(msg, field) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    if (field) field.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    var name = form.firstName.value.trim();
    var email = form.email.value.trim();
    var sessions = Array.prototype.slice.call(form.querySelectorAll('input[name="sessions"]:checked'))
      .map(function (b) { return b.value; });

    if (!name) return showError('Please add your first name.', form.firstName);
    if (!email || !form.email.checkValidity()) return showError('Please add a valid email address.', form.email);
    if (!sessions.length) return showError('Please pick at least one session.', form.querySelector('input[name="sessions"]'));
    if (!form.consent.checked) return showError('Please tick the box so I’m allowed to email you.', form.consent);
    if (form.website.value) return; // spam trap filled in: quietly do nothing

    var payload = {
      firstName: name,
      email: email,
      sessions: sessions.join(', '),
      joiningAs: form.joiningAs.value,
      organisation: form.organisation.value.trim(),
      consent: 'Yes: I agree to Ellen Ivanovic emailing me about these workshops. I can unsubscribe any time.',
      submittedAt: new Date().toISOString(),
      page: location.href
    };

    if (!ENDPOINT) return showError('The waitlist isn’t switched on yet. Please email hello@ellenivanovic.com instead.');

    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    // text/plain keeps this a "simple" request, so no extra permission round trip is needed
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok) throw new Error('not saved');
        form.hidden = true;
        thanks.hidden = false;
        thanks.focus();
      })
      .catch(function () {
        button.disabled = false;
        showError('Something went wrong and you’re not on the list yet. Please try again, or email hello@ellenivanovic.com.');
      });
  });
})();
