#!/bin/bash

LICENSE_FILE="license.txt"
HEADER_MARKER="Licensed under the MIT License."

# Check if the license file exists
if [ ! -f "$LICENSE_FILE" ]; then
  echo "Missing $LICENSE_FILE. Please create one with the license text."
  exit 1
fi

# Read and prepare the license header
LICENSE=$(cat "$LICENSE_FILE")
HEADER="$LICENSE
"

# Add header to all .js and .ts files, excluding node_modules and already marked files
find . -type f \( -name "*.js" -o -name "*.ts" \) ! -path "*/node_modules/*" | while read -r file; do
  if grep -q "$HEADER_MARKER" "$file"; then
    echo "Skipping: $file (already has header)"
  else
    echo "Adding header to: $file"
    tmpfile=$(mktemp)
    echo "$HEADER" > "$tmpfile"
    cat "$file" >> "$tmpfile"
    mv "$tmpfile" "$file"
  fi
done

