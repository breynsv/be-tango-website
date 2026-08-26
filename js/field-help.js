/**
 * BE-TANGO Field Help — the small "?" beside gender, age and height.
 *
 * One component, used six times (three fields x two forms). It answers a
 * question people actually ask when a form suddenly demands personal details:
 * why do you need this?
 *
 * WHY IT IS NOT A `title=""` ATTRIBUTE
 * A native tooltip never appears on a phone, cannot be reached by keyboard,
 * and is not announced by a screen reader. Most of these forms are filled in
 * on a phone, so a hover-only affordance would be invisible to the majority
 * of the people it exists for.
 *
 * BEHAVIOUR
 *   - Pointer devices: hover opens it, leaving closes it.
 *   - Everywhere, including touch: click/tap PINS it open. It stays open until
 *     the person taps the "?" again, taps outside, or presses Escape. That is
 *     the whole reason a tap is handled separately from a hover — on touch a
 *     "hover" is synthesised and immediately lost, so an unpinned panel would
 *     flash and vanish.
 *   - Keyboard: the "?" is a real <button>, so it is in the tab order and
 *     Enter/Space activate it. `aria-expanded` tracks state and
 *     `aria-describedby` points a screen reader at the panel text.
 *
 * LAYOUT
 * The panel is position:absolute, so opening it never reflows the form. Its
 * width is capped at min(17rem, calc(100vw - 2rem)) and it is nudged back
 * inside the viewport after opening, so it cannot cause a horizontal scrollbar
 * on a narrow screen.
 *
 * STYLES ARE INJECTED FROM HERE ON PURPOSE. The two forms live in two
 * different stylesheets (css/free-trial.css and css/enrollment-modal.css), and
 * this component is shared. Shipping the CSS with the JS keeps one source of
 * truth and means the component can never be half-deployed — a stylesheet that
 * was not re-minified or whose ?v= was not bumped cannot leave the "?" unstyled.
 *
 * COPY: lifted verbatim from the CRM so the website and the CRM say the same
 * thing — docs/agent-free-form-fields-2026-08-26.md in betangocrm-laravel.
 * It states what the data is used for and stops there. It deliberately makes
 * no promise about sharing; that belongs in the privacy policy, where it can
 * be precise.
 */
