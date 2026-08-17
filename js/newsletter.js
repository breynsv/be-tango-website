/**
 * BE-TANGO Newsletter Signup Handler
 * Handles all newsletter subscription forms site-wide.
 *
 * Form requirements:
 *   - class="newsletter-form" on the <form> element
 *   - data-endpoint="bootcamp|subscribe" (default: "subscribe")
 *   - data-success-title="..." and data-success-msg="..." on the form
 *   - input[name="_ts"] and input[name="_honey"] hidden fields inside form
 *   - A sibling <div class="ft-success"> immediately after the form
 */
(function () {
  'use strict';

  var BASE = (window.API_CONFIG && window.API_CONFIG.baseURL)
    ? window.API_CONFIG.baseURL
    : 'https://betango.membrero.com/api/v1';

  var LANG_MAP = { fr: 'FR', nl: 'NL' };

  function getLang() {
    var l = (document.documentElement.lang || 'en').toLowerCase().substring(0, 2);
    return LANG_MAP[l] || 'EN';
  }

  var ERROR_MSG = {
    EN: 'Please enter a valid email address.',
    FR: 'Veuillez saisir une adresse e-mail valide.',
    NL: 'Gelieve een geldig e-mailadres in te voeren.'
  };

  var ERROR_RETRY = {
    EN: 'Something went wrong. Please try again.',
    FR: "Une erreur s'est produite. Veuillez r\u00e9essayer.",
    NL: 'Er is iets misgegaan. Probeer het opnieuw.'
  };

  function showFormError(nf, msg) {
    var errEl = nf.parentElement.querySelector('.newsletter-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'newsletter-error';
      nf.appendChild(errEl);
    }
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }

  // Subscribing to a newsletter IS the consent — the submit button says so —
  // so this form deliberately carries no extra opt-in checkbox. What it did
  // lack was any statement of what we do with the address, so add the GDPR
  // line and a privacy link. Injected here rather than in markup because this
  // form appears on ~74 pages.
  var PRIVACY = {
    EN: { url: '/en/privacy-policy/', text: 'We only email you about BE-TANGO classes, workshops and events, and you can unsubscribe at any time.', more: 'Privacy policy.' },
    FR: { url: '/fr/politique-de-confidentialite/', text: 'Nous vous écrivons uniquement au sujet des cours, ateliers et événements BE-TANGO, et vous pouvez vous désinscrire à tout moment.', more: 'Politique de confidentialité.' },
    NL: { url: '/nl/privacy-policy/', text: 'We mailen u enkel over BE-TANGO lessen, workshops en evenementen, en u kunt zich op elk moment uitschrijven.', more: 'Privacybeleid.' }
  };

  function addPrivacyNote(nf) {
    if (nf.querySelector('.newsletter-privacy')) return;
    var p = PRIVACY[getLang()] || PRIVACY.EN;
    var note = document.createElement('p');
    note.className = 'newsletter-privacy';
    note.appendChild(document.createTextNode(p.text + ' '));
    var a = document.createElement('a');
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = p.more;
    note.appendChild(a);
    nf.appendChild(note);
  }

  function initForm(nf) {
    // Set form-load timestamp for spam protection
    var tsInput = nf.querySelector('[name="_ts"]');
    if (tsInput) {
      tsInput.value = Math.floor(Date.now() / 1000);
    }

    addPrivacyNote(nf);

    nf.addEventListener('submit', function (e) {
      e.preventDefault();

      var lang       = getLang();
      var emailInput = nf.querySelector('input[type="email"]');
      var email      = emailInput ? emailInput.value.trim() : '';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (emailInput) emailInput.classList.add('input-error');
        return;
      }
      if (emailInput) emailInput.classList.remove('input-error');

      var btn       = nf.querySelector('button[type="submit"]');
      var successEl = nf.nextElementSibling;
      var endpoint  = nf.dataset.endpoint || 'subscribe';
      var honeyEl   = nf.querySelector('[name="_honey"]');

      if (btn) btn.disabled = true;

      // Clear any previous error
      var existingErr = nf.parentElement.querySelector('.newsletter-error');
      if (existingErr) existingErr.style.display = 'none';

      fetch(BASE + '/newsletter/' + endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify({
          email:  email,
          lang:   lang,
          _honey: honeyEl ? honeyEl.value : '',
          _ts:    tsInput ? parseInt(tsInput.value, 10) : 0
        })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'newsletter_signup', lang: lang });
          nf.style.display = 'none';
          if (successEl && successEl.classList.contains('ft-success')) {
            successEl.innerHTML =
              '<div class="ft-success__icon"><i class="fas fa-check"></i></div>' +
              '<h3>' + (nf.dataset.successTitle || 'Done!') + '</h3>' +
              '<p>'  + (nf.dataset.successMsg   || '')      + '</p>';
            successEl.style.display = 'block';
          }
        } else {
          if (btn) btn.disabled = false;
          showFormError(nf, ERROR_RETRY[lang]);
        }
      })
      .catch(function () {
        if (btn) btn.disabled = false;
        showFormError(nf, ERROR_RETRY[getLang()]);
      });
    });
  }

  function init() {
    document.querySelectorAll('.newsletter-form').forEach(initForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
