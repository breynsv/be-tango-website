/**
 * BE-TANGO Private Lessons Form Handler
 * Handles form submission for private lesson requests.
 */
(function () {
  'use strict';

  const TRANSLATIONS = {
    EN: {
      errorRequired: 'Please fill in all required fields.',
      errorInvalidEmail: 'Please enter a valid email address.',
      errorInvalidPhone: 'Please enter a valid phone number (e.g. +32 498 39 29 39).',
      errorNetwork: 'Connection error. Please try again.',
      errorServer: 'Something went wrong. Please try again or contact us directly at admin@be-tango.com.',
      successTitle: 'Request Sent!',
      successText: "Thank you! We\u2019ll be in touch as soon as possible to plan your private lesson.",
      sending: 'Sending\u2026',
    },
    FR: {
      errorRequired: 'Veuillez remplir tous les champs obligatoires.',
      errorInvalidEmail: 'Veuillez entrer une adresse e-mail valide.',
      errorInvalidPhone: 'Veuillez entrer un numéro de téléphone valide (ex. +32 498 39 29 39).',
      errorNetwork: 'Erreur de connexion. Veuillez r\u00e9essayer.',
      errorServer: 'Une erreur s\u2019est produite. Veuillez r\u00e9essayer ou nous contacter \u00e0 admin@be-tango.com.',
      successTitle: 'Demande envoy\u00e9e\u00a0!',
      successText: 'Merci\u00a0! Nous vous contacterons d\u00e8s que possible pour planifier votre cours particulier.',
      sending: 'Envoi en cours\u2026',
    },
    NL: {
      errorRequired: 'Vul alle verplichte velden in.',
      errorInvalidEmail: 'Voer een geldig e-mailadres in.',
      errorInvalidPhone: 'Voer een geldig telefoonnummer in (bijv. +32 498 39 29 39).',
      errorNetwork: 'Verbindingsfout. Probeer het opnieuw.',
      errorServer: 'Er is iets misgegaan. Probeer het opnieuw of neem contact op via admin@be-tango.com.',
      successTitle: 'Aanvraag verzonden!',
      successText: 'Bedankt! We nemen zo snel mogelijk contact met je op om je priv\u00e9les in te plannen.',
      sending: 'Verzenden\u2026',
    },
  };

  function detectLanguage() {
    const lang = (document.documentElement.lang || 'en').substring(0, 2).toUpperCase();
    return TRANSLATIONS[lang] ? lang : 'EN';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^\+?[\d\s\-\(\)\.]{7,20}$/.test(phone);
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError(el) {
    el.style.display = 'none';
    el.textContent = '';
  }

  function showSuccess(form, successEl, T) {
    form.style.display = 'none';
    successEl.innerHTML =
      '<div class="ft-success__icon"><i class="fas fa-check"></i></div>' +
      '<h3>' + T.successTitle + '</h3>' +
      '<p>' + T.successText + '</p>';
    successEl.style.display = 'block';
  }

  function init() {
    var form = document.getElementById('private-lesson-form');
    if (!form) return;

    var lang = detectLanguage();
    var T = TRANSLATIONS[lang];

    var errorEl = form.querySelector('.ft-form-error');
    var submitBtn = form.querySelector('.ft-submit');
    var successEl = document.getElementById('pl-success');
    var originalBtnText = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError(errorEl);

      var firstName = form.querySelector('[name="first_name"]').value.trim();
      var lastName = form.querySelector('[name="last_name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var phone = form.querySelector('[name="phone"]').value.trim();
      var lessonType = form.querySelector('[name="lesson_type"]').value;
      var message = form.querySelector('[name="message"]').value.trim();

      if (!firstName || !lastName || !email || !lessonType) {
        showError(errorEl, T.errorRequired);
        return;
      }
      if (!isValidEmail(email)) {
        showError(errorEl, T.errorInvalidEmail);
        return;
      }
      if (phone && !isValidPhone(phone)) {
        showError(errorEl, T.errorInvalidPhone);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = T.sending;
      }

      var payload = {
        name: (firstName + ' ' + lastName).trim(),
        email: email,
        phone: phone || null,
        lang: lang,
        lesson_type: lessonType,
        message: message || null,
      };

      try {
        if (!window.BETangoCRM || !window.BETangoCRM.api) {
          throw new Error('API client not loaded');
        }
        await window.BETangoCRM.api.submitPrivateLessonsForm(payload);
        showSuccess(form, successEl, T);
      } catch (err) {
        var isNetwork = err.message && (
          err.message.toLowerCase().includes('fetch') ||
          err.message.toLowerCase().includes('network') ||
          err.message.toLowerCase().includes('timeout')
        );
        showError(errorEl, isNetwork ? T.errorNetwork : T.errorServer);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
