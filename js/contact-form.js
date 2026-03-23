/**
 * BE-TANGO Contact Form Handler
 * Handles form submission for contact requests.
 */
(function () {
  'use strict';

  const TRANSLATIONS = {
    EN: {
      errorRequired: 'Please fill in all required fields (first name, last name, email, topic, and message).',
      errorInvalidEmail: 'Please enter a valid email address.',
      errorInvalidPhone: 'Please enter a valid phone number (e.g. +32 498 39 29 39).',
      errorNetwork: 'Connection error. Please try again.',
      errorServer: 'Something went wrong. Please try again or email us directly.',
      successTitle: 'Message Sent!',
      successBody: "Thank you! We'll get back to you as soon as possible.",
      sending: 'Sending\u2026',
    },
    FR: {
      errorRequired: 'Veuillez remplir tous les champs obligatoires (prénom, nom, email, sujet et message).',
      errorInvalidEmail: 'Veuillez entrer une adresse e-mail valide.',
      errorInvalidPhone: 'Veuillez entrer un numéro de téléphone valide (ex. +32 498 39 29 39).',
      errorNetwork: 'Erreur de connexion. Veuillez r\u00e9essayer.',
      errorServer: 'Une erreur s\u2019est produite. Veuillez r\u00e9essayer ou nous contacter par e-mail.',
      successTitle: 'Message envoy\u00e9\u00a0!',
      successBody: 'Merci\u00a0! Nous vous r\u00e9pondrons dans les plus brefs d\u00e9lais.',
      sending: 'Envoi en cours\u2026',
    },
    NL: {
      errorRequired: 'Vul alle verplichte velden in (voornaam, achternaam, e-mail, onderwerp en bericht).',
      errorInvalidEmail: 'Voer een geldig e-mailadres in.',
      errorInvalidPhone: 'Voer een geldig telefoonnummer in (bijv. +32 498 39 29 39).',
      errorNetwork: 'Verbindingsfout. Probeer het opnieuw.',
      errorServer: 'Er is iets misgegaan. Probeer het opnieuw of neem contact op via e-mail.',
      successTitle: 'Bericht verzonden!',
      successBody: 'Bedankt! We nemen zo snel mogelijk contact met je op.',
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
      '<p>' + T.successBody + '</p>';
    successEl.style.display = 'block';
  }

  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var lang = detectLanguage();
    var T = TRANSLATIONS[lang];

    var errorEl = form.querySelector('.ft-form-error');
    var submitBtn = form.querySelector('.ft-submit');
    var successEl = document.getElementById('contact-success');
    var originalBtnText = submitBtn ? submitBtn.textContent : '';

    // Set form-load timestamp for honeypot protection
    var tsInput = form.querySelector('[name="_ts"]');
    if (tsInput) tsInput.value = Math.floor(Date.now() / 1000);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError(errorEl);

      var firstName = form.querySelector('[name="first_name"]').value.trim();
      var lastName  = form.querySelector('[name="last_name"]').value.trim();
      var email     = form.querySelector('[name="email"]').value.trim();
      var phone     = form.querySelector('[name="phone"]').value.trim();
      var topicEl   = form.querySelector('[name="topic"]');
      var topic     = topicEl ? topicEl.value : '';
      var message   = form.querySelector('[name="message"]').value.trim();

      if (!firstName || !lastName || !email || !topic || !message) {
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
        first_name: firstName,
        last_name:  lastName,
        email:      email,
        phone:      phone || null,
        topic:      topic || null,
        message:    message || null,
        lang:       lang,
        _honey: (form.querySelector('[name="_honey"]') || { value: '' }).value,
        _ts:    parseInt((form.querySelector('[name="_ts"]') || { value: '0' }).value, 10),
      };

      try {
        if (!window.BETangoCRM || !window.BETangoCRM.api) {
          throw new Error('API client not loaded');
        }
        await window.BETangoCRM.api.submitContactForm(payload);
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
