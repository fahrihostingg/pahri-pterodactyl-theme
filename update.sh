#!/usr/bin/env bash
set -Eeuo pipefail
SELF_DIR=""
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
    SELF_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || true)"
fi
if [[ -n "$SELF_DIR" && -f "$SELF_DIR/install.sh" ]]; then
    bash "$SELF_DIR/install.sh"
else
    THEME_REPO="${PAHRI_THEME_REPO:-fahrihostingg/pahri-pterodactyl-theme}"
    THEME_REF="${PAHRI_THEME_REF:-main}"
    command -v curl >/dev/null 2>&1 || { echo "curl diperlukan." >&2; exit 1; }
    curl -fsSL "https://raw.githubusercontent.com/${THEME_REPO}/${THEME_REF}/install.sh" \
        | env PAHRI_THEME_REPO="$THEME_REPO" PAHRI_THEME_REF="$THEME_REF" PANEL_DIR="${PANEL_DIR:-/var/www/pterodactyl}" bash
fi
