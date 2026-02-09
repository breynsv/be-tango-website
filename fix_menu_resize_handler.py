#!/usr/bin/env python3
"""
Fix the resize handler in mobile menu code to remove the else block
that uses mainNav.style.display, which interferes with class-based approach.
"""

import re
import sys

def fix_resize_handler(file_path):
    """Fix the resize handler in a single HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Pattern 1: Blog post pattern with more complete resize handler
        pattern1 = r'(window\.addEventListener\([\'"]resize[\'"],\s*\(\)\s*=>\s*\{\s*clearTimeout\(resizeTimer\);\s*resizeTimer\s*=\s*setTimeout\(\(\)\s*=>\s*\{\s*if\s*\(window\.innerWidth\s*>=\s*768\)\s*\{[^\}]+\})\s*else\s*\{\s*const\s+isExpanded\s*=[^\}]+\}\s*(\}\s*,\s*\d+\);)'

        # Pattern 2: Simpler woluwe pattern
        pattern2 = r'(window\.addEventListener\([\'"]resize[\'"],\s*\(\)\s*=>\s*\{\s*if\s*\(window\.innerWidth\s*>=\s*768\)\s*\{\s*mainNav\.classList\.remove\([\'"]mobile-nav-open[\'"]\);)\s*\}\s*else\s*\{\s*const\s+isExpanded\s*=[^\}]+mainNav\.style\.display[^\}]+\}\s*(\}\);)'

        modified = False

        # Try pattern 1 (blog posts)
        if re.search(pattern1, content, re.DOTALL):
            content = re.sub(pattern1, r'\1\2', content, flags=re.DOTALL)
            modified = True
        # Try pattern 2 (woluwe)
        elif re.search(pattern2, content, re.DOTALL):
            content = re.sub(pattern2, r'\1\n      }\2', content, flags=re.DOTALL)
            modified = True

        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
        return False

def main():
    # List of files that need fixing (excluding partials and already fixed pages)
    files = [
        "fr/cours-de-tango/woluwe/index.html",
        "fr/blog/histoire-du-tango-argentin/index.html",
        "fr/blog/pourquoi-apprendre-le-tango/index.html",
        "fr/blog/evenements-de-tango-internationaux/index.html",
        "fr/blog/evenements-de-tango-a-bruxelles/index.html",
        "fr/blog/les-differents-styles-du-tango-argentin/index.html",
        "fr/blog/index.html",
        "fr/termes-et-conditions-generales/index.html",
        "fr/politique-de-confidentialite/index.html",
        "nl/algemene-voorwaarden/index.html",
        "nl/blog/5-tips-voor-de-beste-tangoschoenen/index.html",
        "nl/blog/tango-evenementen-in-brussel-en-omstreken/index.html",
        "nl/blog/internationale-milongas-en-tango-evenementen/index.html",
        "nl/blog/waarom-tango-leren-dansen/index.html",
        "nl/blog/het-verschil-tussen-tango-vals-en-milonga/index.html",
        "nl/blog/de-geschiedenis-van-de-argentijnse-tango/index.html",
        "nl/blog/woordenboek/index.html",
        "nl/blog/argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen/index.html",
        "nl/blog/index.html",
        "nl/blog/de-verschillende-dansstijlen-van-de-argentijnse-tango/index.html",
        "nl/privacy-policy/index.html",
        "nl/tangolessen/woluwe/index.html",
        "terms-and-conditions/index.html",
        "blog/5-tips-best-tango-shoes/index.html",
        "blog/why-learn-tango/index.html",
        "blog/history-of-argentine-tango/index.html",
        "blog/international-tango-events/index.html",
        "blog/different-styles-of-argentine-tango/index.html",
        "blog/tango-events-brussels/index.html",
        "blog/index.html",
        "blog/argentine-tango-ballroom-tango-differences/index.html",
        "tango-classes/woluwe/index.html",
        "privacy-policy/index.html"
    ]

    fixed_count = 0
    skipped_count = 0

    for file_path in files:
        if fix_resize_handler(file_path):
            print(f"✓ Fixed: {file_path}")
            fixed_count += 1
        else:
            print(f"⊘ Skipped: {file_path}")
            skipped_count += 1

    print(f"\nSummary: Fixed {fixed_count} files, skipped {skipped_count} files")

if __name__ == "__main__":
    main()
