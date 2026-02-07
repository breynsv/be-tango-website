#!/bin/bash
# Script to add enhancement scripts to all English HTML pages

# Find all English HTML pages (excluding nl/ and fr/ directories)
find . -name "index.html" -type f | grep -v "/nl/" | grep -v "/fr/" | while read file; do
    echo "Processing: $file"

    # Count directory depth to calculate correct path
    depth=$(echo "$file" | tr -cd '/' | wc -c)
    depth=$((depth - 1))

    # Build relative path based on depth
    if [ $depth -eq 1 ]; then
        script_path="js/"
    else
        script_path=""
        for i in $(seq 1 $depth); do
            script_path="${script_path}../"
        done
        script_path="${script_path}js/"
    fi

    # Check if scripts already added
    if grep -q "enhancements.js" "$file"; then
        echo "  - Scripts already added, skipping"
        continue
    fi

    # Check if file has the stylesheet marker
    if ! grep -q "<!-- Stylesheet -->" "$file"; then
        echo "  - No stylesheet marker found, skipping"
        continue
    fi

    # Create temporary file with scripts added after stylesheet
    awk -v path="$script_path" '
        /<!-- Stylesheet -->/ {
            print
            getline
            print
            print ""
            print "  <!-- Enhancement Scripts -->"
            print "  <script src=\"" path "enhancements.js\" defer></script>"
            print "  <script src=\"" path "breadcrumbs.js\" defer></script>"
            next
        }
        { print }
    ' "$file" > "${file}.tmp"

    # Replace original with modified version
    mv "${file}.tmp" "$file"
    echo "  - ✓ Scripts added"
done

echo ""
echo "Done! Enhancement scripts added to all English pages."
