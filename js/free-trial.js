/**
 * BE-TANGO Free Trial Page Integration
 * Handles live schedule display and form submission via the CRM API.
 */

(function () {
  'use strict';

  // ========================
  // TRANSLATIONS
  // ========================
  const T = {
    EN: {
      loading: 'Loading available dates…',
      noSlots: 'No upcoming free trial dates scheduled right now.',
      apiError: 'Could not load available dates. Please contact us directly.',
      spotsOk: (n) => `${n} spots available`,
      spotsLow: (n) => n === 1 ? '1 spot left!' : `${n} spots left!`,
      spotsCritical: 'Almost full!',
      selectPlaceholder: '-- Select a date --',
      selectLoading: 'Loading available dates…',
      selectNoSlots: 'No available dates',
      successTitle: 'You\'re Registered!',
      successMessage: 'Your free trial has been booked. We\'ll see you on the dance floor!',
      // Shown when the CRM answers partner_added: the person had already
      // booked this trial on their own and has come back to say they now
      // have a partner. Their EXISTING booking was updated — no second
      // place was taken — and saying so is the difference between "did
      // that work?" and a settled registration.
      successMessagePartnerAdded: 'We\'ve updated your booking — you\'re coming with your partner. We\'ll see you on the dance floor!',
      // Solo registrants ARE registered — the CRM writes status=CONFIRMED and
      // files them under Singles. What is genuinely unsettled is the pairing,
      // so that is the only thing this copy leaves open.
      successTitleWaitlist: 'You\'re Registered!',
      successMessageWaitlist: [
        'Your place in this free trial is booked — we\'ve saved it for you.',
        'One thing is still open: tango is danced in couples, and you told us you\'re coming without a partner. We\'ll look for someone whose age and height match yours, and we\'ll let you know as soon as we\'ve paired you up.',
        'Finding a match isn\'t always quick, so it\'s well worth asking around too — a friend, a colleague, someone in the family. If you find someone, just tell us and we\'ll put you together.',
      ],
      successEmailNote: 'A confirmation has been sent to',
      // Solo registrants receive the partner-search email (free-trial-waitlist),
      // not the class confirmation — so this names what actually arrived.
      successEmailNoteWaitlist: 'We\'ve emailed the details to',
      successRefLabel: 'Reference',
      successDateLabel: 'Your class',
      errorDefault: 'Something went wrong. Please try again or contact us directly.',
      btnLoading: 'Submitting…',
      termsError: 'Please accept the terms and conditions to continue.',
      fvRequired: 'Please fill in this field.',
      fvEmail: 'Please enter a valid email address.',
      fvDate: 'Please choose a date.',
      fvTerms: 'Please accept the terms and conditions to continue.',
      fvSelect: 'Please make a choice.',
      fvHeight: 'Enter a height in centimetres, for example 170.',
      fvPartnerChoice: 'Please tell us whether you\'re coming alone or with a partner.',
      fvBirthYear: 'Enter your year of birth, for example 1985.',
      // Notify mode — shown when no free trial dates are scheduled
      notifyLead: 'Our free trial lessons take place in January and September, just before the start of each 14-week course cycle. Leave your details below and we\'ll let you know as soon as the next dates are announced.',
      notifyBanner: 'There are currently no free trial lessons planned. Leave your details and we\'ll notify you as soon as new dates are announced.',
      notifyFormTitle: 'Keep me informed',
      notifyFormSubtitle: 'We\'ll email you as soon as the next free trial dates are scheduled.',
      notifySubmit: 'Notify me of next dates',
      notifyFormNote: 'No commitment — you\'ll only hear from us when new free trials are announced.',
      notifyEmailRequired: 'Please enter your name and email so we can reach you.',
      notifySuccessTitle: 'You\'re on the list!',
      notifySuccessMessage: 'We\'ll email you as soon as the next free trial dates are announced.',
      // Notify mode books nothing at all — there is no reservation yet to
      // confirm or withhold, only a heads-up about how the pairing works.
      notifySuccessSoloNote: 'Tango is danced in couples, and you told us you don\'t have a partner yet. That\'s no problem — when the next dates are announced we\'ll look for a match for you, based on age and height. It helps a lot if you ask around among friends, family or colleagues in the meantime.',
      // No email is sent by the notify-me endpoint, so this promises the next
      // announcement rather than a confirmation that never arrives.
      notifyEmailNote: 'We\'ll email the next dates to',
      notifyMessagePrefix: '[Free trial — notify me] Would like to be notified when the next free trial dates are scheduled.',
      notifyCheckbox: 'I can\'t make any of these dates — keep me informed about future lessons',
      notifyMessagePrefixWithDates: '[Free trial — none of these dates work] Cannot make any of the scheduled dates, would like to be notified of future free trial dates.',
    },
    FR: {
      loading: 'Chargement des dates disponibles…',
      noSlots: 'Aucune date d\'essai gratuit n\'est programmée pour le moment.',
      apiError: 'Impossible de charger les dates. Veuillez nous contacter directement.',
      spotsOk: (n) => `${n} places disponibles`,
      spotsLow: (n) => n === 1 ? '1 place restante !' : `${n} places restantes !`,
      spotsCritical: 'Presque complet !',
      selectPlaceholder: '-- Sélectionnez une date --',
      selectLoading: 'Chargement des dates disponibles…',
      selectNoSlots: 'Aucune date disponible',
      successTitle: 'Inscription Confirmée !',
      successMessage: 'Votre essai gratuit est réservé. À bientôt sur la piste de danse !',
      successMessagePartnerAdded: 'Nous avons mis à jour votre inscription : vous venez avec votre partenaire. À bientôt sur la piste de danse !',
      successTitleWaitlist: 'Vous êtes inscrit(e) !',
      successMessageWaitlist: [
        'Votre place au cours d\'essai est réservée — nous la gardons pour vous.',
        'Il reste un point à régler : le tango se danse à deux, et vous nous avez indiqué venir sans partenaire. Nous chercherons quelqu\'un dont l\'âge et la taille correspondent aux vôtres, et nous vous préviendrons dès que le duo sera formé.',
        'Trouver un binôme n\'est pas toujours rapide : n\'hésitez donc pas à demander autour de vous — un(e) ami(e), un(e) collègue, quelqu\'un de votre famille. Si vous trouvez quelqu\'un, dites-le-nous et nous vous inscrirons ensemble.',
      ],
      successEmailNote: 'Une confirmation a été envoyée à',
      successEmailNoteWaitlist: 'Les détails ont été envoyés à',
      successRefLabel: 'Référence',
      successDateLabel: 'Votre cours',
      errorDefault: 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement.',
      btnLoading: 'Envoi en cours…',
      termsError: 'Veuillez accepter les conditions générales pour continuer.',
      fvRequired: 'Veuillez remplir ce champ.',
      fvEmail: 'Veuillez saisir une adresse e-mail valide.',
      fvDate: 'Veuillez choisir une date.',
      fvTerms: 'Veuillez accepter les conditions générales pour continuer.',
      fvSelect: 'Veuillez faire un choix.',
      fvHeight: 'Indiquez une taille en centimètres, par exemple 170.',
      fvPartnerChoice: 'Indiquez si vous venez seul(e) ou avec un partenaire.',
      fvBirthYear: 'Indiquez votre année de naissance, par exemple 1985.',
      // Mode notification — affiché quand aucune date d'essai gratuit n'est programmée
      notifyLead: 'Nos cours d\'essai gratuits ont lieu en janvier et en septembre, juste avant le début de chaque cycle de 14 semaines. Laissez-nous vos coordonnées ci-dessous et nous vous préviendrons dès que les prochaines dates seront annoncées.',
      notifyBanner: 'Il n\'y a actuellement aucun cours d\'essai gratuit prévu. Laissez-nous vos coordonnées et nous vous préviendrons dès que de nouvelles dates seront annoncées.',
      notifyFormTitle: 'Tenez-moi informé(e)',
      notifyFormSubtitle: 'Nous vous enverrons un email dès que les prochaines dates d\'essai gratuit seront programmées.',
      notifySubmit: 'Prévenez-moi des prochaines dates',
      notifyFormNote: 'Sans engagement — vous n\'aurez de nouvelles que lorsque de nouveaux essais gratuits seront annoncés.',
      notifyEmailRequired: 'Veuillez renseigner votre nom et votre email pour que nous puissions vous contacter.',
      notifySuccessTitle: 'Vous êtes sur la liste !',
      notifySuccessMessage: 'Nous vous enverrons un email dès que les prochaines dates d\'essai gratuit seront annoncées.',
      notifySuccessSoloNote: 'Le tango se danse à deux, et vous nous avez indiqué ne pas encore avoir de partenaire. Ce n\'est pas un souci : dès l\'annonce des prochaines dates, nous chercherons un binôme pour vous, selon l\'âge et la taille. En attendant, cela aide beaucoup si vous demandez aussi autour de vous — amis, famille ou collègues.',
      notifyEmailNote: 'Nous enverrons les prochaines dates à',
      notifyMessagePrefix: '[Essai gratuit — me prévenir] Souhaite être prévenu(e) lorsque les prochaines dates d\'essai gratuit seront programmées.',
      notifyCheckbox: 'Aucune de ces dates ne me convient — tenez-moi informé(e) des prochains cours',
      notifyMessagePrefixWithDates: '[Essai gratuit — aucune date ne convient] Ne peut se rendre à aucune des dates prévues, souhaite être prévenu(e) des prochaines dates.',
    },
    NL: {
      loading: 'Beschikbare data laden…',
      noSlots: 'Er zijn momenteel geen gratis proeflesdata gepland.',
      apiError: 'Kon geen beschikbare data laden. Neem rechtstreeks contact op.',
      spotsOk: (n) => `${n} plaatsen beschikbaar`,
      spotsLow: (n) => n === 1 ? '1 plek over!' : `${n} plekken over!`,
      spotsCritical: 'Bijna vol!',
      selectPlaceholder: '-- Selecteer een datum --',
      selectLoading: 'Beschikbare data laden…',
      selectNoSlots: 'Geen beschikbare data',
      successTitle: 'Inschrijving Bevestigd!',
      successMessage: 'Je gratis proefles is geboekt. Tot snel op de dansvloer!',
      successMessagePartnerAdded: 'We hebben je inschrijving bijgewerkt — je komt samen met je partner. Tot snel op de dansvloer!',
      successTitleWaitlist: 'Je bent ingeschreven!',
      successMessageWaitlist: [
        'Je plek in deze gratis proefles is gereserveerd — we houden ze voor je vrij.',
        'Eén ding staat nog open: tango dans je met z\'n tweeën, en je gaf aan zonder partner te komen. We zoeken iemand die qua leeftijd en lengte bij je past, en laten het je weten zodra jullie gekoppeld zijn.',
        'Een match vinden lukt niet altijd meteen, dus vraag gerust ook eens rond — een vriend, een collega, iemand uit de familie. Vind je iemand? Laat het ons weten, dan zetten we jullie samen.',
      ],
      successEmailNote: 'Een bevestiging is verzonden naar',
      successEmailNoteWaitlist: 'De details zijn verzonden naar',
      successRefLabel: 'Referentie',
      successDateLabel: 'Je les',
      errorDefault: 'Er is iets misgegaan. Probeer opnieuw of contacteer ons rechtstreeks.',
      btnLoading: 'Verzenden…',
      termsError: 'Gelieve de algemene voorwaarden te aanvaarden om verder te gaan.',
      fvRequired: 'Vul dit veld in.',
      fvEmail: 'Vul een geldig e-mailadres in.',
      fvDate: 'Kies een datum.',
      fvTerms: 'Gelieve de algemene voorwaarden te aanvaarden om verder te gaan.',
      fvSelect: 'Maak een keuze.',
      fvHeight: 'Vul een lengte in centimeters in, bijvoorbeeld 170.',
      fvPartnerChoice: 'Geef aan of je alleen komt of met een partner.',
      fvBirthYear: 'Vul je geboortejaar in, bijvoorbeeld 1985.',
      // Notificatiemodus — zichtbaar wanneer er geen gratis proeflessen gepland zijn
      notifyLead: 'Onze gratis proeflessen vinden plaats in januari en september, net voor de start van elke lescyclus van 14 weken. Laat hieronder je gegevens achter en we laten het je weten zodra de volgende data bekend zijn.',
      notifyBanner: 'Er zijn momenteel geen gratis proeflessen gepland. Laat je gegevens achter en we laten het je weten zodra er nieuwe data aangekondigd worden.',
      notifyFormTitle: 'Hou me op de hoogte',
      notifyFormSubtitle: 'We sturen je een mail zodra de volgende gratis proeflesdata gepland zijn.',
      notifySubmit: 'Breng me op de hoogte',
      notifyFormNote: 'Geen verplichtingen — je hoort alleen van ons wanneer er nieuwe proeflessen aangekondigd worden.',
      notifyEmailRequired: 'Vul je naam en e-mailadres in zodat we je kunnen bereiken.',
      notifySuccessTitle: 'Je staat op de lijst!',
      notifySuccessMessage: 'We sturen je een mail zodra de volgende gratis proeflesdata aangekondigd worden.',
      notifySuccessSoloNote: 'Tango dans je met z\'n tweeën, en je gaf aan nog geen danspartner te hebben. Geen probleem: zodra de volgende data bekend zijn, zoeken we een match voor je op basis van leeftijd en lengte. Het helpt enorm als je ondertussen ook eens rondvraagt bij vrienden, familie of collega\'s.',
      notifyEmailNote: 'We sturen de volgende data naar',
      notifyMessagePrefix: '[Gratis proefles — breng me op de hoogte] Wenst op de hoogte gebracht te worden wanneer de volgende gratis proeflesdata gepland zijn.',
      notifyCheckbox: 'Geen van deze data past mij — hou me op de hoogte van toekomstige lessen',
      notifyMessagePrefixWithDates: '[Gratis proefles — geen datum past] Kan niet op de geplande data, wenst op de hoogte gebracht te worden van toekomstige proeflessen.',
    },
  };

  // ========================
  // HELPERS
  // ========================

  function locStr(val, lang) {
    if (val && typeof val === 'object') return val[lang.toLowerCase()] || val.en || Object.values(val)[0] || '';
    return val || '';
  }

  function getLang() {
    const form = document.getElementById('free-trial-form');
    if (form) {
      const lang = (form.getAttribute('data-language') || '').toUpperCase();
      if (T[lang]) return lang;
    }
    const htmlLang = document.documentElement.lang || '';
    if (htmlLang.startsWith('fr')) return 'FR';
    if (htmlLang.startsWith('nl')) return 'NL';
    return 'EN';
  }

  function formatDate(dateStr, lang) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const localeMap = { EN: 'en-GB', FR: 'fr-FR', NL: 'nl-NL' };
    const out = date.toLocaleDateString(localeMap[lang] || 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    // FR and NL lowercase both weekday and month names. Only the first word
    // starts the string, so capitalise exactly that — `text-transform:
    // capitalize` on .ft-trial-date used to capitalise the month too
    // ("Vendredi 4 Septembre 2026"), which is wrong in both languages.
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  function formatShortDate(dateStr, lang) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const localeMap = { EN: 'en-GB', FR: 'fr-FR', NL: 'nl-NL' };
    return date.toLocaleDateString(localeMap[lang] || 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function groupByLocation(trials) {
    const groups = {};
    trials.forEach((trial) => {
      const key = trial.location?.name || 'Unknown';
      if (!groups[key]) groups[key] = { info: trial.location, items: [] };
      groups[key].items.push(trial);
    });
    return groups;
  }

  // Default capacity per free trial when the backend hasn't set max_students.
  // Roughly 5 couples = 10 dancers.
  const DEFAULT_FT_CAPACITY = 10;

  // Resolve a meaningful "spots remaining" number from a trial payload.
  // The CRM currently returns spots_remaining=null / max_students=null for
  // free trials, so we fall back to DEFAULT_FT_CAPACITY - current_enrollment
  // instead of letting null coerce into the "almost full" bucket.
  function effectiveSpots(trial) {
    if (!trial) return 0;
    if (trial.is_full === true) return 0;
    if (typeof trial.spots_remaining === 'number') return trial.spots_remaining;
    const cap = (typeof trial.max_students === 'number' && trial.max_students > 0)
      ? trial.max_students
      : DEFAULT_FT_CAPACITY;
    const enrolled = typeof trial.current_enrollment === 'number' ? trial.current_enrollment : 0;
    return Math.max(0, cap - enrolled);
  }

  function spotsClass(n) {
    if (n <= 2) return 'ft-spots--critical';
    if (n <= 5) return 'ft-spots--low';
    return 'ft-spots--ok';
  }

  function spotsLabel(n, t) {
    if (n <= 2) return t.spotsCritical;
    if (n <= 5) return t.spotsLow(n);
    return t.spotsOk(n);
  }

  // ========================
  // SCHEDULE RENDERING
  // ========================

  function renderSkeleton(container) {
    container.innerHTML = `
      <div class="ft-skeleton-wrap">
        <div class="ft-skeleton ft-skeleton--header"></div>
        <div class="ft-skeleton ft-skeleton--card"></div>
        <div class="ft-skeleton ft-skeleton--card"></div>
        <div class="ft-skeleton ft-skeleton--card ft-skeleton--short"></div>
      </div>`;
  }

  function renderSchedule(container, trials, lang) {
    const t = T[lang];

    if (!trials.length) {
      container.innerHTML = `
        <div class="ft-empty-banner">
          <div class="ft-empty-banner__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="9" y1="14" x2="15" y2="20" stroke-linecap="round"/>
              <line x1="15" y1="14" x2="9" y2="20" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="ft-empty-banner__title">${t.noSlots}</p>
          <p class="ft-empty-banner__text">${t.notifyBanner}</p>
        </div>`;
      return;
    }

    const groups = groupByLocation(trials);
    let html = '<div class="ft-schedule">';

    Object.entries(groups).forEach(([locName, { info, items }]) => {
      html += `
        <div class="ft-location-block">
          <div class="ft-location-head">
            <svg class="ft-pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <div>
              <strong class="ft-loc-name">${locName}</strong>
              ${info?.building_name ? `<span class="ft-loc-building">${info.building_name}</span>` : ''}
              ${info?.address ? `<span class="ft-loc-address">${locStr(info.address, lang)}${info.city ? ', ' + locStr(info.city, lang) : ''}</span>` : ''}
            </div>
          </div>
          <div class="ft-trials-grid">`;

      items.forEach((trial, i) => {
        const n = effectiveSpots(trial);
        const cls = spotsClass(n);
        const lbl = spotsLabel(n, t);
        html += `
          <div class="ft-trial-card ft-trial-card--selectable" data-trial-id="${trial.id}" style="animation-delay:${i * 0.08}s" role="button" tabindex="0" aria-label="${formatDate(trial.start_date, lang)} ${trial.start_time}–${trial.end_time}">
            <div class="ft-trial-left">
              <span class="ft-trial-date">${formatDate(trial.start_date, lang)}</span>
              <span class="ft-trial-time">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                ${trial.start_time} – ${trial.end_time}
              </span>
            </div>
            <div class="ft-trial-right">
              <span class="ft-spots-badge ${cls}">
                <span class="ft-spots-dot"></span>
                ${lbl}
              </span>
            </div>
          </div>`;
      });

      html += `</div></div>`;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  function wireScheduleClicks(container, selectEl) {
    if (!selectEl) return;
    const formSection = document.getElementById('book-now') || document.getElementById('inscription');
    container.querySelectorAll('.ft-trial-card--selectable[data-trial-id]').forEach((card) => {
      const activate = () => {
        const trialId = card.getAttribute('data-trial-id');
        selectEl.value = trialId;
        selectEl.dispatchEvent(new Event('change'));
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  function renderScheduleError(container, lang) {
    container.innerHTML = `
      <div class="ft-empty ft-empty--error">
        <p>${T[lang].apiError}</p>
      </div>`;
  }

  // ========================
  // SELECT POPULATION
  // ========================

  function populateSelect(select, trials, lang) {
    const t = T[lang];
    select.innerHTML = '';

    if (!trials.length) {
      select.disabled = true;
      select.innerHTML = `<option value="">${t.selectNoSlots}</option>`;
      return;
    }

    select.disabled = false;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = t.selectPlaceholder;
    select.appendChild(placeholder);

    const groups = groupByLocation(trials);

    Object.entries(groups).forEach(([locName, { info, items }]) => {
      const og = document.createElement('optgroup');
      og.label = info?.building_name ? `${locName} – ${info.building_name}` : locName;

      items.forEach((trial) => {
        const opt = document.createElement('option');
        opt.value = trial.id;
        opt.textContent = `${formatShortDate(trial.start_date, lang)} · ${trial.start_time}–${trial.end_time}`;
        og.appendChild(opt);
      });

      select.appendChild(og);
    });
  }

  // ========================
  // PARTNER-MATCHING FIELDS (gender, birth year, height)
  // ========================

  /**
   * The CRM requires gender on every free-trial registration, and birth year
   * plus height from anyone booking WITHOUT a partner — the same conditional
   * the paid enrolment modal has always used, because those two exist so the
   * school can pair a solo registrant. Demanding them from a couple would
   * reject bookings over data nobody would use.
   *
   * Contract: docs/agent-free-form-fields-2026-08-26.md in betangocrm-laravel.
   */
  /**
   * The partner question has THREE states, not two: alone, with a partner, and
   * NOT YET ANSWERED — which is what every visitor sees first.
   *
   * This used to read the hidden `#partner` mirror select, whose selectedIndex
   * is 0 before anybody touches it. That made "not answered" indistinguishable
   * from "coming alone", so birth year and height were shown and marked
   * required on first load, in front of somebody who had not yet said they were
   * coming alone. Reported from the live FR page, 2026-08-27.
   *
   * The radios are the honest source: neither is checked until a card is
   * clicked, so "nothing chosen" has its own value here. Their ids are the same
   * on all three language pages; their `value` attributes are translated, so
   * matching on the value would break on two pages out of three.
   *
   * @returns {'alone'|'partner'|null}
   */
  function partnerChoice(form) {
    if (!form) return null;
    if (form.querySelector('#ft-radio-solo')?.checked) return 'alone';
    if (form.querySelector('#ft-radio-partner')?.checked) return 'partner';
    return null;
  }

  /**
   * Show or hide the two solo-only fields, and keep `required` in step.
   *
   * Both matter. BETangoValidate skips hidden controls, so hiding alone would
   * be enough for the message pass — but leaving `required` set on a hidden
   * input is the kind of thing that starts blocking submits the moment
   * somebody changes how the section is hidden.
   */
  function syncAloneFields(form) {
    if (!form) return;
    // Shown ONLY for an explicit "coming alone". Both of the other two states —
    // with a partner, and nothing chosen yet — leave these hidden and optional.
    const alone = partnerChoice(form) === 'alone';
    const wrap = form.querySelector('#ft-alone-fields');
    if (wrap) wrap.hidden = !alone;

    ['#ft-birth-year', '#ft-height'].forEach(function (sel) {
      const el = form.querySelector(sel);
      if (!el) return;
      el.required = alone;
      // A message left over from before the switch would point at a field
      // that is no longer being asked for — and once the field is hidden the
      // visitor cannot see, reach or clear that message.
      if (!alone && window.BETangoValidate) BETangoValidate.clearField(el);
    });
  }

  /**
   * Notify-me asks for none of this. POST /free-trial/notify-me is unchanged
   * and takes no gender, age or height, so the whole block is hidden rather
   * than left required on a form that will never send it.
   */
  function setMatchSectionVisible(form, visible) {
    if (!form) return;
    const sec = form.querySelector('#ft-match-section');
    if (sec) sec.hidden = !visible;

    const gender = form.querySelector('#ft-gender');
    if (gender) gender.required = visible;

    if (visible) syncAloneFields(form);
    else ['#ft-birth-year', '#ft-height'].forEach(function (sel) {
      const el = form.querySelector(sel);
      if (el) el.required = false;
    });
  }

  // ========================
  // NOTIFY MODE (no upcoming trials)
  // ========================

  /**
   * Rewrite the page UI into "keep me informed" mode when no free trial
   * dates are currently scheduled. The form stays submittable, but instead
   * of booking a specific lesson it collects the visitor's details so we
   * can reach out when the next January / September dates open up.
   */
  function enterNotifyMode(lang) {
    const t = T[lang];
    const form = document.getElementById('free-trial-form');
    if (!form) return;

    // 1) Update the schedule section's lead paragraph with Jan/Sep message
    const scheduleWrapper = document.querySelector('.ft-schedule-wrapper');
    if (scheduleWrapper) {
      const sub = scheduleWrapper.querySelector('.ft-section-sub');
      if (sub) sub.textContent = t.notifyLead;
      // The inner "Available trial classes" header is misleading here — hide it.
      const blockTitle = scheduleWrapper.querySelector('.ft-schedule-block-title');
      if (blockTitle) blockTitle.style.display = 'none';
    }

    // 2) Rewrite the form card header
    const formCard = form.closest('.ft-form-card') || form.parentElement;
    const formTitle = formCard?.querySelector('.ft-form-title');
    const formSubtitle = formCard?.querySelector('.ft-form-subtitle');
    if (formTitle) formTitle.textContent = t.notifyFormTitle;
    if (formSubtitle) formSubtitle.textContent = t.notifyFormSubtitle;

    // 3) Hide the "Your free class date" field entirely. Also drop `required`
    //    so the disabled select can't block submission.
    const selectEl = form.querySelector('#class-date');
    if (selectEl) {
      selectEl.required = false;
      selectEl.disabled = true;
      const field = selectEl.closest('.ft-form-field');
      if (field) field.style.display = 'none';
    }

    // 4) Swap submit button text (preserve the arrow SVG) and footer note
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      const svg = btn.querySelector('svg');
      btn.textContent = '';
      btn.appendChild(document.createTextNode(t.notifySubmit + ' '));
      if (svg) btn.appendChild(svg);
    }
    const note = formCard?.querySelector('.ft-form-note');
    if (note) note.textContent = t.notifyFormNote;

    // 5) Flag mode so the submit handler takes the notify branch
    form.dataset.mode = 'notify';
    setMatchSectionVisible(form, false);
  }

  /**
   * Enter notify mode when there ARE dates available but user picked
   * "none of these dates work". The date select stays visible but locked
   * on the notify option. The form header & submit text change.
   */
  function enterNotifyModeWithDates(lang) {
    const t = T[lang];
    const form = document.getElementById('free-trial-form');
    if (!form) return;

    // Disable the date select — it's irrelevant when user can't make any date
    const selectEl = form.querySelector('#class-date');
    if (selectEl) {
      selectEl.required = false;
      selectEl.disabled = true;
      selectEl.value = '';
    }

    // Rewrite the form card header
    const formCard = form.closest('.ft-form-card') || form.parentElement;
    const formTitle = formCard?.querySelector('.ft-form-title');
    const formSubtitle = formCard?.querySelector('.ft-form-subtitle');
    if (formTitle) formTitle.textContent = t.notifyFormTitle;
    if (formSubtitle) formSubtitle.textContent = t.notifyFormSubtitle;

    // Swap submit button text
    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      const svg = btn.querySelector('svg');
      btn.textContent = '';
      btn.appendChild(document.createTextNode(t.notifySubmit + ' '));
      if (svg) btn.appendChild(svg);
    }
    const note = formCard?.querySelector('.ft-form-note');
    if (note) note.textContent = t.notifyFormNote;

    form.dataset.mode = 'notify';
    setMatchSectionVisible(form, false);
  }

  /**
   * Exit notify mode — restore the original form header & submit text
   * when user picks a real date again.
   */
  function exitNotifyMode(lang) {
    const form = document.getElementById('free-trial-form');
    if (!form) return;

    // Re-enable the date select
    const selectEl = form.querySelector('#class-date');
    if (selectEl) {
      selectEl.required = true;
      selectEl.disabled = false;
    }

    const formCard = form.closest('.ft-form-card') || form.parentElement;

    // Restore original texts from the HTML (hardcoded per lang)
    const originals = {
      EN: { title: 'Book Your Free Class', subtitle: 'We\'ll send you a confirmation within 24 hours.', submit: 'Confirm Registration', note: 'We\'ll confirm your free trial class within 24 hours.' },
      FR: { title: 'Réservez Votre Cours Gratuit', subtitle: 'Nous vous enverrons une confirmation dans les 24 heures.', submit: 'Confirmer mon inscription', note: 'Nous confirmerons votre cours d\'essai gratuit dans les 24 heures.' },
      NL: { title: 'Boek Je Gratis Les', subtitle: 'We sturen je een bevestiging binnen 24 uur.', submit: 'Bevestig je registratie', note: 'We bevestigen je gratis proefles binnen 24 uur.' },
    };
    const o = originals[lang] || originals.EN;

    const formTitle = formCard?.querySelector('.ft-form-title');
    const formSubtitle = formCard?.querySelector('.ft-form-subtitle');
    if (formTitle) formTitle.textContent = o.title;
    if (formSubtitle) formSubtitle.textContent = o.subtitle;

    const btn = form.querySelector('[type="submit"]');
    if (btn) {
      const svg = btn.querySelector('svg');
      btn.textContent = '';
      btn.appendChild(document.createTextNode(o.submit + ' '));
      if (svg) btn.appendChild(svg);
    }
    const note = formCard?.querySelector('.ft-form-note');
    if (note) note.textContent = o.note;

    delete form.dataset.mode;
    setMatchSectionVisible(form, true);
  }

  // #826 — after a submit the tall form is replaced by a short confirmation
  // card, so the page shrinks underneath the reader. On mobile they submit from
  // a scroll position well below where the card then lands, and the page looks
  // unchanged: the confirmation is off-screen ABOVE them and they have to scroll
  // up to find out the booking worked. Nothing else moves the viewport here, so
  // put the card just under the sticky .site-header ourselves.
  function scrollSuccessIntoView(wrap) {
    const card = wrap && wrap.querySelector('.ft-success');
    if (!card) return;
    const header = document.querySelector('.site-header');
    const offset = (header ? header.getBoundingClientRect().height : 0) + 16;
    const top = window.scrollY + card.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function showNotifySuccess(form, lang, hasPartner) {
    const t = T[lang];
    const wrap = form.closest('.form-container') || form.parentElement;
    const email = form.querySelector('#email')?.value || '';

    wrap.innerHTML = `
      <div class="ft-success">
        <div class="ft-success-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <h3 class="ft-success-title">${t.notifySuccessTitle}</h3>
        <p class="ft-success-msg">${t.notifySuccessMessage}</p>
        ${!hasPartner ? `<p class="ft-success-msg ft-success-solo-note">${t.notifySuccessSoloNote}</p>` : ''}
        ${email ? `<p class="ft-success-email">${t.notifyEmailNote} <strong>${email}</strong></p>` : ''}
      </div>`;
    scrollSuccessIntoView(wrap);
  }

  // ========================
  // SUCCESS CARD
  // ========================

  function showSuccess(form, responseData, selectedTrial, lang) {
    const t = T[lang];
    const wrap = form.closest('.form-container') || form.parentElement;
    const email = form.querySelector('#email')?.value || '';
    const enrollmentId = responseData?.data?.enrollment_id;
    // Partner-search copy applies in two backend cases:
    //   1. status === 'Waitlisted'  → class is fully booked
    //   2. partner_needed === true  → registered without a partner; status is
    //                                  CONFIRMED in the CRM (Singles tab) but
    //                                  the registrant still needs pairing, and
    //                                  gets the partner-search email
    // Both are booked; only the pairing is open. This flag is the single source
    // of truth for the title, the message AND the email note below — do not add
    // a second way of deciding which state the registration is in.
    const data = responseData?.data || {};
    const isWaitlisted = data.status === 'Waitlisted'
      || data.partner_needed === true
      || data.waitlisted === true;

    const dateStr = selectedTrial
      ? `${formatDate(selectedTrial.start_date, lang)}&nbsp;·&nbsp;${selectedTrial.start_time}–${selectedTrial.end_time}`
      : '';
    const locationStr = selectedTrial?.location?.name || '';

    const title = isWaitlisted ? t.successTitleWaitlist : t.successTitle;
    // partner_added: an existing solo booking was just upgraded to a couple.
    // Never reachable together with isWaitlisted — the CRM sends
    // partner_needed:false and status CONFIRMED on this branch — but the
    // waitlist copy is checked first regardless, so a full class still
    // wins over the upgrade note.
    const rawMessage = isWaitlisted
      ? t.successMessageWaitlist
      : (data.partner_added === true && t.successMessagePartnerAdded
          ? t.successMessagePartnerAdded
          : t.successMessage);
    const emailNote = isWaitlisted ? t.successEmailNoteWaitlist : t.successEmailNote;
    const paragraphs = Array.isArray(rawMessage) ? rawMessage : [rawMessage];
    const messageHtml = paragraphs
      .map((p) => `<p class="ft-success-msg">${p}</p>`)
      .join('');

    wrap.innerHTML = `
      <div class="ft-success">
        <div class="ft-success-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <h3 class="ft-success-title">${title}</h3>
        ${messageHtml}
        ${email ? `<p class="ft-success-email">${emailNote} <strong>${email}</strong></p>` : ''}
        <div class="ft-success-meta">
          ${dateStr ? `
          <div class="ft-success-row">
            <span class="ft-success-lbl">${t.successDateLabel}</span>
            <span class="ft-success-val">${dateStr}${locationStr ? '<br><em>' + locationStr + '</em>' : ''}</span>
          </div>` : ''}
          ${enrollmentId ? `
          <div class="ft-success-row">
            <span class="ft-success-lbl">${t.successRefLabel}</span>
            <span class="ft-success-val ft-success-ref">#${enrollmentId}</span>
          </div>` : ''}
        </div>
      </div>`;
    scrollSuccessIntoView(wrap);
  }

  // ========================
  // ERROR DISPLAY
  // ========================

  function showFormError(form, msg) {
    let el = form.querySelector('.ft-form-error');
    if (!el) {
      el = document.createElement('div');
      el.className = 'ft-form-error';
      const btn = form.querySelector('[type="submit"]');
      btn ? btn.before(el) : form.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ========================
  // INIT
  // ========================

  async function init() {
    const lang = getLang();
    const t = T[lang];

    if (!window.BETangoCRM?.api) {
      console.warn('[FreeTrial] CRM API client not ready');
      return;
    }

    const api = window.BETangoCRM.api;
    const scheduleEl = document.getElementById('free-trial-schedule');
    const selectEl = document.getElementById('class-date');
    const form = document.getElementById('free-trial-form');

    // Loading states
    if (scheduleEl) renderSkeleton(scheduleEl);
    if (selectEl) {
      selectEl.innerHTML = `<option value="">${t.selectLoading}</option>`;
      selectEl.disabled = true;
    }

    // Fetch
    let trials = [];

    // Attached BEFORE the await on purpose. This listener used to be registered
    // after the free-trials request resolved, which left the form with no handler
    // at all while that request was in flight: an early click fell through to a
    // native GET submit, reloading the page and throwing away what was typed.
    // The handler reads `trials` at submit time, so declaring it above is enough.
    // Set form-load timestamp for honeypot protection
    if (form) {
      var tsInput = form.querySelector('[name="_ts"]');
      if (tsInput) tsInput.value = Math.floor(Date.now() / 1000);
    }

    // Keep the solo-only fields in step with the partner cards.
    //
    // A DELEGATED CLICK LISTENER, not a `change` listener on the radios: the
    // page's own inline script selects a card by assigning `radio.checked =
    // true`, and a programmatic assignment fires no change event. Clicks do
    // bubble, so this runs right after that script and sees the new state.
    if (form) {
      form.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.ft-partner-card')) syncAloneFields(form);
      });
      // Belt and braces for anything that sets the mirror select directly.
      const partnerSelect = form.querySelector('#partner');
      if (partnerSelect) partnerSelect.addEventListener('change', function () { syncAloneFields(form); });

      // The birth-year ceiling is set here rather than written into the three
      // static pages: a year hardcoded into HTML is a ceiling nobody
      // remembers to move. The CRM's rule is `max:date('Y')`, and this tracks
      // it. (The old paid-form ceiling was a frozen `max="2010"` — a silent
      // "no under-16s" that would have refused a teenager outright.)
      const yearInput = form.querySelector('#ft-birth-year');
      if (yearInput) yearInput.max = String(new Date().getFullYear());

      // Starting state: neither card is selected, so this hides the solo-only
      // fields and drops their `required`. They appear when — and only when —
      // somebody picks "coming alone".
      syncAloneFields(form);
    }

    // Form submission. Guarded rather than an early `return`: this now runs before
    // the fetch below, and a bare return would skip rendering the schedule entirely.
    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn?.textContent || '';

      // Hide previous error
      const prevErr = form.querySelector('.ft-form-error');
      if (prevErr) prevErr.hidden = true;

      // Every required field reports itself, inline and in the page's language.
      // This form carries `novalidate`, so nothing validates it unless we do:
      // before this existed, an empty form either did nothing at all or posted
      // and came back as a raw "HTTP 422:".
      // Marketing consent is deliberately absent from this pass — it is optional
      // by design, and gating the booking on it would mean it was not freely given.
      if (window.BETangoValidate) {
        BETangoValidate.clear(form);
        const problems = BETangoValidate.check(form, {
          required: t.fvRequired,
          email:    t.fvEmail,
          select:   t.fvDate,
          checkbox: t.fvTerms,
        });

        // The gender select is not the date select, so it must not inherit
        // "Please choose a date." as its message.
        const genderEl = form.querySelector('#ft-gender');
        problems.forEach(function (pr) {
          if (pr.el === genderEl) pr.message = t.fvSelect;
        });

        // Height and birth year need a shape check the generic pass cannot
        // make — it only knows empty or not. Skip a field already flagged as
        // empty, so nobody gets two messages about one box.
        const heightEl = form.querySelector('#ft-height');
        const typedHeight = heightEl ? heightEl.value.trim() : '';
        if (heightEl && typedHeight && !heightEl.closest('[hidden]')
            && BETangoValidate.parseHeightCm(typedHeight) === null
            && !problems.some(function (pr) { return pr.el === heightEl; })) {
          problems.push({ el: heightEl, message: t.fvHeight });
        }

        const yearEl = form.querySelector('#ft-birth-year');
        const typedYear = yearEl ? yearEl.value.trim() : '';
        if (yearEl && typedYear && !yearEl.closest('[hidden]')
            && !problems.some(function (pr) { return pr.el === yearEl; })) {
          const y = parseInt(typedYear, 10);
          // Same window as the CRM: 1920 to this year.
          if (!(y >= 1920 && y <= new Date().getFullYear())) {
            problems.push({ el: yearEl, message: t.fvBirthYear });
          }
        }

        if (problems.length) {
          BETangoValidate.show(form, problems);
          return;
        }
      }

      // Common fields
      const firstName = form.querySelector('#first-name')?.value?.trim() || '';
      const lastName  = form.querySelector('#last-name')?.value?.trim() || '';
      const email     = form.querySelector('#email')?.value?.trim() || '';
      const phone     = form.querySelector('#phone')?.value?.trim() || null;
      const userNote  = form.querySelector('#message')?.value?.trim() || '';

      // Detect partner from the radios, not from the mirror select: the select
      // reports "coming alone" before anybody has answered, and posting
      // has_partner:false with no birth year or height is exactly the request
      // the CRM refuses with a 422 the visitor can do nothing about.
      const choice = partnerChoice(form);
      const hasPartner = choice === 'partner';

      // A booking must answer the question. Notify-me must NOT have to: that
      // endpoint takes none of these fields, and gating "tell me when a slot
      // opens" on a partner choice would close the path outright.
      if (choice === null && form.dataset.mode !== 'notify') {
        showFormError(form, t.fvPartnerChoice);
        const cards = form.querySelector('.ft-partner-cards');
        if (cards) cards.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Partner-matching fields. Gender is asked of everybody; birth year and
      // height only of someone booking alone, so they are read as null when a
      // partner is coming and the inputs are hidden. Wire names are fixed by
      // the CRM: contact.gender, contact.birth_year, contact.height.
      const gender = form.querySelector('#ft-gender')?.value || null;
      const birthYearRaw = !hasPartner ? (form.querySelector('#ft-birth-year')?.value || '') : '';
      const birthYear = birthYearRaw ? parseInt(birthYearRaw, 10) : null;
      // Sent exactly as typed. App\Support\Height on the CRM side reads
      // "1,70", "1m70" and "170cm" alike, so normalising here would only add a
      // second place for the two to disagree.
      const height = !hasPartner ? (form.querySelector('#ft-height')?.value?.trim() || null) : null;

      // ----- NOTIFY MODE: no upcoming trials, user wants to be kept informed -----
      if (form.dataset.mode === 'notify') {
        if (!firstName || !lastName || !email) {
          showFormError(form, t.notifyEmailRequired);
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = t.btnLoading;
        }

        // Use the "with dates" variant when trials exist but none work for the user
        // Use the "with dates" variant when trials exist but none work for the user
        const notifyCb = form.querySelector('input[name="notify-me"]');
        const prefix = (notifyCb?.checked && trials.length)
          ? t.notifyMessagePrefixWithDates
          : t.notifyMessagePrefix;
        const msgParts = [prefix];
        msgParts.push(hasPartner ? '(with partner)' : '(coming alone)');
        if (userNote) msgParts.push('\n---\n' + userNote);

        const contactPayload = {
          first_name: firstName,
          last_name:  lastName,
          email:      email,
          phone:      phone,
          // Use the existing `free_trial` topic enum; the "notify me" intent
          // is encoded in the message body (notifyMessagePrefix).
          topic:      'free_trial',
          message:    msgParts.join(' '),
          lang:       lang,
          _honey: (form.querySelector('[name="_honey"]') || { value: '' }).value,
          _ts:    parseInt((form.querySelector('[name="_ts"]') || { value: '0' }).value, 10),
        };

        try {
          await api.submitContactForm(contactPayload);
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'free_trial_notify' });
          showNotifySuccess(form, lang, hasPartner);
        } catch (err) {
          console.error('[FreeTrial] Notify signup error:', err);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
          showFormError(form, friendlyError(err, t));
        }
        return;
      }

      // ----- BOOKING MODE: register for a specific free trial date -----
      const productId = parseInt(selectEl?.value);
      const selectedTrial = trials.find((tr) => tr.id === productId) || null;

      if (!productId) {
        // Was a bare `return` — the button simply did nothing, with no clue why.
        if (selectEl && window.BETangoValidate) {
          BETangoValidate.show(form, [{ el: selectEl, message: t.fvDate }]);
        } else {
          showFormError(form, t.fvDate);
        }
        return;
      }

      // Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t.btnLoading;
      }

      const payload = {
        contact: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          language: lang,
          gender: gender,
          birth_year: birthYear,
          height: height,
        },
        product_id: productId,
        has_partner: hasPartner,
        remarks: userNote || null,
        // Kept separate on purpose: terms_accepted gates the booking,
        // marketing_consent is the optional opt-in the CRM logs as GDPR consent.
        terms_accepted: true,
        marketing_consent: !!(form.querySelector('input[name="marketing_consent"]') || {}).checked,
        // Where this visit came from, captured on the landing page by
        // attribution.js. Optional on the backend and guarded here, so a page
        // that never loaded the module still submits fine.
        attribution: (window.BETangoAttribution && window.BETangoAttribution.get()) || null,
        _honey: (form.querySelector('[name="_honey"]') || { value: '' }).value,
        _ts:    parseInt((form.querySelector('[name="_ts"]') || { value: '0' }).value, 10),
      };

      try {
        const res = await api.registerFreeTrial(payload);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'free_trial_signup',
          enrollment_id: (res && res.data && res.data.enrollment_id) || undefined
        });
        showSuccess(form, res, selectedTrial, lang);
      } catch (err) {
        console.error('[FreeTrial] Registration error:', err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        showFormError(form, friendlyError(err, t));
      }
    });

    try {
      const res = await api.getAvailableFreeTrials();
      // API may return array directly or wrapped in .data
      trials = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

      if (scheduleEl) {
        renderSchedule(scheduleEl, trials, lang);
        wireScheduleClicks(scheduleEl, selectEl);
      }
      if (selectEl) {
        populateSelect(selectEl, trials, lang);

        // Add "can't make any date" checkbox below the date field
        if (trials.length) {
          const dateField = selectEl.closest('.ft-form-field');
          if (dateField) {
            const notifyWrap = document.createElement('label');
            notifyWrap.className = 'ft-notify-checkbox';
            notifyWrap.innerHTML = `<input type="checkbox" name="notify-me"> <span>${t.notifyCheckbox}</span>`;
            dateField.after(notifyWrap);

            const cb = notifyWrap.querySelector('input');
            cb.addEventListener('change', () => {
              if (cb.checked) {
                enterNotifyModeWithDates(lang);
              } else {
                exitNotifyMode(lang);
              }
            });
          }
        }
      }

      // Switch the page into "keep me informed" mode when there are no
      // upcoming free trial dates. The form stays submittable but collects
      // contacts for the next January / September cycle.
      if (!trials.length) enterNotifyMode(lang);
    } catch (err) {
      console.error('[FreeTrial] Failed to fetch free trials:', err);
      if (scheduleEl) renderScheduleError(scheduleEl, lang);
      if (selectEl) {
        selectEl.innerHTML = `<option value="">${t.selectNoSlots}</option>`;
        selectEl.disabled = true;
      }
    }

  }

  // A failed request must never show the visitor a raw status line. crm-api.js
  // builds messages like "HTTP 422:" when the response carries no body, which
  // is exactly what an empty form used to produce.
  function friendlyError(err, t) {
    const msg = (err && err.message ? String(err.message) : '').trim();
    if (!msg || /^HTTP\s*\d+\s*:?\s*$/i.test(msg)) return t.errorDefault;
    return msg;
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
