/**
 * Announcements loader for BE-TANGO homepage.
 * Fetches active announcements from the CRM API and renders them.
 * The section is hidden by default (display:none) — JS adds .has-items to show it.
 * Grid layout adapts to item count: 1→full, 2→half, 3→thirds, 4+→carousel.
 */
(function () {
  'use strict';

  const API_BASE = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8001/api/v1'
    : 'https://crm.be-tango.be/api/v1';

  const lang = (document.documentElement.lang ||
    'en').toLowerCase().split('-')[0];

  function t(obj) {
    return obj[lang] || obj['en'] || Object.values(obj).find(v => v) || '';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-GB', {
      month: 'long', year: 'numeric'
    });
  }

  function renderItem(item) {
    const title = t(item.title);
    const content = t(item.content);
    const link = t(item.link);
    const date = formatDate(item.event_date);
    if (!title) return '';

    const linkLabel = lang === 'fr' ? 'En savoir plus →' : lang === 'nl' ? 'Meer info →' : 'Learn more →';
    const linkHtml = link
      ? `<a href="${link}" class="card-link">${linkLabel}</a>`
      : '';

    return `
      <div class="activity-card">
        ${date ? `<span class="card-date-badge">${date}</span>` : ''}
        <h3>${title}</h3>
        ${content ? `<p>${content}</p>` : ''}
        ${linkHtml}
      </div>`;
  }

  function initCarousel(grid, html, count) {
    function visibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    const track = document.createElement('div');
    track.className = 'ann-carousel-track';
    track.innerHTML = html;
    grid.appendChild(track);

    const nav = document.createElement('div');
    nav.className = 'ann-carousel-nav';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'ann-carousel-btn';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '&#8592;';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'ann-carousel-btn';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '&#8594;';
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    grid.after(nav);

    let current = 0;

    // ── Drag / swipe state ──────────────────────────────────────────────────
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragCurrentX = 0;
    let dragBaseOffset = 0;   // translateX value at the moment drag started
    let dragMoved = false;    // true once pointer has moved > threshold
    let isHorizontalDrag = null; // null = undecided, true/false = decided

    const DRAG_THRESHOLD = 30; // px — below this treat release as a click

    function cardWidth() {
      const first = track.children[0];
      if (!first) return 0;
      // offsetWidth + gap (24px from CSS)
      return first.offsetWidth + 24;
    }

    function currentOffset() {
      return current * cardWidth();
    }

    function maxIndex() {
      return Math.max(0, count - visibleCount());
    }

    // Apply a pixel offset directly (no transition) — used during live drag
    function applyRawOffset(px) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${-px}px)`;
    }

    // Snap to a card index with transition
    function snapTo(index) {
      const vis = visibleCount();
      const max = count - vis;
      current = Math.max(0, Math.min(index, max));
      track.style.transition = 'transform 0.4s ease';
      track.style.transform = `translateX(-${current * cardWidth()}px)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= max;
    }

    function update() {
      snapTo(current);
    }

    // ── Pointer helpers ─────────────────────────────────────────────────────

    function onDragStart(clientX, clientY) {
      isDragging = true;
      dragMoved = false;
      isHorizontalDrag = null;
      dragStartX = clientX;
      dragStartY = clientY;
      dragCurrentX = clientX;
      dragBaseOffset = current * cardWidth();
      // Disable transition while dragging so motion is instant
      track.style.transition = 'none';
    }

    function onDragMove(clientX, clientY) {
      if (!isDragging) return;

      const deltaX = clientX - dragStartX;
      const deltaY = clientY - dragStartY;

      // Decide drag direction once we have enough movement
      if (isHorizontalDrag === null) {
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          isHorizontalDrag = Math.abs(deltaX) >= Math.abs(deltaY);
        }
        return; // wait for direction decision before moving anything
      }

      if (!isHorizontalDrag) {
        // Vertical intent — abort drag entirely so page can scroll
        isDragging = false;
        return;
      }

      // Prevent scroll while doing a horizontal drag
      dragCurrentX = clientX;
      if (Math.abs(deltaX) > DRAG_THRESHOLD) dragMoved = true;

      // Clamp so the user cannot drag far past the first/last card
      const raw = dragBaseOffset - deltaX;
      const maxPx = maxIndex() * cardWidth();
      const clamped = Math.max(-cardWidth() * 0.4, Math.min(raw, maxPx + cardWidth() * 0.4));
      applyRawOffset(clamped);
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;

      if (!dragMoved) {
        // Short tap/click — snap back to current without changing index
        snapTo(current);
        return;
      }

      // Determine how far we dragged in card units and snap to nearest card
      const delta = dragCurrentX - dragStartX;
      const cw = cardWidth();
      if (cw === 0) { snapTo(current); return; }

      // Snap to nearest: shift by >0.3 of a card width triggers advance
      const indexOffset = -delta / cw;
      const target = Math.round(current + indexOffset);
      snapTo(target);
    }

    // ── Touch events ────────────────────────────────────────────────────────

    track.addEventListener('touchstart', function (e) {
      const t0 = e.touches[0];
      onDragStart(t0.clientX, t0.clientY);
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      const t0 = e.touches[0];
      // onDragMove decides direction; prevent default only for horizontal drag
      if (isHorizontalDrag === true) e.preventDefault();
      onDragMove(t0.clientX, t0.clientY);
    }, { passive: false });

    track.addEventListener('touchend', function () {
      onDragEnd();
    });

    track.addEventListener('touchcancel', function () {
      isDragging = false;
      snapTo(current);
    });

    // ── Mouse events (click-drag on desktop) ────────────────────────────────

    track.addEventListener('mousedown', function (e) {
      // Only primary button
      if (e.button !== 0) return;
      onDragStart(e.clientX, e.clientY);
      track.classList.add('is-dragging');
      e.preventDefault(); // prevent text selection during drag
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      onDragMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', function (e) {
      if (!isDragging) return;
      track.classList.remove('is-dragging');
      onDragEnd();
    });

    // Prevent ghost drag image appearing on link children
    track.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    // ── Button clicks ────────────────────────────────────────────────────────

    prevBtn.addEventListener('click', function () { current--; update(); });
    nextBtn.addEventListener('click', function () { current++; update(); });
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
  }

  function init() {
    const section = document.getElementById('announcements');
    const grid = document.getElementById('announcements-grid');
    if (!section || !grid) return;

    fetch(`${API_BASE}/announcements`)
      .then(function (r) { return r.json(); })
      .then(function (resp) {
        if (!resp.success || !Array.isArray(resp.data) || resp.data.length === 0) return;
        const items = resp.data;
        const count = items.length;
        const html = items.map(renderItem).join('');

        if (count === 1) {
          grid.classList.add('count-1');
          grid.innerHTML = html;
        } else if (count === 2) {
          grid.classList.add('count-2');
          grid.innerHTML = html;
        } else if (count === 3) {
          grid.classList.add('count-3');
          grid.innerHTML = html;
        } else {
          grid.classList.add('count-carousel');
          initCarousel(grid, html, count);
        }

        section.classList.add('has-items');
      })
      .catch(function () {
        // Silently hide section on error — visitors never see a broken state
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
