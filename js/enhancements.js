/**
 * BE-TANGO Enhancement Scripts
 * - Sticky header scroll effect
 * - Swipe gesture support for carousels
 */

(function() {
  'use strict';

  // ==========================================
  // STICKY HEADER SCROLL EFFECT
  // ==========================================
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 50; // Add scrolled class after 50px

    function handleScroll() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();
  }

  // ==========================================
  // SWIPE GESTURE SUPPORT FOR CAROUSELS
  // ==========================================
  function initSwipeGestures() {
    const carousels = document.querySelectorAll('.reviews-carousel');

    carousels.forEach(carousel => {
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartTime = 0;
      const minSwipeDistance = 50; // Minimum distance for a swipe
      const maxSwipeTime = 300; // Maximum time for a quick swipe (ms)

      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = Date.now();
      }, { passive: true });

      carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const touchDuration = Date.now() - touchStartTime;
        handleSwipe(carousel, touchStartX, touchEndX, touchDuration);
      }, { passive: true });

      function handleSwipe(element, startX, endX, duration) {
        const swipeDistance = Math.abs(endX - startX);

        // Only process if swipe is long enough and quick enough
        if (swipeDistance < minSwipeDistance || duration > maxSwipeTime) return;

        const cardWidth = 300 + 16; // card width + gap

        if (endX < startX) {
          // Swipe left - scroll to next
          element.scrollBy({ left: cardWidth, behavior: 'smooth' });
        } else if (endX > startX) {
          // Swipe right - scroll to previous
          element.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        }
      }
    });
  }

  // ==========================================
  // INITIALIZE ON DOM READY
  // ==========================================
  function init() {
    initStickyHeader();
    initSwipeGestures();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
