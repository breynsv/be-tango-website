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
    const date = formatDate(item.published_at);
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

    function update() {
      const vis = visibleCount();
      const maxIndex = count - vis;
      current = Math.max(0, Math.min(current, maxIndex));
      const cardWidth = track.children[0]
        ? track.children[0].offsetWidth + 24
        : 0;
      track.style.transform = `translateX(-${current * cardWidth}px)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIndex;
    }

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
