#!/usr/bin/env bash
set -Eeuo pipefail

THEME_REPO="${PAHRI_THEME_REPO:-fahrihostingg/pahri-pterodactyl-theme}"
THEME_REF="${PAHRI_THEME_REF:-main}"
ARCHIVE_URL="${PAHRI_THEME_ARCHIVE_URL:-https://codeload.github.com/${THEME_REPO}/tar.gz/${THEME_REF}}"
SELF_DIR=""
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
    SELF_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || true)"
fi
TEMP_DIR=""

log() { printf '\033[1;36m[PAHRI GITHUB]\033[0m %s\n' "$*"; }
ok() { printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

cleanup() {
    [[ -z "$TEMP_DIR" ]] || rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

run_local_installer() {
    local root="$1"
    [[ -f "$root/scripts/install-local.sh" ]] || die "scripts/install-local.sh tidak dijumpai."
    [[ -f "$root/scripts/install-v2.sh" ]] || die "scripts/install-v2.sh tidak dijumpai."
    [[ -f "$root/scripts/install-source.sh" ]] || die "scripts/install-source.sh tidak dijumpai."
    [[ -d "$root/files" ]] || die "Folder files tidak dijumpai dalam pakej tema."
    [[ -d "$root/source" ]] || die "Folder source tidak dijumpai dalam pakej tema."
    [[ -f "$root/files/public/themes/pahri/thema-new.js" ]] || die "Runtime Pahri Thema New tidak dijumpai."
    [[ -f "$root/source/resources/scripts/components/PahriBroadcast.tsx" ]] || die "Komponen Broadcast Center tidak dijumpai."

    bash "$root/scripts/install-local.sh"
    bash "$root/scripts/install-v2.sh"
    bash "$root/scripts/install-source.sh"

    local version="5.0.0"
    if [[ -f "$root/VERSION" ]]; then
        version="$(tr -d '[:space:]' < "$root/VERSION")"
    fi

    printf '\n'
    ok "Pahri Thema New ${version} berjaya dipasang sepenuhnya."
    printf 'Admin Studio: /admin/settings/appearance\n'
    printf 'Command Engine: Ctrl + K\n'
    printf 'Broadcast Center: Admin Panel > Settings > Pahri Thema New\n'
}

if [[ -n "$SELF_DIR" && -f "$SELF_DIR/scripts/install-local.sh" && -d "$SELF_DIR/files" ]]; then
    run_local_installer "$SELF_DIR"
    exit $?
fi

[[ "$THEME_REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] \
    || die "PAHRI_THEME_REPO tidak sah. Gunakan format owner/repository."
[[ "$THEME_REF" =~ ^[A-Za-z0-9._/-]+$ ]] \
    || die "PAHRI_THEME_REF tidak sah."
command -v tar >/dev/null 2>&1 || die "Perintah tar diperlukan."

TEMP_DIR="$(mktemp -d -t pahri-theme.XXXXXX)"
mkdir -p "$TEMP_DIR/source"
ARCHIVE_FILE="$TEMP_DIR/theme.tar.gz"

log "Memuat turun ${THEME_REPO}@${THEME_REF} daripada GitHub..."
if command -v curl >/dev/null 2>&1; then
    curl --fail --location --silent --show-error \
        --retry 3 --retry-delay 2 --connect-timeout 15 \
        "$ARCHIVE_URL" --output "$ARCHIVE_FILE"
elif command -v wget >/dev/null 2>&1; then
    wget --quiet --tries=3 --timeout=30 "$ARCHIVE_URL" -O "$ARCHIVE_FILE"
else
    die "curl atau wget diperlukan untuk pemasangan melalui GitHub."
fi

[[ -s "$ARCHIVE_FILE" ]] || die "Arkib GitHub kosong atau gagal dimuat turun."
tar -xzf "$ARCHIVE_FILE" -C "$TEMP_DIR/source"
SOURCE_DIR="$(find "$TEMP_DIR/source" -mindepth 1 -maxdepth 1 -type d -print -quit)"
[[ -n "$SOURCE_DIR" ]] || die "Struktur arkib GitHub tidak sah."

run_local_installer "$SOURCE_DIR"
