#!/usr/bin/env python3
"""Add Links page to all footers"""

import re
import os
from pathlib import Path

def update_footer(file_path, lang='en'):
    """Update footer to include links page"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Determine the correct link text and path based on language and file location
        file_path_obj = Path(file_path)
        relative_parts = file_path_obj.relative_to(Path.cwd()).parts

        # Calculate path to links page
        if 'fr' in relative_parts:
            link_text = 'Liens'
            # Determine depth
            depth = len(relative_parts) - 2  # Subtract root and filename
            if depth == 0:
                links_path = 'fr/liens/'
            else:
                links_path = '../' * depth + 'fr/liens/'
        elif 'nl' in relative_parts:
            link_text = 'Links'
            depth = len(relative_parts) - 2
            if depth == 0:
                links_path = 'nl/links/'
            else:
                links_path = '../' * depth + 'nl/links/'
        else:  # English
            link_text = 'Links'
            depth = len(relative_parts) - 1
            if depth == 0:
                links_path = 'links/'
            else:
                links_path = '../' * depth + 'links/'

        # Pattern to find footer-legal section without Links already
        pattern1 = r'(<p class="footer-legal">.*?</a>)(\s*</p>)'
        pattern2 = r'(<p class="footer-legal">.*?</a>)(\s*\|)'

        # Check if Links is already in the footer
        if 'Links</a>' in content or 'Liens</a>' in content:
            print(f"⊘ Skipped (already has links): {file_path}")
            return False

        # Try to add after last link in footer-legal
        if re.search(pattern1, content, re.DOTALL):
            new_content = re.sub(
                pattern1,
                rf'\1 |\n          <a href="{links_path}">{link_text}</a>\2',
                content,
                flags=re.DOTALL
            )

            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True

        return False

    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def main():
    # Find all HTML files
    html_files = []

    # Main pages
    for file in Path('.').rglob('*/index.html'):
        if 'node_modules' not in str(file) and '.git' not in str(file):
            html_files.append(file)

    # Root index.html
    if Path('index.html').exists():
        html_files.append(Path('index.html'))

    updated = 0
    skipped = 0
    errors = 0

    for file_path in html_files:
        result = update_footer(str(file_path))
        if result:
            print(f"✓ Updated: {file_path}")
            updated += 1
        elif result is False:
            skipped += 1
        else:
            errors += 1

    print(f"\n=== Summary ===")
    print(f"Updated: {updated} files")
    print(f"Skipped: {skipped} files")
    print(f"Errors: {errors} files")

if __name__ == "__main__":
    main()
