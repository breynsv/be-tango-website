/**
 * BE-TANGO Enrollment Modal
 *
 * Opens a modal when a .btn-sign-up button is clicked and routes the
 * visitor to the student portal to book the class — the modal itself
 * no longer collects contact details or submits an enrollment; paid
 * enrollment now happens in the portal, where the person is authenticated.
 */

(function () {
  'use strict';

  // ========================
  // TRANSLATIONS
  // ========================
  const T = {
    EN: {
      modalTitle: 'Book This Class',
      // Booking now happens in the student portal — this modal only routes
      // people there. Kept: the class-detail chips and the payment-return
      // acknowledgement banner (checkPaymentReturn), which still applies to
      // anyone arriving with a stale ?be_payment_return=1 link.
      routerLead: 'Booking a class happens in your student portal.',
      routerStudentBtn: 'I\'m already a student',
      routerStudentSub: 'Sign in to book this class',
      routerNewBtn: 'I\'m new here',
      routerNewSub: 'Create your free portal account',
      paymentReturn: 'Payment received — thank you! A confirmation email is on its way.',
    },
    FR: {
      modalTitle: 'Réservez ce cours',
      routerLead: 'La réservation d\'un cours se fait depuis votre portail élève.',
      routerStudentBtn: 'Je suis déjà élève',
      routerStudentSub: 'Connectez-vous pour réserver ce cours',
      routerNewBtn: 'Je suis nouveau/nouvelle ici',
      routerNewSub: 'Créez votre compte portail gratuit',
      paymentReturn: 'Paiement reçu — merci ! Un e-mail de confirmation est en route.',
    },
    NL: {
      modalTitle: 'Boek deze les',
      routerLead: 'Een les boeken doe je via je studentenportaal.',
      routerStudentBtn: 'Ik ben al leerling',
      routerStudentSub: 'Log in om deze les te boeken',
      routerNewBtn: 'Ik ben hier nieuw',
      routerNewSub: 'Maak je gratis portaalaccount aan',
      paymentReturn: 'Betaling ontvangen — bedankt! Een bevestigingsmail is onderweg.',
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

  // ========================
  // MODAL HTML
  // ========================

  function buildModalHtml(t) {
    return `
<div class="em-overlay" id="em-overlay" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="em-title">
  <div class="em-dialog">

    <div class="em-accent-bar"></div>

    <button class="em-close" id="em-close" aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
    </button>

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

    <!-- ROUTER VIEW — booking now happens in the student portal; this modal
         only routes people there (see wireRouterLinks / openModal). -->
    <div id="em-router-view">
      <p class="em-router-lead">${t.routerLead}</p>

      <div class="em-router-choices">
        <a class="em-router-choice" id="em-router-student" href="#">
          <span class="em-router-choice-label">${t.routerStudentBtn}</span>
          <span class="em-router-choice-sub">${t.routerStudentSub}</span>
        </a>
        <a class="em-router-choice" id="em-router-new" href="#">
          <span class="em-router-choice-label">${t.routerNewBtn}</span>
          <span class="em-router-choice-sub">${t.routerNewSub}</span>
        </a>
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

  // No CRM API dependency here on purpose: the router renders two static
  // links and makes no API calls, so it must open even when crm-api.js
  // failed to load or the CRM is down — that is exactly when routing
  // people to the portal matters most.
  function init() {
    if (modalInjected) return;

    const t = getT();
    document.body.insertAdjacentHTML('beforeend', buildModalHtml(t));

    modalInjected = true;

    // Wire close button & backdrop
    document.getElementById('em-close').addEventListener('click', closeModal);
    document.getElementById('em-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

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

  // Build the portal login/signup URLs for the class being booked and point
  // the two router links at them. `next` is read and sanitised server-side
  // by the portal (see the CRM's login/signup routes) — it only ever needs
  // to be a portal-relative path here.
  function wireRouterLinks(productId) {
    var portalBase = (window.API_CONFIG && window.API_CONFIG.portalURL) || '/portal';
    // Guard against a bad/missing product id producing "/portal/browse/undefined" —
    // fall back to the browse root rather than emit a broken next path.
    var next = productId ? ('/portal/browse/' + productId) : '/portal/browse';
    var nextParam = encodeURIComponent(next);
    var studentLink = document.getElementById('em-router-student');
    var newLink = document.getElementById('em-router-new');
    if (studentLink) studentLink.href = portalBase + '/login?next=' + nextParam;
    if (newLink) newLink.href = portalBase + '/signup?next=' + nextParam;
  }

  function openModal(productId, className, price, location, time) {
    currentProductId = productId;

    // Render class info chips
    renderChips(className, price, location, time);
    wireRouterLinks(productId);

    // Show overlay
    const overlay = document.getElementById('em-overlay');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the first router choice
    setTimeout(function () {
      const first = document.getElementById('em-router-student');
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
