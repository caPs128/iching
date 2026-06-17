#!/bin/bash
echo "================================"
echo "  六爻占卜 - 增删卜易"
echo "================================"
echo ""

if command -v python3 &> /dev/null; then
    PY=python3
elif command -v python &> /dev/null; then
    PY=python
else
    echo "[ERROR] Python not found. Please install Python 3."
    exit 1
fi

echo "[OK] Python found"
echo "[RUN] Starting server at http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop"
echo "================================"
open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null || true
$PY -m http.server 8080
