import os
import re

CANONICAL_FOOTER = '''  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h3>BE-TANGO</h3>
          <p>Your dance school for Argentine tango in Brussels and Woluwe.</p>
          <p>Experience the connection, the music, and the fun.</p>
          <p style="margin-top: 1rem;"><strong>Phone:</strong> <a href="tel:+32498392939" style="color: inherit;">+32 498 39 29 39</a></p>
          <p><strong>Email:</strong> <a href="mailto:admin@be-tango.com" style="color: inherit;">admin@be-tango.com</a></p>
          <div class="social-links">
            <a href="https://www.facebook.com/p/Be-tango-ART-100057312323946/" aria-label="Facebook" class="social-icon" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/be_tango_brussels/" aria-label="Instagram" class="social-icon" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/en/">Home</a></li>
            <li><a href="/en/tango-classes/">Tango Classes</a></li>
            <li><a href="/en/tango-classes/free-trial/" class="footer-free-trial">Free Trial</a></li>
            <li><a href="/en/blog/">Blog</a></li>
            <li><a href="/en/contact/">Contact</a></li>
            <li><a href="/en/faq/">FAQ</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Classes</h4>
          <ul>
            <li><a href="/en/tango-classes/beginners/">Beginners</a></li>
            <li><a href="/en/tango-classes/experienced/">Experienced</a></li>
            <li><a href="/en/tango-classes/private/">Private Lessons</a></li>
            <li><a href="/en/tango-classes/online/">Online</a></li>
            <li><a href="/en/tango-classes/couples/">Couples</a></li>
            <li><a href="/en/tango-classes/workshops/">Workshops</a></li>
            <li><a href="/en/tango-classes/wedding-dance/">Wedding Dance</a></li>
            <li><a href="/en/tango-classes/team-building/">Team Building</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Locations</h4>
          <div class="footer-location-cards">
            <div class="location-card">
              <strong>BE-TANGO Centre</strong>
              <span class="loc-address">Rue du Marais 68, 1000 Brussels</span>
              <a href="/en/tango-classes/brussels/" class="loc-link">View location →</a>
            </div>
            <div class="location-card">
              <strong>BE-TANGO Woluwe</strong>
              <span class="loc-address">Av. Orban 54, 1150 Woluwe-Saint-Pierre</span>
              <a href="/en/tango-classes/woluwe/" class="loc-link">View location →</a>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 BE-TANGO. All rights reserved.</p>
        <p class="footer-email">Email: <a href="mailto:admin@be-tango.com">admin@be-tango.com</a></p>
        <p class="footer-legal">
          <a href="/en/privacy-policy/">Privacy Policy</a> |
          <a href="/en/terms-and-conditions/">Terms &amp; Conditions</a> |
          <a href="/en/links/">Links</a>
        </p>
      </div>
    </div>
  </footer>'''

BASE_DIR = '/Users/svenbreynaert/Sites/BE-TANGO WEBSITE/be-tango-rebuild/en'

FOOTER_PATTERN = re.compile(
    r'<footer class="site-footer">.*?</footer>',
    re.DOTALL
)

updated = []
skipped = []

for root, dirs, files in os.walk(BASE_DIR):
    for fname in files:
        if fname == 'index.html':
            path = os.path.join(root, fname)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if '<footer class="site-footer">' not in content:
                skipped.append(path)
                continue
            new_content = FOOTER_PATTERN.sub(CANONICAL_FOOTER, content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated.append(path)

print(f"Updated: {len(updated)} files")
for p in sorted(updated):
    print(f"  OK  {p}")

if skipped:
    print(f"\nSkipped (no footer found): {len(skipped)} files")
    for p in sorted(skipped):
        print(f"  --  {p}")
