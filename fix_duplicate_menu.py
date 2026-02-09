#!/usr/bin/env python3
"""
Remove duplicate mobile menu code from HTML files.
The duplicate code starts after the language dropdown section with a second
menuToggle.addEventListener and ends before the smooth scroll section.
"""

import re
import sys
from pathlib import Path

def fix_duplicate_menu(file_path):
    """Remove duplicate mobile menu code from a single HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Pattern to match the duplicate mobile menu code
        # It starts with blank lines and second menuToggle.addEventListener
        # and ends just before "// Smooth scroll for anchor links"
        pattern = r'\n\s*\n\s*menuToggle\.addEventListener\(\'click\',.*?\n\s*\}\);\n\s*\n\s*(?=\s*// Smooth scroll for anchor links)'

        # Check if pattern exists
        if re.search(pattern, content, re.DOTALL):
            # Remove the duplicate code
            new_content = re.sub(pattern, '\n', content, flags=re.DOTALL)

            # Write back to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            return True
        else:
            return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}", file=sys.stderr)
        return False

def main():
    # List of files with the problematic pattern
    files = [
        "fr/cours-de-tango/experimentes/index.html",
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
        "nl/blog/tango-woordenboek/index.html",
        "nl/blog/argentijnse-tango-vs-ballroomtango-de-verschillen-en-gelijkenissen/index.html",
        "nl/blog/index.html",
        "nl/blog/de-verschillende-dansstijlen-van-de-argentijnse-tango/index.html",
        "nl/privacy-policy/index.html",
        "nl/tangolessen/ervaring/index.html",
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
        if fix_duplicate_menu(file_path):
            print(f"✓ Fixed: {file_path}")
            fixed_count += 1
        else:
            print(f"⊘ Skipped (no duplicate found): {file_path}")
            skipped_count += 1

    print(f"\nSummary: Fixed {fixed_count} files, skipped {skipped_count} files")

if __name__ == "__main__":
    main()
