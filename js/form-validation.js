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

  window.BETangoValidate = { check: check, show: show, clear: clear, clearField: clearField };
})();
