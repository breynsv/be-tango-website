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
    return `
<div class="em-overlay" id="em-overlay" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="em-title">
  <div class="em-dialog">
    <button class="em-close" id="em-close" aria-label="Close">&times;</button>

    <!-- FORM VIEW -->
    <div id="em-form-view">
      <h2 class="em-title" id="em-title">${t.modalTitle}</h2>
      <p class="em-subtitle" id="em-subtitle"></p>

      <div class="em-error" id="em-error" hidden></div>

      <form id="em-form" novalidate>

        <div class="em-row-2">
          <div class="em-field">
            <label for="em-first-name">${t.firstName} *</label>
            <input type="text" id="em-first-name" name="first_name" required autocomplete="given-name">
          </div>
          <div class="em-field">
            <label for="em-last-name">${t.lastName} *</label>
            <input type="text" id="em-last-name" name="last_name" required autocomplete="family-name">
          </div>
        </div>

        <div class="em-row-2">
          <div class="em-field">
            <label for="em-email">${t.email} *</label>
            <input type="email" id="em-email" name="email" required autocomplete="email">
          </div>
          <div class="em-field">
            <label for="em-phone">${t.phone} *</label>
            <input type="tel" id="em-phone" name="phone" required autocomplete="tel">
          </div>
        </div>

        <div class="em-row-2">
          <div class="em-field">
            <label for="em-gender">${t.gender}</label>
            <select id="em-gender" name="gender">
              <option value="">${t.genderSelect}</option>
              <option value="Male">${t.genderMale}</option>
              <option value="Female">${t.genderFemale}</option>
              <option value="Other">${t.genderOther}</option>
            </select>
          </div>
          <div class="em-field">
            <label for="em-language">${t.language} *</label>
            <select id="em-language" name="language" required>
              <option value="">${t.languageSelect}</option>
            </select>
          </div>
        </div>

        <p class="em-section-title">${t.partnerQuestion}</p>
        <div class="em-toggle-group">
          <label class="em-toggle-label">
            <input type="radio" name="em-partner-toggle" value="alone">
            ${t.alone}
          </label>
          <label class="em-toggle-label">
            <input type="radio" name="em-partner-toggle" value="with-partner">
            ${t.withPartner}
          </label>
        </div>

        <!-- ALONE SECTION -->
        <div id="em-alone-section" hidden>
          <p class="em-section-title">${t.aloneSection}</p>
          <div class="em-row-2">
            <div class="em-field">
              <label for="em-height">${t.height} *</label>
              <input type="text" id="em-height" name="height" placeholder="170 cm" required>
            </div>
            <div class="em-field">
              <label for="em-birth-year">${t.birthYear} *</label>
              <input type="number" id="em-birth-year" name="birth_year" min="1920" max="2010" placeholder="1985" required>
            </div>
          </div>
        </div>

        <!-- PARTNER SECTION -->
        <div id="em-partner-section" hidden>
          <p class="em-section-title">${t.partnerSection}</p>
          <div class="em-row-2">
            <div class="em-field">
              <label for="em-partner-first-name">${t.partnerFirstName} *</label>
              <input type="text" id="em-partner-first-name" name="partner_first_name">
            </div>
            <div class="em-field">
              <label for="em-partner-last-name">${t.partnerLastName} *</label>
              <input type="text" id="em-partner-last-name" name="partner_last_name">
            </div>
          </div>
          <div class="em-field">
            <label for="em-partner-email">${t.partnerEmail} *</label>
            <input type="email" id="em-partner-email" name="partner_email">
          </div>
          <div class="em-field">
            <label for="em-partner-gender">${t.partnerGender} *</label>
            <select id="em-partner-gender" name="partner_gender" required>
              <option value="">${t.genderSelect}</option>
              <option value="Male">${t.genderMale}</option>
              <option value="Female">${t.genderFemale}</option>
              <option value="Other">${t.genderOther}</option>
            </select>
          </div>
        </div>

        <div class="em-field">
          <label for="em-remarks">${t.remarks}</label>
          <textarea id="em-remarks" name="remarks" rows="3" placeholder="${t.remarksPlaceholder}"></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-full-width" id="em-submit">${t.submit}</button>
      </form>
    </div>

    <!-- SUCCESS VIEW -->
    <div id="em-success-view" hidden>
      <div class="em-success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
      </div>
      <h2 class="em-success-title" id="em-success-title">${t.successTitle}</h2>
      <p class="em-success-msg">${t.successMessage}</p>

      <div class="em-payment-card">
        <h3>${t.paymentTitle}</h3>
        <div class="em-payment-row">
          <span>${t.paymentAmount}</span>
          <strong id="em-pay-amount"></strong>
        </div>
        <div class="em-payment-row">
          <span>${t.paymentIban}</span>
          <strong id="em-pay-iban"></strong>
        </div>
        <div class="em-payment-row">
          <span>${t.paymentRef}</span>
          <strong id="em-pay-ref"></strong>
        </div>
        <div class="em-payment-row">
          <span>${t.paymentDue}</span>
          <strong id="em-pay-due"></strong>
        </div>
        <div class="em-payment-row">
          <span>${t.paymentBankName}</span>
          <strong id="em-pay-bank"></strong>
        </div>
      </div>

      <div class="em-qr-wrap" id="em-qr-wrap">
        <p>${t.qrTitle}</p>
        <div id="em-qr-canvas"></div>
      </div>

      <button class="btn btn-primary btn-full-width" id="em-success-close" style="margin-top:1.5rem">${t.close}</button>
    </div>

  </div>
</div>`;
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

    // Partner toggle
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
          btn.dataset.location || ''
        );
      }
    });
  }

  // ========================
  // OPEN / CLOSE
  // ========================

  function openModal(productId, className, price, location) {
    currentProductId = productId;

    // Update subtitle with class info
    const parts = [];
    if (className) parts.push(className);
    if (price) parts.push('€' + parseFloat(price).toFixed(0));
    if (location) parts.push(location);
    document.getElementById('em-subtitle').textContent = parts.join(' · ');

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
    const t = getT();

    document.getElementById('em-success-title').textContent = t.successTitle;

    // Fill payment card
    const amount = parseFloat(data.amount || 0);
    document.getElementById('em-pay-amount').textContent = '€' + amount.toFixed(2);
    document.getElementById('em-pay-iban').textContent = formatIban(data.bank_account || 'BE97068896456849');
    document.getElementById('em-pay-ref').textContent = data.payment_reference || '';
    document.getElementById('em-pay-due').textContent = formatDueDate(data.due_date);
    document.getElementById('em-pay-bank').textContent = data.bank_name || 'BE-TANGO ART';

    // Generate QR
    generateEpcQrCode(data);

    // Swap views
    document.getElementById('em-form-view').hidden = true;
    document.getElementById('em-success-view').hidden = false;

    // Scroll dialog to top
    const dialog = document.querySelector('.em-dialog');
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
      const msg = lang === 'FR' ? 'Veuillez indiquer si vous venez seul(e) ou avec un(e) partenaire.'
                : lang === 'NL' ? 'Geef aan of je alleen komt of een partner meebrengt.'
                : 'Please indicate whether you\'re coming alone or with a partner.';
      errEl.textContent = msg;
      errEl.hidden = false;
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const hasPartner = partnerRadio.value === 'with-partner';

    // Gather contact fields
    const firstName = document.getElementById('em-first-name').value.trim();
    const lastName  = document.getElementById('em-last-name').value.trim();
    const email     = document.getElementById('em-email').value.trim();
    const phone     = document.getElementById('em-phone').value.trim() || null;
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
      payload.partner = {
        first_name: document.getElementById('em-partner-first-name').value.trim(),
        last_name:  document.getElementById('em-partner-last-name').value.trim(),
        email:      document.getElementById('em-partner-email').value.trim(),
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
      errEl.textContent = err.message || t.errorDefault;
      errEl.hidden = false;
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      document.getElementById('em-qr-wrap').hidden = true;
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
      document.getElementById('em-qr-wrap').hidden = true;
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
