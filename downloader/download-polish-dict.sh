#!/bin/bash

# URL of the Polish dictionary package from Debian
DEB_URL="http://ftp.pl.debian.org/debian/pool/main/i/ipolish/wpolish_20240901-1_all.deb"
DEB_FILE="wpolish.deb"
# Define output path relative to script location
SCRIPT_DIR="$(dirname "$0")"
OUTPUT_DIR="${SCRIPT_DIR}/../public/dict"
OUTPUT_FILE="${OUTPUT_DIR}/polish.txt"

# Set to true to enable cleanup, false to disable
ENABLE_CLEANUP=true

# Create a temporary directory for extraction
EXTRACT_DIR="./extracted"
mkdir -p "$EXTRACT_DIR"

echo "Downloading: $DEB_URL"
wget -q "$DEB_URL" -O "$DEB_FILE" || curl -s -o "$DEB_FILE" "$DEB_URL"
echo "Downloaded and saved to: $DEB_FILE"

echo "Extracting .deb file..."
# List archive contents and find data.tar file
DATA_TAR_FILE=$(ar t "$DEB_FILE" | grep "^data.tar")
echo "Found data archive: $DATA_TAR_FILE"

# Extract the specific data.tar file
ar x "$DEB_FILE" "$DATA_TAR_FILE"

echo "Extracting data archive..."
tar -xf "$DATA_TAR_FILE" -C "$EXTRACT_DIR"

# Find and copy the dictionary file
DICT_PATH="$EXTRACT_DIR/usr/share/dict/polish"
if [ -f "$DICT_PATH" ]; then
    # Create output directory if it doesn't exist
    mkdir -p "$OUTPUT_DIR"
    cp "$DICT_PATH" "$OUTPUT_FILE"
    echo "Polish dictionary extracted to: $OUTPUT_FILE"
else
    echo "Polish dictionary file not found!"
    exit 1
fi

# Cleanup
if [ "$ENABLE_CLEANUP" = true ]; then
    echo "Cleaning up temporary files..."
    rm -f "$DEB_FILE" "$DATA_TAR_FILE"
    rm -rf "$EXTRACT_DIR"
    echo "Cleanup complete."
else
    echo "Skipping cleanup of temporary files."
fi