(function () {
  'use strict';

  var COPY = {
    EN: {
      label:  'Why are we asking this?',
      gender: 'Tango is danced in couples, so a class needs a balance of leaders and followers. We use this to place you in the right class and, if you book alone, to look for a partner.',
      age:    'If you book without a partner, we look for someone in a similar age range. We also use it to suggest a class that suits you.',
      height: 'Dancing is more comfortable with a partner of a similar height, so we use this to match you if you book alone.',
    },
    FR: {
      label:  'Pourquoi vous demandons-nous cela ?',
      gender: 'Le tango se danse en couple : un cours a donc besoin d’un équilibre entre guideurs et suiveurs. Nous utilisons cette information pour vous placer dans le bon cours et, si vous vous inscrivez seul, pour vous chercher un ou une partenaire.',
      age:    'Si vous vous inscrivez sans partenaire, nous cherchons quelqu’un d’une tranche d’âge similaire. Cela nous aide aussi à vous proposer un cours adapté.',
      height: 'Danser est plus confortable avec un ou une partenaire de taille similaire ; nous utilisons donc cette information pour vous trouver quelqu’un si vous vous inscrivez seul.',
    },
    NL: {
      label:  'Waarom vragen we dit?',
      gender: 'Tango dans je in paren, dus een les heeft een balans nodig tussen leiders en volgers. We gebruiken dit om je in de juiste les te plaatsen en, als je alleen boekt, om een partner voor je te zoeken.',
      age:    'Als je zonder partner boekt, zoeken we iemand van ongeveer dezelfde leeftijd. Het helpt ons ook om een passende les voor te stellen.',
      height: 'Dansen gaat prettiger met een partner van ongeveer dezelfde lengte, dus gebruiken we dit om je te matchen als je alleen boekt.',
    },
  };

  var CSS = [
    '.fh{position:relative;display:inline-block;vertical-align:middle;line-height:0;margin-left:.35em}',
    // EVERY SELECTOR HERE IS `.fh .fh-btn`, NOT `.fh-btn`, AND THAT IS LOAD-BEARING.
    // styles.css gives every `button:not([hidden])` on the site
    // `min-height:44px;min-width:44px;padding:12px 20px` below 768px. That is
    // specificity (0,1,1) and would beat a bare `.fh-btn` at (0,1,0), turning
    // this 18px dot into a fat 44px circle on exactly the screens most people
    // use. `.fh .fh-btn` is (0,2,0) and wins. The 44px tap target is still
    // honoured — by the ::before below, which costs no visual weight.
    '.fh .fh-btn{appearance:none;-webkit-appearance:none;display:inline-flex;align-items:center;justify-content:center;',
    'width:18px;height:18px;min-width:18px;min-height:18px;padding:0;',
    'border-radius:50%;border:1px solid currentColor;background:transparent;',
    'color:inherit;opacity:.65;cursor:pointer;position:relative;',
    'font-family:inherit;font-size:11px;font-weight:600;line-height:1;',
    'text-transform:none;letter-spacing:0}',
    '.fh .fh-btn:hover,.fh .fh-btn:focus-visible{opacity:1}',
    '.fh .fh-btn:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    // The visible dot is 18px but the tappable area is 44px, the accessible
    // minimum. Without this the "?" is a coin-flip to hit with a thumb.
    '.fh .fh-btn::before{content:"";position:absolute;top:50%;left:50%;width:44px;height:44px;transform:translate(-50%,-50%)}',
    '.fh .fh-panel{position:absolute;top:calc(100% + 8px);left:0;z-index:60;',
    'width:max-content;max-width:min(17rem,calc(100vw - 2rem));',
    'background:#111827;color:#F9FAFB;border-radius:8px;padding:10px 12px;',
    'font-family:inherit;font-size:13px;font-weight:400;line-height:1.45;',
    'text-transform:none;letter-spacing:0;text-align:left;',
    'box-shadow:0 8px 24px rgba(0,0,0,.28);white-space:normal}',
    '.fh .fh-panel[hidden]{display:none}',
    // The little arrow. Purely decorative; it is not repositioned when the
    // panel is nudged, so it is kept subtle enough that a few px of drift
    // reads as a shadow rather than as a mistake.
    '.fh .fh-panel::before{content:"";position:absolute;bottom:100%;left:6px;border:6px solid transparent;border-bottom-color:#111827}',
    '@media (prefers-reduced-motion:no-preference){.fh .fh-panel{animation:fh-in .12s ease-out}}',
    '@keyframes fh-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}',
  ].join('');

  var STYLE_ID = 'fh-styles';
  var seq = 0;
  var openEl = null;      // the .fh currently showing a panel
  var pinned = false;     // true when it was opened by click/tap

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // The page language, same convention as the rest of the site: <html lang>.
  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2).toUpperCase();
    return COPY[l] ? l : 'EN';
  }

  function textFor(topic) {
    var t = COPY[lang()];
    return t[topic] || '';
  }

  function labelFor() {
    return COPY[lang()].label;
  }

  /**
   * Turn `<span class="fh" data-fh="gender"></span>` into the real thing.
   * Safe to call repeatedly — anything already built is skipped.
   */
  function hydrate(root) {
    injectStyles();
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll('.fh[data-fh]:not([data-fh-ready])');

    Array.prototype.forEach.call(nodes, function (el) {
      var topic = el.getAttribute('data-fh');
      var body = textFor(topic);
      if (!body) return;

      var id = 'fh-panel-' + (++seq);

      var btn = document.createElement('button');
      btn.type = 'button';               // never submits the form it sits in
      btn.className = 'fh-btn';
      btn.setAttribute('aria-label', labelFor());
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-describedby', id);
      btn.textContent = '?';

      var panel = document.createElement('span');
      panel.className = 'fh-panel';
      panel.id = id;
      panel.setAttribute('role', 'tooltip');
      panel.hidden = true;
      panel.textContent = body;

      el.appendChild(btn);
      el.appendChild(panel);
      el.setAttribute('data-fh-ready', '');
    });
  }

  /**
   * Keep the panel inside the viewport.
   *
   * It is left-anchored by default, which is right almost everywhere, but a
   * "?" near the right edge of a narrow screen would push it off. Measure once
   * after showing and shift it back. Done in JS rather than CSS because the
   * amount depends on where the button happens to sit, and on whether it is
   * inside the modal's own scrolling dialog.
   */
  function reposition(panel) {
    panel.style.left = '0px';
    var r = panel.getBoundingClientRect();
    var margin = 8;
    var shift = 0;

    if (r.right > window.innerWidth - margin) shift = (window.innerWidth - margin) - r.right;
    if (r.left + shift < margin) shift = margin - r.left;

    if (shift) panel.style.left = shift + 'px';
  }

  function panelOf(el) { return el.querySelector('.fh-panel'); }
  function btnOf(el)   { return el.querySelector('.fh-btn'); }

  function open(el, isPinned) {
    if (openEl && openEl !== el) close();
    var panel = panelOf(el);
    var btn = btnOf(el);
    if (!panel || !btn) return;

    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    openEl = el;
    pinned = !!isPinned;
    reposition(panel);
  }

  function close() {
    if (!openEl) return;
    var panel = panelOf(openEl);
    var btn = btnOf(openEl);
    if (panel) { panel.hidden = true; panel.style.left = ''; }
    if (btn) btn.setAttribute('aria-expanded', 'false');
    openEl = null;
    pinned = false;
  }

  // Only true on a device that can genuinely hover. On touch this is false, so
  // the hover path never runs and tapping is the only way in — which is the
  // behaviour we want there anyway.
  function canHover() {
    return window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  // ONE set of delegated listeners on the document, not listeners per button.
  // The enrollment modal throws its markup away and rebuilds it every time it
  // opens, so per-button listeners would leak on every open.
  function wire() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.fh-btn') : null;

      if (btn) {
        // Inside a <form>, a stray click must never bubble into a label and
        // focus the control, nor submit anything.
        e.preventDefault();
        e.stopPropagation();
        var el = btn.closest('.fh');
        if (openEl === el && pinned) close();
        else open(el, true);
        return;
      }

      // A tap anywhere else dismisses it. Clicking inside the panel itself
      // does not, so the text can be selected and read.
      if (openEl && !e.target.closest('.fh')) close();
    }, true);

    document.addEventListener('mouseover', function (e) {
      if (!canHover()) return;
      var btn = e.target.closest ? e.target.closest('.fh-btn') : null;
      if (btn && !pinned) open(btn.closest('.fh'), false);
    });

    document.addEventListener('mouseout', function (e) {
      if (!canHover() || pinned || !openEl) return;
      var from = e.target.closest ? e.target.closest('.fh') : null;
      var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.fh') : null;
      if (from === openEl && to !== openEl) close();
    });

    // Focus opens it unpinned, so a keyboard user tabbing past sees the text
    // without having to press anything. Enter/Space then pin it, via click.
    document.addEventListener('focusin', function (e) {
      var btn = e.target.closest ? e.target.closest('.fh-btn') : null;
      if (btn) open(btn.closest('.fh'), false);
      else if (openEl && !pinned) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (!openEl) return;
      // Swallow it, so Escape closes the tooltip rather than the modal behind it.
      e.stopPropagation();
      var btn = btnOf(openEl);
      close();
      if (btn) btn.focus();
    }, true);

    // A panel measured before a scroll is in the wrong place after one.
    window.addEventListener('resize', function () { if (openEl) reposition(panelOf(openEl)); });
    window.addEventListener('scroll', function () { if (openEl) reposition(panelOf(openEl)); }, true);
  }

  // Safety net. hydrate() is called explicitly by both forms, but the modal
  // rebuilds its markup on every open and a missed call would silently ship a
  // form with no "?" at all — the failure would be invisible in a diff.
  function observe() {
    if (!window.MutationObserver || !document.body) return;
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        if (records[i].addedNodes.length) {
          if (document.querySelector('.fh[data-fh]:not([data-fh-ready])')) hydrate(document);
          return;
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    hydrate(document);
    wire();
    observe();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.BETangoFieldHelp = { hydrate: hydrate, copy: COPY, close: close };
})();
