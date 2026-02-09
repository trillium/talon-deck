#!/bin/bash
# Deploy Talon files as symlinks into ~/.talon/user/trillium_talon_deck/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/talon"
TARGET="$HOME/.talon/user/trillium_talon_deck"

mkdir -p "$TARGET"

for f in "$SOURCE"/*; do
  name=$(basename "$f")
  rm -f "$TARGET/$name"
  ln -s "$f" "$TARGET/$name"
  echo "  $name -> $f"
done

echo "Deployed $(ls "$SOURCE" | wc -l | tr -d ' ') files to $TARGET"
