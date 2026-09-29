/**
 * BE-TANGO YouTube click-to-play facade
 *
 * Pages show a <button class="yt-facade" data-yt-id="…" data-yt-title="…">
 * holding the video's thumbnail and a play icon, laid out in the same 16:9 box
 * the iframe used to fill (so nothing shifts). The YouTube player — about
 * 1.9 MB of JS and fonts per page — is only fetched when a visitor asks for it:
 * on click we swap the button for the real iframe, autoplaying.
 *
 * The facade's layout lives in inline styles on the markup, so this script
 * only has to handle the click.
 */
(function () {
  'use strict';

  function play(btn) {
    var id = btn.getAttribute('data-yt-id');
    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) return;

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    iframe.title = btn.getAttribute('data-yt-title') || 'YouTube video';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';

    btn.parentNode.replaceChild(iframe, btn);
    iframe.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.yt-facade') : null;
    if (!btn) return;
    e.preventDefault();
    play(btn);
  });
})();
