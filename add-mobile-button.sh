#!/bin/bash

# Script to add floating mobile call button to all HTML pages
# BE-TANGO Website - Mobile Improvements

BUTTON_HTML='  <!-- Floating Mobile Call Button -->
  <a href="tel:+32498392939" class="mobile-call-button" aria-label="Call BE-TANGO">
    <i class="fas fa-phone"></i>
  </a>

'

# Find all HTML files (excluding partials directory)
find . -name "*.html" -not -path "./partials/*" -type f | while read file; do
    # Check if button already exists
    if ! grep -q "mobile-call-button" "$file"; then
        echo "Adding button to: $file"

        # Find the line before </body> tag and insert button
        if grep -q "</body>" "$file"; then
            # Use sed to insert before </body>
            sed -i.mobilebak '/^[[:space:]]*<\/body>/i\
  <!-- Floating Mobile Call Button -->\
  <a href="tel:+32498392939" class="mobile-call-button" aria-label="Call BE-TANGO">\
    <i class="fas fa-phone"></i>\
  </a>\
' "$file"
            echo "  ✓ Added to $file"
        else
            echo "  ✗ No </body> tag found in $file"
        fi
    else
        echo "Button already exists in: $file"
    fi
done

echo ""
echo "Mobile call button has been added to all pages!"
echo "Backup files created with .mobilebak extension"
