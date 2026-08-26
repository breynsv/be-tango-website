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
      // Router + portal-account copy (2026-08-19). The form below books anyone,
      // known or not. `known*` is the note appended UNDER the confirmation when
      // the CRM reports an existing portal account — an aside, never a refusal,
      // so the wording must not ask for a booking that has already happened.
      routerLead: 'Booking a class happens here or in your student portal.',
      routerStudentBtn: 'I\'m already a student',
      routerStudentSub: 'Sign in to book this class',
      routerNewBtn: 'I\'m new here',
      routerNewSub: 'Book in one step, no account needed',
      knownTitle: 'You also have a student portal',
      knownMessage: 'This email address is already on file with us, so you have a portal account. Sign in any time to see this booking, your details and your past classes.',
      knownButton: 'Go to your portal',
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
      payOnline: 'Pay now online',
      payOnlineOr: 'Or pay by bank transfer',
      alreadyTitle: 'You\'re Already Registered',
      alreadyMessage: 'You\'re already signed up for this class. We\'ve re-sent the confirmation to your email — please check your spam folder too.',
      paymentReturn: 'Payment received — thank you! A confirmation email is on its way.',
      close: 'Close',
      required: 'required',
      // The progress strip's final label. It used to say "Confirmed" for every
      // outcome, so a big CONFIRMED sat above "we cannot confirm your
      // participation". Keyed by enrollmentType(data) instead.
      progressPaid: 'Confirmed',
      progressAlreadyRegistered: 'Already registered',
      progressWaitlist: 'On the waitlist',
      progressPartnerNeeded: 'Pending',
      // Fallback city for the modal eyebrow when the button carries no
      // data-location (the real city is passed through from the schedule).
      eyebrowCity: 'Brussels',
      // A solo registrant IS registered — the CRM writes the row, holds the
      // seat and files them under Singles. Only the pairing is genuinely open,
      // so that is the only thing this copy leaves open. Same fact, same
      // wording as js/free-trial.js.
      waitlistTitle: 'You\'re Registered!',
      waitlistMessage: 'Your registration for this class is in and your place is reserved. One thing is still open: tango is danced in couples, and you signed up without a partner. We\'ll look for someone whose age and height match yours, and we\'ll send you the payment details as soon as we\'ve paired you up.',
      waitlistAdvice: 'Finding a match isn\'t always quick, so it\'s well worth asking around too — a friend, a colleague, someone in the family. If you find someone, just tell us and we\'ll put you together.',
      waitlistClose: 'Close',
      classFullTitle: 'Class is Fully Booked',
      classFullMessage: 'This class is currently full. We\'ve added you to the waitlist — if a spot opens up we\'ll email you with confirmation and payment details.',
      classFullAdvice: 'In the meantime, feel free to check out our other classes that still have spots available.',
      // The footer note under the Close button. It used to be a single hardcoded
      // "a confirmation email has been sent" for every outcome, so it contradicted
      // the partner-search copy right above it. Keyed by enrollmentType(data) —
      // the same classification the progress label and the branches already use.
      doneNotePaid: 'A confirmation email has been sent to your inbox.',
      doneNoteAlreadyRegistered: 'A confirmation email has been sent to your inbox.',
      doneNoteWaitlist: 'We\'ve emailed you to confirm you\'re on the waitlist.',
      doneNotePartnerNeeded: 'We\'ve emailed you the details — we\'ll write again as soon as we\'ve found you a partner.',
      marketingOptIn: 'Yes, I\'d like to be kept informed by email about classes, workshops and events. Unsubscribe anytime — {link}.',
      privacyLink: 'privacy policy',
      terms: 'By submitting, I agree to the {link} of BE-TANGO.',
      termsLink: 'terms and conditions',
      termsError: 'Please accept the terms and conditions to continue.',
      fvRequired: 'Please fill in this field.',
      fvEmail: 'Please enter a valid email address.',
      fvSelect: 'Please make a choice.',
      fvPhone: 'Invalid phone number. Example: +32 475 00 00 00',
      fvHeight: 'Enter a height in centimetres, for example 170.',
      fvBirthYear: 'Enter your year of birth, for example 1985.',
    },
    FR: {
      // Router + portal-account copy (2026-08-19). The form below books anyone,
      // known or not. `known*` is the note appended UNDER the confirmation when
      // the CRM reports an existing portal account — an aside, never a refusal,
      // so the wording must not ask for a booking that has already happened.
      routerLead: 'La réservation d\'un cours se fait ici ou depuis votre portail élève.',
      routerStudentBtn: 'Je suis déjà élève',
      routerStudentSub: 'Connectez-vous pour réserver ce cours',
      routerNewBtn: 'Je suis nouveau/nouvelle ici',
      routerNewSub: 'Réservez en une étape, sans compte',
      knownTitle: 'Vous avez aussi un portail élève',
      knownMessage: 'Cette adresse e-mail est déjà enregistrée chez nous, vous avez donc un compte sur le portail. Connectez-vous quand vous le souhaitez pour retrouver cette réservation, vos informations et vos cours précédents.',
      knownButton: 'Accéder à votre portail',
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
      payOnline: 'Payer maintenant en ligne',
      payOnlineOr: 'Ou payer par virement bancaire',
      alreadyTitle: 'Vous êtes déjà inscrit(e)',
      alreadyMessage: 'Vous êtes déjà inscrit(e) à ce cours. Nous venons de renvoyer la confirmation à votre adresse e-mail — pensez à vérifier vos spams.',
      paymentReturn: 'Paiement reçu — merci ! Un e-mail de confirmation est en route.',
      close: 'Fermer',
      required: 'obligatoire',
      progressPaid: 'Confirmé',
      progressAlreadyRegistered: 'Déjà inscrit(e)',
      progressWaitlist: 'Sur liste d\'attente',
      progressPartnerNeeded: 'En attente',
      eyebrowCity: 'Bruxelles',
      waitlistTitle: 'Vous êtes inscrit(e) !',
      waitlistMessage: 'Votre inscription à ce cours est enregistrée et votre place est réservée. Il reste un point à régler : le tango se danse à deux, et vous vous êtes inscrit(e) sans partenaire. Nous chercherons quelqu\'un dont l\'âge et la taille correspondent aux vôtres, et nous vous enverrons les détails de paiement dès que le duo sera formé.',
      waitlistAdvice: 'Trouver un binôme n\'est pas toujours rapide : n\'hésitez donc pas à demander autour de vous — un(e) ami(e), un(e) collègue, quelqu\'un de votre famille. Si vous trouvez quelqu\'un, dites-le-nous et nous vous inscrirons ensemble.',
      waitlistClose: 'Fermer',
      classFullTitle: 'Cours Complet',
      classFullMessage: 'Ce cours est actuellement complet. Nous vous avons ajouté(e) à la liste d\'attente — si une place se libère, nous vous enverrons un e-mail avec confirmation et détails de paiement.',
      classFullAdvice: 'En attendant, n\'hésitez pas à découvrir nos autres cours qui ont encore des places disponibles.',
      doneNotePaid: 'Un email de confirmation a été envoyé à votre boîte mail.',
      doneNoteAlreadyRegistered: 'Un email de confirmation a été envoyé à votre boîte mail.',
      doneNoteWaitlist: 'Nous vous avons envoyé un email confirmant votre inscription sur la liste d\'attente.',
      doneNotePartnerNeeded: 'Nous vous avons envoyé les détails par email — nous vous réécrirons dès que nous vous aurons trouvé un(e) partenaire.',
      marketingOptIn: 'Oui, je souhaite recevoir des informations par e-mail sur les cours, ateliers et événements. Désinscription à tout moment — {link}.',
      privacyLink: 'politique de confidentialité',
      terms: 'En m\'inscrivant, j\'accepte les {link} de BE-TANGO.',
      termsLink: 'conditions générales',
      termsError: 'Veuillez accepter les conditions générales pour continuer.',
      fvRequired: 'Veuillez remplir ce champ.',
      fvEmail: 'Veuillez saisir une adresse e-mail valide.',
      fvSelect: 'Veuillez faire un choix.',
      fvPhone: 'Numéro de téléphone invalide. Exemple : +32 475 00 00 00',
      fvHeight: 'Indiquez une taille en centimètres, par exemple 170.',
      fvBirthYear: 'Indiquez votre année de naissance, par exemple 1985.',
    },
    NL: {
      // Router + portal-account copy (2026-08-19). The form below books anyone,
      // known or not. `known*` is the note appended UNDER the confirmation when
      // the CRM reports an existing portal account — an aside, never a refusal,
      // so the wording must not ask for a booking that has already happened.
      routerLead: 'Een les boeken doe je hier of via je studentenportaal.',
      routerStudentBtn: 'Ik ben al leerling',
      routerStudentSub: 'Log in om deze les te boeken',
      routerNewBtn: 'Ik ben hier nieuw',
      routerNewSub: 'Boek in één stap, geen account nodig',
      knownTitle: 'Je hebt ook een studentenportaal',
      knownMessage: 'Dit e-mailadres is al bij ons bekend, dus je hebt een portaalaccount. Log in wanneer je wilt om deze boeking, je gegevens en je eerdere lessen te bekijken.',
      knownButton: 'Naar je portaal',
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
      payOnline: 'Nu online betalen',
      payOnlineOr: 'Of betaal via bankoverschrijving',
      alreadyTitle: 'Je bent al ingeschreven',
      alreadyMessage: 'Je bent al ingeschreven voor deze les. We hebben de bevestiging opnieuw naar je e-mailadres gestuurd — kijk ook in je spam.',
      paymentReturn: 'Betaling ontvangen — bedankt! Een bevestigingsmail is onderweg.',
      close: 'Sluiten',
      required: 'verplicht',
      progressPaid: 'Bevestigd',
      progressAlreadyRegistered: 'Al ingeschreven',
      progressWaitlist: 'Op de wachtlijst',
      progressPartnerNeeded: 'In afwachting',
      eyebrowCity: 'Brussel',
      waitlistTitle: 'Je bent ingeschreven!',
      waitlistMessage: 'Je inschrijving voor deze les is geregistreerd en je plek is gereserveerd. Eén ding staat nog open: tango dans je met z\'n tweeën, en je schreef je in zonder partner. We zoeken iemand die qua leeftijd en lengte bij je past, en sturen je de betalingsgegevens zodra jullie gekoppeld zijn.',
      waitlistAdvice: 'Een match vinden lukt niet altijd meteen, dus vraag gerust ook eens rond — een vriend, een collega, iemand uit de familie. Vind je iemand? Laat het ons weten, dan zetten we jullie samen.',
      waitlistClose: 'Sluiten',
      classFullTitle: 'Les is Volgeboekt',
      classFullMessage: 'Deze les is momenteel volgeboekt. We hebben je op de wachtlijst gezet — zodra er een plek vrijkomt sturen we je een mail met bevestiging en betalingsgegevens.',
      classFullAdvice: 'Bekijk in tussentijd zeker onze andere lessen die nog plaatsen beschikbaar hebben.',
      doneNotePaid: 'Een bevestigingsmail is verzonden naar je inbox.',
      doneNoteAlreadyRegistered: 'Een bevestigingsmail is verzonden naar je inbox.',
      doneNoteWaitlist: 'We hebben je een mail gestuurd die je plek op de wachtlijst bevestigt.',
      doneNotePartnerNeeded: 'We hebben je de details gemaild — we schrijven je opnieuw zodra we een partner voor je gevonden hebben.',
      marketingOptIn: 'Ja, ik wens via e-mail op de hoogte gehouden te worden van lessen, workshops en evenementen. Uitschrijven kan altijd — {link}.',
      privacyLink: 'privacybeleid',
      terms: 'Door te verzenden, ga ik akkoord met de {link} van BE-TANGO.',
      termsLink: 'algemene voorwaarden',
      termsError: 'Gelieve de algemene voorwaarden te aanvaarden om verder te gaan.',
      fvRequired: 'Vul dit veld in.',
      fvEmail: 'Vul een geldig e-mailadres in.',
      fvSelect: 'Maak een keuze.',
      fvPhone: 'Ongeldig telefoonnummer. Voorbeeld : +32 475 00 00 00',
      fvHeight: 'Vul een lengte in centimeters in, bijvoorbeeld 170.',
      fvBirthYear: 'Vul je geboortejaar in, bijvoorbeeld 1985.',
    },
  };

  // ========================
  // MODULE STATE
  // ========================
  let currentProductId = null;
  let modalInjected = false;
  // The element that opened the modal; focus returns to it on close.
  let lastTrigger = null;

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

  // Terms and privacy pages exist in all three languages under different slugs.
  // Keep these in sync with the footer links in the page templates.
  const LEGAL_URLS = {
    EN: { terms: '/en/terms-and-conditions/',              privacy: '/en/privacy-policy/' },
    FR: { terms: '/fr/termes-et-conditions-generales/',    privacy: '/fr/politique-de-confidentialite/' },
    NL: { terms: '/nl/algemene-voorwaarden/',              privacy: '/nl/privacy-policy/' },
  };

  function getLegalUrls() {
    return LEGAL_URLS[getLang()] || LEGAL_URLS.EN;
  }

  // Digits, spaces, + - ( ) . / — between 7 and 15 digits.
  function isValidPhone(raw) {
    var digits = raw.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15 && /^[+\d][\d\s\-()\/.]+$/.test(raw);
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
    // The terms are now an explicit checkbox above, so this note only carries
    // the confirmation promise — repeating "you agree to our terms" here would
    // contradict the fact that agreement is a deliberate tick, not a side effect.
    var footerNote = lang === 'FR'
      ? 'Nous confirmerons votre place par email sous 24&nbsp;h.'
      : lang === 'NL'
      ? 'We bevestigen uw plaats per email binnen 24&nbsp;uur.'
      : 'We\'ll confirm your spot by email within 24&nbsp;hours.';
    var legal = getLegalUrls();
    var marketingHtml = t.marketingOptIn.replace(
      '{link}',
      '<a href="' + legal.privacy + '" target="_blank" rel="noopener">' + t.privacyLink + '</a>'
    );

    var termsHtml = t.terms.replace(
      '{link}',
      '<a href="' + legal.terms + '" target="_blank" rel="noopener">' + t.termsLink + '</a>'
    );
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
<div class="em-overlay" id="em-overlay" role="dialog" aria-modal="true" aria-hidden="true" inert aria-labelledby="em-title">
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
      <p class="em-eyebrow" id="em-eyebrow">BE-TANGO ${t.eyebrowCity}</p>
      <h2 class="em-title" id="em-title">${t.modalTitle}</h2>
    </div>

    <div class="em-chips" id="em-chips" role="list" aria-label="Class details" aria-live="polite">
      <span class="em-chip-skeleton" style="width:68px"></span>
      <span class="em-chip-skeleton" style="width:80px"></span>
      <span class="em-chip-skeleton" style="width:52px"></span>
      <span class="em-chip-skeleton" style="width:140px"></span>
    </div>

    <div class="em-divider" aria-hidden="true"></div>

    <!-- ROUTER VIEW — the first thing the modal shows.
         "Already a student" leaves for the portal (new tab, carrying this
         page's language). "New here" reveals the form below, which books in
         one step. The form is NOT hidden behind an account on purpose: making
         a newcomer sign up, verify an email and set a password before they may
         pay for a class is friction at the exact moment they decided to buy.
         Anyone already on file books normally too: the CRM fills blank fields and
         never overwrites, so an open form cannot rewrite a real student's record.
         It reports the existing portal account on the success payload, which is
         announced under the confirmation rather than instead of it. -->
    <div id="em-router-view">
      <p class="em-router-lead">${t.routerLead}</p>
      <div class="em-router-choices">
        <a class="em-router-choice" id="em-router-student" href="#" target="_blank" rel="noopener">
          <span class="em-router-choice-label">${t.routerStudentBtn}</span>
          <span class="em-router-choice-sub">${t.routerStudentSub}</span>
        </a>
        <button type="button" class="em-router-choice" id="em-router-new">
          <span class="em-router-choice-label">${t.routerNewBtn}</span>
          <span class="em-router-choice-sub">${t.routerNewSub}</span>
        </button>
      </div>
    </div>

    <!-- FORM VIEW -->
    <div id="em-form-view" hidden>
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
            <label class="em-label" for="em-gender">${t.gender} <span class="em-required" aria-hidden="true">*</span><span class="fh" data-fh="gender"></span></label>
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
                <label class="em-label" for="em-height">${t.height} <span class="em-required" aria-hidden="true">*</span><span class="fh" data-fh="height"></span></label>
                <input class="em-input" type="text" id="em-height" name="height" placeholder="170 cm" required>
              </div>
              <div class="em-field">
                <label class="em-label" for="em-birth-year">${t.birthYear} <span class="em-required" aria-hidden="true">*</span><span class="fh" data-fh="age"></span></label>
                <input class="em-input" type="number" id="em-birth-year" name="birth_year" min="1920" max="${new Date().getFullYear()}" placeholder="1985" required>
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

        <div class="em-gdpr">
          <label class="em-consent">
            <input type="checkbox" id="em-marketing-consent" name="marketing_consent">
            <span>${marketingHtml}</span>
          </label>
        </div>

        <label class="em-consent em-consent--terms">
          <input type="checkbox" id="em-terms" name="terms_accepted" required>
          <span>${termsHtml} <span class="em-required" aria-hidden="true">*</span></span>
        </label>

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
        <svg class="em-check-ring" id="em-success-icon" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="36" cy="36" r="35" class="em-check-ring-bg"/>
          <circle cx="36" cy="36" r="35" class="em-check-ring-border"/>
          <path d="M21 37.5L30.5 47L51 26" class="em-check-path"/>
          <path d="M36 20V36.5L46.5 43" class="em-pending-path"/>
        </svg>
        <h2 class="em-success-title" id="em-success-title">${t.successTitle}</h2>
        <p class="em-success-msg" id="em-success-msg">${t.successMessage}</p>
      </div>

      <div id="em-success-payment">

        <a id="em-pay-online-btn" href="#" rel="noopener noreferrer"
           style="display:none;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 18px;margin-top:4px;background:#1a1a1a;color:#fff;border-radius:9999px;font-weight:600;font-size:15px;text-decoration:none;">
          <span>${t.payOnline}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <p id="em-pay-online-or" style="display:none;text-align:center;color:#8a8a82;font-size:13px;margin:14px 0 0;">${t.payOnlineOr}</p>

        <div class="em-divider" id="em-divider-1"></div>

        <div class="em-payment" id="em-bank-block">
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

        <div class="em-divider" id="em-divider-2"></div>

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
        <p class="em-done-note" id="em-done-note">${t.doneNotePaid}</p>
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

    // Turn the <span class="fh"> placeholders into real "?" buttons.
    if (window.BETangoFieldHelp) {
      window.BETangoFieldHelp.hydrate(document.getElementById('em-overlay'));
    }

    // Inject spinner keyframe once
    if (!document.getElementById('em-spin-style')) {
      var style = document.createElement('style');
      style.id = 'em-spin-style';
      style.textContent = '@keyframes em-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }

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
    // "I'm new here" reveals the one-step form rather than leaving for the
    // portal. Delegated so it survives the modal HTML being rebuilt.
    document.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('#em-router-new')) {
        e.preventDefault();
        showFormView();
      }
    });

  }

  // ========================
  // OPEN / CLOSE
  // ========================

  function openModal(productId, className, price, location, time) {
    currentProductId = productId;

    // Remember who opened the modal so focus can go back there on close —
    // see closeModal(), which must not hide a subtree that still holds focus.
    lastTrigger = document.activeElement;

    // Eyebrow: the location the class actually runs at, not a hardcoded
    // "Brussels" shown above Woluwe-Saint-Pierre classes. data-location is
    // already localised by the schedule loader; the fallback is translated.
    var eyebrow = document.getElementById('em-eyebrow');
    if (eyebrow) eyebrow.textContent = 'BE-TANGO ' + (location || getT().eyebrowCity);

    // Render class info chips
    renderChips(className, price, location, time);

    // Reset form
    document.getElementById('em-form').reset();

    // Start on the router. wireRouterLinks() points "already a student" at this
    // class in the portal, in this page's language.
    wireRouterLinks(productId);
    showRouterView();

    // Hide error
    const errEl = document.getElementById('em-error');
    errEl.hidden = true;
    errEl.textContent = '';

    // Reset partner toggle — no pre-selection, hide both sections
    handlePartnerToggle();

    // Show overlay
    const overlay = document.getElementById('em-overlay');
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the first router choice; showFormView() focuses the first input
    // when (and only when) the form is actually revealed.
    setTimeout(function () {
      const first = document.getElementById('em-router-student');
      if (first) first.focus();
    }, 50);
  }

  // Chrome blocks aria-hidden on an element whose descendant still has focus
  // ("Blocked aria-hidden on an element because its descendant retained focus")
  // and logs it as an accessibility violation. Every close path lands here, so
  // focus is moved out first — back to the button that opened the modal, which
  // is also the correct behaviour for keyboard and screen-reader users. `inert`
  // then keeps the hidden subtree out of the tab order for good measure; the
  // aria-hidden attribute stays because .em-overlay[aria-hidden="false"] is
  // what makes the overlay visible in CSS.
  function closeModal() {
    const overlay = document.getElementById('em-overlay');
    if (overlay) {
      if (overlay.contains(document.activeElement)) {
        if (lastTrigger && document.contains(lastTrigger) && typeof lastTrigger.focus === 'function') {
          lastTrigger.focus();
        } else if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      }
      overlay.inert = true;
      overlay.setAttribute('aria-hidden', 'true');
    }
    lastTrigger = null;
    document.body.style.overflow = '';
    currentProductId = null;
  }

  // ========================
  // VIEWS
  // ========================

  // Exactly one of the four panels is visible at a time. They are switched here
  // rather than at each call site so a new panel cannot be added and leave an
  // old one showing underneath it.
  function showPanel(id) {
    ['em-router-view', 'em-form-view', 'em-success-view'].forEach(function (panel) {
      var el = document.getElementById(panel);
      if (el) el.hidden = (panel !== id);
    });
  }

  function showRouterView() { showPanel('em-router-view'); }

  // Point "I'm already a student" at this class inside the portal.
  //
  // `lang`: nobody is signed in on the other side, so the portal has no
  // Contact.language to read and would render in the SCHOOL's locale — a
  // visitor reading the Dutch site landed on a French login page. This page
  // knows the answer, so it states it; the CRM re-validates the code against
  // the locales it actually has a translation file for.
  function wireRouterLinks(productId) {
    var portalBase = (window.API_CONFIG && window.API_CONFIG.portalURL) || '/portal';
    // Guard against a bad/missing product id producing ".../browse/undefined" —
    // fall back to the browse root rather than emit a broken next path.
    var next = productId ? ('/portal/browse/' + encodeURIComponent(productId)) : '/portal/browse';
    var lang = (document.documentElement.getAttribute('lang') || '').slice(0, 2).toLowerCase();
    var langParam = /^[a-z]{2}$/.test(lang) ? '&lang=' + lang : '';
    var studentLink = document.getElementById('em-router-student');
    if (studentLink) {
      studentLink.href = portalBase + '/login?next=' + encodeURIComponent(next) + langParam;
    }
  }

  function showFormView() {
    showPanel('em-form-view');
    setTimeout(function () {
      var first = document.getElementById('em-first-name');
      if (first) first.focus();
    }, 50);
  }



  function enrollmentType(data) {
    if (data.already_registered) return 'already_registered';
    if (data.waitlisted)         return 'waitlist';
    if (data.partner_needed)     return 'partner_needed';
    return 'paid';
  }

  function pushEnrollmentConversion(data) {
    var type = enrollmentType(data);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'enrollment_success',
      enrollment_type: type,
      value: type === 'paid' ? parseFloat(data.amount || 0) : 0,
      currency: 'EUR',
      transaction_id: data.payment_reference || undefined
    });
  }

  // Booked, AND they already have a portal account. Announced under the normal
  // confirmation rather than instead of it: the booking and its payment details
  // are the thing they came for, and the account is useful extra. Replacing the
  // confirmation with "go and sign in" is what made somebody fill the form in
  // and get nothing back.
  function announcePortalAccount(portalUrl) {
    if (!portalUrl) return;
    var host = document.getElementById('em-success-view');
    if (!host || document.getElementById('em-known-note')) return;
    var t = getT();
    var wrap = document.createElement('div');
    wrap.id = 'em-known-note';
    wrap.className = 'em-known-note';
    var title = document.createElement('p');
    title.className = 'em-known-note-title';
    title.textContent = t.knownTitle;
    var msg = document.createElement('p');
    msg.className = 'em-known-note-msg';
    msg.textContent = t.knownMessage;
    var link = document.createElement('a');
    link.className = 'em-known-note-link';
    link.href = portalUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = t.knownButton;
    wrap.appendChild(title); wrap.appendChild(msg); wrap.appendChild(link);
    host.appendChild(wrap);
  }

  function showSuccessView(data) {
    var t = getT();
    pushEnrollmentConversion(data);

    // One classification for the whole view. The icon, the footer note and the
    // progress strip all read from these two lines — #643/#659 were caused by
    // separate places each deciding for themselves what state the booking was
    // in, so do NOT reintroduce a second source of truth here.
    var outcome = enrollmentType(data);
    // Only a booked-and-settled place completes the journey. Waitlist and
    // partner-search are genuinely unfinished.
    var isComplete = (outcome === 'paid' || outcome === 'already_registered');

    // Payment methods drive the pay-now button, the bank block (IBAN / ref / due /
    // bank name) and the SEPA QR. The CRM now returns payment_methods on the
    // response; fall back to reproducing today's exact behaviour when it's absent
    // (old CRM still deployed — the frontend and CRM ship independently).
    var methods = Array.isArray(data.payment_methods)
      ? data.payment_methods
      : (data.checkout_url ? ['bank', 'online'] : ['bank']);

    var payBtn = document.getElementById('em-pay-online-btn');
    var payOr = document.getElementById('em-pay-online-or');
    var bankBlock = document.getElementById('em-bank-block');
    var divider1 = document.getElementById('em-divider-1');
    var divider2 = document.getElementById('em-divider-2');
    var qrSection = document.getElementById('em-qr-section');

    // Whether to fetch the QR below — only when the bank block is actually
    // visible, regardless of which branch below set that.
    var shouldLoadQr = false;

    // Three outcomes, in priority order:
    //   1. data.waitlisted        → class is fully booked. Defense-in-depth:
    //                                the API rejects full classes at 400 so
    //                                this branch is normally unreachable.
    //   2. data.partner_needed    → solo registration. Partner-search popup;
    //                                payment details only arrive later, when
    //                                admin pairs the registrant with a partner.
    //   3. else                   → couple registration with payment popup.
    if (data.already_registered) {
      // Re-submission of a class the contact is already enrolled in. Show a
      // clear "already registered" message — no bank details/QR (those were
      // re-sent by email). The CRM also returns payment_methods/checkout_url
      // here now, so an unpaid duplicate registrant can still pay online.
      document.getElementById('em-success-title').textContent = t.alreadyTitle;
      document.getElementById('em-success-msg').hidden = false;
      document.getElementById('em-success-msg').textContent = t.alreadyMessage;
      document.getElementById('em-success-waitlist').hidden = true;

      if (bankBlock) bankBlock.hidden = true;
      if (divider1) divider1.hidden = true;
      if (divider2) divider2.hidden = true;
      if (qrSection) qrSection.hidden = true;
      if (payOr) payOr.style.display = 'none';

      var alreadyHasOnline = !!data.checkout_url;
      if (payBtn) {
        if (alreadyHasOnline) {
          payBtn.href = data.checkout_url;
          payBtn.style.display = 'flex';
        } else {
          payBtn.style.display = 'none';
        }
      }
      document.getElementById('em-success-payment').hidden = !alreadyHasOnline;
    } else if (data.waitlisted) {
      document.getElementById('em-success-title').textContent = t.classFullTitle;
      document.getElementById('em-success-msg').hidden = true;
      document.getElementById('em-success-payment').hidden = true;
      document.getElementById('em-success-waitlist').hidden = false;
      document.getElementById('em-waitlist-message').textContent = t.classFullMessage;
      document.getElementById('em-waitlist-advice').textContent = t.classFullAdvice;
    } else if (data.partner_needed) {
      // Partner-search state — no payment info, "looking for a partner" copy
      document.getElementById('em-success-title').textContent = t.waitlistTitle;
      document.getElementById('em-success-msg').hidden = true;
      document.getElementById('em-success-payment').hidden = true;
      document.getElementById('em-success-waitlist').hidden = false;
      document.getElementById('em-waitlist-message').textContent = t.waitlistMessage;
      document.getElementById('em-waitlist-advice').textContent = t.waitlistAdvice;
    } else {
      // Payment state (couple registration)
      document.getElementById('em-success-title').textContent = t.successTitle;
      document.getElementById('em-success-msg').hidden = false;
      document.getElementById('em-success-msg').textContent = t.successMessage;
      document.getElementById('em-success-waitlist').hidden = true;

      // Fill payment details. Only couple registrations reach this branch
      // (solos go through partner-search), so the 2\u00d7 per-person split is
      // always shown. These fields sit inside the bank block, which may end up
      // hidden below — harmless to fill regardless.
      var amount = parseFloat(data.amount || 0);
      var perPerson = amount / 2;
      document.getElementById('em-pay-amount').innerHTML =
        '<span class="em-pay-amount-split">2 \u00d7 \u20ac' + perPerson.toFixed(0) + ' p.p.</span>\u20ac' + amount.toFixed(2);
      document.getElementById('em-pay-iban').textContent = formatIban(data.bank_account || 'BE97068896456849');
      document.getElementById('em-pay-ref').textContent = data.payment_reference || '';
      document.getElementById('em-pay-due').textContent = formatDueDate(data.due_date);
      document.getElementById('em-pay-bank').textContent = data.bank_name || 'BE-TANGO ART';

      // Drive the pay-now button, the "or pay by bank transfer" label, the bank
      // block (IBAN/ref/due/bank name) and the QR from payment_methods:
      //   ["bank"]         → button+label hidden, bank block + QR shown
      //   ["online"]       → button shown, label+bank block+QR hidden
      //   ["bank","online"]→ button+label shown, bank block + QR shown
      // The pay-now button additionally requires checkout_url — if the mint
      // failed server-side the field is absent, and a button with no href is
      // worse than none.
      var hasBank = methods.indexOf('bank') !== -1;
      var hasOnline = methods.indexOf('online') !== -1 && !!data.checkout_url;

      if (payBtn) {
        if (hasOnline) {
          payBtn.href = data.checkout_url;
          payBtn.style.display = 'flex';
        } else {
          payBtn.style.display = 'none';
        }
      }
      if (payOr) payOr.style.display = (hasBank && hasOnline) ? 'block' : 'none';
      if (bankBlock) bankBlock.hidden = !hasBank;
      if (divider1) divider1.hidden = !hasBank;
      if (divider2) divider2.hidden = !hasBank;
      if (qrSection) qrSection.hidden = !hasBank;

      document.getElementById('em-success-payment').hidden = !(hasBank || hasOnline);
      shouldLoadQr = hasBank;
    }

    // The gold tick and the footer note were the two signals the earlier batch
    // left behind: a completed checkmark and "a confirmation email has been
    // sent" sat directly above "we cannot confirm your participation". Both now
    // follow the same `outcome` as the progress label below.
    var successIcon = document.getElementById('em-success-icon');
    if (successIcon) {
      successIcon.classList.toggle('em-check-ring--pending', !isComplete);
    }
    var DONE_NOTE_KEY = {
      paid:               'doneNotePaid',
      already_registered: 'doneNoteAlreadyRegistered',
      waitlist:           'doneNoteWaitlist',
      partner_needed:     'doneNotePartnerNeeded'
    };
    var doneNoteEl = document.getElementById('em-done-note');
    if (doneNoteEl) {
      doneNoteEl.textContent = t[DONE_NOTE_KEY[outcome]] || t.doneNotePaid;
    }

    // Progress strip. The label used to read "Confirmed" for every outcome, so a
    // gold CONFIRMED rendered directly above "we cannot confirm your participation"
    // (partner search) and above "You're Already Registered". The label and the
    // dots follow the same `outcome` classification.
    var LABEL_KEY = {
      paid:               'progressPaid',
      already_registered: 'progressAlreadyRegistered',
      waitlist:           'progressWaitlist',
      partner_needed:     'progressPartnerNeeded'
    };
    // The last dot stays grey rather than claiming done.
    document.querySelectorAll('.em-progress-dot').forEach(function (dot, i) {
      dot.classList.toggle('em-progress-dot--inactive', !isComplete && i === 2);
    });
    var progressLabel = document.querySelector('.em-progress-label');
    if (progressLabel) {
      progressLabel.textContent = t[LABEL_KEY[outcome]] || t.progressPaid;
      progressLabel.style.color = isComplete ? '#C9A820' : '#6B7280';
    }

    // Swap views
    document.getElementById('em-form-view').hidden = true;
    document.getElementById('em-success-view').hidden = false;

    // Scroll dialog to top
    var dialog = document.querySelector('.em-dialog');
    if (dialog) dialog.scrollTop = 0;

    // Lazy-load QR only when the bank block is actually visible — otherwise skip
    // the /enrollments/payment-qr call entirely rather than drawing into a
    // hidden node (online-only, already-registered without bank, partner-search,
    // waitlist all skip it).
    if (shouldLoadQr) {
      loadPaymentQr(data);
    }
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

  // Localized names for the 3 supported language codes, shown in the dropdown.
  // Keys = page language (EN/FR/NL); inner keys = language code.
  const LANG_NAMES = {
    EN: { EN: 'English',  FR: 'French',       NL: 'Dutch'      },
    FR: { EN: 'Anglais',  FR: 'Français',     NL: 'Néerlandais' },
    NL: { EN: 'Engels',   FR: 'Frans',        NL: 'Nederlands' },
  };

  function localizedLangName(code, pageLang) {
    return (LANG_NAMES[pageLang] && LANG_NAMES[pageLang][code]) || code;
  }

  async function loadLanguages() {
    const select = document.getElementById('em-language');
    if (!select) return;

    const pageLang = getLang(); // EN | FR | NL

    function appendOption(code) {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = localizedLangName(code, pageLang);
      // Use the HTML attribute (not just the property) so form.reset() preserves the preselection
      if (code === pageLang) opt.setAttribute('selected', 'selected');
      select.appendChild(opt);
    }

    try {
      const res = await window.BETangoCRM.api.getLanguages();
      const languages = res.data || res;
      // A successful answer carrying no languages is as useless as no answer at
      // all, and far more dangerous, because nothing throws to say so:
      // #em-language is REQUIRED, so a select with zero options can never be
      // satisfied and the booking form becomes permanently unsubmittable. The
      // visitor sees "Please make a choice" against a dropdown that offers
      // none. Treat "no languages" exactly like "no reply" and fall back.
      const codes = (Array.isArray(languages) ? languages : [])
        .map(function (lang) { return lang && lang.code; })
        .filter(Boolean);
      if (!codes.length) throw new Error('the languages endpoint returned none');
      codes.forEach(appendOption);
    } catch (err) {
      console.warn('[EnrollmentModal] Could not load languages, using defaults:', err);
      ['EN', 'FR', 'NL'].forEach(appendOption);
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

    // Validate required fields inline, in the page's language.
    // This used to be checkValidity() + reportValidity(), which shows a native
    // browser bubble: one field at a time, and worded in the BROWSER's language,
    // so a Dutch visitor on an English browser got "Please fill out this field".
    // Marketing consent is deliberately absent from this pass: it is optional,
    // and gating the booking on it would mean the consent was not freely given.
    const form = document.getElementById('em-form');
    const problems = window.BETangoValidate
      ? BETangoValidate.check(form, {
          required: t.fvRequired,
          email:    t.fvEmail,
          select:   t.fvSelect,
          checkbox: t.termsError,
        })
      : [];

    // Phone shape is a rule check(), which only knows "empty or not", cannot make.
    // Skip it when the field is already flagged as empty — one message per field.
    const phoneEl = document.getElementById('em-phone');
    const typedPhone = phoneEl ? phoneEl.value.trim() : '';
    if (typedPhone && !isValidPhone(typedPhone) && !problems.some((p) => p.el === phoneEl)) {
      problems.push({ el: phoneEl, message: t.fvPhone });
    }

    // Height and birth year, same treatment: only worth checking once the
    // field is both visible and filled, and never a second message on a field
    // the required pass has already flagged.
    const heightEl = document.getElementById('em-height');
    const typedHeight = heightEl ? heightEl.value.trim() : '';
    if (typedHeight && !heightEl.closest('[hidden]')
        && window.BETangoValidate
        && window.BETangoValidate.parseHeightCm(typedHeight) === null
        && !problems.some((p) => p.el === heightEl)) {
      problems.push({ el: heightEl, message: t.fvHeight });
    }

    const yearEl = document.getElementById('em-birth-year');
    const typedYear = yearEl ? yearEl.value.trim() : '';
    if (typedYear && !yearEl.closest('[hidden]') && !problems.some((p) => p.el === yearEl)) {
      const y = parseInt(typedYear, 10);
      // Same window as the CRM: 1920 to this year. The old ceiling was a
      // hardcoded 2010, a silent "no under-16s" nobody had to notice while
      // the field was optional.
      if (!(y >= 1920 && y <= new Date().getFullYear())) {
        problems.push({ el: yearEl, message: t.fvBirthYear });
      }
    }

    if (problems.length) {
      if (window.BETangoValidate) BETangoValidate.show(form, problems);
      else showError(problems[0].message, problems[0].el.id);
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
      // Two independent facts, deliberately sent separately: terms_accepted is a
      // precondition of the booking, marketing_consent is the optional opt-in the
      // CRM logs as GDPR consent. Never collapse these back into one flag.
      terms_accepted:    true,
      marketing_consent: !!(document.getElementById('em-marketing-consent') || {}).checked,
      // Where this visit came from, captured on the landing page by
      // attribution.js. Optional on the backend and guarded here, so a page
      // that never loaded the module still submits fine.
      attribution:       (window.BETangoAttribution && window.BETangoAttribution.get()) || null,
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
      // Only when the CRM says so. Absent for everyone who has no account yet,
      // which is most people using this form.
      if (data && data.existing_student) {
        announcePortalAccount(data.portal_url);
      }
    } catch (err) {
      // The CRM used to answer 409 existing_student here and roll the booking
      // back, which lost the form the visitor had just filled in. It books them
      // now and says so on the SUCCESS payload instead (see showSuccessView),
      // so there is no longer a refusal branch to handle — only real errors.
      console.error('[EnrollmentModal] Submit error:', err);
      showError(err.message || t.errorDefault);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t.submit;
    }
  }

  // ========================
  // EPC / SEPA QR CODE — lazy-loaded from server after confirmation page shows
  // ========================

  function showQrSpinner(canvas) {
    var lang = getLang();
    var label = lang === 'FR' ? 'Génération du QR code…'
              : lang === 'NL' ? 'QR-code genereren…'
              : 'Generating QR code…';
    canvas.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:10px;">'
      + '<div style="width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#C9A820;border-radius:50%;animation:em-spin 0.8s linear infinite;"></div>'
      + '<span style="font-size:12px;color:#9ca3af;">' + label + '</span>'
      + '</div>';
  }

  async function loadPaymentQr(data) {
    var canvas = document.getElementById('em-qr-canvas');
    if (!canvas) return;

    if (!data.enrollment_id || !data.payment_reference) {
      document.getElementById('em-qr-section').hidden = true;
      return;
    }

    showQrSpinner(canvas);

    try {
      var res = await window.BETangoCRM.api.fetchPaymentQr(data.enrollment_id, data.payment_reference);
      if (res && res.data && res.data.qr_base64) {
        canvas.innerHTML = '';
        var img = document.createElement('img');
        img.src = res.data.qr_base64;
        img.alt = 'Payment QR Code';
        img.style.cssText = 'width:200px;height:200px;display:block;margin:0 auto;';
        canvas.appendChild(img);
      } else {
        document.getElementById('em-qr-section').hidden = true;
      }
    } catch (err) {
      console.warn('[EnrollmentModal] QR fetch failed:', err);
      document.getElementById('em-qr-section').hidden = true;
    }
  }

  // ========================
  // BOOT
  // ========================

  // Acknowledge return from the hosted payment page (?be_payment_return=1). The
  // final paid status is confirmed by the provider webhook; this banner is just
  // an acknowledgement so the customer isn't left on a blank page after paying.
  function checkPaymentReturn() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('be_payment_return') !== '1') return;
      var t = getT();
      var bar = document.createElement('div');
      bar.setAttribute('role', 'status');
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a7f37;color:#fff;padding:14px 18px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;box-shadow:0 2px 10px rgba(0,0,0,.25);';
      bar.innerHTML = '✓ ' + t.paymentReturn + ' <button type="button" aria-label="Close" style="margin-left:14px;background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:14px;">✕</button>';
      document.body.appendChild(bar);

      // The bar is fixed at top:0 and the site header is sticky at top:0, so
      // without this the bar sits ON the header — slicing the logo in half and
      // clipping the header CTA. Pad the page down by the bar's height (the
      // header moves with it, being in normal flow) and push the header's
      // sticky offset down too, so it parks under the bar once you scroll.
      var header = document.querySelector('.site-header');
      var prevPad = document.body.style.paddingTop;
      var prevTop = header ? header.style.top : '';

      function offsetForBar() {
        var h = bar.offsetHeight;
        document.body.style.paddingTop = h + 'px';
        if (header) header.style.top = h + 'px';
      }
      function clearOffset() {
        document.body.style.paddingTop = prevPad;
        if (header) header.style.top = prevTop;
      }

      offsetForBar();

      // Measuring once is not enough: the message wraps to two or three lines on
      // narrow screens, and the final line count only settles after the webfont
      // swaps in — measured too early, EN on a 390px viewport reserved 73px for a
      // bar that ended up 93px tall, putting the header back under it. Track the
      // bar's real height instead of guessing when it stops changing.
      var ro = null;
      if (typeof ResizeObserver === 'function') {
        ro = new ResizeObserver(offsetForBar);
        ro.observe(bar);
      } else {
        window.addEventListener('resize', offsetForBar);
      }

      bar.querySelector('button').addEventListener('click', function () {
        if (ro) ro.disconnect(); else window.removeEventListener('resize', offsetForBar);
        clearOffset();
        bar.remove();
      });

      params.delete('be_payment_return');
      var qs = params.toString();
      history.replaceState({}, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); checkPaymentReturn(); });
  } else {
    init();
    checkPaymentReturn();
  }

  console.log('[Enrollment Modal] Initialized');

})();
