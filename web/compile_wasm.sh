#!/bin/bash
set -e

# Make sure Homebrew binaries are in the path
export PATH="/opt/homebrew/bin:$PATH"

echo "Compiling MiniDyn to WebAssembly..."

# Ensure we are in the web/ directory
cd "$(dirname "$0")"

# Create public directory if it doesn't exist
mkdir -p public

# Run Emscripten compiler with Embind enabled
em++ -O3 -std=c++17 \
  -I../include \
  ../src/wasm/bindings.cpp \
  -o public/minidyn.js \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createMinidynModule" \
  -s ENVIRONMENT="web" \
  -s ALLOW_MEMORY_GROWTH=1 \
  --bind

echo "WebAssembly compilation successful! Output files:"
ls -la public/minidyn.*
