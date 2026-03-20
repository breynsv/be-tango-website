/**
 * BE-TANGO Enrollment Modal
 *
 * Opens a sign-up modal when a .btn-sign-up button is clicked,
 * submits a paid-lesson enrollment to the CRM API, then shows
 * a payment summary card with a SEPA EPC QR code.
 */

(function () {
  'use strict';

  // ========================
  // TRANSLATIONS
  // ========================
  const T = {
    EN: {
      modalTitle: 'Sign Up for Class',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone',
      gender: 'Gender',
      genderSelect: '-- Select --',
      genderMale: 'Male',
      genderFemale: 'Female',
      genderOther: 'Other',
      partnerQuestion: 'Are you coming alone or with a partner?',
      alone: 'I\'m coming alone',
      withPartner: 'I\'m bringing a partner',
      partnerSection: 'Partner Information',
      partnerFirstName: 'Partner\'s First Name',
      partnerLastName: 'Partner\'s Last Name',
      partnerEmail: 'Partner\'s Email',
      partnerGender: 'Partner\'s Gender',
      aloneSection: 'A Bit About You',
      height: 'Height (e.g. 170 cm)',
      birthYear: 'Birth Year',
      language: 'Preferred Language',
      languageSelect: '-- Select --',
      remarks: 'Remarks',
      remarksPlaceholder: 'Anything you\'d like us to know…',
      submit: 'CONFIRM REGISTRATION',
      submitting: 'Submitting…',
      errorDefault: 'Something went wrong. Please try again or contact us directly.',
      successTitle: 'You\'re Registered!',
      successMessage: 'Your enrollment is confirmed. Check your inbox for the payment details.',
      paymentTitle: 'Payment Details',
      paymentAmount: 'Amount',
      paymentIban: 'IBAN',
      paymentRef: 'Structured Reference',
      paymentDue: 'Pay Before',
      paymentBankName: 'Bank Name',
      qrTitle: 'Scan to Pay (SEPA)',
      close: 'Close',
      required: 'required',
      waitlistTitle: 'Registration Received',
      waitlistMessage: 'As you indicated you are searching for a dance partner, we cannot confirm your participation immediately. If we find a partner that matches your criteria we will send you an email with a confirmation.',
      waitlistAdvice: 'We strongly advise searching for a partner in your own network of friends, family and coworkers.',
      waitlistClose: 'Close',
    },
    FR: {
      modalTitle: 'S\'inscrire au cours',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Adresse e-mail',
      phone: 'Téléphone',
      gender: 'Genre',
      genderSelect: '-- Sélectionner --',
      genderMale: 'Homme',
      genderFemale: 'Femme',
      genderOther: 'Autre',
      partnerQuestion: 'Venez-vous seul(e) ou avec un(e) partenaire ?',
      alone: 'Je viens seul(e)',
      withPartner: 'Je viens avec un(e) partenaire',
      partnerSection: 'Informations sur le/la partenaire',
      partnerFirstName: 'Prénom du/de la partenaire',
      partnerLastName: 'Nom du/de la partenaire',
      partnerEmail: 'E-mail du/de la partenaire',
      partnerGender: 'Genre du/de la partenaire',
      aloneSection: 'Quelques informations sur vous',
      height: 'Taille (ex. 170 cm)',
      birthYear: 'Année de naissance',
      language: 'Langue préférée',
      languageSelect: '-- Sélectionner --',
      remarks: 'Remarques',
      remarksPlaceholder: 'Quelque chose que vous souhaitez nous faire savoir…',
      submit: 'CONFIRMER L\'INSCRIPTION',
      submitting: 'Envoi en cours…',
      errorDefault: 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement.',
      successTitle: 'Inscription Confirmée !',
      successMessage: 'Votre inscription est confirmée. Vérifiez votre boîte mail pour les détails de paiement.',
      paymentTitle: 'Détails du paiement',
      paymentAmount: 'Montant',
      paymentIban: 'IBAN',
      paymentRef: 'Communication structurée',
      paymentDue: 'Payer avant le',
      paymentBankName: 'Nom de la banque',
      qrTitle: 'Scanner pour payer (SEPA)',
      close: 'Fermer',
      required: 'obligatoire',
      waitlistTitle: 'Demande Reçue',
      waitlistMessage: 'Comme vous cherchez un partenaire de danse, nous ne pouvons pas confirmer votre participation immédiatement. Nous vous enverrons un email dès que nous aurons trouvé un partenaire correspondant à vos critères.',
      waitlistAdvice: 'Nous vous conseillons vivement de chercher un partenaire dans votre réseau.',
      waitlistClose: 'Fermer',
    },
    NL: {
      modalTitle: 'Inschrijven voor de les',
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      email: 'E-mailadres',
      phone: 'Telefoon',
      gender: 'Geslacht',
      genderSelect: '-- Selecteer --',
      genderMale: 'Man',
      genderFemale: 'Vrouw',
      genderOther: 'Andere',
      partnerQuestion: 'Kom je alleen of met een partner?',
      alone: 'Ik kom alleen',
      withPartner: 'Ik breng een partner mee',
      partnerSection: 'Gegevens partner',
      partnerFirstName: 'Voornaam partner',
      partnerLastName: 'Achternaam partner',
      partnerEmail: 'E-mail partner',
      partnerGender: 'Geslacht partner',
      aloneSection: 'Iets over jezelf',
      height: 'Lengte (bv. 170 cm)',
      birthYear: 'Geboortejaar',
      language: 'Voorkeurstaal',
      languageSelect: '-- Selecteer --',
      remarks: 'Opmerkingen',
      remarksPlaceholder: 'Iets dat je ons wil laten weten…',
      submit: 'INSCHRIJVING BEVESTIGEN',
      submitting: 'Verzenden…',
      errorDefault: 'Er is iets misgegaan. Probeer opnieuw of contacteer ons rechtstreeks.',
      successTitle: 'Inschrijving Bevestigd!',
      successMessage: 'Je inschrijving is bevestigd. Controleer je inbox voor de betalingsgegevens.',
      paymentTitle: 'Betalingsgegevens',
      paymentAmount: 'Bedrag',
      paymentIban: 'IBAN',
      paymentRef: 'Gestructureerde mededeling',
      paymentDue: 'Betaal voor',
      paymentBankName: 'Banknaam',
      qrTitle: 'Scan om te betalen (SEPA)',
      close: 'Sluiten',
      required: 'verplicht',
      waitlistTitle: 'Aanvraag Ontvangen',
      waitlistMessage: 'Omdat u op zoek bent naar een danspartner, kunnen wij uw deelname niet onmiddellijk bevestigen. We sturen u een e-mail zodra we een geschikte partner gevonden hebben.',
      waitlistAdvice: 'We raden u sterk aan om in uw eigen netwerk van vrienden, familie en collega\'s naar een partner te zoeken.',
      waitlistClose: 'Sluiten',
    },
  };

  // ========================
  // MODULE STATE
  // ========================
  let currentProductId = null;
  let modalInjected = false;

  // ========================
  // HELPERS
  // ========================

  function getLang() {
    const htmlLang = document.documentElement.lang || '';
    if (htmlLang.startsWith('fr')) return 'FR';
    if (htmlLang.startsWith('nl')) return 'NL';
    return 'EN';
  }

  function getT() {
    return T[getLang()];
  }

  function showError(msg, focusId) {
    const errEl = document.getElementById('em-error');
    errEl.textContent = msg;
    errEl.hidden = false;
    // Directly scroll the dialog (overflow-y:auto container) — scrollIntoView is
    // unreliable inside position:fixed overlays (broken in Safari).
    const dialog = document.querySelector('.em-dialog');
    if (dialog) {
      const top = errEl.offsetTop - 24;
      dialog.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) el.focus();
    }
  }

  function formatIban(iban) {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatDueDate(dateStr) {
    // dateStr format: YYYY-MM-DD
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const lang = getLang();
    const localeMap = { EN: 'en-GB', FR: 'fr-FR', NL: 'nl-NL' };
    return date.toLocaleDateString(localeMap[lang] || 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ========================
  // MODAL HTML
  // ========================

  function buildModalHtml(t) {
    var lang = getLang();
    var progressLabel = lang === 'FR' ? 'Inscription' : lang === 'NL' ? 'Inschrijving' : 'Registration';
    var footerNote = lang === 'FR'
      ? 'En vous inscrivant, vous acceptez nos conditions. Nous confirmerons votre place par email sous 24&nbsp;h.'
      : lang === 'NL'
      ? 'Door in te schrijven gaat u akkoord met onze voorwaarden. We bevestigen uw plaats per email.'
      : 'By registering you agree to our Terms &amp; Conditions. We\'ll confirm your spot by email within 24&nbsp;hours.';
    var doneNote = lang === 'FR'
      ? 'Un email de confirmation a été envoyé à votre boîte mail.'
      : lang === 'NL'
      ? 'Een bevestigingsmail is verzonden naar uw inbox.'
      : 'A confirmation email has been sent to your inbox.';
    var dueBannerSubtext = lang === 'FR'
      ? 'Virement vers l\'IBAN ci-dessus avec la communication structurée.'
      : lang === 'NL'
      ? 'Overschrijf naar de bovenstaande IBAN met de gestructureerde mededeling.'
      : 'Transfer the amount to the IBAN above using the structured reference.';
    var aloneCardSub = lang === 'FR' ? 'Nous vous associerons<br/>en classe' : lang === 'NL' ? 'We koppelen je<br/>in de les' : 'We\'ll pair you up<br/>in class';
    var partnerCardSub = lang === 'FR' ? 'Vous vous inscrivez<br/>ensemble' : lang === 'NL' ? 'Jullie schrijven je<br/>samen in' : 'You\'ll register<br/>together';
    var qrCaption = lang === 'FR'
      ? 'Pointez l\'appareil photo de votre application bancaire.<br/>Ouvre un paiement SEPA prérempli. Pris en charge par la plupart des banques belges.'
      : lang === 'NL'
      ? 'Richt uw bankapp-camera op deze code.<br/>Opent een vooraf ingevuld SEPA-betaling. Ondersteund door de meeste Belgische banken.'
      : 'Point your banking app camera at this code.<br/>Opens a pre-filled SEPA payment. Supported by most Belgian banks.';

    return `
<div class="em-overlay" id="em-overlay" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="em-title">
  <div class="em-dialog">

    <div class="em-accent-bar"></div>

    <button class="em-close" id="em-close" aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
    </button>

    <div class="em-progress" aria-hidden="true">
      <div class="em-progress-dot"></div>
      <div class="em-progress-dot em-progress-dot--inactive"></div>
      <div class="em-progress-dot em-progress-dot--inactive"></div>
      <span class="em-progress-label">${progressLabel}</span>
    </div>

    <div class="em-header">
      <p class="em-eyebrow">BE-TANGO Brussels</p>
      <h2 class="em-title" id="em-title">${t.modalTitle}</h2>
    </div>

    <div class="em-chips" id="em-chips" role="list" aria-label="Class details" aria-live="polite">
      <span class="em-chip-skeleton" style="width:68px"></span>
      <span class="em-chip-skeleton" style="width:80px"></span>
      <span class="em-chip-skeleton" style="width:52px"></span>
      <span class="em-chip-skeleton" style="width:140px"></span>
    </div>

    <div class="em-divider" aria-hidden="true"></div>

    <!-- FORM VIEW -->
    <div id="em-form-view">
      <div class="em-error" id="em-error" hidden></div>

      <form id="em-form" novalidate>

        <div class="em-row">
          <div class="em-field">
            <label class="em-label" for="em-first-name">${t.firstName} <span class="em-required" aria-hidden="true">*</span></label>
            <input class="em-input" type="text" id="em-first-name" name="first_name" autocomplete="given-name" required>
          </div>
          <div class="em-field">
            <label class="em-label" for="em-last-name">${t.lastName} <span class="em-required" aria-hidden="true">*</span></label>
            <input class="em-input" type="text" id="em-last-name" name="last_name" autocomplete="family-name" required>
          </div>
        </div>

        <div class="em-row">
          <div class="em-field">
            <label class="em-label" for="em-email">${t.email} <span class="em-required" aria-hidden="true">*</span></label>
            <input class="em-input" type="email" id="em-email" name="email" autocomplete="email" required>
          </div>
          <div class="em-field">
            <label class="em-label" for="em-phone">${t.phone} <span class="em-required" aria-hidden="true">*</span></label>
            <input class="em-input" type="tel" id="em-phone" name="phone" autocomplete="tel" placeholder="+32 475 00 00 00" required>
          </div>
        </div>

        <div class="em-row">
          <div class="em-field">
            <label class="em-label" for="em-gender">${t.gender} <span class="em-required" aria-hidden="true">*</span></label>
            <div class="em-select-wrap">
              <select class="em-select" id="em-gender" name="gender" required>
                <option value="">${t.genderSelect}</option>
                <option value="Male">${t.genderMale}</option>
                <option value="Female">${t.genderFemale}</option>
                <option value="Other">${t.genderOther}</option>
              </select>
            </div>
          </div>
          <div class="em-field">
            <label class="em-label" for="em-language">${t.language} <span class="em-required" aria-hidden="true">*</span></label>
            <div class="em-select-wrap">
              <select class="em-select" id="em-language" name="language" required>
                <option value="">${t.languageSelect}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="em-section">
          <p class="em-section-title" id="em-partner-label">${t.partnerQuestion}</p>

          <div class="em-partner-cards" role="radiogroup" aria-labelledby="em-partner-label">

            <label class="em-partner-card" for="em-solo">
              <input type="radio" id="em-solo" name="em-partner-toggle" value="alone">
              <div class="em-partner-check" aria-hidden="true">
                <svg viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1.5" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="em-partner-icon" aria-hidden="true">🧍</div>
              <span class="em-partner-label">${t.alone}</span>
              <span class="em-partner-sublabel">${aloneCardSub}</span>
            </label>

            <label class="em-partner-card" for="em-with-partner">
              <input type="radio" id="em-with-partner" name="em-partner-toggle" value="with-partner">
              <div class="em-partner-check" aria-hidden="true">
                <svg viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1.5" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="em-partner-icon" aria-hidden="true">🧑‍🤝‍🧑</div>
              <span class="em-partner-label">${t.withPartner}</span>
              <span class="em-partner-sublabel">${partnerCardSub}</span>
            </label>

          </div>

          <!-- ALONE SECTION -->
          <div id="em-alone-section" class="em-sub-section" hidden>
            <p class="em-sub-section-title">${t.aloneSection}</p>
            <div class="em-row">
              <div class="em-field">
                <label class="em-label" for="em-height">${t.height} <span class="em-required" aria-hidden="true">*</span></label>
                <input class="em-input" type="text" id="em-height" name="height" placeholder="170 cm">
              </div>
              <div class="em-field">
                <label class="em-label" for="em-birth-year">${t.birthYear} <span class="em-required" aria-hidden="true">*</span></label>
                <input class="em-input" type="number" id="em-birth-year" name="birth_year" min="1920" max="2010" placeholder="1985">
              </div>
            </div>
          </div>

          <!-- PARTNER SECTION -->
          <div id="em-partner-section" class="em-sub-section" hidden>
            <p class="em-sub-section-title">${t.partnerSection}</p>
            <div class="em-row">
              <div class="em-field">
                <label class="em-label" for="em-partner-first-name">${t.partnerFirstName} <span class="em-required" aria-hidden="true">*</span></label>
                <input class="em-input" type="text" id="em-partner-first-name" name="partner_first_name">
              </div>
              <div class="em-field">
                <label class="em-label" for="em-partner-last-name">${t.partnerLastName} <span class="em-required" aria-hidden="true">*</span></label>
                <input class="em-input" type="text" id="em-partner-last-name" name="partner_last_name">
              </div>
            </div>
            <div class="em-field">
              <label class="em-label" for="em-partner-email">${t.partnerEmail} <span class="em-required" aria-hidden="true">*</span></label>
              <input class="em-input" type="email" id="em-partner-email" name="partner_email">
            </div>
            <div class="em-field">
              <label class="em-label" for="em-partner-gender">${t.partnerGender}</label>
              <div class="em-select-wrap">
                <select class="em-select" id="em-partner-gender" name="partner_gender">
                  <option value="">${t.genderSelect}</option>
                  <option value="Male">${t.genderMale}</option>
                  <option value="Female">${t.genderFemale}</option>
                  <option value="Other">${t.genderOther}</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        <div class="em-field em-field--remarks">
          <label class="em-label" for="em-remarks">${t.remarks}</label>
          <textarea class="em-textarea" id="em-remarks" name="remarks" placeholder="${t.remarksPlaceholder}"></textarea>
        </div>

        <div class="em-submit-wrap">
          <button type="submit" class="em-submit" id="em-submit">
            ${t.submit}
            <svg class="em-submit-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <p class="em-footer-note">${footerNote}</p>
        </div>

      </form>
    </div>

    <!-- SUCCESS VIEW -->
    <div id="em-success-view" hidden>

      <div class="em-success-hero">
        <svg class="em-check-ring" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="36" cy="36" r="35" class="em-check-ring-bg"/>
          <circle cx="36" cy="36" r="35" class="em-check-ring-border"/>
          <path d="M21 37.5L30.5 47L51 26" class="em-check-path"/>
        </svg>
        <h2 class="em-success-title" id="em-success-title">${t.successTitle}</h2>
        <p class="em-success-msg">${t.successMessage}</p>
      </div>

      <div class="em-chips" id="em-success-chips" role="list" aria-label="Class details"></div>

      <div id="em-success-payment">
        <div class="em-divider"></div>

        <div class="em-payment">
          <p class="em-payment-heading">${t.paymentTitle}</p>
          <div class="em-pay-rows">
            <div class="em-pay-row">
              <span class="em-pay-label">${t.paymentAmount}</span>
              <span class="em-pay-value em-pay-value--amount" id="em-pay-amount"></span>
            </div>
            <div class="em-pay-row">
              <span class="em-pay-label">${t.paymentBankName}</span>
              <span class="em-pay-value" id="em-pay-bank"></span>
            </div>
            <div class="em-pay-row">
              <span class="em-pay-label">${t.paymentIban}</span>
              <span class="em-pay-value" id="em-pay-iban"></span>
            </div>
            <div class="em-pay-row">
              <span class="em-pay-label">${t.paymentRef}</span>
              <span class="em-pay-value em-pay-value--ref" id="em-pay-ref"></span>
            </div>
          </div>
          <div class="em-due-banner" role="note">
            <svg class="em-due-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 8h16M6 2v4M14 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="10" cy="13" r="1" fill="currentColor"/>
            </svg>
            <div class="em-due-text">
              <strong id="em-pay-due"></strong>
              ${dueBannerSubtext}
            </div>
          </div>
        </div>

        <div class="em-divider"></div>

        <div class="em-qr-section" id="em-qr-section">
          <div class="em-qr-body">
            <p class="em-qr-label">${t.qrTitle}</p>
            <div id="em-qr-canvas"></div>
            <p class="em-qr-caption">${qrCaption}</p>
          </div>
        </div>
      </div>

      <div id="em-success-waitlist" hidden>
        <div class="em-divider"></div>
        <p id="em-waitlist-message"></p>
        <p id="em-waitlist-advice"></p>
      </div>

      <div class="em-done-wrap">
        <button class="em-done-btn" id="em-success-close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 8L6.5 12.5L14 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${t.close}
        </button>
        <p class="em-done-note">${doneNote}</p>
      </div>

    </div>

  </div>
</div>`;
  }

  // ========================
  // CHIP RENDERING
  // ========================

  function renderChips(className, price, location, time) {
    var chipItems = [];

    // Split className on · to extract level/day parts
    var parts = (className || '').split('·').map(function (s) { return s.trim(); }).filter(Boolean);
    parts.forEach(function (part) {
      chipItems.push({ label: part, type: 'default' });
    });

    // Time chip (e.g. "19:00–20:30")
    if (time) {
      chipItems.push({ label: time, type: 'time' });
    }

    // Price chip
    if (price) {
      var priceVal = parseFloat(price);
      if (!isNaN(priceVal) && priceVal > 0) {
        chipItems.push({ label: '\u20ac' + priceVal.toFixed(0), type: 'price' });
      }
    }

    // Location chip
    if (location) {
      chipItems.push({ label: location, type: 'default' });
    }

    var html = chipItems.map(function (item) {
      if (item.type === 'price') {
        return '<span class="em-chip em-chip--price" role="listitem">'
          + '<svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true" style="opacity:.7">'
          + '<path d="M4.5 1v9M2 3.5h4a1.5 1.5 0 010 3H2m0 0h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'
          + '</svg>' + item.label + '</span>';
      }
      if (item.type === 'time') {
        return '<span class="em-chip" role="listitem">'
          + '<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style="opacity:.5;flex-shrink:0">'
          + '<circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.2"/>'
          + '<path d="M5.5 3v2.5l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
          + '</svg>' + item.label + '</span>';
      }
      return '<span class="em-chip" role="listitem"><span class="em-chip-dot"></span>' + item.label + '</span>';
    }).join('');

    var chipsEl = document.getElementById('em-chips');
    if (chipsEl) chipsEl.innerHTML = html || chipsEl.innerHTML;

    var successChipsEl = document.getElementById('em-success-chips');
    if (successChipsEl) successChipsEl.innerHTML = html;
  }

  // ========================
  // INIT — inject modal once
  // ========================

  function init() {
    if (!window.BETangoCRM?.api) {
      console.warn('[EnrollmentModal] CRM API not ready');
      return;
    }

    if (modalInjected) return;

    const t = getT();
    document.body.insertAdjacentHTML('beforeend', buildModalHtml(t));
    modalInjected = true;

    // Wire close button & backdrop
    document.getElementById('em-close').addEventListener('click', closeModal);
    document.getElementById('em-success-close').addEventListener('click', closeModal);
    document.getElementById('em-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Partner card is-selected visual state
    document.querySelectorAll('.em-partner-card').forEach(function (card) {
      card.addEventListener('click', function () {
        document.querySelectorAll('.em-partner-card').forEach(function (c) {
          c.classList.remove('is-selected');
        });
        card.classList.add('is-selected');
      });
    });

    // Partner toggle logic (section visibility + required fields)
    document.querySelectorAll('input[name="em-partner-toggle"]').forEach(function (radio) {
      radio.addEventListener('change', handlePartnerToggle);
    });

    // Load languages from backend
    loadLanguages();

    // Form submit
    document.getElementById('em-form').addEventListener('submit', handleSubmit);

    // Event delegation for .btn-sign-up clicks (works for dynamically loaded schedule)
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-sign-up');
      if (btn) {
        e.preventDefault();
        openModal(
          btn.dataset.productId,
          btn.dataset.className || '',
          btn.dataset.price || '',
          btn.dataset.location || '',
          btn.dataset.time || ''
        );
      }
    });
  }

  // ========================
  // OPEN / CLOSE
  // ========================

  function openModal(productId, className, price, location, time) {
    currentProductId = productId;

    // Render class info chips
    renderChips(className, price, location, time);

    // Reset form
    document.getElementById('em-form').reset();
    showFormView();

    // Hide error
    const errEl = document.getElementById('em-error');
    errEl.hidden = true;
    errEl.textContent = '';

    // Reset partner toggle — no pre-selection, hide both sections
    handlePartnerToggle();

    // Show overlay
    const overlay = document.getElementById('em-overlay');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first field
    setTimeout(function () {
      const first = document.getElementById('em-first-name');
      if (first) first.focus();
    }, 50);
  }

  function closeModal() {
    const overlay = document.getElementById('em-overlay');
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    currentProductId = null;
  }

  // ========================
  // VIEWS
  // ========================

  function showFormView() {
    document.getElementById('em-form-view').hidden = false;
    document.getElementById('em-success-view').hidden = true;
  }

  function showSuccessView(data) {
    var t = getT();

    if (data.partner_needed) {
      // Waitlist state — no payment info
      document.getElementById('em-success-title').textContent = t.waitlistTitle;
      document.getElementById('em-success-payment').hidden = true;
      document.getElementById('em-success-waitlist').hidden = false;
      document.getElementById('em-waitlist-message').textContent = t.waitlistMessage;
      document.getElementById('em-waitlist-advice').textContent = t.waitlistAdvice;
    } else {
      // Payment state
      document.getElementById('em-success-title').textContent = t.successTitle;
      document.getElementById('em-success-payment').hidden = false;
      document.getElementById('em-success-waitlist').hidden = true;

      // Fill payment details
      var amount = parseFloat(data.amount || 0);
      var perPerson = amount / 2;
      document.getElementById('em-pay-amount').innerHTML =
        '<span class="em-pay-amount-split">2 \u00d7 \u20ac' + perPerson.toFixed(0) + ' p.p.</span>\u20ac' + amount.toFixed(2);
      document.getElementById('em-pay-iban').textContent = formatIban(data.bank_account || 'BE97068896456849');
      document.getElementById('em-pay-ref').textContent = data.payment_reference || '';
      document.getElementById('em-pay-due').textContent = formatDueDate(data.due_date);
      document.getElementById('em-pay-bank').textContent = data.bank_name || 'BE-TANGO ART';

      // Generate QR
      generateEpcQrCode(data);
    }

    // Update progress dots to complete state
    document.querySelectorAll('.em-progress-dot').forEach(function (dot) {
      dot.classList.remove('em-progress-dot--inactive');
    });
    var progressLabel = document.querySelector('.em-progress-label');
    if (progressLabel) {
      var lang = getLang();
      progressLabel.textContent = lang === 'FR' ? 'Confirm\u00e9' : lang === 'NL' ? 'Bevestigd' : 'Confirmed';
      progressLabel.style.color = '#C9A820';
    }

    // Swap views
    document.getElementById('em-form-view').hidden = true;
    document.getElementById('em-success-view').hidden = false;

    // Scroll dialog to top
    var dialog = document.querySelector('.em-dialog');
    if (dialog) dialog.scrollTop = 0;
  }

  // ========================
  // PARTNER TOGGLE
  // ========================

  function handlePartnerToggle() {
    const selected = document.querySelector('input[name="em-partner-toggle"]:checked');
    const isAlone = selected && selected.value === 'alone';
    const withPartner = selected && selected.value === 'with-partner';

    const aloneSection = document.getElementById('em-alone-section');
    const partnerSection = document.getElementById('em-partner-section');

    aloneSection.hidden = !isAlone;
    partnerSection.hidden = !withPartner;

    // height / birth year required only when alone section is visible
    ['em-height', 'em-birth-year'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.required = isAlone;
    });

    // partner fields required only when partner section is visible
    ['em-partner-first-name', 'em-partner-last-name', 'em-partner-email', 'em-partner-gender'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.required = withPartner;
    });
  }

  // ========================
  // LANGUAGE LOADER
  // ========================

  async function loadLanguages() {
    const select = document.getElementById('em-language');
    if (!select) return;

    try {
      const res = await window.BETangoCRM.api.getLanguages();
      const languages = res.data || res;
      const pageLang = getLang(); // EN | FR | NL

      languages.forEach(function (lang) {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = lang.name;
        // Pre-select the option that matches the current page language
        if (lang.code === pageLang) opt.selected = true;
        select.appendChild(opt);
      });
    } catch (err) {
      console.warn('[EnrollmentModal] Could not load languages:', err);
      // Fallback: add EN/FR/NL manually so the form still works
      [['EN', 'English'], ['FR', 'French'], ['NL', 'Dutch']].forEach(function ([code, name]) {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = name;
        if (code === getLang()) opt.selected = true;
        select.appendChild(opt);
      });
    }
  }

  // ========================
  // FORM SUBMIT
  // ========================

  async function handleSubmit(e) {
    e.preventDefault();

    const t = getT();
    const submitBtn = document.getElementById('em-submit');
    const errEl = document.getElementById('em-error');

    // Hide previous error
    errEl.hidden = true;

    // Validate required fields
    const form = document.getElementById('em-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Determine partner state
    const partnerRadio = document.querySelector('input[name="em-partner-toggle"]:checked');
    if (!partnerRadio) {
      const lang = getLang();
      showError(
        lang === 'FR' ? 'Veuillez indiquer si vous venez seul(e) ou avec un(e) partenaire.'
        : lang === 'NL' ? 'Geef aan of je alleen komt of een partner meebrengt.'
        : 'Please indicate whether you\'re coming alone or with a partner.'
      );
      return;
    }
    const hasPartner = partnerRadio.value === 'with-partner';

    // Gather contact fields
    const firstName = document.getElementById('em-first-name').value.trim();
    const lastName  = document.getElementById('em-last-name').value.trim();
    const email     = document.getElementById('em-email').value.trim();
    const phoneRaw  = document.getElementById('em-phone').value.trim();
    const phone     = phoneRaw || null;

    // Validate phone format — required; allow digits, spaces, +, -, (, ), ., / — min 7 digits
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    if (!phoneRaw || phoneDigits.length < 7 || phoneDigits.length > 15 || !/^[+\d][\d\s\-()\/.]+$/.test(phoneRaw)) {
      const lang = getLang();
      showError(
        lang === 'FR' ? 'Numéro de téléphone invalide. Exemple\u00a0: +32\u00a0475\u00a000\u00a000\u00a000'
        : lang === 'NL' ? 'Ongeldig telefoonnummer. Voorbeeld\u00a0: +32\u00a0475\u00a000\u00a000\u00a000'
        : 'Invalid phone number. Example: +32 475 00 00 00',
        'em-phone'
      );
      return;
    }
    const gender    = document.getElementById('em-gender').value || null;
    const language  = document.getElementById('em-language').value || null;
    const remarks   = document.getElementById('em-remarks').value.trim() || null;

    // Fields visible only in alone mode
    const height       = !hasPartner ? (document.getElementById('em-height').value.trim() || null) : null;
    const birthYearRaw = !hasPartner ? document.getElementById('em-birth-year').value : '';
    const birthYear    = birthYearRaw ? parseInt(birthYearRaw) : null;

    // Build payload
    const payload = {
      contact: {
        first_name: firstName,
        last_name:  lastName,
        email:      email,
        phone:      phone,
        language:   language,
        gender:     gender,
        height:     height,
        birth_year: birthYear,
      },
      product_id:  parseInt(currentProductId),
      has_partner: hasPartner,
      remarks:     remarks,
    };

    if (hasPartner) {
      const partnerEmail = document.getElementById('em-partner-email').value.trim();
      if (partnerEmail.toLowerCase() === email.toLowerCase()) {
        const lang = getLang();
        showError(
          lang === 'FR' ? 'L\'adresse e-mail du/de la partenaire doit être différente de la vôtre.'
          : lang === 'NL' ? 'Het e-mailadres van de partner mag niet hetzelfde zijn als uw eigen e-mailadres.'
          : 'The partner\'s email address must be different from your own.',
          'em-partner-email'
        );
        return;
      }
      payload.partner = {
        first_name: document.getElementById('em-partner-first-name').value.trim(),
        last_name:  document.getElementById('em-partner-last-name').value.trim(),
        email:      partnerEmail,
        gender:     document.getElementById('em-partner-gender').value || null,
      };
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = t.submitting;

    try {
      const res = await window.BETangoCRM.api.submitEnrollment(payload);
      const data = res.data || res;
      showSuccessView(data);
    } catch (err) {
      console.error('[EnrollmentModal] Submit error:', err);
      showError(err.message || t.errorDefault);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t.submit;
    }
  }

  // ========================
  // EPC / SEPA QR CODE
  // ========================

  function generateEpcQrCode(data) {
    const canvas = document.getElementById('em-qr-canvas');
    if (!canvas) return;

    // Clear previous QR
    canvas.innerHTML = '';

    if (typeof QRCode === 'undefined') {
      console.warn('[EnrollmentModal] QRCode.js not loaded — skipping QR generation');
      document.getElementById('em-qr-section').hidden = true;
      return;
    }

    const iban    = (data.bank_account || 'BE97068896456849').replace(/\s/g, '');
    const name    = data.bank_name || 'BE-TANGO ART';
    const amount  = parseFloat(data.amount || 0);
    const ref     = data.payment_reference || '';

    // EPC QR Code (SEPA Credit Transfer) — GiroCode standard
    // Line 10 = structured creditor reference, Line 11 = unstructured (empty)
    const epcLines = [
      'BCD',              // 1  Service tag
      '002',              // 2  Version
      '1',                // 3  Character set (UTF-8)
      'SCT',              // 4  Identification
      data.bank_bic || 'GEBABEBB', // 5  BIC
      name,               // 6  Beneficiary name
      iban,               // 7  IBAN
      'EUR' + amount.toFixed(2), // 8  Amount
      '',                 // 9  Purpose (optional)
      ref,                // 10 Structured remittance reference
      '',                 // 11 Unstructured remittance (empty when structured used)
      '',                 // 12 Beneficiary to originator info
    ];

    const epcString = epcLines.join('\n');

    try {
      new QRCode(canvas, {
        text: epcString,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (err) {
      console.error('[EnrollmentModal] QR generation failed:', err);
      document.getElementById('em-qr-section').hidden = true;
    }
  }

  // ========================
  // BOOT
  // ========================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[Enrollment Modal] Initialized');

})();
