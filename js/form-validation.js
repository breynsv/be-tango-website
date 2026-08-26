/**
 * BE-TANGO Form Validation
 *
 * Renders an inline message underneath each invalid control, in the page's own
 * language. Both booking forms carry `novalidate`, so the browser's native
 * bubbles are off — and they were the wrong tool anyway: a native bubble shows
 * one field at a time and speaks the BROWSER's language, not the page's, so a
 * Dutch visitor on an English browser was told "Please fill out this field".
 *
 * Callers own the wording. This module owns placement, focus and clearing.
 *
 *   var problems = BETangoValidate.check(form, {
 *     required: 'Dit veld is verplicht',
 *     email:    'Vul een geldig e-mailadres in',
 *     select:   'Maak een keuze',
 *     checkbox: 'Je moet dit aanvinken om verder te gaan',
 *   });
 *   if (problems.length) { BETangoValidate.show(form, problems); return; }
 *
 * Add your own entries to `problems` before calling show() to report anything
 * the generic pass cannot know about (phone shape, "alone or with a partner").
 *
 * This file previously held an auto-attaching validator that targeted
 * `.form-group` wrappers. Neither booking form has ever used that class, and no
 * page ever loaded the script — it could not have worked. Replaced wholesale.
 */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Forms get one delegated listener, not one per field: the modal rebuilds its
  // markup every time it opens, and per-field listeners would pile up with it.
  var wired = new WeakSet();

  function key(el) {
    return el.id || el.name || '';
  }

  // Hidden controls must never be reported. The modal keeps its alone/partner
  // panels in the DOM with `hidden`, and a message pointing at a field the
  // visitor cannot see is worse than no message at all.
  function isHidden(el) {
    return el.offsetWidth + el.offsetHeight === 0 || el.closest('[hidden]') !== null;
  }

  function errorNodeFor(el) {
    var form = el.form || el.closest('form');
    return form ? form.querySelector('.fv-error[data-error-for="' + key(el) + '"]') : null;
  }

  function clearField(el) {
    var node = errorNodeFor(el);
    if (node) node.remove();
    el.classList.remove('fv-invalid');
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
  }

  function clear(form) {
    if (!form) return;
    form.querySelectorAll('.fv-error').forEach(function (n) { n.remove(); });
    form.querySelectorAll('.fv-invalid').forEach(function (el) {
      el.classList.remove('fv-invalid');
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

  function wire(form) {
    if (wired.has(form)) return;
    wired.add(form);
    // Clearing as the visitor types is what makes the message read as guidance
    // rather than a verdict — it goes away the moment the field is fixed.
    var onEdit = function (e) {
      var el = e.target;
      if (el && el.classList && el.classList.contains('fv-invalid')) clearField(el);
    };
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);
  }

  function place(el, msg) {
    var id = 'fv-err-' + (key(el) || Math.random().toString(36).slice(2));
    var node = document.createElement('p');
    node.className = 'fv-error';
    node.id = id;
    node.setAttribute('data-error-for', key(el));
    node.setAttribute('role', 'alert');
    node.textContent = msg;

    // Field wrappers first, then consent labels (checkboxes sit inside their own
    // <label> with no wrapper), then a plain sibling as the last resort.
    var wrap = el.closest('.ft-form-field, .em-field, .ft-form-group');
    if (wrap) {
      wrap.appendChild(node);
    } else {
      var label = el.closest('label');
      if (label && label.parentNode) label.parentNode.insertBefore(node, label.nextSibling);
      else if (el.parentNode) el.parentNode.insertBefore(node, el.nextSibling);
      else return;
    }

    el.classList.add('fv-invalid');
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', id);
  }

  /**
   * Collect what is wrong, without touching the DOM.
   * Returns an array of {el, message} in DOM order.
   */
  function check(form, msgs) {
    if (!form) return [];
    msgs = msgs || {};
    var problems = [];

    form.querySelectorAll('[required]').forEach(function (el) {
      if (isHidden(el)) return;
      var tag = el.tagName.toLowerCase();

      if (el.type === 'checkbox') {
        if (!el.checked) problems.push({ el: el, message: msgs.checkbox || msgs.required });
        return;
      }
      if (tag === 'select') {
        if (!el.value) problems.push({ el: el, message: msgs.select || msgs.required });
        return;
      }
      if (!el.value.trim()) {
        problems.push({ el: el, message: msgs.required });
        return;
      }
      // Only worth checking the format once something is actually there.
      if (el.type === 'email' && !EMAIL_RE.test(el.value.trim())) {
        problems.push({ el: el, message: msgs.email || msgs.required });
      }
    });

    // Optional email fields (the partner's address) still have to be well-formed.
    form.querySelectorAll('input[type="email"]:not([required])').forEach(function (el) {
      if (isHidden(el) || !el.value.trim()) return;
      if (!EMAIL_RE.test(el.value.trim())) {
        problems.push({ el: el, message: msgs.email || msgs.required });
      }
    });

    return problems;
  }

  /**
   * Render the messages, then put the visitor on the first offending field.
   */
  function show(form, problems) {
    if (!form || !problems || !problems.length) return;
    wire(form);
    clear(form);
    problems.forEach(function (p) {
      if (p && p.el && p.message) place(p.el, p.message);
    });

    var first = problems[0].el;
    // Inside the modal the dialog scrolls, not the window; scrollIntoView is
    // unreliable in position:fixed overlays on Safari, so nudge the dialog itself.
    var dialog = first.closest('.em-dialog');
    if (dialog) {
      var top = first.getBoundingClientRect().top - dialog.getBoundingClientRect().top;
      dialog.scrollTo({ top: Math.max(0, dialog.scrollTop + top - 80), behavior: 'smooth' });
    } else {
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
  }

  /**
   * Read a typed height into whole centimetres, or null if it cannot be read.
   *
   * This mirrors App\Support\Height in the CRM, deliberately and case for case:
   * "170", "170cm", "170 cm", "172 CM", "1,70", "1.70 m", "1m70", "1 m 78",
   * 170 and 1.83 all resolve; "17", "1700", "1985", "tall", "0", "99" and
   * "251" do not.
   *
   * WHY IT IS DUPLICATED HERE rather than left to the server. The field is
   * required now, so a notation we refuse is a booking somebody loses. The
   * server is generous about format for exactly that reason — but its 422
   * message is translated into the TENANT's CRM locale, not the visitor's, so
   * a Dutch visitor typing something odd would be corrected in English.
   * Catching the format here lets us say it in the language of the page. The
   * server rule remains the authority; this is only a kinder first pass.
   *
   * Returns null both for "empty" and for "unreadable" — callers test for
   * emptiness themselves, because the two need different messages.
   */
  function parseHeightCm(raw) {
    if (raw === null || raw === undefined) return null;
    var s = String(raw).trim().toLowerCase();
    if (!s) return null;

    var cm = null;

    // "1m70", "1 m 78", "2m". A lone trailing digit is tens of centimetres —
    // "1m8" is 180, not 108 — which is how people actually write it.
    var m = s.match(/^(\d)\s*m\s*(\d{1,2})?$/);
    if (m) {
      var part = m[2] === undefined ? 0
        : (m[2].length === 1 ? parseInt(m[2], 10) * 10 : parseInt(m[2], 10));
      cm = parseInt(m[1], 10) * 100 + part;
    }

    if (cm === null) {
      // Metres only when the unit says so; "cm" must never be read as "m".
      var isMetres = /(^|[\s\d])(m|meters?|metres?)\s*$/.test(s) && !/centimet|cm/.test(s);
      var body = s
        .replace(/\s*(cm|centimeters?|centimetres?|m|meters?|metres?)\s*$/, '')
        .replace(',', '.')
        .trim();

      if (!/^\d+(\.\d+)?$/.test(body)) return null;

      var n = parseFloat(body);
      // Anything under 3 is metres whatever the unit said — nobody is 2cm
      // tall, so a bare "1.70" is unambiguous.
      cm = (isMetres || n < 3) ? Math.round(n * 100) : Math.round(n);
    }

    // A sanity range to catch a slipped keystroke, not a judgement about
    // anyone. Same bounds as the CRM, so a value accepted here is never
    // refused there.
    if (!isFinite(cm) || cm < 100 || cm > 250) return null;
    return cm;
  }

  window.BETangoValidate = {
    check: check,
    show: show,
    clear: clear,
    clearField: clearField,
    parseHeightCm: parseHeightCm,
  };
})();
